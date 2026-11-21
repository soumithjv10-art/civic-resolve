import { ComplaintCategory, PriorityLevel, DepartmentInfo, SLAConfig } from "./types";

export const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  "Roads & Potholes",
  "Garbage & Sanitation",
  "Streetlights & Electrical",
  "Water Supply & Leakage",
  "Drainage & Sewage",
  "Public Safety & Parks",
  "Other",
];

export const PRIORITY_LEVELS: PriorityLevel[] = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

export const DEPARTMENTS: DepartmentInfo[] = [
  {
    id: "pwd",
    name: "Public Works Department (PWD)",
    categories: ["Roads & Potholes", "Drainage & Sewage"],
    headOfficer: "Er. K. Ramesh (Chief Engineer)",
    contactEmail: "pwd.works@municipal.gov.in",
    phone: "+91 44 2561 9001",
  },
  {
    id: "swm",
    name: "Solid Waste Management & Sanitation",
    categories: ["Garbage & Sanitation"],
    headOfficer: "Dr. S. Meenakshi (Zonal Health Officer)",
    contactEmail: "sanitation@municipal.gov.in",
    phone: "+91 44 2561 9002",
  },
  {
    id: "eb",
    name: "Municipal Electrical & Streetlighting Board",
    categories: ["Streetlights & Electrical"],
    headOfficer: "Er. V. Sundaram (Divisional Electrical Engineer)",
    contactEmail: "streetlights@municipal.gov.in",
    phone: "+91 44 2561 9003",
  },
  {
    id: "metro-water",
    name: "Metro Water Supply & Sewerage Board",
    categories: ["Water Supply & Leakage", "Drainage & Sewage"],
    headOfficer: "Er. A. Vijayakumar (Executive Engineer)",
    contactEmail: "waterboard@municipal.gov.in",
    phone: "+91 44 2561 9004",
  },
  {
    id: "parks-safety",
    name: "Parks, Playgrounds & Public Safety Dept",
    categories: ["Public Safety & Parks", "Other"],
    headOfficer: "Thiru. R. Balaji (Superintendent of Parks)",
    contactEmail: "civicsafety@municipal.gov.in",
    phone: "+91 44 2561 9005",
  },
];

export const SLA_TARGETS: Record<PriorityLevel, SLAConfig> = {
  Critical: {
    priority: "Critical",
    targetHours: 4,
    warningHours: 2,
  },
  High: {
    priority: "High",
    targetHours: 24,
    warningHours: 18,
  },
  Medium: {
    priority: "Medium",
    targetHours: 72,
    warningHours: 48,
  },
  Low: {
    priority: "Low",
    targetHours: 168, // 7 days = 168 hours
    warningHours: 120,
  },
};

export const DEFAULT_DEPARTMENT_FOR_CATEGORY: Record<ComplaintCategory, string> = {
  "Roads & Potholes": "Public Works Department (PWD)",
  "Garbage & Sanitation": "Solid Waste Management & Sanitation",
  "Streetlights & Electrical": "Municipal Electrical & Streetlighting Board",
  "Water Supply & Leakage": "Metro Water Supply & Sewerage Board",
  "Drainage & Sewage": "Metro Water Supply & Sewerage Board",
  "Public Safety & Parks": "Parks, Playgrounds & Public Safety Dept",
  "Other": "Public Works Department (PWD)",
};
