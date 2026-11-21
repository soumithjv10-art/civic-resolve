import { Complaint, GeoCoordinates } from "./types";
import {
  DUPLICATE_DISTANCE_CLOSE_METERS,
  DUPLICATE_DISTANCE_NEAR_METERS,
  DUPLICATE_DISTANCE_NEIGHBORHOOD_METERS,
} from "./constants";

/**
 * Calculates great-circle distance between two geographic coordinates in meters (Haversine formula).
 * Uses a fast bounding-box pre-check to eliminate expensive trigonometry for distant coordinates.
 *
 * @param coord1 - First coordinate pair
 * @param coord2 - Second coordinate pair
 * @returns Distance in meters, or null if coordinates are missing
 */
export function calculateDistanceMeters(
  coord1?: GeoCoordinates,
  coord2?: GeoCoordinates
): number | null {
  if (!coord1 || !coord2) return null;

  // Fast bounding-box check: 0.01 deg is ~1.11km.
  // If lat or lng differs by > 0.01, the point is guaranteed to be outside 500m neighborhood radius.
  const dLatAbs = Math.abs(coord2.lat - coord1.lat);
  const dLngAbs = Math.abs(coord2.lng - coord1.lng);
  if (dLatAbs > 0.01 || dLngAbs > 0.01) {
    return 1500; // Guaranteed > 500m threshold without running trigonometry
  }

  const R = 6371e3; // Earth's radius in meters
  const lat1 = (coord1.lat * Math.PI) / 180;
  const lat2 = (coord2.lat * Math.PI) / 180;
  const deltaLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const deltaLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Tokenizes text into a set of normalized alphanumeric words of length > 2.
 */
function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

/**
 * Calculates Jaccard similarity between a pre-tokenized set and a target string.
 */
function tokenSimilarity(set1: Set<string>, targetText: string): number {
  if (set1.size === 0) return 0;
  const set2 = tokenize(targetText);
  if (set2.size === 0) return 0;

  let intersection = 0;
  for (const token of set1) {
    if (set2.has(token)) intersection++;
  }

  const union = set1.size + set2.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export interface DuplicateMatchResult {
  isPotentialDuplicate: boolean;
  confidenceScore: number; // 0 to 1
  matchedComplaint?: Complaint;
  reasons: string[];
}

/**
 * Compares an incoming complaint against an existing pool of active complaints
 * to detect if it relates to an existing open civic incident.
 * Pre-tokenizes incoming text once to avoid O(N^2) string operations.
 *
 * @param incoming - Complaint payload being submitted
 * @param existingComplaints - Array of existing complaint records
 * @returns Duplicate match result with confidence score and reasons
 */
export function detectPotentialDuplicate(
  incoming: {
    title: string;
    description: string;
    category: string;
    coordinates?: GeoCoordinates;
    location: string;
  },
  existingComplaints: Complaint[]
): DuplicateMatchResult {
  let highestScore = 0;
  let bestMatch: Complaint | undefined = undefined;
  let bestReasons: string[] = [];

  // Pre-tokenize incoming strings once outside the loop
  const incomingTitleTokens = tokenize(incoming.title);
  const incomingDescTokens = tokenize(incoming.description);
  const incomingLocTokens = tokenize(incoming.location);

  for (let i = 0; i < existingComplaints.length; i++) {
    const candidate = existingComplaints[i];

    // Only compare against unresolved complaints
    if (candidate.status === "Resolved") continue;

    let score = 0;
    const reasons: string[] = [];

    // 1. Category check
    const sameCategory = candidate.category === incoming.category;
    if (sameCategory) {
      score += 0.3;
      reasons.push(`Identical municipal category (${incoming.category})`);
    }

    // 2. Geographic distance check
    if (incoming.coordinates && candidate.coordinates) {
      const distance = calculateDistanceMeters(incoming.coordinates, candidate.coordinates);
      if (distance !== null) {
        if (distance <= DUPLICATE_DISTANCE_CLOSE_METERS) {
          score += 0.45;
          reasons.push(`Extremely close geographic proximity (~${Math.round(distance)}m)`);
        } else if (distance <= DUPLICATE_DISTANCE_NEAR_METERS) {
          score += 0.35;
          reasons.push(`Nearby location (~${Math.round(distance)}m)`);
        } else if (distance <= DUPLICATE_DISTANCE_NEIGHBORHOOD_METERS) {
          score += 0.15;
          reasons.push(`In same immediate neighborhood (~${Math.round(distance)}m)`);
        }
      }
    } else {
      // Fallback location string comparison using pre-tokenized incoming location
      const locSim = tokenSimilarity(incomingLocTokens, candidate.location);
      if (locSim > 0.4) {
        score += 0.25;
        reasons.push("Overlapping location landmarks");
      }
    }

    // 3. Text semantic/token similarity
    const titleSim = tokenSimilarity(incomingTitleTokens, candidate.title);
    const descSim = tokenSimilarity(incomingDescTokens, candidate.description);
    const textSim = titleSim * 0.6 + descSim * 0.4;

    if (textSim > 0.4) {
      score += 0.25;
      reasons.push(`High textual similarity (${Math.round(textSim * 100)}% match)`);
    } else if (textSim > 0.2) {
      score += 0.15;
      reasons.push("Related issue terminology");
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = candidate;
      bestReasons = reasons;
    }
  }

  const isPotential = highestScore >= 0.55;

  return {
    isPotentialDuplicate: isPotential,
    confidenceScore: Math.min(1.0, Math.round(highestScore * 100) / 100),
    matchedComplaint: bestMatch,
    reasons: bestReasons,
  };
}
