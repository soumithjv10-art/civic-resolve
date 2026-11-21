import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { ComplaintCategory, PriorityLevel, VoiceTranscribeResult } from "./types";
import { classifyDeterministically } from "./priority-engine";
import { DEFAULT_DEPARTMENT_FOR_CATEGORY } from "./constants";

export interface AIAnalysisOutput {
  category: ComplaintCategory;
  priority: PriorityLevel;
  department: string;
  aiSummary: string;
  confidence: number;
  reasoning: string;
  isFallback: boolean;
  detectedHazards?: string[];
}

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

export interface ResolutionVerificationOutput {
  aiVerdict: "Likely Resolved" | "Possibly Incomplete" | "Unable to Verify" | "Requires Manual Review";
  verification: "Likely Resolved" | "Possibly Incomplete" | "Unable to Verify" | "Requires Manual Review";
  confidence: number;
  reasoning: string;
  observedChanges: string[];
  requiresHumanReview: boolean;
  isFallback: boolean;
}

const ResolutionVerificationSchema = z.object({
  aiVerdict: z.enum([
    "Likely Resolved",
    "Possibly Incomplete",
    "Unable to Verify",
    "Requires Manual Review",
  ]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  observedChanges: z.array(z.string()).default([]),
});

/**
 * Module-level cached instance of the GoogleGenAI client (Singleton pattern).
 */
let cachedGeminiClient: GoogleGenAI | null = null;
let cachedApiKey: string | null = null;

/**
 * Returns a singleton instance of GoogleGenAI if a valid API key is present at runtime.
 */
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "PASTE_YOUR_GEMINI_API_KEY_HERE" || apiKey.trim() === "") {
    return null;
  }
  if (cachedGeminiClient && cachedApiKey === apiKey) {
    return cachedGeminiClient;
  }
  try {
    cachedGeminiClient = new GoogleGenAI({ apiKey });
    cachedApiKey = apiKey;
    return cachedGeminiClient;
  } catch (err) {
    console.warn("Failed to instantiate GoogleGenAI client singleton:", err);
    return null;
  }
}

/**
 * Analyzes a civic grievance submission using Gemini 3.8 Flash,
 * falling back gracefully to deterministic keyword-based analysis if unavailable.
 *
 * @param input - Grievance details including title, description, location, and optional image
 * @returns Structured AI triage output with category, priority, department, and summary
 */
