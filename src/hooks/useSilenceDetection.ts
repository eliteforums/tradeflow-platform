import { useState, useEffect, useRef, useCallback } from "react";

interface UseSilenceDetectionOptions {
  enabled: boolean;
  warningThresholdSec?: number; // default 120 (2 min)
  autoEndThresholdSec?: number; // default 300 (5 min)
  onWarning?: () => void;
  onAutoEnd?: () => void;
}

export const useSilenceDetection = ({
  enabled,
  warningThresholdSec = 120,
  autoEndThresholdSec = 300,
  onWarning,
  onAutoEnd,
}: UseSilenceDetectionOptions) => {
  const [silenceDurationSec, setSilenceDurationSec] = useState(0);
  const [hasWarned, setHasWarned] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetSilence = useCallback(() => {
    lastActivityRef.current = Date.now();
    setSilenceDurationSec(0);
    setHasWarned(false);
  }, []);

  // Monitor audio tracks for activity via Web Audio API
  useEffect(() => {
    if (!enabled) return;

    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let streamRef: MediaStream | null = null;

    const startMonitoring = async () => {
      try {
        // Get the local mic stream to detect user's own audio
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef = stream;
        audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkAudio = () => {
          if (!analyser) return;
          analyser.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length;
          // Threshold: if average frequency energy > 5, consider as "speaking"
          if (avg > 5) {
            lastActivityRef.current = Date.now();
          }
        };

        // Check every 500ms
        intervalRef.current = setInterval(checkAudio, 500);
      } catch {
        // Can't access mic - silence detection won't work
        console.warn("[SilenceDetection] Could not access mic for monitoring");
      }
    };

    startMonitoring();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef) streamRef.getTracks().forEach((t) => t.stop());
      if (audioCtx) audioCtx.close();
    };
  }, [enabled]);

  // Tick silence duration every second
  useEffect(() => {
    if (!enabled) return;

    const ticker = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      setSilenceDurationSec(elapsed);

      if (elapsed >= warningThresholdSec && !hasWarned) {
        setHasWarned(true);
        onWarning?.();
      }

      if (elapsed >= autoEndThresholdSec) {
        onAutoEnd?.();
      }
    }, 1000);

    return () => clearInterval(ticker);
  }, [enabled, warningThresholdSec, autoEndThresholdSec, hasWarned, onWarning, onAutoEnd]);

  return { silenceDurationSec, resetSilence };
};
