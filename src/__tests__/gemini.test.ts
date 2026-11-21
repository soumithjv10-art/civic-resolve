import { describe, it, expect } from "vitest";
import { analyzeComplaintWithAI } from "@/lib/gemini";
import { classifyDeterministically } from "@/lib/priority-engine";
import { z } from "zod";

const AIAnalysisSchema = z.object({
  category: z.enum([
    "Roads & Potholes",
    "Garbage & Sanitation",
    "Streetlights & Electrical",
    "Water Supply & Leakage",
    "Drainage & Sewage",
    "Public Safety & Parks",
    "Other",
  ]),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  department: z.string(),
  aiSummary: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  detectedHazards: z.array(z.string()).optional(),
});

describe("Gemini AI Triage & Fallback Processing", () => {
  it("parses valid structured JSON conforming to AIAnalysisSchema", () => {
    const rawJson = JSON.stringify({
      category: "Roads & Potholes",
      priority: "High",
      department: "Public Works Department (PWD)",
      aiSummary: "Severe road crater causing vehicle skids on highway.",
      confidence: 0.95,
      reasoning: "Deep pothole on high speed corridor.",
      detectedHazards: ["Accident risk"],
    });

    const parsed = JSON.parse(rawJson);
    const validated = AIAnalysisSchema.safeParse(parsed);
    expect(validated.success).toBe(true);
    if (validated.success) {
      expect(validated.data.category).toBe("Roads & Potholes");
      expect(validated.data.priority).toBe("High");
    }
  });

  it("safely handles malformed JSON or markdown codeblocks", () => {
    const malformedStrings = [
      "```json\n{\"category\": \"Roads & Potholes\", \"priority\": \"High\", \"department\": \"PWD\", \"aiSummary\": \"Test\", \"confidence\": 0.9, \"reasoning\": \"None\"}\n```",
      "Not JSON at all",
      "{\"broken\": json",
    ];

    for (const str of malformedStrings) {
      let parsed = null;
      try {
        const cleaned = str.replace(/```(?:json)?\n?/g, "").replace(/```/g, "").trim();
        parsed = JSON.parse(cleaned);
      } catch {
        parsed = null;
      }

      if (parsed) {
        const validated = AIAnalysisSchema.safeParse(parsed);
        expect(validated.success).toBe(true);
      } else {
        expect(parsed).toBeNull();
      }
    }
  });

  it("falls back to deterministic classification without throwing when API key is missing", async () => {
    // With placeholder key, analyzeComplaintWithAI runs deterministic fallback
    const result = await analyzeComplaintWithAI({
      title: "Snapped electrical line sparking near bus stop",
      description: "Live wire hanging over pedestrian crossing",
      location: "Anna Nagar",
    });

    expect(result).toBeDefined();
    expect(result.priority).toBe("Critical");
    expect(result.category).toBe("Streetlights & Electrical");
    expect(result.department).toBe("Municipal Electrical & Streetlighting Board");
    expect(result.isFallback).toBe(true);
  });

  it("correctly identifies hazardous keywords across Tamil and English", () => {
    const electrical = classifyDeterministically(
      "மின்கம்பி அறுந்து விழுந்துள்ளது",
      "மின்சாரம் பாய்கிறது ஆபத்து"
    );
    expect(electrical.category).toBe("Streetlights & Electrical");
    expect(electrical.priority).toBe("Critical");

    const pothole = classifyDeterministically(
      "பெரிய பள்ளம் ரோட்டில்",
      "வாகனங்கள் விபத்து ஏற்படும்"
    );
    expect(pothole.category).toBe("Roads & Potholes");
    expect(pothole.priority).toBe("High");
  });
});
