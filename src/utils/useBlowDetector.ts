import { useState, useRef, useCallback, useEffect } from "react";

export function useBlowDetector(onBlow: () => void) {
  const [status, setStatus] = useState<"idle" | "listening" | "denied" | "unavailable">("idle");
  const [blowIntensity, setBlowIntensity] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);
  const consecutiveRef = useRef(0);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStatus("idle");
    setBlowIntensity(0);
    consecutiveRef.current = 0;
  }, []);

  const start = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("unavailable");
        return;
      }
      setStatus("listening");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const data = new Uint8Array(analyser.fftSize);

      let smoothedIntensity = 0;

      const detect = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        const rawIntensity = Math.min(1, rms / 0.3);
        smoothedIntensity = smoothedIntensity * 0.7 + rawIntensity * 0.3;
        setBlowIntensity(smoothedIntensity);

        if (rms > 0.18) {
          consecutiveRef.current += 1;
          if (consecutiveRef.current > 8) {
            onBlow();
            consecutiveRef.current = 0;
          }
        } else {
          consecutiveRef.current = Math.max(0, consecutiveRef.current - 1);
        }
        rafRef.current = requestAnimationFrame(detect);
      };
      detect();
    } catch {
      setStatus("denied");
    }
  }, [onBlow, stop]);

  useEffect(() => () => stop(), [stop]);

  return { start, stop, status, blowIntensity };
}
