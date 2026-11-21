"use client";

import { useState, useRef, useEffect } from "react";
import { VoiceTranscribeResult } from "@/lib/types";
import { Mic, MicOff, Loader2, AlertCircle, Languages } from "lucide-react";

interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: {
    [index: number]: SpeechRecognitionResultItem;
  };
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => ISpeechRecognition;

interface WindowWithSpeech {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

interface VoiceRecorderProps {
  onDraftGenerated: (draft: VoiceTranscribeResult) => void;
  className?: string;
}

export function VoiceRecorder({ onDraftGenerated, className = "" }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLang, setSelectedLang] = useState<"ta-IN" | "en-IN">("ta-IN");
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    // Check Web Speech API support
    const win = window as unknown as WindowWithSpeech;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      // Speech recognition not supported in current browser environment
    }
  }, []);

  const startRecording = () => {
    setErrorMessage(null);
    setTranscript("");

    const win = window as unknown as WindowWithSpeech;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setErrorMessage(
        "Web Speech API is not supported in this browser. Please use Google Chrome or Edge, or type your complaint manually."
      );
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = selectedLang;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + " ";
        }
        setTranscript(currentTranscript.trim());
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setErrorMessage("Microphone access was denied. Please allow microphone permissions in your browser.");
        } else if (event.error === "no-speech") {
          setErrorMessage("No speech detected. Please speak clearly into the microphone.");
        } else {
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to access speech recognition";
      setErrorMessage(message);
      setIsRecording(false);
    }
  };

  const stopRecordingAndProcess = async () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignored
      }
    }
    setIsRecording(false);

    if (!transcript.trim()) {
      setErrorMessage("No voice input was captured. Please try speaking again.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/voice/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcript.trim(),
          language: selectedLang,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to process speech draft");
      }

      onDraftGenerated(data.draft);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Voice processing error";
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`p-4 bg-[#FAF8F5] border border-[#E6E1D6] rounded-2xl ${className}`}>
      {/* Top Controls: Language Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-[#1B4332]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
            Voice Reporting (குரல் பதிவு)
          </span>
        </div>

        {/* Language selector toggle */}
        <div className="flex items-center bg-white rounded-lg border border-[#E6E1D6] p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setSelectedLang("ta-IN")}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              selectedLang === "ta-IN"
                ? "bg-[#1B4332] text-white shadow-xs"
                : "text-[#57534E] hover:text-[#1C1917]"
            }`}
          >
            தமிழ் (Tamil)
          </button>
          <button
            type="button"
            onClick={() => setSelectedLang("en-IN")}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              selectedLang === "en-IN"
                ? "bg-[#1B4332] text-white shadow-xs"
                : "text-[#57534E] hover:text-[#1C1917]"
            }`}
          >
            English (India)
          </button>
        </div>
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded-xl flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Mic Button & Status */}
      <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#B04A26] disabled:bg-stone-300 text-white font-semibold text-xs transition-all shadow-sm group"
          >
            <Mic className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>
              {selectedLang === "ta-IN" ? "பேசத் தொடங்குங்கள் (Start Speaking)" : "Click to Speak"}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecordingAndProcess}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold text-xs transition-all shadow-md animate-pulse"
          >
            <MicOff className="w-4 h-4" />
            <span>முடிக்கவும் (Done / Process Audio)</span>
          </button>
        )}

        <div className="text-xs text-[#57534E] text-center sm:text-left flex-1">
          {isRecording ? (
            <span className="font-semibold text-red-700 flex items-center gap-1.5 justify-center sm:justify-start">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block"></span>
              கேட்கிறது... (Listening in {selectedLang === "ta-IN" ? "Tamil" : "English"})
            </span>
          ) : isProcessing ? (
            <span className="font-semibold text-[#1B4332] flex items-center gap-1.5 justify-center sm:justify-start">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Gemini 3.8 Flash குரல் தகவலை மாற்றுகிறது... (Structuring draft)
            </span>
          ) : (
            <span>
              {selectedLang === "ta-IN"
                ? "உங்கள் புகாரை தமிழில் பேசலாம். செயற்கை நுண்ணறிவு அதை வகைப்படுத்தி ஆங்கிலத்தில் மொழிபெயர்க்கும்."
                : "Describe the civic issue naturally. AI will structure and categorize it into the form."}
            </span>
          )}
        </div>
      </div>

      {/* Live transcript preview */}
      {transcript && (
        <div className="mt-3 p-3 bg-white rounded-xl border border-[#E6E1D6] text-xs">
          <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">
            Live Speech Transcript:
          </span>
          <p className="text-[#1C1917] italic font-medium">{transcript}</p>
        </div>
      )}
    </div>
  );
}
