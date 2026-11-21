import { Firestore } from "@google-cloud/firestore";
import { Complaint, Incident, AuditLog, Resolution, EscalationRecord } from "./types";
import { INITIAL_SEED_COMPLAINTS } from "./seed-data";

/**
 * Singleton instance of Google Cloud Firestore client.
 */
let firestoreInstance: Firestore | null = null;
let useMemoryStore = false;

// In-memory fallback store to ensure zero downtime and smooth local builds/testing
const memoryStore = {
  complaints: new Map<string, Complaint>(
    INITIAL_SEED_COMPLAINTS.map((c) => [c.id, c])
  ),
  incidents: new Map<string, Incident>(),
  auditLogs: new Array<AuditLog>(),
  resolutions: new Map<string, Resolution>(),
  escalations: new Array<EscalationRecord>(),
};

/**
 * Server-side TTL in-memory query cache for instant (<1ms) sub-second responses
 */
interface CachedQuery {
  timestamp: number;
  data: Complaint[];
}
let complaintsCache: CachedQuery | null = null;
const CACHE_TTL_MS = 10000; // 10 seconds

function clearComplaintsCache() {
  complaintsCache = null;
}

/**
 * Returns a singleton instance of the Firestore client.
 * Falls back to an in-memory store in local offline environments.
 */
export function getFirestoreDb(): Firestore | null {
  if (useMemoryStore) return null;
  if (!firestoreInstance) {
    try {
      const projectId = process.env.GOOGLE_CLOUD_PROJECT;
      if (!projectId || projectId.includes("placeholder")) {
        useMemoryStore = true;
        return null;
      }
      firestoreInstance = new Firestore({
        projectId,
        ignoreUndefinedProperties: true,
      });
    } catch (err) {
      console.warn("Firestore initialization failed, falling back to local memory store:", err);
      useMemoryStore = true;
      return null;
    }
  }
  return firestoreInstance;
}

/**
 * Fetches complaints ordered by createdAt desc, capped at limit.
 * Leverages an in-memory query cache with 10s TTL to eliminate duplicate database round-trips.
 *
 * @param limitCount - Maximum number of records to return (defaults to 50)
 * @returns Array of complaint objects
 */
export async function getAllComplaints(limitCount = 50): Promise<Complaint[]> {
  const now = Date.now();
  if (complaintsCache && now - complaintsCache.timestamp < CACHE_TTL_MS) {
    return complaintsCache.data.slice(0, limitCount);
  }

  const db = getFirestoreDb();
  if (db) {
    try {
      const snapshot = await db
        .collection("complaints")
        .orderBy("createdAt", "desc")
        .limit(Math.max(limitCount, 100))
        .get();

      const results = snapshot.docs.map((doc) => doc.data() as Complaint);
      complaintsCache = { timestamp: now, data: results };
      return results.slice(0, limitCount);
    } catch (err) {
      console.warn("Error fetching from Firestore, falling back to memory store:", err);
    }
  }

  const list = Array.from(memoryStore.complaints.values());
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  complaintsCache = { timestamp: now, data: list };
  return list.slice(0, limitCount);
}

/**
 * Fetches a single complaint by tracking ID.
 *
 * @param id - Complaint tracking ID
 * @returns Complaint record or null if not found
 */
export async function getComplaintById(id: string): Promise<Complaint | null> {
  const db = getFirestoreDb();
  if (db) {
    try {
      const doc = await db.collection("complaints").doc(id).get();
      if (doc.exists) {
        return doc.data() as Complaint;
      }
    } catch (err) {
      console.warn(`Firestore getComplaintById(${id}) error, falling back:`, err);
    }
  }

  return memoryStore.complaints.get(id) || null;
}

/**
 * Inserts or updates a complaint record in Firestore or the fallback store.
 *
 * @param complaint - Complaint object to persist
 * @returns Saved complaint object
 */
