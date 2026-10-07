import { useEffect, useRef } from "react";

interface AmbientParticlesProps {
  density?: "low" | "medium" | "high";
  petals?: boolean;
  dots?: boolean;
  hearts?: boolean;
  className?: string;
}

export function AmbientParticles({
  density = "medium",
  petals = true,
  dots = true,
  hearts = false,
  className = "",
}: AmbientParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
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

    const isMobile = window.innerWidth < 768;
    const mobileMultiplier = isMobile ? 0.45 : 1.0;
    const baseCount = density === "low" ? 22 : density === "medium" ? 42 : 72;
    const count = Math.max(8, Math.min(Math.floor(baseCount * mobileMultiplier), Math.floor((w * h) / (isMobile ? 36000 : 20000))));

    type Particle = {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      alpha: number;
      type: "dot" | "petal" | "heart";
      rot: number;
      rotSpeed: number;
      color: string;
      layer: number;
    };

    const petalPalette = ["#d9a85e", "#d4869a", "#f3cbb4", "#ffffff", "#b06b7d", "#fda4af"];
    const heartPalette = ["#f43f5e", "#fb7185", "#fda4af", "#e11d48"];
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const layer = Math.random() < 0.35 ? 0 : Math.random() < 0.75 ? 1 : 2;
      const speedScale = layer === 0 ? 0.5 : layer === 1 ? 0.85 : 1.25;
      const sizeScale = layer === 0 ? 0.7 : layer === 1 ? 1.0 : 1.35;

      const isHeart = hearts && Math.random() < 0.22;
      const isPetal = !isHeart && petals && (!dots || Math.random() > 0.55);
      const pType: "dot" | "petal" | "heart" = isHeart ? "heart" : isPetal ? "petal" : "dot";
      const pColor = isHeart
        ? heartPalette[Math.floor(Math.random() * heartPalette.length)]
        : petalPalette[Math.floor(Math.random() * petalPalette.length)];

      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (isHeart ? Math.random() * 3.5 + 2.5 : isPetal ? Math.random() * 4 + 3 : Math.random() * 2 + 1) * sizeScale,
        vx: (Math.random() - 0.5) * (isHeart ? 0.3 : isPetal ? 0.35 : 0.2) * speedScale,
        vy: ((Math.random() * -0.35) - (isHeart ? 0.25 : isPetal ? 0.2 : 0.08)) * speedScale,
        alpha: Math.random() * 0.4 + (layer === 0 ? 0.15 : 0.25),
        type: pType,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02 * speedScale,
        color: pColor,
        layer,
      });
    }

    let isPaused = false;
    const handleVisibility = () => {
      isPaused = document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const draw = () => {
      if (!isPaused) {
        ctx.clearRect(0, 0, w, h);
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.rotSpeed;
          if (p.y < -30) {
            p.y = h + 30;
            p.x = Math.random() * w;
          }
          if (p.x < -30) p.x = w + 30;
          if (p.x > w + 30) p.x = -30;

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          if (p.type === "heart") {
            ctx.rotate(p.rot * 0.4);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            const s = p.r * 0.85;
            ctx.moveTo(0, s * 0.3);
            ctx.bezierCurveTo(-s, -s * 0.7, -s * 1.3, s * 0.5, 0, s * 1.3);
            ctx.bezierCurveTo(s * 1.3, s * 0.5, s, -s * 0.7, 0, s * 0.3);
            ctx.fill();
          } else if (p.type === "petal") {
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.r, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });
      }
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [density, petals, dots, hearts]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none select-none z-10 ${className}`}
      aria-hidden="true"
    />
  );
}

export default AmbientParticles;
