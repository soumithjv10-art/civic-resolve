export type ComplaintCategory =
  | "Roads & Potholes"
  | "Garbage & Sanitation"
  | "Streetlights & Electrical"
  | "Water Supply & Leakage"
  | "Drainage & Sewage"
  | "Public Safety & Parks"
  | "Other";

export type PriorityLevel = "Low" | "Medium" | "High" | "Critical";

export type ComplaintStatus =
  | "Reported"
  | "In Progress"
  | "Awaiting Verification"
  | "Resolved"
  | "Reopened";

export type VerificationStatus =
  | "Unverified"
  | "Pending Citizen"
  | "Confirmed Resolved"
  | "Disputed";

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface ComplaintHistoryEntry {
  timestamp: string;
  action: string;
  performedBy: string;
  details?: string;
  previousStatus?: ComplaintStatus;
  newStatus?: ComplaintStatus;
}

export interface ResolutionEvidence {
  beforeImageUrl?: string;
  afterImageUrl?: string;
  verifiedAt?: string;
  aiVerdict?: "Likely Resolved" | "Possibly Incomplete" | "Unable to Verify" | "Requires Manual Review";
  aiConfidence?: number;
  aiReasoning?: string;
  officialNotes?: string;
  submittedBy?: string;
}

export interface Complaint {
  id: string; // e.g. CIVIC-2026-10492
  title: string;
  description: string;
  location: string;
  coordinates?: GeoCoordinates;
  imageUrl?: string;
  userCategory?: string;
  language: string; // e.g. "en", "ta", "auto"
  originalLanguageText?: string; // Original Tamil text if translated
  category: ComplaintCategory;
  priority: PriorityLevel;
  department: string;
  aiSummary: string;
  aiConfidence: number;
  isFallback?: boolean;
  aiReasoning?: string;
  status: ComplaintStatus;
  upvotes: number;
  incidentId?: string;
  duplicateOf?: string;
  duplicateCount: number;
  assignedOfficer?: string;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
  slaDeadline: string; // ISO 8601 string
  resolvedAt?: string; // ISO 8601 string
  adminNotes: string;
  resolutionEvidence?: ResolutionEvidence;
  verificationStatus: VerificationStatus;
  escalationLevel: number; // 0: Dept, 1: Supervisor, 2: Municipal Admin, 3: Senior Authority
  isSampleData?: boolean;
  history?: ComplaintHistoryEntry[];
}

export interface Incident {
  incidentId: string;
  primaryComplaintId: string;
  relatedComplaintIds: string[];
  category: ComplaintCategory;
  location: string;
  coordinates?: GeoCoordinates;
  totalReports: number;
  priority: PriorityLevel;
  department: string;
  incidentStatus: ComplaintStatus;
  communityImpact: "Low" | "Moderate" | "Severe" | "Critical";
  createdAt: string;
  updatedAt: string;
}

export interface Resolution {
  resolutionId: string;
  complaintId: string;
  beforeImage?: string;
  afterImage: string;
  aiVerificationResult: "Likely Resolved" | "Possibly Incomplete" | "Unable to Verify" | "Requires Manual Review";
  verificationConfidence: number;
  officialNotes: string;
  citizenConfirmation?: "Confirmed" | "Disputed" | "Pending";
  createdAt: string;
}

export interface DepartmentInfo {
  id: string;
  name: string;
  categories: ComplaintCategory[];
  headOfficer: string;
  contactEmail: string;
  phone: string;
}

export interface AuditLog {
  id: string;
  complaintId: string;
  action: string;
  actor: string;
  timestamp: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
  notes?: string;
}

export interface EscalationRecord {
  id: string;
  complaintId: string;
  previousLevel: number;
  newLevel: number;
  reason: string;
  triggeredBy: string;
  timestamp: string;
}

export interface SLAConfig {
  priority: PriorityLevel;
  targetHours: number;
  warningHours: number;
}

export interface VoiceTranscribeResult {
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: PriorityLevel;
  department: string;
  detectedLanguage: "ta" | "en" | "other";
  originalText: string;
  translatedText?: string;
  confidence: number;
}

export interface DepartmentMetric {
  departmentName: string;
  totalAssigned: number;
  pending: number;
  overdue: number;
  adminResolved: number;
  aiVerified: number;
  citizenConfirmed: number;
  avgResolutionHours: number;
  slaComplianceRate: number;
}

export interface PredictiveRecommendation {
  id: string;
  category: ComplaintCategory;
  locality: string;
  incidentCount: number;
  recommendation: string;
  riskLevel: "Critical" | "High" | "Medium" | "Elevated";
  preventativeAction: string;
}

export interface AnalyticsData {
  totalComplaints: number;
  openComplaints: number;
  resolvedComplaints: number;
  overdueComplaints: number;
  overallResolutionRate: number;
  avgResolutionHours: number;
  slaComplianceRate: number;
  categoryDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  departmentMetrics: DepartmentMetric[];
  predictiveInsights: PredictiveRecommendation[];
  geographicHotspots: Array<{ locality: string; count: number; category: string }>;
}