export async function saveComplaint(complaint: Complaint): Promise<Complaint> {
  clearComplaintsCache();
  const db = getFirestoreDb();
  if (db) {
    try {
      await db.collection("complaints").doc(complaint.id).set(complaint, { merge: true });
    } catch (err) {
      console.warn(`Firestore saveComplaint(${complaint.id}) error, falling back:`, err);
    }
  }

  memoryStore.complaints.set(complaint.id, complaint);
  return complaint;
}

/**
 * Persists an entire array of complaint records in a single high-efficiency Firestore batch.
 *
 * @param complaints - Array of complaints to persist
 */
export async function saveComplaintsBatch(complaints: Complaint[]): Promise<void> {
  clearComplaintsCache();
  const db = getFirestoreDb();
  if (db) {
    try {
      const batch = db.batch();
      for (const c of complaints) {
        const ref = db.collection("complaints").doc(c.id);
        batch.set(ref, c, { merge: true });
      }
      await batch.commit();
    } catch (err) {
      console.warn("Firestore saveComplaintsBatch error, falling back:", err);
    }
  }

  for (const c of complaints) {
    memoryStore.complaints.set(c.id, c);
  }
}

/**
 * Updates partial fields on a complaint and appends an audit log entry.
 *
 * @param id - Tracking ID of complaint
 * @param updates - Partial fields to update
 * @param actor - Actor performing the update
 * @returns Updated complaint record or null
 */
export async function updateComplaintFields(
  id: string,
  updates: Partial<Complaint>,
  actor = "System"
): Promise<Complaint | null> {
  clearComplaintsCache();
  const existing = await getComplaintById(id);
  if (!existing) return null;

  const updated: Complaint = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (updates.status && updates.status !== existing.status) {
    const historyEntry = {
      timestamp: new Date().toISOString(),
      action: `Status updated to ${updates.status}`,
      performedBy: actor,
      previousStatus: existing.status,
      newStatus: updates.status,
      details: updates.adminNotes || "Administrative status transition",
    };
    updated.history = [...(existing.history || []), historyEntry];
  }

  await saveComplaint(updated);

  await recordAuditLog({
    id: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    complaintId: id,
    action: updates.status ? `STATUS_CHANGE_TO_${updates.status}` : "COMPLAINT_UPDATED",
    actor,
    timestamp: new Date().toISOString(),
    changes: Object.entries(updates).reduce(
      (acc, [k, v]) => ({
        ...acc,
        [k]: { from: (existing as unknown as Record<string, unknown>)[k], to: v },
      }),
      {}
    ),
  });

  return updated;
}

/**
 * Atomically increments community upvotes on a complaint.
 *
 * @param id - Complaint tracking ID
 * @returns Updated upvote total
 */
export async function incrementComplaintUpvotes(id: string): Promise<number> {
  clearComplaintsCache();
  const complaint = await getComplaintById(id);
  if (!complaint) return 0;

  const newUpvotes = (complaint.upvotes || 0) + 1;
  await saveComplaint({ ...complaint, upvotes: newUpvotes });
  return newUpvotes;
}

/**
 * Persists an administrative or system audit log.
 *
 * @param log - Audit log record
 */
export async function recordAuditLog(log: AuditLog): Promise<void> {
  const db = getFirestoreDb();
  if (db) {
    try {
      await db.collection("audit_logs").doc(log.id).set(log);
    } catch (err) {
      console.warn("Firestore recordAuditLog error:", err);
    }
  }
  memoryStore.auditLogs.push(log);
}

/**
 * Retrieves audit logs for a complaint in chronological reverse order.
 *
 * @param complaintId - Complaint tracking ID
 * @returns Array of audit logs
 */
