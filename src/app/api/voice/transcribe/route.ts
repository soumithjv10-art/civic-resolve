import { NextRequest, NextResponse } from "next/server";
import { VoiceTranscribeSchema } from "@/lib/validation";
import { transcribeAndStructureVoice } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = VoiceTranscribeSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid voice transcript input",
          details: validated.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { transcript, language } = validated.data;
    const structuredResult = await transcribeAndStructureVoice(
      transcript,
      language
    );

    return NextResponse.json({
      success: true,
      draft: structuredResult,
    });
  } catch (error) {
    console.error("Voice transcription parsing error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process voice transcript." },
      { status: 500 }
    );
  }
}
