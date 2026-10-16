import { useEffect, useRef } from "react";

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
  gravity: number;
  trail?: { x: number; y: number; alpha: number }[];
}

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  width: number;
  height: number;
  rot: number;
  rotSpeed: number;
  alpha: number;
  decay: number;
}

interface CelebrationEffectsProps {
  type: "cake" | "cutting" | "reveal";
  edgesOnly?: boolean;
  active?: boolean;
  className?: string;
  durationMs?: number; // Automatic cleanup duration (avoids infinite loops)
}

export function CelebrationEffects({
  type,
  edgesOnly = false,
  active = true,
  className = "",
  durationMs = 6000,
}: CelebrationEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let raf = 0;
    const isMobile = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    let w = window.innerWidth;
    let h = window.innerHeight;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let sparks: Spark[] = [];
    let confetti: ConfettiPiece[] = [];

    // Premium luxury palettes
    const goldPalette = ["#fef08a", "#fde047", "#d9a85e", "#fffdfa", "#fed7aa", "#f59e0b"];
    const rosePalette = ["#f43f5e", "#fb7185", "#fda4af", "#be123c", "#fbcfe8", "#ffffff"];
    const celebrationPalette = ["#fef08a", "#d9a85e", "#f43f5e", "#fb7185", "#ffffff", "#fed7aa"];

    const createFireworkBurst = (originX: number, originY: number, countMultiplier = 1) => {
      const baseCount = isMobile ? 24 : 45;
      const count = Math.floor(baseCount * countMultiplier);
      const palette = type === "cutting" ? celebrationPalette : type === "cake" ? goldPalette : celebrationPalette;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * (isMobile ? 3.5 : 5.0) + 0.8;
        sparks.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (type === "cutting" ? 2.5 : 0.8),
          color: palette[Math.floor(Math.random() * palette.length)],
          alpha: 1,
          decay: Math.random() * 0.016 + 0.012,
          size: Math.random() * (isMobile ? 2.0 : 2.8) + 1.2,
          gravity: type === "cutting" ? 0.06 : 0.04,
        });
      }
    };

    const createDirectionalSparks = (originX: number, originY: number) => {
      // Golden directional sparks radiating upward from cake cut
      const count = isMobile ? 22 : 40;
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
        const speed = Math.random() * 5.5 + 2.0;
        sparks.push({
          x: originX + (Math.random() - 0.5) * 20,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: goldPalette[Math.floor(Math.random() * goldPalette.length)],
          alpha: 1,
          decay: Math.random() * 0.018 + 0.012,
          size: Math.random() * 2.5 + 1.2,
          gravity: 0.08,
        });
      }
    };

    const createConfettiBurst = (originX: number, originY: number) => {
      const count = isMobile ? 20 : 38;
      const palette = type === "cutting" ? rosePalette : goldPalette;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1.5;
        confetti.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.5,
          color: palette[Math.floor(Math.random() * palette.length)],
          width: Math.random() * 5 + 3,
          height: Math.random() * 8 + 4,
          rot: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 10,
          alpha: 1,
          decay: Math.random() * 0.012 + 0.008,
        });
      }
    };

    // Staggered celebration sequence based on scene type
    const timers: NodeJS.Timeout[] = [];

    if (type === "cake") {
      // Cake blown out: initial golden sparks followed by celebratory burst
      createFireworkBurst(w * 0.5, h * 0.45, 1.1);
      createConfettiBurst(w * 0.5, h * 0.45);
      timers.push(
        setTimeout(() => {
          createFireworkBurst(w * (edgesOnly ? 0.18 : 0.35), h * 0.3, 0.9);
        }, 500),
        setTimeout(() => {
          createFireworkBurst(w * (edgesOnly ? 0.82 : 0.65), h * 0.28, 0.9);
        }, 1100),
        setTimeout(() => {
          createFireworkBurst(w * 0.5, h * 0.25, 1.2);
        }, 1800)
      );
    } else if (type === "cutting") {
      // Cake cut: dramatic upward directional sparks and rose-gold confetti shower
      createDirectionalSparks(w * 0.5, h * 0.55);
      createConfettiBurst(w * 0.5, h * 0.5);
      timers.push(
        setTimeout(() => {
          createFireworkBurst(w * 0.3, h * 0.35, 0.9);
          createFireworkBurst(w * 0.7, h * 0.35, 0.9);
        }, 450),
        setTimeout(() => {
          createDirectionalSparks(w * 0.5, h * 0.55);
          createConfettiBurst(w * 0.5, h * 0.45);
        }, 1200)
      );
    } else if (type === "reveal") {
      // Main Birthday Reveal: Grand multi-tiered fireworks sequence
      createFireworkBurst(w * 0.25, h * 0.3, 1.0);
      timers.push(
        setTimeout(() => {
          createFireworkBurst(w * 0.75, h * 0.26, 1.0);
        }, 600),
        setTimeout(() => {
          createFireworkBurst(w * 0.5, h * 0.22, 1.3);
          createConfettiBurst(w * 0.5, h * 0.25);
        }, 1300),
        setTimeout(() => {
          createFireworkBurst(w * 0.32, h * 0.28, 0.9);
          createFireworkBurst(w * 0.68, h * 0.28, 0.9);
        }, 2200),
        setTimeout(() => {
          createFireworkBurst(w * 0.5, h * 0.2, 1.4);
        }, 3200)
      );
    }

    const startTime = Date.now();
    let isPaused = false;
    const handleVisibility = () => {
      isPaused = document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const loop = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > durationMs && sparks.length === 0 && confetti.length === 0) {
        // Animation finished cleanly: clear canvas and stop RAF to conserve 100% CPU/GPU
        ctx.clearRect(0, 0, w, h);
        return;
      }

      if (!isPaused) {
        ctx.clearRect(0, 0, w, h);

        // Render Sparks
        sparks = sparks.filter((s) => {
          s.x += s.vx;
          s.y += s.vy;
          s.vy += s.gravity;
          s.vx *= 0.98;
          s.vy *= 0.98;
          s.alpha -= s.decay;

          if (s.alpha <= 0) return false;

          ctx.save();
          ctx.globalAlpha = Math.max(0, s.alpha);
          ctx.fillStyle = s.color;
          if (!isMobile) {
            ctx.shadowBlur = 4;
            ctx.shadowColor = s.color;
          }
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          return true;
        });

        // Render Confetti
        confetti = confetti.filter((c) => {
          c.x += c.vx;
          c.y += c.vy;
          c.vy += 0.14;
          c.vx *= 0.985;
          c.rot += c.rotSpeed;
          c.alpha -= c.decay;

          if (c.alpha <= 0 || c.y > h + 20) return false;

          ctx.save();
          ctx.globalAlpha = Math.max(0, c.alpha);
          ctx.translate(c.x, c.y);
          ctx.rotate((c.rot * Math.PI) / 180);
          ctx.fillStyle = c.color;
          ctx.fillRect(-c.width / 2, -c.height / 2, c.width, c.height);
          ctx.restore();
          return true;
        });
      }

      raf = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [type, edgesOnly, active, durationMs]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-30 w-full h-full ${className}`}
      aria-hidden="true"
    />
  );
}

export default CelebrationEffects;