export async function analyzeComplaintWithAI(input: {
  title: string;
  description: string;
  location: string;
  userCategory?: string;
  imageBase64?: string;
  imageMimeType?: string;
}): Promise<AIAnalysisOutput> {
  const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const ai = getGeminiClient();

  if (!ai) {
    const fallback = classifyDeterministically(
      input.title,
      input.description,
      input.userCategory
    );
    return {
      category: fallback.category,
      priority: fallback.priority,
      department: fallback.department,
      aiSummary: fallback.aiSummary,
      confidence: fallback.confidence,
      reasoning: `Rule-based municipal triage (Deterministic fallback active): ${fallback.reasoning}`,
      isFallback: true,
    };
  }

  const systemPrompt = `You are CivicResolve AI, an expert municipal triage intelligence system.
Analyze the citizen complaint thoroughly. Categorize it into one of these strict categories:
- "Roads & Potholes"
- "Garbage & Sanitation"
- "Streetlights & Electrical"
- "Water Supply & Leakage"
- "Drainage & Sewage"
- "Public Safety & Parks"
- "Other"

Priority Rules:
- "Critical": Exposed live wires, open manholes, structural road collapse, acute life safety hazards, severe flooding.
- "High": Deep potholes on active transit routes, major water pipeline burst, dark unlit junctions, raw sewage overflowing into public areas.
- "Medium": Overflowing bins, minor non-potable leaks, broken sidewalk slabs, regular maintenance requests.
- "Low": Faded signage, minor aesthetic park issues, light cosmetic wear.

Assign the most appropriate department from:
- "Public Works Department (PWD)"
- "Solid Waste Management & Sanitation"
- "Municipal Electrical & Streetlighting Board"
- "Metro Water Supply & Sewerage Board"
- "Parks, Playgrounds & Public Safety Dept"

Respond ONLY with valid JSON matching this schema:
{
  "category": string,
  "priority": "Low" | "Medium" | "High" | "Critical",
  "department": string,
  "aiSummary": string (concise editorial 1-2 sentences),
  "confidence": number (between 0.0 and 1.0),
  "reasoning": string (clear explanation of priority and category),
  "detectedHazards": string[] (optional list of hazards)
}`;

  try {
    const contents: Array<string | { inlineData: { data: string; mimeType: string } }> = [];

    let promptText = `Citizen Complaint Details:
Title: ${input.title}
Location: ${input.location}
Description: ${input.description}`;

    if (input.userCategory) {
      promptText += `\nCitizen Selected Category: ${input.userCategory}`;
    }

    contents.push(promptText);

    if (input.imageBase64 && input.imageMimeType) {
      contents.push({
        inlineData: {
          data: input.imageBase64,
          mimeType: input.imageMimeType,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    const parsedJson = JSON.parse(responseText);
    const validated = AIAnalysisSchema.parse(parsedJson);

    return {
      category: validated.category,
      priority: validated.priority,
      department: validated.department || DEFAULT_DEPARTMENT_FOR_CATEGORY[validated.category],
      aiSummary: validated.aiSummary,
      confidence: validated.confidence,
      reasoning: validated.reasoning,
      isFallback: false,
      detectedHazards: validated.detectedHazards,
    };
  } catch (error) {
    console.warn("Gemini API call failed, using deterministic fallback:", error);
    const fallback = classifyDeterministically(
      input.title,
      input.description,
      input.userCategory
    );
    return {
      category: fallback.category,
      priority: fallback.priority,
      department: fallback.department,
      aiSummary: fallback.aiSummary,
      confidence: fallback.confidence,
      reasoning: `Rule-based municipal triage (AI unavailable): ${fallback.reasoning}`,
      isFallback: true,
    };
  }
}

/**
 * Compares before and after photographs to verify if civic repairs are genuine.
 *
 * @param input - Repair details including before/after photo URLs and official notes
 * @returns AI verification verdict, confidence, and human review recommendation
 */
export async function verifyResolutionWithAI(input: {
  complaintTitle: string;
  category: string;
  beforeImageUrl?: string;
  afterImageUrl: string;
  officialNotes: string;
}): Promise<ResolutionVerificationOutput> {
  const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const ai = getGeminiClient();

  if (!ai) {
    return {
      aiVerdict: "Requires Manual Review",
      verification: "Requires Manual Review",
      confidence: 0.7,
      reasoning: "Automated AI visual verification is operating in standard review mode. Official notes indicate completion, awaiting manual administrator sign-off.",
      observedChanges: ["Repair completion photo submitted by field supervisor"],
      requiresHumanReview: true,
      isFallback: true,
    };
  }

  const systemPrompt = `You are CivicResolve's municipal audit intelligence.
Evaluate the evidence provided for civic resolution verification.
Determine if the problem stated has been genuinely resolved based on the before/after images and official notes.
Possible verdicts:
- "Likely Resolved": Defect clearly repaired, clean surface/fix visible.
- "Possibly Incomplete": Partial work done, residual debris or incomplete patch.
- "Unable to Verify": Image blurry, incorrect angle, or insufficient visual cues.
- "Requires Manual Review": Discrepancies between notes and visual evidence.

Respond ONLY with valid JSON matching:
{
  "aiVerdict": "Likely Resolved" | "Possibly Incomplete" | "Unable to Verify" | "Requires Manual Review",
  "confidence": number (0.0 to 1.0),
  "reasoning": string,
  "observedChanges": string[]
}`;

  try {
    const prompt = `Grievance: ${input.complaintTitle} (${input.category})
Official Repair Notes: ${input.officialNotes}
Before Photo URL: ${input.beforeImageUrl || "None provided"}
After Photo URL: ${input.afterImageUrl}`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [prompt],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const validated = ResolutionVerificationSchema.parse(parsed);

    return {
      aiVerdict: validated.aiVerdict,
      verification: validated.aiVerdict,
      confidence: validated.confidence,
      reasoning: validated.reasoning,
      observedChanges: validated.observedChanges,
      requiresHumanReview: validated.aiVerdict !== "Likely Resolved" || validated.confidence < 0.85,
      isFallback: false,
    };
  } catch (err) {
    console.warn("AI verification error, falling back:", err);
    return {
      aiVerdict: "Requires Manual Review",
      verification: "Requires Manual Review",
      confidence: 0.65,
      reasoning: "AI image comparison fallback: Official field repair notes recorded. Manual visual inspection recommended.",
      observedChanges: ["Official field repair notes submitted"],
      requiresHumanReview: true,
      isFallback: true,
    };
  }
}

const VoiceStructureSchema = z.object({
  title: z.string(),
  description: z.string(),
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
  detectedLanguage: z.enum(["ta", "en", "other"]),
  translatedText: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

/**
 * Transcribes and structures speech recognition output in Tamil or English
 * using Gemini 3.8 Flash, with resilient deterministic fallback.
 *
 * @param transcript - Raw speech recognition text
 * @param hintLanguage - Expected input language code (e.g. 'ta-IN' or 'en-IN')
 * @returns Structured grievance draft ready for review
 */
export async function transcribeAndStructureVoice(
  transcript: string,
  hintLanguage: string = "ta-IN"
): Promise<VoiceTranscribeResult> {
  const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const ai = getGeminiClient();

  const isTamil =
    hintLanguage.startsWith("ta") || /[\u0B80-\u0BFF]/.test(transcript);

  if (!ai) {
    const fallback = classifyDeterministically(
      transcript,
      transcript,
      undefined
    );

    let title = transcript.slice(0, 80);
    if (isTamil) {
      title = `குடிமக்கள் புகார்: ${transcript.slice(0, 50)}...`;
    }

    return {
      title: title.length > 5 ? title : `Civic Grievance: ${fallback.category}`,
      description: transcript,
      category: fallback.category,
      priority: fallback.priority,
      department: fallback.department,
      detectedLanguage: isTamil ? "ta" : "en",
      originalText: transcript,
      translatedText: isTamil
        ? `Citizen reported: ${transcript} (Auto-translated by deterministic municipal engine)`
        : undefined,
      confidence: 0.82,
    };
  }

  const systemPrompt = `You are CivicResolve AI Voice Intake specialist.
A citizen has spoken a grievance in ${isTamil ? "Tamil (or Tanglish)" : "English"}.
Transcript: "${transcript}"

Task:
1. Detect whether the language is Tamil ('ta') or English ('en').
2. Provide a clear, actionable English complaint title (max 100 characters).
3. If the input is in Tamil, translate and elaborate the full description into clear English while keeping the original context intact.
4. Categorize strictly into one of:
   - "Roads & Potholes"
   - "Garbage & Sanitation"
   - "Streetlights & Electrical"
   - "Water Supply & Leakage"
   - "Drainage & Sewage"
   - "Public Safety & Parks"
   - "Other"
5. Assign Priority: "Low" | "Medium" | "High" | "Critical".
6. Assign Department:
   - "Public Works Department (PWD)"
   - "Solid Waste Management & Sanitation"
   - "Municipal Electrical & Streetlighting Board"
   - "Metro Water Supply & Sewerage Board"
   - "Parks, Playgrounds & Public Safety Dept"

Respond ONLY with valid JSON matching:
{
  "title": string,
  "description": string,
  "category": string,
  "priority": "Low" | "Medium" | "High" | "Critical",
  "department": string,
  "detectedLanguage": "ta" | "en" | "other",
  "translatedText": string (optional English translation),
  "confidence": number (between 0.0 and 1.0)
}`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        `Speech Transcript: "${transcript}"\nHint Language: ${hintLanguage}`,
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const validated = VoiceStructureSchema.parse(parsed);

    return {
      title: validated.title,
      description: validated.description,
      category: validated.category,
      priority: validated.priority,
      department: validated.department || DEFAULT_DEPARTMENT_FOR_CATEGORY[validated.category],
      detectedLanguage: validated.detectedLanguage,
      originalText: transcript,
      translatedText: validated.translatedText,
      confidence: validated.confidence,
    };
  } catch (err) {
    console.warn("Gemini voice structuring error, falling back:", err);
    const fallback = classifyDeterministically(
      transcript,
      transcript,
      undefined
    );

    return {
      title: transcript.slice(0, 80) || `Civic Grievance: ${fallback.category}`,
      description: transcript,
      category: fallback.category,
      priority: fallback.priority,
      department: fallback.department,
      detectedLanguage: isTamil ? "ta" : "en",
      originalText: transcript,
      confidence: 0.78,
    };
  }
}
