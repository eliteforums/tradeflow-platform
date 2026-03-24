import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AudioMonitorState {
  isListening: boolean;
  currentTranscript: string;
  riskLevel: number;
  lastTriggerSnippet: string | null;
  isProcessing: boolean;
}

interface UseAudioMonitorOptions {
  sessionId: string;
  sessionType?: "blackbox" | "peer";
  enabled?: boolean;
  classifyIntervalMs?: number; // How often to send buffer to AI (default 15s)
  bufferWindowMs?: number; // Rolling buffer window (default 30s)
  onRiskDetected?: (level: number, snippet: string) => void;
}

/**
 * Live audio monitoring hook using Web Speech API.
 * Captures speech-to-text in real-time, maintains a rolling buffer,
 * and periodically classifies content via the ai-transcribe edge function.
 * Stores only ±10s around trigger events (PRD 19.1 selective retention).
 */
export function useAudioMonitor({
  sessionId,
  sessionType = "blackbox",
  enabled = true,
  classifyIntervalMs = 15000,
  bufferWindowMs = 30000,
  onRiskDetected,
}: UseAudioMonitorOptions) {
  const [state, setState] = useState<AudioMonitorState>({
    isListening: false,
    currentTranscript: "",
    riskLevel: 0,
    lastTriggerSnippet: null,
    isProcessing: false,
  });

  // Rolling buffer of timestamped transcript chunks
  const bufferRef = useRef<{ text: string; timestamp: number }[]>([]);
  const recognitionRef = useRef<any>(null);
  const classifyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // Get transcript text within a time window
  const getBufferText = useCallback((fromMs?: number, toMs?: number) => {
    const now = Date.now();
    const from = fromMs || now - bufferWindowMs;
    const to = toMs || now;
    return bufferRef.current
      .filter((chunk) => chunk.timestamp >= from && chunk.timestamp <= to)
      .map((chunk) => chunk.text)
      .join(" ")
      .trim();
  }, [bufferWindowMs]);

  // Trim buffer to window size
  const trimBuffer = useCallback(() => {
    const cutoff = Date.now() - bufferWindowMs;
    bufferRef.current = bufferRef.current.filter((chunk) => chunk.timestamp >= cutoff);
  }, [bufferWindowMs]);

  // Send buffer to AI for classification
  const classifyBuffer = useCallback(async () => {
    if (!enabledRef.current) return;

    const transcript = getBufferText();
    if (!transcript || transcript.length < 10) return;

    setState((prev) => ({ ...prev, isProcessing: true }));

    try {
      const { data, error } = await supabase.functions.invoke("ai-transcribe", {
        body: {
          transcript,
          session_id: sessionId,
          timestamp_offset: Date.now(),
        },
      });

      if (error) {
        console.error("[AudioMonitor] Classification error:", error);
        return;
      }

      const flagLevel = data?.flag_level || 0;

      setState((prev) => ({
        ...prev,
        riskLevel: Math.max(prev.riskLevel, flagLevel),
        isProcessing: false,
        lastTriggerSnippet: flagLevel > 0 ? data?.trigger_snippet || null : prev.lastTriggerSnippet,
      }));

      if (flagLevel > 0 && onRiskDetected) {
        onRiskDetected(flagLevel, data?.trigger_snippet || transcript.slice(-200));
      }
    } catch (err) {
      console.error("[AudioMonitor] Classification failed:", err);
      setState((prev) => ({ ...prev, isProcessing: false }));
    }
  }, [sessionId, getBufferText, onRiskDetected]);

  // Start speech recognition
  const startListening = useCallback(() => {
    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("[AudioMonitor] Web Speech API not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN"; // Default to Indian English for Eternia

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " ";
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalTranscript.trim()) {
        bufferRef.current.push({
          text: finalTranscript.trim(),
          timestamp: Date.now(),
        });
        trimBuffer();
      }

      setState((prev) => ({
        ...prev,
        currentTranscript: interimTranscript || finalTranscript,
      }));
    };

    recognition.onerror = (event: any) => {
      console.error("[AudioMonitor] Speech recognition error:", event.error);
      // Auto-restart on non-fatal errors
      if (event.error === "no-speech" || event.error === "aborted") {
        if (enabledRef.current) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch {
              // Already started
            }
          }, 1000);
        }
      }
    };

    recognition.onend = () => {
      // Auto-restart if still enabled
      if (enabledRef.current) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch {
            // Already started
          }
        }, 500);
      } else {
        setState((prev) => ({ ...prev, isListening: false }));
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setState((prev) => ({ ...prev, isListening: true }));
    } catch (err) {
      console.error("[AudioMonitor] Failed to start recognition:", err);
    }
  }, [trimBuffer]);

  // Stop speech recognition
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Already stopped
      }
      recognitionRef.current = null;
    }
    setState((prev) => ({ ...prev, isListening: false }));
  }, []);

  // Start/stop based on enabled prop
  useEffect(() => {
    if (enabled) {
      startListening();
      // Set up periodic classification
      classifyTimerRef.current = setInterval(classifyBuffer, classifyIntervalMs);
    } else {
      stopListening();
      if (classifyTimerRef.current) {
        clearInterval(classifyTimerRef.current);
        classifyTimerRef.current = null;
      }
    }

    return () => {
      stopListening();
      if (classifyTimerRef.current) {
        clearInterval(classifyTimerRef.current);
        classifyTimerRef.current = null;
      }
    };
  }, [enabled, startListening, stopListening, classifyBuffer, classifyIntervalMs]);

  // Manual trigger for immediate classification
  const classifyNow = useCallback(() => {
    classifyBuffer();
  }, [classifyBuffer]);

  // Reset risk level
  const resetRisk = useCallback(() => {
    setState((prev) => ({ ...prev, riskLevel: 0, lastTriggerSnippet: null }));
  }, []);

  // ±10s selective retention: capture transcript around escalation trigger, then purge buffer
  const captureEscalationSnippet = useCallback((windowMs: number = 10000): string => {
    const now = Date.now();
    const from = now - windowMs;
    const to = now + windowMs; // future entries within window (if any delayed results arrive)
    const snippet = bufferRef.current
      .filter((chunk) => chunk.timestamp >= from && chunk.timestamp <= to)
      .map((chunk) => chunk.text)
      .join(" ")
      .trim();

    // Purge entire buffer — selective retention: only the snippet survives
    bufferRef.current = [];

    return snippet;
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    classifyNow,
    resetRisk,
    captureEscalationSnippet,
  };
}
