import { ComplaintCategory, PriorityLevel } from "./types";
import { DEFAULT_DEPARTMENT_FOR_CATEGORY } from "./constants";

interface HeuristicClassification {
  category: ComplaintCategory;
  priority: PriorityLevel;
  department: string;
  aiSummary: string;
  confidence: number;
  reasoning: string;
}

export function classifyDeterministically(
  title: string,
  description: string,
  userSuppliedCategory?: string
): HeuristicClassification {
  const combined = `${title} ${description}`.toLowerCase();

  // 1. Critical safety hazard checks
  if (
    combined.includes("electric shock") ||
    combined.includes("live wire") ||
    combined.includes("open wire") ||
    combined.includes("hanging wire") ||
    combined.includes("transformer sparking") ||
    combined.includes("open manhole") ||
    combined.includes("missing manhole cover") ||
    combined.includes("road collapse") ||
    combined.includes("cave in") ||
    combined.includes("massive sinkhole") ||
    combined.includes("severe flooding") ||
    combined.includes("submerged road") ||
    combined.includes("மின்சாரம்") ||
    combined.includes("அறுந்து விழுந்த")
  ) {
    let cat: ComplaintCategory = "Streetlights & Electrical";
    if (combined.includes("manhole") || combined.includes("drain") || combined.includes("சாக்கடை")) {
      cat = "Drainage & Sewage";
    } else if (combined.includes("road") || combined.includes("sinkhole") || combined.includes("பள்ளம்") || combined.includes("சாலை")) {
      cat = "Roads & Potholes";
    }

    return {
      category: cat,
      priority: "Critical",
      department: DEFAULT_DEPARTMENT_FOR_CATEGORY[cat],
      aiSummary: `Critical public safety hazard: ${title.slice(0, 80)}. Immediate danger identified requiring emergency municipal intervention.`,
      confidence: 0.92,
      reasoning: "Keyword heuristics detected severe immediate danger (live wire, open manhole, or structural collapse) warranting a 4-hour SLA.",
    };
  }

  // 2. High priority checks
  if (
    combined.includes("burst") ||
    combined.includes("pipeline break") ||
    combined.includes("water pipe burst") ||
    combined.includes("major leak") ||
    combined.includes("deep pothole") ||
    combined.includes("huge pothole") ||
    combined.includes("crater") ||
    combined.includes("accident prone") ||
    combined.includes("unlit junction") ||
    combined.includes("dark intersection") ||
    combined.includes("complete blackout") ||
    combined.includes("sewage flooding") ||
    combined.includes("raw sewage overflow") ||
    combined.includes("பெரிய பள்ளம்") ||
    combined.includes("குழாய் உடைப்பு")
  ) {
    let cat: ComplaintCategory = "Roads & Potholes";
    if (combined.includes("pipe") || combined.includes("water") || combined.includes("குழாய்") || combined.includes("குடிநீர்")) {
      cat = "Water Supply & Leakage";
    } else if (combined.includes("sewage") || combined.includes("drain") || combined.includes("சாக்கடை")) {
      cat = "Drainage & Sewage";
    } else if (combined.includes("unlit") || combined.includes("blackout") || combined.includes("light") || combined.includes("விளக்கு")) {
      cat = "Streetlights & Electrical";
    }

    return {
      category: cat,
      priority: "High",
      department: DEFAULT_DEPARTMENT_FOR_CATEGORY[cat],
      aiSummary: `High-priority infrastructure issue: ${title.slice(0, 80)}. Significant risk of vehicle accidents or health hazards.`,
      confidence: 0.88,
      reasoning: "Severe disruption or elevated safety risk detected on vital public infrastructure requiring a 24-hour response window.",
    };
  }

  // 3. Medium priority checks (Garbage, broken streetlights, minor leaks, clogged drains)
  if (
    combined.includes("garbage") ||
    combined.includes("trash") ||
    combined.includes("waste") ||
    combined.includes("dump") ||
    combined.includes("litter") ||
    combined.includes("bin overflowing") ||
    combined.includes("குப்பை") ||
    combined.includes("துர்நாற்றம்")
  ) {
    return {
      category: "Garbage & Sanitation",
      priority: "Medium",
      department: DEFAULT_DEPARTMENT_FOR_CATEGORY["Garbage & Sanitation"],
      aiSummary: `Sanitation concern regarding solid waste accumulation in ${title.slice(0, 60)}.`,
      confidence: 0.85,
      reasoning: "Solid waste or uncollected garbage poses health and hygiene concerns; routed to Solid Waste Management with standard 72-hour turnaround.",
    };
  }

  if (
    combined.includes("light") ||
    combined.includes("lamp") ||
    combined.includes("flickering") ||
    combined.includes("dark street") ||
    combined.includes("தெரு விளக்கு") ||
    combined.includes("விளக்கு")
  ) {
    return {
      category: "Streetlights & Electrical",
      priority: "Medium",
      department: DEFAULT_DEPARTMENT_FOR_CATEGORY["Streetlights & Electrical"],
      aiSummary: `Streetlighting maintenance requested: ${title.slice(0, 60)}.`,
      confidence: 0.86,
      reasoning: "Non-functional illumination reported; routed to Electrical Board for component inspection.",
    };
  }

  if (
    combined.includes("sewage") ||
    combined.includes("drain") ||
    combined.includes("clogged") ||
    combined.includes("gutter") ||
    combined.includes("stagnant") ||
    combined.includes("சாக்கடை") ||
    combined.includes("கழிவுநீர்")
  ) {
    return {
      category: "Drainage & Sewage",
      priority: "Medium",
      department: DEFAULT_DEPARTMENT_FOR_CATEGORY["Drainage & Sewage"],
      aiSummary: `Drainage blockage and storm water overflow concern: ${title.slice(0, 60)}.`,
      confidence: 0.84,
      reasoning: "Stagnant drainage or gutter blockage requiring desilting; scheduled for inspection within standard SLA.",
    };
  }

  if (
    combined.includes("water") ||
    combined.includes("drinking water") ||
    combined.includes("contamination") ||
    combined.includes("low pressure") ||
    combined.includes("tap") ||
    combined.includes("குடிநீர்") ||
    combined.includes("தண்ணீர்")
  ) {
    return {
      category: "Water Supply & Leakage",
      priority: "Medium",
      department: DEFAULT_DEPARTMENT_FOR_CATEGORY["Water Supply & Leakage"],
      aiSummary: `Municipal water service issue reported: ${title.slice(0, 60)}.`,
      confidence: 0.85,
      reasoning: "Municipal water supply irregularity; routed to Metro Water Supply & Sewerage Board.",
    };
  }

  if (
    combined.includes("park") ||
    combined.includes("bench") ||
    combined.includes("tree branch") ||
    combined.includes("swing") ||
    combined.includes("playground") ||
    combined.includes("பூங்கா")
  ) {
    return {
      category: "Public Safety & Parks",
      priority: "Low",
      department: DEFAULT_DEPARTMENT_FOR_CATEGORY["Public Safety & Parks"],
      aiSummary: `Public park and amenities maintenance needed: ${title.slice(0, 60)}.`,
      confidence: 0.83,
      reasoning: "Routine amenity upkeep or non-hazardous park fixture repair; assigned standard low-urgency queue.",
    };
  }

  // 4. Default / User-supplied fallback
  let selectedCategory: ComplaintCategory = "Other";
  if (
    userSuppliedCategory &&
    [
      "Roads & Potholes",
      "Garbage & Sanitation",
      "Streetlights & Electrical",
      "Water Supply & Leakage",
      "Drainage & Sewage",
      "Public Safety & Parks",
      "Other",
    ].includes(userSuppliedCategory)
  ) {
    selectedCategory = userSuppliedCategory as ComplaintCategory;
  } else if (
    combined.includes("pothole") ||
    combined.includes("road") ||
    combined.includes("tar") ||
    combined.includes("பள்ளம்") ||
    combined.includes("ரோடு") ||
    combined.includes("சாலை")
  ) {
    selectedCategory = "Roads & Potholes";
  }


  return {
    category: selectedCategory,
    priority: "Medium",
    department: DEFAULT_DEPARTMENT_FOR_CATEGORY[selectedCategory],
    aiSummary: `Citizen grievance filed: ${title.slice(0, 90)}. Recorded for inspection.`,
    confidence: 0.78,
    reasoning: "Deterministic keyword heuristic applied in absence of explicit critical safety triggers.",
  };
}
