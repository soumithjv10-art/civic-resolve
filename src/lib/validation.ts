import { z } from "zod";

export const ComplaintCategoryEnum = z.enum([
  "Roads & Potholes",
  "Garbage & Sanitation",
  "Streetlights & Electrical",
  "Water Supply & Leakage",
  "Drainage & Sewage",
  "Public Safety & Parks",
  "Other",
]);

export const PriorityLevelEnum = z.enum(["Low", "Medium", "High", "Critical"]);

export const ComplaintStatusEnum = z.enum([
  "Reported",
  "In Progress",
  "Awaiting Verification",
  "Resolved",
  "Reopened",
]);

export const CreateComplaintSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(250, "Title cannot exceed 250 characters"),
  description: z
    .string()
    .max(5000)
    .optional(),
  location: z
    .string()
    .min(2, "Location description must be at least 2 characters")
    .max(250, "Location cannot exceed 250 characters"),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
  imageUrl: z.string().optional(),
  imageBase64: z.string().optional(),
  imageMimeType: z
    .enum(["image/jpeg", "image/png", "image/webp"])
    .optional(),
  userCategory: z.string().optional(),
  language: z.string().default("en"),
  originalLanguageText: z.string().optional(),
});

export const UpdateComplaintAdminSchema = z.object({
  status: ComplaintStatusEnum.optional(),
  priority: PriorityLevelEnum.optional(),
  department: z.string().optional(),
  adminNotes: z.string().optional(),
  assignedOfficer: z.string().optional(),
  slaDeadline: z.string().optional(),
  escalationLevel: z.number().min(0).max(3).optional(),
});

export const AdminAuthSchema = z.object({
  secret: z.string().min(1, "Password/Secret is required"),
});

export const ResolutionSubmissionSchema = z.object({
  complaintId: z.string().min(1, "Complaint ID is required"),
  afterImageUrl: z.string().min(1, "After-repair photo is required"),
  officialNotes: z.string().min(5, "Official repair notes are required"),
});

export const CitizenConfirmationSchema = z.object({
  complaintId: z.string().min(1, "Complaint ID is required"),
  decision: z.enum(["Confirmed", "Disputed"]),
  feedback: z.string().max(1000).optional(),
});

export const CitizenReopenSchema = z.object({
  reason: z
    .string()
    .min(5, "Please provide a reason for disputing the resolution (at least 5 characters)")
    .max(1000, "Reason cannot exceed 1000 characters"),
});


export const UpvoteSchema = z.object({
  complaintId: z.string().min(1, "Complaint ID is required"),
});

export const VoiceTranscribeSchema = z.object({
  transcript: z.string().min(3, "Voice transcript must contain at least 3 characters"),
  language: z.enum(["ta-IN", "en-IN", "ta", "en"]).default("ta-IN"),
});

export const DuplicateCheckSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  category: z.string().optional(),
  location: z.string().min(2),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
});

export const LinkIncidentSchema = z.object({
  primaryComplaintId: z.string().min(1, "Primary complaint ID is required"),
  duplicateComplaintIds: z.array(z.string()).min(1, "At least one duplicate ID is required"),
  notes: z.string().optional(),
});

export const EscalateRequestSchema = z.object({
  complaintId: z.string().optional(),
  reason: z.string().optional(),
  autoScanAllOverdue: z.boolean().default(false),
});