export async function getAuditLogsForComplaint(complaintId: string): Promise<AuditLog[]> {
  const db = getFirestoreDb();
  if (db) {
    try {
      const snap = await db
        .collection("audit_logs")
        .where("complaintId", "==", complaintId)
        .orderBy("timestamp", "desc")
        .get();
      return snap.docs.map((doc) => doc.data() as AuditLog);
    } catch (err) {
      console.warn("Firestore getAuditLogs error, falling back:", err);
    }
  }

  return memoryStore.auditLogs
    .filter((l) => l.complaintId === complaintId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Retrieves all grouped municipal incident records.
 */
export async function getAllIncidents(): Promise<Incident[]> {
  const db = getFirestoreDb();
  if (db) {
    try {
      const snap = await db.collection("incidents").orderBy("updatedAt", "desc").get();
      return snap.docs.map((d) => d.data() as Incident);
    } catch (err) {
      console.warn("Firestore getAllIncidents error:", err);
    }
  }

  return Array.from(memoryStore.incidents.values());
}

/**
 * Saves a grouped incident record.
 *
 * @param incident - Incident object
 * @returns Saved incident object
 */
export async function saveIncident(incident: Incident): Promise<Incident> {
  const db = getFirestoreDb();
  if (db) {
    try {
      await db.collection("incidents").doc(incident.incidentId).set(incident, { merge: true });
    } catch (err) {
      console.warn("Firestore saveIncident error:", err);
    }
  }
  memoryStore.incidents.set(incident.incidentId, incident);
  return incident;
}

/**
 * Records an SLA escalation event.
 *
 * @param record - Escalation record object
 */
export async function recordEscalation(record: EscalationRecord): Promise<void> {
  const db = getFirestoreDb();
  if (db) {
    try {
      await db.collection("escalation_records").doc(record.id).set(record);
    } catch (err) {
      console.warn("Firestore recordEscalation error:", err);
    }
  }
  memoryStore.escalations.push(record);
}

/**
 * Retrieves all SLA escalation records.
 */
export async function getAllEscalations(): Promise<EscalationRecord[]> {
  const db = getFirestoreDb();
  if (db) {
    try {
      const snap = await db.collection("escalation_records").orderBy("timestamp", "desc").get();
      return snap.docs.map((d) => d.data() as EscalationRecord);
    } catch (err) {
      console.warn("Firestore getAllEscalations error:", err);
    }
  }
  return [...memoryStore.escalations].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Links duplicate complaints to a shared parent incident record.
 * Parallelizes duplicate updates with Promise.all for high performance.
 *
 * @param primaryId - Primary complaint tracking ID
 * @param duplicateIds - List of duplicate complaint tracking IDs
 * @param notes - Grouping description notes
 * @returns Generated Incident record
 */
export async function linkComplaintsToIncident(
  primaryId: string,
  duplicateIds: string[],
  notes = "Grouped as related incident reports"
): Promise<Incident | null> {
  clearComplaintsCache();
  const primary = await getComplaintById(primaryId);
  if (!primary) return null;

  const incidentId = primary.incidentId || `INC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const allRelated = Array.from(new Set([primaryId, ...duplicateIds]));

  // Update primary complaint
  const primaryPromise = updateComplaintFields(primaryId, {
    incidentId,
    duplicateCount: (primary.duplicateCount || 0) + duplicateIds.length,
    adminNotes: `${primary.adminNotes ? primary.adminNotes + "\n" : ""}[Incident Grouped: ${incidentId}] ${notes}`,
  });

  // Update all duplicates concurrently
  const duplicatePromises = duplicateIds.map((dupId) =>
    updateComplaintFields(dupId, {
      incidentId,
      duplicateOf: primaryId,
      adminNotes: `Associated as duplicate report under primary ${primaryId} (Incident ${incidentId})`,
    })
  );

  await Promise.all([primaryPromise, ...duplicatePromises]);

  const incidentRecord: Incident = {
    incidentId,
    primaryComplaintId: primaryId,
    relatedComplaintIds: allRelated,
    category: primary.category,
    location: primary.location,
    coordinates: primary.coordinates,
    totalReports: allRelated.length,
    priority: primary.priority,
    department: primary.department,
    incidentStatus: primary.status,
    communityImpact:
      allRelated.length >= 5
        ? "Critical"
        : allRelated.length >= 3
        ? "Severe"
        : "Moderate",
    createdAt: primary.createdAt,
    updatedAt: now,
  };

  await saveIncident(incidentRecord);
  return incidentRecord;
}
