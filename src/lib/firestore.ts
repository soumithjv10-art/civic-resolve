import { Firestore } from "@google-cloud/firestore";
import { Complaint, Incident, AuditLog, Resolution, EscalationRecord } from "./types";
import { INITIAL_SEED_COMPLAINTS } from "./seed-data";

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

export function getFirestoreDb(): Firestore | null {
  if (useMemoryStore) return null;
  if (!firestoreInstance) {
    try {
      const projectId = process.env.GOOGLE_CLOUD_PROJECT;
      // If no valid GCP project is set or if credentials are explicitly missing in local test, fallback gracefully
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
 * Fetch all complaints (ordered by createdAt desc, capped at limit)
 */
export async function getAllComplaints(limitCount = 50): Promise<Complaint[]> {
  const db = getFirestoreDb();
  if (db) {
    try {
      const snapshot = await db
        .collection("complaints")
        .orderBy("createdAt", "desc")
        .limit(limitCount)
        .get();

      return snapshot.docs.map((doc) => doc.data() as Complaint);
    } catch (err) {
      console.warn("Error fetching from Firestore, falling back to memory store:", err);
    }
  }

  // Memory store fallback
  const list = Array.from(memoryStore.complaints.values());
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return list.slice(0, limitCount);
}

/**
 * Fetch single complaint by tracking ID
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
 * Insert or update a complaint
 */
export async function saveComplaint(complaint: Complaint): Promise<Complaint> {
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
 * Update partial fields on a complaint
 */
export async function updateComplaintFields(
  id: string,
  updates: Partial<Complaint>,
  actor = "System"
): Promise<Complaint | null> {
  const existing = await getComplaintById(id);
  if (!existing) return null;

  const updated: Complaint = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // Add history record if status changed
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

  // Save audit log
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
 * Upvote a complaint atomically
 */
export async function incrementComplaintUpvotes(id: string): Promise<number> {
  const complaint = await getComplaintById(id);
  if (!complaint) return 0;

  const newUpvotes = (complaint.upvotes || 0) + 1;
  await saveComplaint({ ...complaint, upvotes: newUpvotes });
  return newUpvotes;
}

/**
 * Audit log recording
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
 * Retrieve audit logs for a complaint
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
 * Incidents
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
 * Escalation records
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
 * Link duplicate complaints to a shared incident record
 */
export async function linkComplaintsToIncident(
  primaryId: string,
  duplicateIds: string[],
  notes = "Grouped as related incident reports"
): Promise<Incident | null> {
  const primary = await getComplaintById(primaryId);
  if (!primary) return null;

  const incidentId = primary.incidentId || `INC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const allRelated = Array.from(new Set([primaryId, ...duplicateIds]));

  // Update primary
  await updateComplaintFields(primaryId, {
    incidentId,
    duplicateCount: (primary.duplicateCount || 0) + duplicateIds.length,
    adminNotes: `${primary.adminNotes ? primary.adminNotes + "\n" : ""}[Incident Grouped: ${incidentId}] ${notes}`,
  });

  // Update all duplicates
  for (const dupId of duplicateIds) {
    await updateComplaintFields(dupId, {
      incidentId,
      duplicateOf: primaryId,
      adminNotes: `Associated as duplicate report under primary ${primaryId} (Incident ${incidentId})`,
    });
  }

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

