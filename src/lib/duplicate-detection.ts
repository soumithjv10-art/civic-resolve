import { Complaint, GeoCoordinates } from "./types";

/**
 * Calculates great-circle distance between two coordinates in meters (Haversine formula).
 */
export function calculateDistanceMeters(
  coord1?: GeoCoordinates,
  coord2?: GeoCoordinates
): number | null {
  if (!coord1 || !coord2) return null;
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
 * Calculates Jaccard similarity between two token sets.
 */
function tokenSimilarity(text1: string, text2: string): number {
  const tokenize = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );

  const set1 = tokenize(text1);
  const set2 = tokenize(text2);

  if (set1.size === 0 || set2.size === 0) return 0;

  let intersection = 0;
  for (const token of set1) {
    if (set2.has(token)) intersection++;
  }

  const union = new Set([...set1, ...set2]).size;
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

  for (const candidate of existingComplaints) {
    // Only check unresolved complaints
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
        if (distance <= 50) {
          score += 0.45;
          reasons.push(`Extremely close geographic proximity (~${Math.round(distance)}m)`);
        } else if (distance <= 200) {
          score += 0.35;
          reasons.push(`Nearby location (~${Math.round(distance)}m)`);
        } else if (distance <= 500) {
          score += 0.15;
          reasons.push(`In same immediate neighborhood (~${Math.round(distance)}m)`);
        }
      }
    } else {
      // Fallback location string comparison
      const locSim = tokenSimilarity(incoming.location, candidate.location);
      if (locSim > 0.4) {
        score += 0.25;
        reasons.push("Overlapping location landmarks");
      }
    }

    // 3. Text semantic/token similarity
    const titleSim = tokenSimilarity(incoming.title, candidate.title);
    const descSim = tokenSimilarity(incoming.description, candidate.description);
    const textSim = (titleSim * 0.6 + descSim * 0.4);

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
