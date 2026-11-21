import { describe, it, expect } from "vitest";
import { transcribeAndStructureVoice } from "@/lib/gemini";

describe("Tamil & English Voice Intake Engine", () => {
  it("structures English speech input with appropriate categorization and fallback", async () => {
    const transcript = "Deep pothole on the main road after signal, motorbikes are skidding";
    const result = await transcribeAndStructureVoice(transcript, "en-IN");

    expect(result.category).toBe("Roads & Potholes");
    expect(result.priority).toBe("High");
    expect(result.originalText).toBe(transcript);
    expect(result.title.length).toBeGreaterThan(5);
  });

  it("handles Tamil voice transcripts, detects language and creates structured draft", async () => {
    const tamilTranscript = "ரோட்டில் பெரிய பள்ளம் ஏற்பட்டுள்ளது, வாகனங்கள் செல்ல முடியவில்லை";
    const result = await transcribeAndStructureVoice(tamilTranscript, "ta-IN");

    expect(result.detectedLanguage).toBe("ta");
    expect(result.originalText).toBe(tamilTranscript);
    expect(result.category).toBe("Roads & Potholes");
  });
});
