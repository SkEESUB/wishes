import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Lock,
  Unlock,
  Play,
  Pause,
  VolumeX,
  RotateCcw,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  Sparkles,
  Calendar,
  X,
  Smile,
  Laugh,
  Eye,
  EyeOff,
  Compass,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
} from "lucide-react";
import assets from "./data/assets";
import {
  config,
  birthdayWish,
  letterContent,
  memories,
  wishTreeWishes,
  happiness,
  type HappinessItem,
  birthdayContent,
  stories,
} from "./data/content";
import { stickersConfig } from "./data/stickers";
import { NameRibbon } from "./components/NameRibbon";
import { PremiumButton } from "./components/PremiumButton";
import { WishTree, collectibleCardDetails } from "./components/WishTree";
import { CinematicCakeWish } from "./components/cinematic/CinematicCakeWish";
import { CinematicCakeCut } from "./components/cinematic/CinematicCakeCut";
import { CinematicAudioPlayer } from "./components/cinematic/CinematicAudioPlayer";
import { CinematicOurStory } from "./components/cinematic/CinematicOurStory";



/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type SceneState = {
  scene: number;
  started: boolean;
  countdownSkipped: boolean;
  passwordCorrect: boolean;
  openedGifts: string[];
  visitedGifts: string[];
  letterAnimated: boolean;
  cakeBlown: boolean;
  cakeStage: number;
  happinessOpened: string[];
  audioEnabled: boolean;
  audioVolume: number;
  experienceCompleted: boolean;
  reducedMotion: boolean;
};

/* ------------------------------------------------------------------ */
/* Utilities                                                          */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "birthdayExperience";

function getTargetBirthdayDate() {
  return new Date(config.birthdayDate);
}

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function loadState(): Partial<SceneState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const state = JSON.parse(raw);
      const isPastBirthday = Date.now() >= getTargetBirthdayDate().getTime();
      if (isPastBirthday) {
        // After birthday date/time has passed, every fresh website opening/reload must show 15s countdown
        return {
          ...state,
          scene: 2,
          countdownSkipped: false,
        };
      }
      return {
        ...state,
        countdownSkipped: false,
      };
    }
  } catch {}
  return {};
}

function saveState(state: SceneState) {
  try {
    const toSave = { ...state };
    // Do NOT permanently store "countdown completed" in localStorage
    delete (toSave as any).countdownSkipped;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {}
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/* Shared Components                                                  */
/* ------------------------------------------------------------------ */

function BackgroundLayer({
  src,
  overlay = true,
  className,
  animate = false,
}: {
  src?: string;
  overlay?: boolean;
  className?: string;
  animate?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
      className={cn("absolute inset-0 z-0", className)}
    >
      {src ? (
        <div className={cn("absolute inset-0 overflow-hidden", animate && "slow-zoom-bg")}>
          <img
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      ) : null}
      <div
        className={cn(
          "absolute inset-0",
          overlay &&
            "bg-gradient-to-b from-[#0b0d1c]/75 via-[#1a0f1a]/60 to-[#0b0d1c]/92"
        )}
      />
    </motion.div>
  );
}

function ParticleField({
  density = "medium",
  petals = true,
  dots = true,
  hearts = false,
}: {
  density?: "low" | "medium" | "high";
  petals?: boolean;
  dots?: boolean;
  hearts?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
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
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const mobileMultiplier = isMobile ? 0.45 : 1.0;
    const baseCount = density === "low" ? 20 : density === "medium" ? 40 : 70;
    const count = Math.max(8, Math.min(Math.floor(baseCount * mobileMultiplier), Math.floor((w * h) / (isMobile ? 36000 : 22000))));

    type P = {
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
      layer: number; // 0 = background, 1 = midground, 2 = foreground
    };

    const petalPalette = ["#d9a85e", "#d4869a", "#f3cbb4", "#ffffff", "#b06b7d"];
    const heartPalette = ["#f43f5e", "#fb7185", "#fda4af", "#e11d48"];
    const particles: P[] = [];
    for (let i = 0; i < count; i++) {
      const layer = Math.random() < 0.35 ? 0 : Math.random() < 0.75 ? 1 : 2;
      const speedScale = layer === 0 ? 0.6 : layer === 1 ? 1.0 : 1.4;
      const sizeScale = layer === 0 ? 0.7 : layer === 1 ? 1.0 : 1.35;

      const isHeart = hearts && Math.random() < 0.22;
      const isPetal = !isHeart && petals && (!dots || Math.random() > 0.6);
      if (!isHeart && !isPetal && !dots) continue;

      const pType: "dot" | "petal" | "heart" = isHeart ? "heart" : isPetal ? "petal" : "dot";
      const pColor = isHeart
        ? heartPalette[Math.floor(Math.random() * heartPalette.length)]
        : petalPalette[Math.floor(Math.random() * petalPalette.length)];

      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (isHeart ? Math.random() * 3.5 + 2.5 : isPetal ? Math.random() * 4 + 3 : Math.random() * 2 + 1) * sizeScale,
        vx: (Math.random() - 0.5) * (isHeart ? 0.3 : isPetal ? 0.4 : 0.2) * speedScale,
        vy: ((Math.random() * -0.4) - (isHeart ? 0.3 : isPetal ? 0.2 : 0.06)) * speedScale,
        alpha: (Math.random() * 0.4 + (layer === 0 ? 0.15 : 0.25)),
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
  }, [density, petals, dots, hearts, prefersReducedMotion]);

  return <canvas ref={canvasRef} className="petal-canvas will-change-transform" aria-hidden="true" />;
}

export function RomanticCelebrationBackdrop({ className }: { className?: string }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReduced || (typeof window !== "undefined" && window.innerWidth < 768)) return;
    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 16;
      const y = (e.clientY / window.innerHeight - 0.5) * 12;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, [prefersReduced]);

  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden select-none z-0", className)}>
      {/* Deep Romantic Burgundy / Midnight gradient base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0e040c] via-[#230718] to-[#0a0208]" />

      {/* Layer 1: Blurred Romantic Bokeh Orbs (Background depth) */}
      <motion.div
        animate={prefersReduced ? {} : { x: mousePos.x * 0.4, y: mousePos.y * 0.4 }}
        transition={{ type: "spring", stiffness: 40, damping: 20 }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-[8%] left-[10%] w-48 h-48 rounded-full bg-rose-500/15 blur-3xl" />
        <div className="absolute top-[18%] right-[12%] w-60 h-60 rounded-full bg-amber-400/12 blur-3xl" />
        <div className="absolute top-[48%] left-[20%] w-72 h-72 rounded-full bg-[#e11d48]/10 blur-[90px]" />
        <div className="absolute top-[62%] right-[18%] w-56 h-56 rounded-full bg-[#fef08a]/10 blur-3xl" />
        <div className="absolute top-[14%] left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-rose-400/12 blur-[100px]" />
      </motion.div>

      {/* Layer 2: Fairy Lights & Fabric Hanging Ribbons */}
      <motion.div
        animate={prefersReduced ? {} : { x: mousePos.x * 0.7, y: mousePos.y * 0.7 }}
        transition={{ type: "spring", stiffness: 45, damping: 20 }}
        className="absolute inset-x-0 top-0 h-48 sm:h-64 pointer-events-none"
      >
        <svg viewBox="0 0 1000 240" preserveAspectRatio="none" className="w-full h-full opacity-85">
          <defs>
            <linearGradient id="ribbonSilkRose" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#881337" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#be123c" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fda4af" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="ribbonGoldIvory" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#d9a85e" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#78350f" stopOpacity="0.8" />
            </linearGradient>
            <radialGradient id="fairyGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fffbeb" stopOpacity="1" />
              <stop offset="40%" stopColor="#fef08a" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#d9a85e" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Draping Swag Ribbons (Upper Canopy Curves) */}
          <path d="M -20,10 Q 250,90 500,20 Q 750,90 1020,10" fill="none" stroke="url(#ribbonSilkRose)" strokeWidth="3" opacity="0.65" />
          <path d="M -20,25 Q 240,115 500,35 Q 760,115 1020,25" fill="none" stroke="url(#ribbonGoldIvory)" strokeWidth="2.2" opacity="0.75" />
          <path d="M 120,-10 Q 350,140 600,10 Q 820,130 1020,40" fill="none" stroke="#be123c" strokeWidth="1.8" opacity="0.5" strokeDasharray="6 3" />

          {/* Hanging Vertical Silk Streamers from edges */}
          <path d="M 40,0 C 45,50 30,100 42,160 C 50,195 38,220 40,260" fill="none" stroke="#fda4af" strokeWidth="2.5" opacity="0.6" />
          <path d="M 70,0 C 65,40 80,90 72,145 C 68,180 75,205 72,240" fill="none" stroke="#fef08a" strokeWidth="1.8" opacity="0.7" />
          <path d="M 960,0 C 955,50 970,100 958,160 C 950,195 962,220 960,260" fill="none" stroke="#fda4af" strokeWidth="2.5" opacity="0.6" />
          <path d="M 930,0 C 935,40 920,90 928,145 C 932,180 925,205 928,240" fill="none" stroke="#fef08a" strokeWidth="1.8" opacity="0.7" />

          {/* Warm Fairy Light Orbs along ribbons */}
          {[
            { cx: 80, cy: 38 },
            { cx: 160, cy: 68 },
            { cx: 250, cy: 88 },
            { cx: 340, cy: 80 },
            { cx: 420, cy: 52 },
            { cx: 500, cy: 22 },
            { cx: 580, cy: 50 },
            { cx: 660, cy: 78 },
            { cx: 750, cy: 88 },
            { cx: 840, cy: 68 },
            { cx: 920, cy: 38 },
            { cx: 42, cy: 110 },
            { cx: 40, cy: 190 },
            { cx: 72, cy: 130 },
            { cx: 958, cy: 110 },
            { cx: 960, cy: 190 },
            { cx: 928, cy: 130 },
          ].map((f, i) => (
            <g key={i}>
              <circle cx={f.cx} cy={f.cy} r="9" fill="url(#fairyGlow)" className="animate-pulse" style={{ animationDelay: `${(i * 0.22) % 2.5}s`, animationDuration: "2.8s" }} />
              <circle cx={f.cx} cy={f.cy} r="2.2" fill="#ffffff" />
            </g>
          ))}
        </svg>

        {/* Decorative Flower Garlands & Rose Clusters along Top Arch */}
        <div className="absolute top-1 left-2 sm:left-6 flex items-center gap-1 opacity-80 filter drop-shadow-[0_2px_8px_rgba(244,63,94,0.6)]">
          <span className="text-xl sm:text-2xl transform -rotate-12">🌹</span>
          <span className="text-sm sm:text-base -mt-1 transform rotate-6">🌸</span>
          <span className="text-base sm:text-lg -ml-1">✨</span>
        </div>
        <div className="absolute top-1 right-2 sm:right-6 flex items-center gap-1 opacity-80 filter drop-shadow-[0_2px_8px_rgba(244,63,94,0.6)]">
          <span className="text-base sm:text-lg -mr-1">✨</span>
          <span className="text-sm sm:text-base -mt-1 transform -rotate-6">🌸</span>
          <span className="text-xl sm:text-2xl transform rotate-12">🌹</span>
        </div>
        <div className="absolute top-0 inset-x-0 mx-auto w-fit flex items-center gap-2 opacity-75 filter drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)]">
          <span className="text-xs sm:text-sm text-gold">✦</span>
          <span className="text-base sm:text-xl">🌹</span>
          <span className="text-xs sm:text-sm text-rose-300">♥</span>
          <span className="text-base sm:text-xl">🌹</span>
          <span className="text-xs sm:text-sm text-gold">✦</span>
        </div>
      </motion.div>

      {/* Floating Petals and Tiny Gold Dust */}
      <ParticleField density="low" petals={true} dots={true} />

      {/* Subtle warm center bloom keeping backdrop deep and non-intrusive */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(244,63,94,0.08)_0%,_transparent_65%)] mix-blend-screen pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_45%,_rgba(0,0,0,0.85)_100%)] pointer-events-none" />
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  className,
  type = "button",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const isNavigatingRef = useRef(false);
  const handleClick = (_e?: React.MouseEvent) => {
    if (disabled || isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 600);
    onClick?.();
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      whileHover={
        disabled
          ? {}
          : {
              y: -2.5,
              scale: 1.025,
              boxShadow:
                "0 12px 30px -5px rgba(217, 168, 94, 0.5), 0 0 24px rgba(217, 168, 94, 0.35)",
            }
      }
      whileTap={
        disabled
          ? {}
          : {
              scale: 0.96,
              y: 0,
            }
      }
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      className={cn(
        "btn-primary relative group inline-flex min-h-[48px] items-center justify-center rounded-full px-8 py-3 font-serif font-semibold tracking-wider shadow-md transition-all duration-300 cursor-pointer overflow-hidden select-none",
        disabled && "opacity-50 cursor-not-allowed filter grayscale",
        className
      )}
    >
      {/* Soft shine shimmer sweep across button */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}

export function GlassButton({
  children,
  onClick,
  className,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { 
        y: -2, 
        scale: 1.02,
        boxShadow: "0 10px 20px -5px rgba(255, 255, 255, 0.15), 0 0 12px rgba(255, 255, 255, 0.1)" 
      }}
      whileTap={disabled ? {} : { 
        scale: 0.97, 
        y: 0 
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn("btn-glass inline-flex min-h-[44px] items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium shadow-sm transition-shadow duration-300", className)}
    >
      {children}
    </motion.button>
  );
}

function CountdownCard({ value, label }: { value: number; label: string }) {
  const formatted = String(value).padStart(2, "0");
  return (
    <div className="relative flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border border-[#e7b876]/75 bg-[#0b0410]/75 backdrop-blur-xl px-1.5 py-2 sm:px-3.5 sm:py-3 md:px-5 md:py-4 min-w-[50px] sm:min-w-[72px] md:min-w-[88px] shadow-[0_12px_32px_rgba(0,0,0,0.7),0_0_24px_rgba(231,184,118,0.22),inset_0_1px_1px_rgba(255,255,255,0.25)] overflow-hidden">
      {/* Corner subtle gold highlights */}
      <span className="absolute top-1 left-1.5 w-1 h-1 rounded-full bg-[#fef08a]/40" />
      <span className="absolute top-1 right-1.5 w-1 h-1 rounded-full bg-[#fef08a]/40" />

      {/* Subtle mechanical horizontal separator line */}
      <div className="absolute inset-x-0 top-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#e7b876]/25 to-transparent pointer-events-none z-10" />

      {/* Digit container with animated flip/slide */}
      <div className="relative h-7 sm:h-10 md:h-12 flex items-center justify-center overflow-hidden w-full">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={formatted}
            initial={{ y: -18, opacity: 0, scale: 0.94, filter: "blur(2px)" }}
            animate={{ y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ y: 18, opacity: 0, scale: 0.94, filter: "blur(2px)" }}
            transition={{
              y: { type: "spring", stiffness: 380, damping: 26 },
              opacity: { duration: 0.22 },
              scale: { duration: 0.22 },
              filter: { duration: 0.18 },
            }}
            className="font-serif text-2xl sm:text-4xl md:text-5xl font-semibold text-[#fef08a] glow-gold leading-none tracking-tight select-none inline-block drop-shadow-[0_2px_12px_rgba(254,240,138,0.4)]"
          >
            {formatted}
          </motion.span>
        </AnimatePresence>
      </div>

      <span className="mt-1 sm:mt-1.5 text-[7.5px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#fed7aa]/90 font-medium select-none">
        {label}
      </span>
    </div>
  );
}

function SafeImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const [err, setErr] = useState(false);
  if (err || !src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-rose-900/40 to-midnight",
          className
        )}
      >
        <ImageIcon className="h-10 w-10 text-white/30" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt || ""}
      className={className}
      onError={() => setErr(true)}
      loading="lazy"
    />
  );
}

function Polaroid({
  image,
  caption,
  date: _date,
  rotate = 0,
  className,
  onClick,
}: {
  image: string;
  caption: string;
  date?: string;
  rotate?: number;
  className?: string;
  onClick?: () => void;
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -py * 16, y: px * 16 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.button
      whileHover={{ y: -8, scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      animate={prefersReduced ? {} : { rotateX: tilt.x, rotateY: tilt.y }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
      className={cn(
        "polaroid block w-full p-2.5 pb-4 text-left border border-[#78350f]/15 hover:border-[#d9a85e]/60 rounded-xs bg-[#faf7f2] shadow-[0_16px_36px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.2)] hover:shadow-[0_24px_50px_rgba(0,0,0,0.7),0_0_25px_rgba(217,168,94,0.25)] cursor-pointer group focus:outline-none transition-all duration-300 select-none",
        className
      )}
      style={{
        transformStyle: "preserve-3d",
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <div className="relative border border-[#78350f]/10 group-hover:border-[#d9a85e]/40 p-0.5 rounded-xs bg-white shadow-inner transition-colors duration-300">
        <SafeImage
          src={image}
          alt={caption}
          className="polaroid-img aspect-square w-full rounded-xs bg-stone-100 object-cover filter sepia-[8%] contrast-[103%] brightness-[97%] group-hover:sepia-0 group-hover:brightness-102 transition-all duration-300"
        />
        {/* Subtle inner gold foil highlight on hover */}
        <div className="absolute inset-0 border border-transparent group-hover:border-gold/25 rounded-xs pointer-events-none transition-colors duration-300" />
      </div>
      <div className="mt-2.5 px-1 flex items-center justify-between">
        <span className="font-serif italic text-xs sm:text-sm text-[#451a03] font-semibold truncate tracking-tight">
          {caption}
        </span>
        <span className="text-[10px] text-[#b45309] font-serif group-hover:scale-125 transition-transform">♥</span>
      </div>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* Audio Engine                                                       */
/* ------------------------------------------------------------------ */

function useAudioEngine() {
  const playlist = useMemo(() => birthdayContent.playlist, []);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const currentTrack = playlist[currentTrackIndex] || playlist[0];

  const [volume, setVolumeState] = useState(0.85);
  const [audioError, setAudioError] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(["Perfect"]);

  // HTML5 Audio state
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // Initialize and track audio element
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audio.loop = isLooping;
    audio.preload = "auto";

    if (currentTrack && currentTrack.src) {
      audio.src = currentTrack.src;
      audio.load();
    }

    const onTimeUpdate = () => {
      setAudioCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setAudioProgress(audio.currentTime / audio.duration);
      }
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    };

    const onPlay = () => setIsPlayingAudio(true);
    const onPause = () => setIsPlayingAudio(false);

    const onEnded = () => {
      if (!audio.loop) {
        setIsPlayingAudio(false);
        setAudioProgress(0);
        setAudioCurrentTime(0);
        // Advance track
        handleNextTrack();
      }
    };

    const onError = () => {
      setAudioError(true);
      setIsPlayingAudio(false);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    audioElRef.current = audio;

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audioElRef.current = null;
    };
  }, [currentTrackIndex]);

  // Sync volume & loop when changed
  useEffect(() => {
    if (audioElRef.current) {
      audioElRef.current.volume = volume;
      audioElRef.current.loop = isLooping;
    }
  }, [volume, isLooping]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
  }, []);

  const play = useCallback(() => {
    if (audioElRef.current) {
      const p = audioElRef.current.play();
      if (p !== undefined) {
        p.catch(() => {
          // Handled gracefully if browser blocks before gesture
          setIsPlayingAudio(false);
        });
      }
    }
  }, []);

  const pause = useCallback(() => {
    if (audioElRef.current) {
      audioElRef.current.pause();
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlayingAudio) pause();
    else play();
  }, [isPlayingAudio, play, pause]);

  const handleNextTrack = useCallback(() => {
    if (isShuffle && playlist.length > 1) {
      let rand = Math.floor(Math.random() * playlist.length);
      while (rand === currentTrackIndex) {
        rand = Math.floor(Math.random() * playlist.length);
      }
      setCurrentTrackIndex(rand);
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    }
    // Auto-play next if was playing
    setTimeout(() => {
      if (audioElRef.current) {
        audioElRef.current.play().catch(() => {});
      }
    }, 100);
  }, [isShuffle, playlist.length, currentTrackIndex]);

  const handlePrevTrack = useCallback(() => {
    if (audioElRef.current && audioElRef.current.currentTime > 3) {
      audioElRef.current.currentTime = 0;
      setAudioCurrentTime(0);
      setAudioProgress(0);
    } else {
      setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
      setTimeout(() => {
        if (audioElRef.current) {
          audioElRef.current.play().catch(() => {});
        }
      }, 100);
    }
  }, [playlist.length]);

  const seek = useCallback((ratio: number) => {
    if (audioElRef.current && audioElRef.current.duration) {
      const targetTime = Math.max(0, Math.min(1, ratio)) * audioElRef.current.duration;
      audioElRef.current.currentTime = targetTime;
      setAudioCurrentTime(targetTime);
      setAudioProgress(ratio);
    }
  }, []);

  const toggleLoop = useCallback(() => {
    setIsLooping((prev) => !prev);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  const toggleFavorite = useCallback((title: string) => {
    setFavorites((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  }, []);

  const loadTrack = useCallback((index: number, shouldPlay: boolean) => {
    setCurrentTrackIndex(index);
    if (shouldPlay) {
      setTimeout(() => {
        if (audioElRef.current) {
          audioElRef.current.play().catch(() => {});
        }
      }, 100);
    }
  }, []);

  // Duration fallback if metadata not yet ready
  const effectiveDuration = audioDuration > 0 ? audioDuration : (currentTrackIndex === 0 ? 263 : 173);

  return {
    enabled: false, // Global ambient music is permanently disabled
    volume,
    setVolume,
    startAmbient: () => {}, // No-op: global background audio removed
    stopAmbient: () => {},  // No-op
    toggleAmbient: () => {},// No-op
    isPlayingVoice: isPlayingAudio,
    voiceProgress: audioProgress,
    voiceDuration: effectiveDuration,
    currentTime: audioCurrentTime,
    currentTrackIndex,
    currentTrack,
    playlist,
    play,
    pause,
    togglePlay,
    next: handleNextTrack,
    prev: handlePrevTrack,
    seek,
    isLooping,
    toggleLoop,
    isShuffle,
    toggleShuffle,
    favorites,
    toggleFavorite,
    loadTrack,
    audioError,
    playVoiceMelody: play,
    pauseVoiceMelody: pause,
    replayVoiceMelody: () => seek(0),
  };
}


function useBlowDetector(onBlow: () => void) {
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
            consecutiveRef.current = 0; // Reset to allow subsequent blowing
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

function FireworkCanvas({ edgesOnly = false }: { edgesOnly?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    let raf = 0;
    let w = window.innerWidth;
    let h = window.innerHeight;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    type Spark = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      decay: number;
      size: number;
      gravity: number;
    };

    let sparks: Spark[] = [];
    const colors = ["#d9a85e", "#fffdfa", "#f3cbb4", "#d4869a", "#fff5e6"];

    const createFirework = (x: number, y: number) => {
      const count = 35 + Math.floor(Math.random() * 25);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.5 + 1;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.015 + 0.01,
          size: Math.random() * 1.5 + 1.2,
          gravity: 0.04,
        });
      }
    };

    let timer = 0;
    let nextExplosionFrame = 60;

    // Elegant entrance firework bursts
    const t1 = setTimeout(() => {
      const x = edgesOnly ? w * (0.08 + Math.random() * 0.12) : w * 0.25;
      createFirework(x, h * 0.28);
    }, 350);
    const t2 = setTimeout(() => {
      const x = edgesOnly ? w * (0.8 + Math.random() * 0.12) : w * 0.75;
      createFirework(x, h * 0.24);
    }, 850);

    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      timer++;
      if (timer >= nextExplosionFrame) {
        let fireworkX;
        if (edgesOnly) {
          fireworkX = Math.random() > 0.5 
            ? w * (0.06 + Math.random() * 0.15) 
            : w * (0.79 + Math.random() * 0.15);
        } else {
          fireworkX = w * (0.2 + Math.random() * 0.6);
        }
        createFirework(
          fireworkX,
          h * (0.15 + Math.random() * 0.25)
        );
        nextExplosionFrame = timer + 120 + Math.floor(Math.random() * 100);
      }

      sparks = sparks.filter((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.vy += s.gravity;
        s.vx *= 0.98;
        s.vy *= 0.98;
        s.alpha -= s.decay;

        if (s.alpha <= 0) return false;

        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = s.color;
        // High fidelity glowing spark filter
        ctx.shadowBlur = 5;
        ctx.shadowColor = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      });

      raf = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10 w-full h-full" />;
}

function TypewriterText({ text, speed = 30 }: { text: string; speed?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setIndex(text.length);
      return;
    }

    setIndex(0);
    let curr = 0;
    let timer: NodeJS.Timeout;

    const type = () => {
      if (curr < text.length) {
        setIndex(curr + 1);
        curr++;
        const variation = Math.random() * 20 - 10;
        timer = setTimeout(type, Math.max(10, speed + variation));
      }
    };

    type();
    return () => clearTimeout(timer);
  }, [text, speed]);

  const visiblePart = text.slice(0, index);
  const invisiblePart = text.slice(index);

  return (
    <span className="relative">
      <span>{visiblePart}</span>
      <span className="opacity-0 pointer-events-none select-none" aria-hidden="true">
        {invisiblePart}
      </span>
      {index < text.length && (
        <span
          className="inline-block w-1.5 h-4 bg-rose/80 ml-0.5 animate-pulse"
          style={{ verticalAlign: "middle" }}
        />
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                */
/* ------------------------------------------------------------------ */

export default function App() {
  const [state, setState] = useState<SceneState>(() => {
    const saved = loadState();
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return {
      scene: saved.scene ?? 0,
      started: saved.started ?? false,
      countdownSkipped: saved.countdownSkipped ?? false,
      passwordCorrect: saved.passwordCorrect ?? false,
      openedGifts: saved.openedGifts ?? [],
      visitedGifts: saved.visitedGifts ?? [],
      letterAnimated: saved.letterAnimated ?? false,
      cakeBlown: saved.cakeBlown ?? false,
      cakeStage: saved.cakeStage ?? 0,
      happinessOpened: saved.happinessOpened ?? [],
      audioEnabled: saved.audioEnabled ?? false,
      audioVolume: saved.audioVolume ?? 0.5,
      experienceCompleted: saved.experienceCompleted ?? false,
      reducedMotion,
    };
  });

  const audio = useAudioEngine();
  const [targetDate] = useState(() => getTargetBirthdayDate());
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [direction, setDirection] = useState<number>(1);

  const isTransitioningRef = useRef(false);
  const goTo = useCallback((scene: number) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 450);

    setState((s) => {
      setDirection(scene >= s.scene ? 1 : -1);
      const next = { ...s, scene };
      saveState(next);
      return next;
    });
  }, []);

  const startExperience = useCallback(() => {
    setState((s) => {
      const next = { ...s, started: true };
      saveState(next);
      return next;
    });
    // Background music removed
    const now = new Date().getTime();
    if (targetDate.getTime() - now <= 0) {
      goTo(2); // Cinematic 15-second countdown on every start/reload after birthday
    } else {
      goTo(1);
    }
  }, [audio, goTo, targetDate]);

  const unlockPassword = useCallback(() => {
    setState((s) => {
      const next = { ...s, passwordCorrect: true };
      saveState(next);
      return next;
    });
    goTo(5);
  }, [goTo]);

  const openGift = useCallback(
    (id: string) => {
      setState((s) => {
        const opened = s.openedGifts.includes(id)
          ? s.openedGifts
          : [...s.openedGifts, id];
        const next = { ...s, openedGifts: opened };
        saveState(next);
        return next;
      });
    },
    []
  );

  const goToGift = useCallback((sceneIndex: number, giftId: string) => {
    setState((s) => {
      const visited = s.visitedGifts.includes(giftId)
        ? s.visitedGifts
        : [...s.visitedGifts, giftId];
      const opened = s.openedGifts.includes(giftId)
        ? s.openedGifts
        : [...s.openedGifts, giftId];
      const next = { ...s, scene: sceneIndex, visitedGifts: visited, openedGifts: opened };
      saveState(next);
      return next;
    });
  }, []);

  const handleGiftContinue = useCallback((giftId: string) => {
    setState((s) => {
      const opened = s.openedGifts.includes(giftId)
        ? s.openedGifts
        : [...s.openedGifts, giftId];
      const next = { ...s, openedGifts: opened, scene: 9 };
      saveState(next);
      return next;
    });
  }, []);

  const backToGifts = useCallback(() => goTo(9), [goTo]);

  const completeExperience = useCallback(() => {
    setState((s) => {
      const next = { ...s, experienceCompleted: true };
      saveState(next);
      return next;
    });
    goTo(17);
  }, [goTo]);

  const replay = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      scene: 0,
      started: false,
      countdownSkipped: false,
      passwordCorrect: false,
      openedGifts: [],
      visitedGifts: [],
      letterAnimated: false,
      cakeBlown: false,
      cakeStage: 0,
      happinessOpened: [],
      audioEnabled: false,
      audioVolume: 0.5,
      experienceCompleted: false,
      reducedMotion: state.reducedMotion,
    });
    // Background music removed
  }, [audio, state.reducedMotion]);

  /* Countdown */
  useEffect(() => {
    const tick = () => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;
      if (diff <= 0) {
        setCountdown({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }
      const totalSecs = Math.ceil(diff / 1000);
      const d = Math.floor(totalSecs / (60 * 60 * 24));
      const h = Math.floor((totalSecs / (60 * 60)) % 24);
      const m = Math.floor((totalSecs / 60) % 60);
      const s = totalSecs % 60;
      setCountdown({ d, h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate, state.scene, goTo]);

  useEffect(() => {
    audio.setVolume(state.audioVolume);
  }, [state.audioVolume]);

  const skipCountdown = useCallback(() => {
    setState((s) => {
      const next = { ...s, countdownSkipped: true };
      saveState(next);
      return next;
    });
    goTo(3);
  }, [goTo]);

  const scenes = useMemo(
    () => [
      <WelcomeScene key="welcome" onStart={startExperience} />,
      <CountdownStartScene key="cdstart" onBegin={() => goTo(2)} onSkip={skipCountdown} />,
      <CountdownRunningScene key="cdrun" countdown={countdown} targetDate={targetDate} onSkip={skipCountdown} />,
      <BirthdayRevealScene key="reveal" onContinue={() => goTo(4)} />,
      <PasswordScene key="password" onUnlock={unlockPassword} />,
      <WishesScene key="wishes" onContinue={() => goTo(6)} />,
      <CakeScene key="cake" onBlown={() => goTo(7)} />,
      <CakeCuttingScene
        key="cutcake"
        stage={state.cakeStage}
        onStage={(n) => {
          setState((s) => {
            const next = { ...s, cakeStage: n };
            saveState(next);
            return next;
          });
          if (n >= 6) setTimeout(() => goTo(8), 1000);
        }}
      />,
      <ShareHappinessScene
        key="happiness"
        opened={state.happinessOpened}
        onOpen={(id) => {
          setState((s) => {
            const opened = s.happinessOpened.includes(id)
              ? s.happinessOpened
              : [...s.happinessOpened, id];
            const next = { ...s, happinessOpened: opened };
            saveState(next);
            return next;
          });
        }}
        onContinue={() => goTo(9)}
      />,
      <GiftsScene key="gifts" opened={state.openedGifts} onOpen={openGift} onContinue={() => goTo(13)} goToGift={goToGift} />,
      <LetterScene
        key="letter"
        onBack={() => handleGiftContinue("letter")}
        onContinue={() => handleGiftContinue("letter")}
        cameFromGifts={true}
        onNext={() => goToGift(11, "memories")}
        onPrev={() => goToGift(12, "voice")}
      />,
      <MemoriesScene
        key="memories"
        onBack={() => handleGiftContinue("memories")}
        onContinue={() => handleGiftContinue("memories")}
        onNext={() => goToGift(12, "voice")}
        onPrev={() => goToGift(10, "letter")}
      />,
      <CinematicAudioPlayer
        key="voice"
        audio={audio}
        onBack={() => handleGiftContinue("voice")}
        onContinue={() => {
          setState((s) => {
            const opened = s.openedGifts.includes("voice")
              ? s.openedGifts
              : [...s.openedGifts, "voice"];
            const next = { ...s, openedGifts: opened, scene: 13 };
            saveState(next);
            return next;
          });
        }}
      />,

      <WishTree
        key="wishtree"
        onContinue={() => goTo(14)}
      />,
      <CinematicOurStory
        key="memoryjourney"
        onContinue={() => goTo(15)}
      />,
      <HiddenSurpriseScene key="surprise" onContinue={() => goTo(16)} />,
      <SpecialVideoScene key="specialvideo" onContinue={completeExperience} audio={audio} />,
      <FinalScene key="final" onReplay={replay} />,
    ],
    [
      startExperience,
      goTo,
      skipCountdown,
      countdown,
      targetDate,
      unlockPassword,
      state.cakeStage,
      state.happinessOpened,
      state.openedGifts,
      state.visitedGifts,
      openGift,
      goToGift,
      handleGiftContinue,
      backToGifts,
      audio,
      completeExperience,
      replay,
    ]
  );

  const isStoryScene = state.scene === 14;

  useEffect(() => {
    if (state.scene === 14) {
      window.scrollTo(0, 0);
    }
  }, [state.scene]);

  return (
    <div
      className={cn(
        "relative w-full bg-midnight text-white safe-top safe-bottom",
        isStoryScene
          ? "min-h-screen h-auto overflow-x-hidden overflow-y-visible"
          : "h-screen overflow-hidden"
      )}
    >


      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={state.scene}
          custom={direction}
          variants={
            state.reducedMotion
              ? {
                  initial: { opacity: 0 },
                  animate: { opacity: 1, transition: { duration: 0.2 } },
                  exit: { opacity: 0, transition: { duration: 0.2 } },
                }
              : (() => {
                  switch (state.scene) {
                    // Password Scene: Romantic glow & scale expansion into Wishes
                    case 4:
                      return {
                        initial: { opacity: 0, scale: 0.94, filter: "blur(8px)" },
                        animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
                        exit: { opacity: 0, scale: 1.05, filter: "blur(6px)", transition: { duration: 0.45, ease: "easeInOut" } },
                      };
                    // Wishes / Birthday Reveal
                    case 3:
                    case 5:
                      return {
                        initial: (dir: number) => ({ opacity: 0, y: dir > 0 ? 22 : -22, scale: 0.98, filter: "blur(6px)" }),
                        animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
                        exit: (dir: number) => ({ opacity: 0, y: dir > 0 ? -18 : 18, scale: 1.02, filter: "blur(5px)", transition: { duration: 0.4, ease: "easeInOut" } }),
                      };
                    // Cake & Cutting: Warm candlelight bloom fade
                    case 6:
                    case 7:
                      return {
                        initial: { opacity: 0, scale: 1.03, filter: "blur(6px)" },
                        animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                        exit: { opacity: 0, scale: 0.97, filter: "blur(5px)", transition: { duration: 0.4, ease: "easeInOut" } },
                      };
                    // Share Happiness Cards: Sparkle scale & fade
                    case 8:
                      return {
                        initial: { opacity: 0, scale: 0.95, y: 16, filter: "blur(6px)" },
                        animate: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                        exit: { opacity: 0, scale: 1.03, y: -16, filter: "blur(5px)", transition: { duration: 0.4, ease: "easeInOut" } },
                      };
                    // Gifts & Gift details (Letter, Memories, Voice): Elegant slide with depth
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                      return {
                        initial: (dir: number) => ({ opacity: 0, x: dir > 0 ? 32 : -32, scale: 0.98, filter: "blur(4px)" }),
                        animate: { opacity: 1, x: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
                        exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -32 : 32, scale: 0.98, filter: "blur(4px)", transition: { duration: 0.4, ease: "easeInOut" } }),
                      };
                    // Wish Tree (13) & Memory Journey (14): Botanical curtain crossfade
                    case 13:
                    case 14:
                      return {
                        initial: { opacity: 0, scale: 1.04, filter: "blur(8px)" },
                        animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
                        exit: { opacity: 0, scale: 0.96, filter: "blur(6px)", transition: { duration: 0.45, ease: "easeInOut" } },
                      };
                    // Special Video & Final Scene (16, 17): Cinematic starlight fade-through-dark
                    case 16:
                    case 17:
                      return {
                        initial: { opacity: 0, scale: 0.95, filter: "blur(10px)" },
                        animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] } },
                        exit: { opacity: 0, scale: 1.04, filter: "blur(8px)", transition: { duration: 0.5, ease: "easeInOut" } },
                      };
                    default:
                      return {
                        initial: (dir: number) => ({
                          opacity: 0,
                          scale: dir > 0 ? 0.97 : 1.02,
                          y: dir > 0 ? 14 : -14,
                          filter: "blur(6px)",
                        }),
                        animate: {
                          opacity: 1,
                          scale: 1,
                          y: 0,
                          filter: "blur(0px)",
                          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                        },
                        exit: (dir: number) => ({
                          opacity: 0,
                          scale: dir > 0 ? 1.02 : 0.97,
                          y: dir > 0 ? -12 : 12,
                          filter: "blur(5px)",
                          transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                        }),
                      };
                  }
                })()
          }
          initial="initial"
          animate="animate"
          exit="exit"
          className={cn(
            "w-full",
            isStoryScene
              ? "relative min-h-screen h-auto overflow-visible"
              : "absolute inset-0 overflow-hidden"
          )}
        >
          {scenes[state.scene]}
        </motion.div>
      </AnimatePresence>

        {/* Global music toggle removed */}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 0 — Welcome                                                  */
/* ------------------------------------------------------------------ */

function WelcomeScene({ onStart }: { onStart: () => void }) {
  return (
    <div
      className="scene-container cursor-pointer"
      onClick={onStart}
      onKeyDown={(e) => e.key === "Enter" && onStart()}
      role="button"
      tabIndex={0}
      aria-label="Begin our story"
    >
      <BackgroundLayer src={assets.welcomeFlowers} overlay animate />
      <ParticleField density="medium" petals />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="flex flex-col items-center"
        >
          <span className="mb-6 text-xs uppercase tracking-[0.4em] text-gold font-medium">
            A Special Journey Awaits
          </span>

          {/* Sealed envelope breathing visual */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="relative h-28 w-44 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center mb-10 overflow-hidden"
          >
            {/* Inner envelope lines */}
            <div className="absolute inset-x-4 top-6 h-0.5 bg-white/10" />
            <div className="absolute inset-x-4 top-10 h-0.5 bg-white/10" />
            <div className="absolute inset-x-8 top-14 h-0.5 bg-white/10" />
            
            {/* Wax seal heart icon */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              >
                <Heart className="h-8 w-8 fill-rose text-rose filter drop-shadow-[0_0_10px_rgba(212,134,154,0.85)]" />
              </motion.div>
            </div>
          </motion.div>

          <h1 className="font-serif text-4xl font-bold leading-tight sm:text-6xl max-w-xl mx-auto">
            <span className="gradient-text glow-gold block">Tonight is a little different...</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md font-serif italic text-base text-white/70 sm:text-lg">
            There&apos;s a little story waiting for you.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-10"
          >
            <PrimaryButton onClick={onStart}>Begin Our Story ♥</PrimaryButton>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 1 & 2 — Countdown                                            */
/* ------------------------------------------------------------------ */

function CountdownStartScene({ onBegin, onSkip }: { onBegin: () => void; onSkip: () => void }) {
  return (
    <div className="scene-container relative overflow-hidden">
      <BackgroundLayer src={assets.cinematicFlowerArch || assets.countdownGarden} overlay />
      {/* Soft depth gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#07030e]/80 via-transparent to-[#050209]/90 pointer-events-none" />
      <ParticleField density="low" petals={true} dots={false} />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-start sm:justify-center overflow-y-auto px-4 pt-10 sm:pt-14 pb-40 text-center select-none">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="max-w-xl my-auto flex flex-col items-center">
          <NameRibbon
            badgeText="Opening Cinematic"
            title="Something Special Is Coming..."
            subtitle="The stars are aligning, the flowers are waking, and a little magic is being prepared just for you."
          />
          <div className="mt-8 sm:mt-10 flex flex-col items-center gap-3.5 sm:flex-row sm:justify-center">
            <PremiumButton variant="gold" size="lg" onClick={onBegin}>
              <Sparkles size={16} /> Begin Countdown
            </PremiumButton>
            <PremiumButton variant="glass" size="md" onClick={onSkip}>
              Skip Countdown →
            </PremiumButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function CountdownRunningScene({
  countdown,
  targetDate,
  onSkip,
}: {
  countdown: { d: number; h: number; m: number; s: number };
  targetDate: Date;
  onSkip: () => void;
}) {
  const isPastBirthday = Date.now() >= targetDate.getTime();
  const [timerCount, setTimerCount] = useState(15);
  const [isBlooming, setIsBlooming] = useState(false);

  useEffect(() => {
    if (!isPastBirthday) return;
    if (timerCount <= 1) {
      setIsBlooming(true);
      const timer = setTimeout(() => {
        onSkip();
      }, 1300);
      return () => clearTimeout(timer);
    }
    const interval = setInterval(() => {
      setTimerCount((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPastBirthday, timerCount, onSkip]);

  return (
    <div className="scene-container relative overflow-hidden">
      <BackgroundLayer src={assets.cinematicFlowerArch || assets.countdownGarden} overlay animate />
      {/* Dark cinematic vignette keeping couple in bottom walkway visible while spotlighting countdown */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080310]/80 via-black/25 to-[#040108]/85 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(217,168,94,0.14)_0%,_transparent_70%)] pointer-events-none" />
      <ParticleField density="medium" petals={true} dots={false} />

      {/* Light Bloom at 1 */}
      {isBlooming && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1.8 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(254,240,138,0.75)_0%,_rgba(244,63,94,0.35)_40%,_transparent_70%)] pointer-events-none z-30 mix-blend-screen"
        />
      )}

      <div className="relative z-10 flex flex-1 flex-col items-center justify-start overflow-y-auto px-3 sm:px-4 pt-5 sm:pt-9 md:pt-11 pb-36 sm:pb-44 text-center select-none w-full">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl my-auto flex flex-col items-center"
        >
          {/* Top glowing red-gold heart emblem with winged filigree swirls */}
          <div className="flex items-center justify-center gap-2 mb-2 text-[#e7b876]">
            <svg className="w-8 sm:w-14 h-4 text-[#e7b876]/80 drop-shadow-[0_0_8px_rgba(231,184,118,0.5)]" viewBox="0 0 60 16" fill="none">
              <path d="M58 8 C42 8, 32 14, 20 14 C10 14, 4 8, 2 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="58" cy="8" r="2" fill="currentColor" />
            </svg>
            <div className="relative flex items-center justify-center px-1">
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.95, 0.5] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                className="absolute inset-0 m-auto w-7 h-7 rounded-full bg-rose-500/40 blur-md pointer-events-none"
              />
              <Heart className="h-6 w-6 sm:h-7 sm:w-7 fill-rose-500 text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.95)] relative" />
            </div>
            <svg className="w-8 sm:w-14 h-4 text-[#e7b876]/80 drop-shadow-[0_0_8px_rgba(231,184,118,0.5)] transform -scale-x-100" viewBox="0 0 60 16" fill="none">
              <path d="M58 8 C42 8, 32 14, 20 14 C10 14, 4 8, 2 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="58" cy="8" r="2" fill="currentColor" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="font-script text-4xl sm:text-6xl md:text-7xl text-[#fef08a] glow-gold font-normal tracking-wide drop-shadow-[0_4px_24px_rgba(254,240,138,0.45)]">
            {isPastBirthday ? "Your Special Day" : "A special day"}
          </h2>

          {/* Subtitle */}
          <div className="flex items-center justify-center gap-2.5 mt-1 sm:mt-1.5 text-xs sm:text-sm md:text-base font-serif text-[#fed7aa] tracking-[0.2em] uppercase font-light">
            <span className="text-[#e7b876]/70">~ ✦ ~</span>
            <span>{isPastBirthday ? "is here • let the magic begin" : "is almost here"}</span>
            <span className="text-[#e7b876]/70">~ ✦ ~</span>
          </div>

          {/* COUNTDOWN BODY: STATE A vs STATE B */}
          {isPastBirthday ? (
            /* STATE B: Cinematic 15-Second Countdown */
            <div className="relative mt-6 sm:mt-8 mx-auto p-6 sm:p-8 rounded-3xl border border-[#e7b876]/50 bg-black/50 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_45px_rgba(231,184,118,0.25)] max-w-md w-full flex flex-col items-center">
              {/* Floral corner emblems */}
              <span className="absolute -top-3 -left-3 text-2xl select-none filter drop-shadow-[0_2px_8px_rgba(244,63,94,0.8)]">🌹</span>
              <span className="absolute -top-3 -right-3 text-2xl select-none filter drop-shadow-[0_2px_8px_rgba(244,63,94,0.8)]">🌹</span>
              <span className="absolute -bottom-3 -left-3 text-xl select-none filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.8)]">✨</span>
              <span className="absolute -bottom-3 -right-3 text-xl select-none filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.8)]">✨</span>

              <span className="text-[11px] sm:text-xs font-serif uppercase tracking-[0.3em] text-[#fed7aa]/90 font-medium">
                Opening in
              </span>

              {/* Animated Cinematic Big Digit */}
              <div className="h-32 sm:h-40 flex items-center justify-center w-full overflow-visible">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={timerCount}
                    initial={{ scale: 1.4, opacity: 0, filter: "blur(12px)", y: -10 }}
                    animate={{
                      scale: timerCount === 1 ? [1, 1.25, 1.15] : 1,
                      opacity: 1,
                      filter: "blur(0px)",
                      y: 0,
                    }}
                    exit={{ scale: 0.8, opacity: 0, filter: "blur(10px)", y: 10 }}
                    transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
                    className="relative flex items-center justify-center select-none"
                  >
                    <span className="font-serif text-7xl sm:text-8xl md:text-9xl font-bold text-[#fef08a] glow-gold leading-none tracking-tight drop-shadow-[0_4px_35px_rgba(254,240,138,0.6)]">
                      {timerCount}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Romantic heartbeat flourish */}
              <div className="flex items-center justify-center gap-2 text-xs font-serif text-[#fed7aa] tracking-widest pt-2 border-t border-white/10 w-full">
                <span className="text-gold/70">✦</span>
                <Heart size={12} className="fill-rose-400 text-rose-400 animate-pulse" />
                <span className="italic">Every second is dedicated to you</span>
                <Heart size={12} className="fill-rose-400 text-rose-400 animate-pulse" />
                <span className="text-gold/70">✦</span>
              </div>
            </div>
          ) : (
            /* STATE A: Real accurate countdown cards (Days, Hours, Minutes, Seconds) */
            <div className="relative mt-5 sm:mt-7 mx-auto p-3 sm:p-5 md:p-6 rounded-3xl border border-[#e7b876]/50 bg-black/45 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.75),0_0_40px_rgba(231,184,118,0.22)] max-w-xl w-full">
              {/* Left Floral Rose Bouquet Cluster */}
              <div className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 pointer-events-none select-none z-20 flex flex-col items-center">
                <span className="text-xl sm:text-3xl filter drop-shadow-[0_4px_12px_rgba(244,63,94,0.9)] transform -rotate-12">🌹</span>
                <span className="text-xs sm:text-base filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.8)] -mt-2">✨</span>
              </div>

              {/* Right Floral Rose Bouquet Cluster */}
              <div className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 pointer-events-none select-none z-20 flex flex-col items-center">
                <span className="text-xl sm:text-3xl filter drop-shadow-[0_4px_12px_rgba(244,63,94,0.9)] transform rotate-12">🌹</span>
                <span className="text-xs sm:text-base filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.8)] -mt-2">✨</span>
              </div>

              {/* Countdown Blocks Row */}
              <div className="flex items-center justify-center gap-1 sm:gap-2.5 md:gap-3.5 px-1 sm:px-2">
                <CountdownCard value={countdown.d} label="Days" />
                <motion.span
                  animate={{ scale: [1, 1.28, 1, 1.16, 1], opacity: [0.65, 1, 0.65] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                  className="text-rose-400 text-xs sm:text-sm select-none font-serif drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]"
                >
                  ♥
                </motion.span>
                <CountdownCard value={countdown.h} label="Hours" />
                <motion.span
                  animate={{ scale: [1, 1.28, 1, 1.16, 1], opacity: [0.65, 1, 0.65] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut", delay: 0.1 }}
                  className="text-rose-400 text-xs sm:text-sm select-none font-serif drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]"
                >
                  ♥
                </motion.span>
                <CountdownCard value={countdown.m} label="Minutes" />
                <motion.span
                  animate={{ scale: [1, 1.28, 1, 1.16, 1], opacity: [0.65, 1, 0.65] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut", delay: 0.2 }}
                  className="text-rose-400 text-xs sm:text-sm select-none font-serif drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]"
                >
                  ♥
                </motion.span>
                <CountdownCard value={countdown.s} label="Seconds" />
              </div>

              {/* Calendar icon and countdown destination badge */}
              <div className="mt-4 pt-3 border-t border-white/10 flex flex-col items-center gap-1.5">
                <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-[#e7b876]/30 text-xs sm:text-sm text-[#fed7aa] font-serif tracking-wide">
                  <Calendar size={13} className="text-gold shrink-0" />
                  <span>Counting down to October 19 • 12:00 AM</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-gold/70 font-mono mt-0.5">
                  <span>~ ✦</span>
                  <Heart size={10} className="fill-rose-400 text-rose-400 inline" />
                  <span>✦ ~</span>
                </div>
              </div>
            </div>
          )}

          {/* Skip Countdown Action */}
          <div className="mt-6 sm:mt-8">
            <PremiumButton
              variant="glass"
              size="md"
              onClick={onSkip}
            >
              Skip Countdown →
            </PremiumButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 3 — Birthday Reveal                                          */
/* ------------------------------------------------------------------ */

function BirthdayRevealScene({ onContinue }: { onContinue: () => void }) {
  const [stage, setStage] = useState(1);
  const partnerName = birthdayContent.herName;

  useEffect(() => {
    const t1 = setTimeout(() => setStage(2), 3500);
    const t2 = setTimeout(() => setStage(3), 7000);
    const t3 = setTimeout(() => setStage(4), 10500);
    const t4 = setTimeout(() => setStage(5), 14000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const skip = () => {
    setStage(5);
  };

  return (
    <div className="scene-container bg-[#05060f]">
      {/* Background layer changes intensity based on stage */}
      <AnimatePresence mode="wait">
        {stage >= 3 ? (
          <BackgroundLayer key="reveal-bg" src={assets.birthdayReveal} overlay />
        ) : (
          <motion.div
            key="dark-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-b from-[#05060f] via-[#0b0c16] to-[#05060f]"
          />
        )}
      </AnimatePresence>

      {/* Particle field density builds up */}
      {stage === 1 && <ParticleField density="low" petals={false} />}
      {stage === 2 && <ParticleField density="medium" petals={false} />}
      {stage >= 3 && <ParticleField density="high" petals={true} />}

      {/* Subtle background light bloom */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-3000 pointer-events-none",
        stage === 1 ? "opacity-10" : stage === 2 ? "opacity-25" : "opacity-40",
        "bg-[radial-gradient(circle_at_center,_rgba(217,168,94,0.15),_transparent_65%)]"
      )} />

      {/* Celebration fireworks effect on Stage 4 and 5 */}
      {stage >= 4 && <FireworkCanvas />}

      <div className="relative z-20 flex flex-1 flex-col items-center justify-center p-6 text-center">
        <AnimatePresence mode="wait">
          {stage === 1 && (
            <motion.div
              key="stage1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 1.5 }}
              className="max-w-md"
            >
              <p className="font-serif italic text-xl text-champagne/80 tracking-wide leading-relaxed">
                "Close your eyes... and take a deep breath."
              </p>
            </motion.div>
          )}

          {stage === 2 && (
            <motion.div
              key="stage2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 1.5 }}
              className="max-w-md"
            >
              <p className="text-xs uppercase tracking-[0.4em] text-white/50 mb-3">The night is quiet</p>
              <p className="font-serif italic text-xl text-champagne/80 tracking-wide leading-relaxed">
                "Listen to the stars whispering your name..."
              </p>
            </motion.div>
          )}

          {stage === 3 && (
            <motion.div
              key="stage3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.5 }}
              className="max-w-2xl"
            >
              <motion.h1
                initial={{ filter: "blur(12px)", opacity: 0 }}
                animate={{ filter: "blur(0px)", opacity: 1 }}
                transition={{ duration: 1.8 }}
                className="font-serif text-5xl font-bold leading-tight sm:text-7xl lg:text-8xl gradient-text glow-gold"
              >
                Happy Birthday
              </motion.h1>
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1.2 }}
                className="mt-4 font-script text-5xl text-rose glow-rose sm:text-7xl"
              >
                {partnerName} ♥
              </motion.h2>
            </motion.div>
          )}

          {stage === 4 && (
            <motion.div
              key="stage4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="max-w-xl"
            >
              <h1 className="font-serif text-4xl font-bold leading-tight sm:text-6xl gradient-text glow-gold">
                Happy Birthday
              </h1>
              <h2 className="mt-3 font-script text-5xl text-rose glow-rose sm:text-7xl">
                Pandi ♥
              </h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="mt-6 font-serif italic text-lg text-white/80 sm:text-xl"
              >
                "Every moment with you is a gift..."
              </motion.p>
            </motion.div>
          )}

          {stage === 5 && (
            <motion.div
              key="stage5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5 }}
              className="max-w-2xl"
            >
              <h1 className="font-serif text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl gradient-text glow-gold">
                Happy Birthday Bangaram ♥ 
              </h1>
              <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
                On this beautiful day, a small journey of memories, wishes, and love is waiting for you. Let's step inside.
              </p>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="mt-10"
              >
                <PrimaryButton onClick={onContinue}>
                  Step Inside Our Universe ♥
                </PrimaryButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tiny subtle skip button for convenience during preview */}
      {stage < 5 && (
        <button
          onClick={skip}
          className="absolute bottom-6 right-6 z-30 min-h-[44px] min-w-[44px] px-3 py-2 flex items-center justify-center text-xs text-white/40 hover:text-white/80 tracking-widest uppercase transition-colors cursor-pointer"
        >
          Skip Intro
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 4 — Password                                                 */
/* ------------------------------------------------------------------ */

function PasswordScene({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isButtonActive = value.trim().length > 0 && !success && !isValidating;

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!value.trim() || isValidating || success) return;

    setIsValidating(true);
    setError(false);

    setTimeout(() => {
      const isCorrect =
        value.trim().toLowerCase() === config.password.toLowerCase() ||
        value.trim() === config.password;

      setIsValidating(false);

      if (isCorrect) {
        setError(false);
        setSuccess(true);
        setTimeout(() => onUnlock(), 1300);
      } else {
        setError(true);
        setSuccess(false);
        setTimeout(() => {
          setValue("");
          setError(false);
          inputRef.current?.focus();
        }, 1100);
      }
    }, 450);
  };

  const characters = useMemo(() => value.split(""), [value]);

  return (
    <div className="scene-container relative overflow-hidden">
      <BackgroundLayer src={assets.cinematicFlowerArch || assets.couplePhoto} overlay />

      {/* Cinematic dark depth vignette keeping couple at bottom clear while centering content */}
      <motion.div
        animate={success ? { opacity: [0.7, 0.4, 0.6] } : { opacity: 0.8 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-gradient-to-b from-[#080310]/85 via-black/35 to-[#040108]/85 pointer-events-none"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(217,168,94,0.14)_0%,_transparent_70%)] pointer-events-none" />

      {/* Romantic floating petals, hearts and golden bokeh */}
      <ParticleField density={success ? "high" : "low"} petals={true} dots={false} hearts={true} />

      <div className="relative z-10 flex min-h-full flex-1 flex-col items-center justify-start overflow-y-auto px-4 pt-6 sm:pt-10 md:pt-14 pb-36 sm:pb-44 text-center select-none w-full">
        <motion.div
          animate={
            success
              ? { opacity: [1, 1, 0], scale: [1, 1.02, 0.94], filter: ["blur(0px)", "blur(0px)", "blur(6px)"] }
              : { opacity: 1, scale: 1, filter: "blur(0px)" }
          }
          transition={success ? { duration: 1.25, times: [0, 0.6, 1], ease: "easeInOut" } : { duration: 0.85 }}
          className="w-full max-w-md my-auto flex flex-col items-center"
        >
          {/* Reference: Glowing lock icon medallion with delicate heart flourish on top and filigree wings */}
          <div className="relative mb-3 flex flex-col items-center justify-center">
            {/* Top flourish */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="mb-1 text-gold/80 flex items-center justify-center gap-1.5"
            >
              <span className="text-[10px] text-gold/60">✦ ──</span>
              <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
              <span className="text-[10px] text-gold/60">── ✦</span>
            </motion.div>

            {/* Glowing circular medallion with side golden filigree spirals */}
            <div className="relative flex items-center justify-center gap-2 sm:gap-3">
              {/* Left ornamental filigree spiral */}
              <svg className="w-8 sm:w-12 h-6 text-gold/80 drop-shadow-[0_0_6px_rgba(231,184,118,0.5)] transform -scale-x-100 shrink-0" viewBox="0 0 50 30" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M48 15 C35 15, 30 5, 18 5 C10 5, 5 10, 5 17 C5 24, 12 27, 18 24 C24 21, 23 12, 17 12 C12 12, 10 15, 12 18" strokeLinecap="round" />
                <circle cx="48" cy="15" r="2" fill="currentColor" />
              </svg>

              <div className="relative flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: success ? [1, 1.4, 1.3] : [1, 1.15, 1],
                    opacity: success ? [0.6, 0.9, 0.8] : [0.35, 0.65, 0.35],
                  }}
                  transition={success ? { duration: 0.8 } : { repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className={cn(
                    "absolute inset-0 m-auto w-20 h-20 rounded-full blur-md pointer-events-none",
                    success ? "bg-amber-400/60" : error ? "bg-rose-500/50" : "bg-amber-400/35"
                  )}
                />

                <motion.div
                  animate={
                    error
                      ? { x: [-8, 8, -6, 6, -2, 2, 0] }
                      : success
                      ? { scale: [1, 1.18, 1.1], rotate: [0, -6, 6, 0] }
                      : { scale: [1, 1.03, 1] }
                  }
                  transition={
                    error
                      ? { duration: 0.5, ease: "easeInOut" }
                      : success
                      ? { duration: 0.6 }
                      : { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  }
                  className={cn(
                    "relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-2 bg-black/45 backdrop-blur-md transition-all duration-400",
                    success
                      ? "border-gold text-gold shadow-[0_0_35px_rgba(231,184,118,0.8)]"
                      : error
                      ? "border-rose-400 text-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.5)]"
                      : "border-[#e7b876]/70 text-[#f7d69e] shadow-[0_0_20px_rgba(231,184,118,0.4)]"
                  )}
                >
                  {success ? (
                    <Unlock className="h-7 w-7 sm:h-8 sm:w-8 text-gold drop-shadow-[0_0_14px_rgba(231,184,118,0.95)]" />
                  ) : (
                    <Lock className="h-7 w-7 sm:h-8 sm:w-8 text-[#f7d69e] drop-shadow-[0_0_10px_rgba(231,184,118,0.6)]" />
                  )}
                </motion.div>
              </div>

              {/* Right ornamental filigree spiral */}
              <svg className="w-8 sm:w-12 h-6 text-gold/80 drop-shadow-[0_0_6px_rgba(231,184,118,0.5)] shrink-0" viewBox="0 0 50 30" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M48 15 C35 15, 30 5, 18 5 C10 5, 5 10, 5 17 C5 24, 12 27, 18 24 C24 21, 23 12, 17 12 C12 12, 10 15, 12 18" strokeLinecap="round" />
                <circle cx="48" cy="15" r="2" fill="currentColor" />
              </svg>
            </div>
          </div>

          {/* Reference: Typography */}
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#fed7aa] glow-gold tracking-wide">
            Only one person
          </h2>
          <p className="mt-1 font-serif italic text-base sm:text-xl text-rose-100/90 font-light">
            can unlock this...
          </p>

          {/* Reference: Form with Pill-shaped Input & Button */}
          <form onSubmit={submit} className="mt-6 sm:mt-7 w-full max-w-sm flex flex-col items-center gap-4">
            {/* Pill-shaped Heart Input */}
            <motion.div
              animate={error ? { x: [-10, 10, -7, 7, -3, 3, 0] } : {}}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              onClick={() => inputRef.current?.focus()}
              className={cn(
                "relative flex items-center justify-center w-full min-h-[50px] sm:min-h-[54px] rounded-full border px-4 py-2 transition-all duration-300 cursor-text",
                "bg-black/50 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)]",
                isFocused
                  ? "border-gold ring-2 ring-gold/40 shadow-[0_0_25px_rgba(231,184,118,0.45)]"
                  : error
                  ? "border-rose-500/80 shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                  : "border-[#e7b876]/55 hover:border-[#e7b876]/80"
              )}
            >
              {/* Real HTML Input */}
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={success || isValidating}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                className="absolute inset-0 w-full h-full opacity-0 cursor-text px-6 z-10"
                aria-label="Enter Secret Password"
                autoFocus
              />

              {/* Centered Heart-Mask Display */}
              <div className="flex-1 flex items-center justify-center flex-wrap gap-1.5 px-3 overflow-hidden pointer-events-none z-0">
                {characters.length === 0 ? (
                  <span className="text-white/45 text-xs sm:text-sm font-serif italic tracking-wide flex items-center gap-1.5">
                    Tap here to type <Heart size={13} className="text-rose-400/80 inline fill-rose-400/40" />
                  </span>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {characters.map((char, idx) => (
                      <motion.span
                        key={`${idx}-${char}`}
                        initial={{ scale: 0, y: 6 }}
                        animate={{ scale: [1.3, 1], y: 0 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 450, damping: 20 }}
                        className={cn(
                          "inline-flex items-center justify-center select-none",
                          showPassword
                            ? "text-gold font-serif font-bold text-base sm:text-lg tracking-wider px-0.5 uppercase drop-shadow-[0_0_8px_rgba(231,184,118,0.7)]"
                            : "text-rose-400 text-lg sm:text-xl px-0.5 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]"
                        )}
                      >
                        {showPassword ? char : "♥"}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                )}

                {/* Blinking Romantic Caret */}
                {isFocused && !success && !isValidating && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }}
                    className="inline-block w-0.5 h-4 bg-gold/90 ml-0.5 rounded-full"
                  />
                )}
              </div>

              {/* Password visibility toggle */}
              {value.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPassword(!showPassword);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              )}
            </motion.div>

            {/* Error / Success Feedback */}
            <div className="min-h-[22px] flex items-center justify-center text-xs">
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-300 glow-rose font-serif italic text-xs sm:text-sm"
                >
                  That's not quite our secret password, my love. Try again ♥
                </motion.p>
              )}
              {success && (
                <motion.p
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-gold glow-gold font-serif italic text-sm font-semibold"
                >
                  ✨ Unlocked with love! Welcome, my love ✨
                </motion.p>
              )}
            </div>

            {/* Reference: Pill-shaped Unlock Button */}
            <button
              type="submit"
              disabled={!isButtonActive}
              className={cn(
                "w-full sm:w-auto min-w-[200px] min-h-[48px] sm:min-h-[50px] px-8 rounded-full font-serif font-bold text-sm sm:text-base tracking-wider transition-all duration-300 cursor-pointer shadow-lg",
                "bg-gradient-to-r from-[#e7b876] via-[#f7d69e] to-[#e7b876] text-[#2c1307]",
                isButtonActive
                  ? "shadow-[0_0_25px_rgba(231,184,118,0.5)] hover:shadow-[0_0_35px_rgba(231,184,118,0.8)] hover:scale-105 active:scale-95"
                  : "opacity-45 cursor-not-allowed filter grayscale"
              )}
            >
              {isValidating ? (
                <span className="inline-flex items-center gap-2">
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 0.7 }}
                    className="inline-block text-rose-900"
                  >
                    ♥
                  </motion.span>
                  Opening with love...
                </span>
              ) : success ? (
                <span className="inline-flex items-center gap-2">
                  ✨ Welcome, My Love ✨
                </span>
              ) : (
                <span className="inline-flex items-center justify-center gap-1.5">
                  Unlock <Heart size={15} className="fill-current text-[#2c1307] inline" />
                </span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Animated Sticker Component                                         */
/* ------------------------------------------------------------------ */

interface AnimatedStickerProps {
  src: string;
  alt: string;
  className?: string;
  delay?: number;
  rotate?: number;
  floatY?: number;
  pulseHeart?: boolean;
  sway?: boolean;
  sparkles?: boolean;
}

function AnimatedSticker({
  src,
  alt,
  className,
  delay = 0,
  rotate = 0,
  floatY = 8,
  pulseHeart,
  sway,
  sparkles,
}: AnimatedStickerProps) {
  const [loadError, setLoadError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.75, y: 15 }}
      animate={{
        opacity: 1,
        scale: pulseHeart ? [1, 1.035, 1] : 1,
        y: [0, -floatY, 0],
        rotate: sway ? [rotate - 3.5, rotate + 3.5, rotate - 3.5] : [rotate - 1.5, rotate + 1.5, rotate - 1.5],
      }}
      transition={{
        opacity: { duration: 0.8, delay },
        scale: pulseHeart
          ? { repeat: Infinity, duration: 2.2, ease: "easeInOut" }
          : { duration: 0.8, delay, ease: [0.34, 1.56, 0.64, 1] },
        y: {
          duration: 3.2 + (delay % 2) * 0.8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: delay * 0.5,
        },
        rotate: {
          duration: sway ? 3.6 : 4.5,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: delay * 0.5,
        },
      }}
      whileHover={{ scale: 1.08, rotate: 0 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative flex items-center justify-center select-none transition-transform duration-300 pointer-events-auto",
        className
      )}
    >
      {!loadError ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={src}
            alt={alt}
            onError={() => setLoadError(true)}
            className="w-full h-full object-contain pointer-events-none filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.45)] drop-shadow-[0_0_15px_rgba(251,113,133,0.3)]"
            loading="eager"
          />

          {/* Micro-animation 1: Floating mini-hearts for Teddy Holding Heart */}
          {pulseHeart && (
            <div className="absolute inset-0 pointer-events-none overflow-visible">
              {[0, 1].map((idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, scale: 0.6, y: 0, x: idx === 0 ? -12 : 12 }}
                  animate={{
                    opacity: [0, 0.85, 0],
                    scale: [0.6, 1.1, 0.8],
                    y: [-10, -42, -58],
                    x: idx === 0 ? [-12, -20, -14] : [12, 22, 16],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.8,
                    delay: idx * 1.4,
                    ease: "easeOut",
                  }}
                  className="absolute top-1/2 left-1/2 text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)] text-xs sm:text-sm select-none"
                >
                  ♥
                </motion.span>
              ))}
            </div>
          )}

          {/* Micro-animation 2: Tiny cuddle hearts for Teddy Hugs */}
          {sway && (
            <div className="absolute -top-3 inset-x-0 flex justify-center pointer-events-none">
              <motion.span
                animate={{
                  scale: [0.8, 1.25, 0.8],
                  opacity: [0.5, 0.95, 0.5],
                  y: [0, -6, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.4,
                  ease: "easeInOut",
                }}
                className="text-pink-400 drop-shadow-[0_0_10px_rgba(244,114,182,0.9)] text-sm sm:text-base select-none"
              >
                💕
              </motion.span>
            </div>
          )}

          {/* Micro-animation 3: Sparkles for Teddy with Roses & Gift */}
          {sparkles && (
            <div className="absolute inset-0 pointer-events-none">
              {[
                { top: "20%", left: "15%", delay: 0 },
                { top: "45%", right: "12%", delay: 1.2 },
              ].map((sp, idx) => (
                <motion.span
                  key={idx}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.4, 1.2, 0.4],
                    rotate: [0, 90, 180],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.2,
                    delay: sp.delay,
                    ease: "easeInOut",
                  }}
                  style={{ top: sp.top, left: sp.left, right: sp.right }}
                  className="absolute text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)] text-xs sm:text-sm select-none"
                >
                  ✦
                </motion.span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-full rounded-2xl bg-rose-500/10 border border-rose-400/30 flex items-center justify-center text-rose-300 font-serif text-2xl">
          ♥
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 5 — Wishes                                                   */
/* ------------------------------------------------------------------ */

function WishesScene({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="scene-container">
      <BackgroundLayer src={assets.birthdayReveal} overlay />
      <ParticleField density="medium" petals={true} dots={false} />
      <FireworkCanvas />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-start sm:justify-center overflow-y-auto p-4 sm:p-6 py-10 sm:py-12 text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="w-full max-w-3xl my-auto">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1 }} className="font-serif text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl gradient-text glow-gold">
            {birthdayWish.heading}
          </motion.h1>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 1 }} className="mt-1 font-script text-3.5xl text-rose glow-rose sm:text-5xl">
            {birthdayWish.subheading}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="mt-6 sm:mt-8 flex flex-row items-center justify-center gap-2 sm:gap-6 md:gap-8 w-full px-2 max-w-xl mx-auto"
          >
            {stickersConfig.map((sticker) => (
              <AnimatedSticker
                key={sticker.id}
                src={sticker.src}
                alt={sticker.alt}
                className={sticker.className}
                delay={sticker.animation?.delay ?? 0.3}
                rotate={sticker.animation?.rotate ?? 0}
                floatY={sticker.animation?.floatY ?? 8}
                pulseHeart={sticker.animation?.pulseHeart}
                sway={sticker.animation?.sway}
                sparkles={sticker.animation?.sparkles}
              />
            ))}
          </motion.div>

          <p className="mx-auto mt-6 max-w-xl text-sm sm:text-base md:text-lg leading-relaxed text-white/85 min-h-[5.5rem] px-2 select-text">
            <TypewriterText text={birthdayWish.message} speed={25} />
          </p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 6.8, duration: 1 }} className="mt-4 font-script text-2.5xl sm:text-3.5xl text-gold glow-gold">
            {birthdayWish.closing}
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 7.2, duration: 0.8 }} className="mt-8">
            <PrimaryButton onClick={onContinue}>Begin Our Journey →</PrimaryButton>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 6 — Blow the Candles                                         */
/* ------------------------------------------------------------------ */

export function CakeScene({ onBlown }: { onBlown: () => void }) {
  const [lit, setLit] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [smoke, setSmoke] = useState<number | null>(null);
  const [micRequestAsked, setMicRequestAsked] = useState(false);
  const [blowStage, setBlowStage] = useState<"active" | "shrinking" | "smoke" | "sparkles" | "celebrate" | "ready">("active");
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [celebrationConfetti, setCelebrationConfetti] = useState<{ id: number; x: number; y: number; color: string; size: number; vx: number; vy: number; rot: number; rotSpeed: number }[]>([]);
  
  const blowOne = () => {
    if (lit.length === 0 || blowStage !== "active") return;
    const removed = lit[0];
    
    if (lit.length === 1) {
      // Last candle blowout sequence:
      // 1. Flame shrinks
      setBlowStage("shrinking");
      setTimeout(() => {
        // 2. Flame disappears
        setLit([]);
        setBlowStage("smoke");
        setSmoke(removed);
        
        // 3. Smoke appears
        setTimeout(() => {
          setSmoke(null);
          setBlowStage("sparkles");
          
          // 4. Tiny sparkles appear around cake
          const newSparkles = Array.from({ length: 24 }).map((_, i) => ({
            id: i,
            x: 120 + Math.random() * 160,
            y: 90 + Math.random() * 70
          }));
          setSparkles(newSparkles);
          
          setTimeout(() => {
            setBlowStage("celebrate");
            // 5. Celebration particles trigger (confetti)
            const confettiColors = ["#d9a85e", "#f43f5e", "#fb7185", "#ffffff", "#fed7aa", "#fbcfe8"];
            const newConfetti = Array.from({ length: 65 }).map((_, i) => ({
              id: i,
              x: 200,
              y: 135,
              color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
              size: Math.random() * 6 + 4,
              vx: (Math.random() - 0.5) * 8,
              vy: -4 - Math.random() * 8,
              rot: Math.random() * 360,
              rotSpeed: (Math.random() - 0.5) * 12
            }));
            setCelebrationConfetti(newConfetti);
            
            // 6. Transition becomes available
            setTimeout(() => {
              setBlowStage("ready");
            }, 1200);
          }, 800);
        }, 1000);
      }, 600);
    } else {
      // Normal candle blowout
      const next = lit.slice(1);
      setLit(next);
      setSmoke(removed);
      setTimeout(() => setSmoke(null), 1200);
    }
  };

  const { start, stop, blowIntensity } = useBlowDetector(() => blowOne());

  // Proactively request mic permission on scene enter
  useEffect(() => {
    if (!micRequestAsked) {
      setMicRequestAsked(true);
      start();
    }
  }, [micRequestAsked, start]);

  // Clean up mic listening when scene leaves
  useEffect(() => () => stop(), [stop]);

  // Stop mic blow detector once all candles are blown out or inactive
  useEffect(() => {
    if (lit.length === 0 || blowStage !== "active") {
      stop();
    }
  }, [lit.length, blowStage, stop]);

  // Confetti update loop
  useEffect(() => {
    if (celebrationConfetti.length === 0) return;
    let active = true;
    let raf = 0;
    const update = () => {
      if (!active) return;
      setCelebrationConfetti((prev) =>
        prev
          .map((c) => ({
            ...c,
            x: c.x + c.vx,
            y: c.y + c.vy,
            vy: c.vy + 0.18, // gravity
            rot: c.rot + c.rotSpeed,
          }))
          .filter((c) => c.y < 240 && c.x > 0 && c.x < 400)
      );
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [celebrationConfetti.length]);

  // Organic coordinates on the top surface of the round cake
  const candles = [
    { x: 135, y: 145, color: "#e08da2", stripe: "#fff0f5" },
    { x: 160, y: 135, color: "#d9a85e", stripe: "#fcf7eb" },
    { x: 180, y: 154, color: "#b06b7d", stripe: "#ede3cf" },
    { x: 200, y: 138, color: "#e08da2", stripe: "#fff0f5" },
    { x: 220, y: 154, color: "#d9a85e", stripe: "#fcf7eb" },
    { x: 240, y: 135, color: "#b06b7d", stripe: "#ede3cf" },
    { x: 265, y: 145, color: "#e08da2", stripe: "#fff0f5" },
  ];

  return (
    <div className="scene-container relative">
      {/* Rich Romantic Burgundy & Nocturnal Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0309] via-[#1f0616] to-[#080207] z-0" />
      
      {/* Warm champagne & rose ambient bloom centered on cake */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-1000 pointer-events-none z-0 mix-blend-screen",
        lit.length > 0 ? "opacity-90" : "opacity-40"
      )}
      style={{
        background: "radial-gradient(circle at 50% 55%, rgba(217, 168, 94, 0.22) 0%, rgba(244, 63, 94, 0.15) 35%, transparent 70%)"
      }}
      />
      
      {/* Cinematic vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.88)_100%)] pointer-events-none z-0" />

      {/* Hanging fairy light accents along top */}
      <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-10 opacity-60 flex justify-around px-8">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-[1px] h-6 sm:h-8 bg-gradient-to-b from-white/20 via-gold/40 to-gold/70" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_8px_rgba(254,240,138,0.9)] animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
          </div>
        ))}
      </div>

      {/* Edge-only Fireworks once candles blown */}
      {(blowStage === "celebrate" || blowStage === "ready") && (
        <FireworkCanvas edgesOnly={true} />
      )}

      <ParticleField density="low" petals={true} dots={false} />

      {/* Ambient room darkening overlay when all candles are blown out */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-[2000ms] pointer-events-none z-20",
        lit.length === 0 ? "bg-black/75 opacity-100" : "opacity-0"
      )} />

      <div className="relative z-10 flex min-h-full flex-1 flex-col items-center justify-center p-4 sm:p-6 py-8 sm:py-10 text-center select-none">
        
        {/* Header Calligraphy */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-3 sm:mb-4 z-30"
        >
          {/* Decorative Romantic Ribbon */}
          <div className="inline-flex items-center justify-center gap-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-[#881337] via-[#be123c] to-[#881337] border-y border-[#fef08a]/80 shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_15px_rgba(244,63,94,0.35)] mb-2">
            <span className="text-[10px] sm:text-xs font-serif uppercase tracking-[0.25em] text-[#fed7aa] font-semibold">
              ✦ HAPPY BIRTHDAY ✦
            </span>
          </div>

          {/* Name Only On This Page */}
          <h2 className="font-calligraphy text-4xl sm:text-6xl text-[#fef08a] glow-gold leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            Happy Birthday {birthdayContent.herName}
          </h2>

          <p className="text-xs sm:text-sm font-serif italic text-rose-100/80 mt-1 max-w-md mx-auto leading-relaxed">
            {lit.length > 0 
              ? "Make a wish and let every little dream in your heart come true." 
              : "Your wish has been whispered to the stars..."}
          </p>
        </motion.div>

        {/* Realistic circular pink cake centerpiece with integrated ribbon behind */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: lit.length === 0 ? 1.03 : 1 }}
          transition={{ duration: 1.2 }}
          className={cn(
            "relative w-full max-w-[42rem] h-[52vh] sm:h-[60vh] cursor-pointer transition-all duration-1000 flex items-center justify-center",
            lit.length === 0 ? "z-30" : "z-10"
          )}
          onClick={blowOne}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && blowOne()}
          aria-label="Tap to blow out a candle"
        >
          <svg viewBox="0 0 400 240" className="w-full drop-shadow-[0_24px_60px_rgba(0,0,0,0.65)] overflow-visible">
            <defs>
              <linearGradient id="cakeTop" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffcbd7" />
                <stop offset="100%" stopColor="#fca1b5" />
              </linearGradient>
              <linearGradient id="cakeFront" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fca1b5" />
                <stop offset="60%" stopColor="#e87a90" />
                <stop offset="100%" stopColor="#cf576e" />
              </linearGradient>
              <linearGradient id="goldCalligraphy" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#d4af37" />
                <stop offset="35%" stopColor="#fef08a" />
                <stop offset="70%" stopColor="#d9a85e" />
                <stop offset="100%" stopColor="#996515" />
              </linearGradient>
              <radialGradient id="flameOuter" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="35%" stopColor="#ffe082" stopOpacity="0.85" />
                <stop offset="65%" stopColor="#ff8a65" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="flameInner" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#fff59d" />
                <stop offset="100%" stopColor="#ffb300" />
              </linearGradient>
              <filter id="cakeShadow">
                <feDropShadow dx="0" dy="16" stdDeviation="14" floodColor="#000" floodOpacity="0.6" />
              </filter>
              <filter id="ribbonShadow">
                <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.55" />
              </filter>
              <filter id="flameGlowFilter">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="frostingGlow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0.5" dy="1.5" stdDeviation="0.8" floodColor="#3d1f05" floodOpacity="0.8" />
              </filter>

              {/* Ribbon Shading & Colors */}
              <linearGradient id="ribbonBodyGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#831843" />
                <stop offset="15%" stopColor="#9f1239" />
                <stop offset="50%" stopColor="#e11d48" />
                <stop offset="85%" stopColor="#9f1239" />
                <stop offset="100%" stopColor="#831843" />
              </linearGradient>
              <linearGradient id="ribbonFoldDark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4c0519" />
                <stop offset="100%" stopColor="#2b030d" />
              </linearGradient>
              <linearGradient id="ribbonTailGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9f1239" />
                <stop offset="100%" stopColor="#670d22" />
              </linearGradient>
            </defs>

            {/* ========================================================= */}
            {/* PHYSICAL SATIN RIBBON BEHIND THE CAKE                     */}
            {/* "Happy Birthday Bindu"                                     */}
            {/* ========================================================= */}
            <g className="cake-ribbon-behind select-none" opacity="0.98">
              {/* Left Ribbon Tail (Dovetail notch folded behind) */}
              <path
                d="M 42 98 L 68 88 L 68 116 L 42 126 L 53 112 Z"
                fill="url(#ribbonTailGrad)"
                filter="url(#ribbonShadow)"
              />
              {/* Right Ribbon Tail */}
              <path
                d="M 358 98 L 332 88 L 332 116 L 358 126 L 347 112 Z"
                fill="url(#ribbonTailGrad)"
                filter="url(#ribbonShadow)"
              />

              {/* Shaded Foldbacks behind body */}
              <path d="M 68 88 L 86 92 L 86 120 L 68 116 Z" fill="url(#ribbonFoldDark)" />
              <path d="M 332 88 L 314 92 L 314 120 L 332 116 Z" fill="url(#ribbonFoldDark)" />

              {/* Main Arched Ribbon Banner Body */}
              <path
                d="M 72 88 Q 200 58 328 88 L 328 116 Q 200 86 72 116 Z"
                fill="url(#ribbonBodyGrad)"
                filter="url(#ribbonShadow)"
              />

              {/* Gold Embroidered Edges on top and bottom of banner */}
              <path d="M 73 89 Q 200 59 327 89" fill="none" stroke="url(#goldCalligraphy)" strokeWidth="1.2" opacity="0.9" />
              <path d="M 73 115 Q 200 85 327 115" fill="none" stroke="url(#goldCalligraphy)" strokeWidth="1.2" opacity="0.9" />

              {/* Text Path following the arch of the ribbon */}
              <path id="ribbonArchPath" d="M 76 106 Q 200 76 324 106" fill="none" />
              <text
                className="font-serif font-bold text-[13px] tracking-[0.18em]"
                fill="url(#goldCalligraphy)"
                filter="url(#frostingGlow)"
              >
                <textPath href="#ribbonArchPath" startOffset="50%" textAnchor="middle">
                  Happy Birthday {birthdayContent.herName}
                </textPath>
              </text>
            </g>

            {/* Porcelain Plate */}
            <ellipse cx="200" cy="195" rx="150" ry="24" fill="#faf8f5" filter="url(#cakeShadow)" />
            <ellipse cx="200" cy="195" rx="146" ry="21" fill="none" stroke="#ebdcb9" strokeWidth="1.5" opacity="0.6" />

            {/* Circular Cake Cylinder Body */}
            {/* Front Wall */}
            <path d="M 100 135 L 100 185 A 100 24 0 0 0 300 185 L 300 135 A 100 24 0 0 1 100 135 Z" fill="url(#cakeFront)" />

            {/* Top Surface */}
            <ellipse cx="200" cy="135" rx="100" ry="24" fill="url(#cakeTop)" />

            {/* Frosting Border Swirls (Around Top Perimeter) */}
            <g opacity="0.95">
              {Array.from({ length: 18 }).map((_, i) => {
                const angle = (i * 2 * Math.PI) / 18;
                const cx = 200 + 98 * Math.cos(angle);
                const cy = 135 + 22.5 * Math.sin(angle);
                const isEven = i % 2 === 0;
                return (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r={isEven ? 5 : 4.2}
                    fill={isEven ? "#fffdfa" : "#d4869a"}
                    stroke="#ebdcb9"
                    strokeWidth="0.5"
                  />
                );
              })}
            </g>

            {/* Frosting Drips on the Front Face */}
            <path
              d="M 100 135 Q 105 148 110 135 Q 120 152 128 135 Q 138 142 144 135 Q 160 151 168 135 Q 185 147 194 135 Q 210 152 218 135 Q 228 141 233 135 Q 248 152 256 135 Q 272 148 284 135 Q 295 144 300 135"
              fill="none"
              stroke="#fffdf8"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.92"
            />

            {/* 7 Candles Standing on Top Surface */}
            {candles.map((candle, idx) => (
              <g key={idx}>
                {/* Candle Body */}
                <rect
                  x={candle.x - 2.2}
                  y={candle.y - 28}
                  width="4.4"
                  height="28"
                  fill={candle.color}
                  rx="0.8"
                />
                {/* Candle Stripes */}
                <path
                  d={`M ${candle.x - 2.2} ${candle.y - 23} L ${candle.x + 2.2} ${candle.y - 19}
                     M ${candle.x - 2.2} ${candle.y - 15} L ${candle.x + 2.2} ${candle.y - 11}
                     M ${candle.x - 2.2} ${candle.y - 7} L ${candle.x + 2.2} ${candle.y - 3}`}
                  stroke={candle.stripe}
                  strokeWidth="1.2"
                />
                {/* Wick */}
                <line
                  x1={candle.x}
                  y1={candle.y - 28}
                  x2={candle.x}
                  y2={candle.y - 32}
                  stroke="#4a3b32"
                  strokeWidth="0.8"
                />

                {/* Animated Wind-responsive Candle Flame (SVG-rendered) */}
                {lit.includes(idx) && (
                  <motion.g
                    animate={
                      blowStage === "shrinking" && lit.length === 1 && lit[0] === idx
                        ? { scale: 0, opacity: 0 }
                        : {
                            scaleY: [1, 1.08, 0.95, 1.04, 1],
                            scaleX: [1, 1.05, 0.96, 1.03, 1],
                            y: [0, -0.5, 0.3, -0.3, 0],
                            skewX: blowIntensity * 32,
                            scale: 1 - blowIntensity * 0.65,
                            opacity: 1 - blowIntensity * 0.3,
                          }
                    }
                    transition={
                      blowStage === "shrinking" && lit.length === 1 && lit[0] === idx
                        ? { duration: 0.5, ease: "easeIn" }
                        : {
                            repeat: Infinity,
                            duration: 0.7 + idx * 0.12,
                            ease: "easeInOut",
                          }
                    }
                    className="origin-bottom"
                    style={{ transformOrigin: `${candle.x}px ${candle.y - 32}px` }}
                  >
                    {/* Outer Radiant Aura */}
                    <circle
                      cx={candle.x}
                      cy={candle.y - 39}
                      r="14"
                      fill="url(#flameOuter)"
                      filter="url(#flameGlowFilter)"
                      style={{ mixBlendMode: "screen" }}
                    />
                    {/* Inner Flame Core */}
                    <path
                      d={`M ${candle.x} ${candle.y - 45} 
                          C ${candle.x - 3} ${candle.y - 39} ${candle.x - 3.5} ${candle.y - 36} ${candle.x} ${candle.y - 32} 
                          C ${candle.x + 3} ${candle.y - 36} ${candle.x + 3} ${candle.y - 39} ${candle.x} ${candle.y - 45} Z`}
                      fill="url(#flameInner)"
                    />
                  </motion.g>
                )}

                {/* Smoke Wisp after Extinguishing */}
                {smoke === idx && (
                  <motion.path
                    initial={{ opacity: 0.8, y: 0, scale: 0.6 }}
                    animate={{ opacity: 0, y: -28, scale: 1.6 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    d={`M ${candle.x} ${candle.y - 32} Q ${candle.x - 4} ${candle.y - 40} ${candle.x + 2} ${candle.y - 50}`}
                    stroke="#e2e8f0"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    className="pointer-events-none"
                  />
                )}
              </g>
            ))}

            {/* Sparkles around cake */}
            {sparkles.map((s) => (
              <motion.circle
                key={s.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1.4, 0] }}
                transition={{ duration: 0.8, delay: (s.id % 5) * 0.1 }}
                cx={s.x}
                cy={s.y}
                r="2.5"
                fill="#fde047"
                filter="url(#flameGlowFilter)"
              />
            ))}

            {/* Confetti Particles in Cake Area */}
            {celebrationConfetti.map((c) => (
              <rect
                key={c.id}
                x={c.x}
                y={c.y}
                width={c.size}
                height={c.size * 0.6}
                fill={c.color}
                transform={`rotate(${c.rot} ${c.x} ${c.y})`}
                opacity="0.9"
              />
            ))}
          </svg>
        </motion.div>

        {/* Bottom Status / Continue Trigger */}
        <div className="relative z-30 mt-4 min-h-[50px] flex items-center justify-center">
          {lit.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white/60 text-xs flex items-center gap-2"
            >
              <Sparkles size={14} className="text-gold animate-spin" style={{ animationDuration: "3s" }} />
              <span>{lit.length} candles glowing brightly</span>
            </motion.div>
          ) : (
            <AnimatePresence>
              {blowStage === "ready" && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <button
                    onClick={onBlown}
                    className="btn-pill-rose font-serif text-sm tracking-wide shadow-[0_0_25px_rgba(244,63,94,0.5)] cursor-pointer"
                  >
                    Cut the Cake ♥ →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

export function CakeCuttingScene({ stage, onStage }: { stage: number; onStage: (n: number) => void }) {
  const [activeKnife, setActiveKnife] = useState<number | null>(null);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; vx: number; vy: number; color: string; size: number; alpha: number }[]>([]);

  const spawnParticles = (x: number, y: number, count = 20) => {
    const colors = ["#d9a85e", "#f43f5e", "#fb7185", "#ffffff", "#fed7aa", "#fbcfe8"];
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x,
      y,
      vx: (Math.random() - 0.5) * 5,
      vy: -2 - Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 4 + 2,
      alpha: 1,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
  };

  const interact = () => {
    if (activeKnife !== null) return;
    if (stage < 3) {
      setActiveKnife(stage);
      // Wait 700ms (when knife passes center) to show cut line & advance stage
      setTimeout(() => {
        onStage(stage + 1);
        spawnParticles(200, 135, 25);
      }, 700);
      // Wait 1400ms to allow another cut
      setTimeout(() => {
        setActiveKnife(null);
      }, 1400);
    } else if (stage < 5) {
      onStage(stage + 1);
      spawnParticles(200, 135, 15);
    }
  };

  useEffect(() => {
    if (particles.length === 0) return;
    let active = true;
    let raf = 0;
    const update = () => {
      if (!active) return;
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.15,
            alpha: p.alpha - 0.02,
          }))
          .filter((p) => p.alpha > 0 && p.y < 280)
      );
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [particles.length]);

  // Dimensions of the 3D-isometric cake
  const rx = 100;
  const ry = 24;
  const h = 60; // cake height
  const cyTop = 135;
  const cx = 200;

  // Sorting indices from back-to-front to ensure perfect overlap rendering (painter's algorithm)
  const sortedSlices = [4, 3, 5, 0, 2, 1];

  return (
    <div className="scene-container relative">
      {/* Premium Dark Burgundy Background Progression matching Candle scene */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0309] via-[#1f0616] to-[#080207] z-0" />
      
      {/* Soft spotlight behind the cake (Warm champagne/gold bloom) */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 mix-blend-screen opacity-70"
        style={{
          background: "radial-gradient(circle at 50% 55%, rgba(217, 168, 94, 0.2) 0%, rgba(244, 63, 94, 0.12) 40%, transparent 70%)"
        }}
      />
      
      {/* Cinematic vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_45%,_rgba(0,0,0,0.88)_100%)] pointer-events-none z-0" />

      {/* Hanging fairy light accents along top */}
      <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-10 opacity-60 flex justify-around px-8">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-[1px] h-6 sm:h-8 bg-gradient-to-b from-white/20 via-gold/40 to-gold/70" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_8px_rgba(254,240,138,0.9)] animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
          </div>
        ))}
      </div>

      {/* Edge-only Fireworks once cut is complete */}
      {stage >= 5 && (
        <FireworkCanvas edgesOnly={true} />
      )}

      <ParticleField density="low" petals={true} dots={false} />
      
      <div className="relative z-10 flex min-h-full flex-1 flex-col items-center justify-center p-4 py-8 text-center select-none overflow-y-auto">
        
        {/* Title & Decorative Ribbon */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 sm:mb-4 z-30"
        >
          {/* Decorative Romantic Ribbon matching Cake Scene */}
          <div className="inline-flex items-center justify-center gap-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-[#881337] via-[#be123c] to-[#881337] border-y border-[#fef08a]/80 shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_15px_rgba(244,63,94,0.35)] mb-2">
            <span className="text-[10px] sm:text-xs font-serif uppercase tracking-[0.25em] text-[#fed7aa] font-semibold">
              ✦ SHARED SWEETNESS ✦
            </span>
          </div>

          <h2 className="font-calligraphy text-4xl sm:text-6xl text-[#fef08a] glow-gold leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            Cake Cutting Time
          </h2>

          <div className="flex items-center justify-center gap-2 my-1">
            <span className="text-xs text-gold/60">~</span>
            <span className="font-script text-2xl sm:text-3xl text-rose-300 glow-rose">
              {birthdayContent.herName}
            </span>
            <span className="text-xs text-gold/60">~</span>
          </div>

          <p className="text-xs sm:text-sm font-serif italic text-rose-100/80 mt-1 max-w-md mx-auto leading-relaxed">
            {stage === 0 && "Let's cut the cake and make this moment sweeter together..."}
            {stage === 1 && "Tap to make the second cut ✦"}
            {stage === 2 && "Tap to make the final cut ✦"}
            {stage >= 3 && stage < 5 && "The sweet slices pull apart! Tap to serve ✦"}
            {stage >= 5 && "Every slice holds a special reason I adore you ♥"}
          </p>
        </motion.div>

        <div
          className="relative w-full max-w-[42rem] h-[52vh] sm:h-[60vh] cursor-pointer flex items-center justify-center"
          onClick={interact}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && interact()}
          aria-label="Tap to slice cake"
        >
          <svg viewBox="0 0 400 280" className="w-full drop-shadow-[0_24px_60px_rgba(0,0,0,0.65)] overflow-visible">
            <defs>
              <linearGradient id="cutFrostingTop" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffcbd7" />
                <stop offset="100%" stopColor="#fca1b5" />
              </linearGradient>
              <linearGradient id="cutFrostingSide" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fca1b5" />
                <stop offset="60%" stopColor="#e87a90" />
                <stop offset="100%" stopColor="#cf576e" />
              </linearGradient>
              <linearGradient id="spongeWall" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
              <linearGradient id="jamLayer" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#be123c" />
                <stop offset="50%" stopColor="#e11d48" />
                <stop offset="100%" stopColor="#9f1239" />
              </linearGradient>
              <linearGradient id="silverKnife" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#e2e8f0" />
                <stop offset="70%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
              <linearGradient id="goldKnifeHandle" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#d9a85e" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>
              <filter id="cakeCutShadow">
                <feDropShadow dx="0" dy="16" stdDeviation="14" floodColor="#000" floodOpacity="0.6" />
              </filter>

              {/* Decorative Ribbon Garland behind cake */}
              <linearGradient id="garlandBody" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#831843" />
                <stop offset="50%" stopColor="#be185d" />
                <stop offset="100%" stopColor="#831843" />
              </linearGradient>
            </defs>

            {/* Background Garland Arch */}
            <g opacity="0.85">
              <path
                d="M 60 70 Q 200 40 340 70 L 340 92 Q 200 62 60 92 Z"
                fill="url(#garlandBody)"
                filter="url(#cakeCutShadow)"
              />
              <path d="M 61 71 Q 200 41 339 71" fill="none" stroke="#fef08a" strokeWidth="1" opacity="0.8" />
              <path d="M 61 91 Q 200 61 339 91" fill="none" stroke="#fef08a" strokeWidth="1" opacity="0.8" />
              <path id="cutGarlandPath" d="M 65 83 Q 200 53 335 83" fill="none" />
              <text className="font-serif font-bold text-[12px] tracking-[0.2em]" fill="#fef08a">
                <textPath href="#cutGarlandPath" startOffset="50%" textAnchor="middle">
                  A Sweet Slice of Joy ♡
                </textPath>
              </text>
            </g>

            {/* Porcelain Plate */}
            <ellipse cx="200" cy="195" rx="145" ry="24" fill="#faf8f5" filter="url(#cakeCutShadow)" />
            <ellipse cx="200" cy="195" rx="141" ry="21" fill="none" stroke="#ebdcb9" strokeWidth="1.5" opacity="0.6" />

            {/* 6 Individual Isometric Cake Slices */}
            {sortedSlices.map((sliceIdx) => {
              const startAngle = (sliceIdx * 60 * Math.PI) / 180;
              const endAngle = ((sliceIdx + 1) * 60 * Math.PI) / 180;
              const midAngle = ((sliceIdx + 0.5) * 60 * Math.PI) / 180;

              // Pull apart outward radially at stage >= 3
              const pullDist = stage >= 5 ? 26 : stage >= 4 ? 18 : stage >= 3 ? 10 : 0;
              const dx = Math.cos(midAngle) * pullDist;
              const dy = Math.sin(midAngle) * pullDist * (ry / rx);

              const p1x = cx + rx * Math.cos(startAngle);
              const p1y = cyTop + ry * Math.sin(startAngle);
              const p2x = cx + rx * Math.cos(endAngle);
              const p2y = cyTop + ry * Math.sin(endAngle);

              return (
                <g
                  key={sliceIdx}
                  transform={`translate(${dx}, ${dy})`}
                  className="transition-transform duration-700 ease-out"
                >
                  {/* Internal Sponge & Jam Walls exposed when separated */}
                  {stage >= 3 && (
                    <>
                      {/* Left Wall Slice (facing inward from startAngle) */}
                      <path
                        d={`M ${cx} ${cyTop} L ${p1x} ${p1y} L ${p1x} ${p1y + h} L ${cx} ${cyTop + h} Z`}
                        fill="url(#spongeWall)"
                        stroke="#fef08a"
                        strokeWidth="0.5"
                      />
                      {/* Jam & Cream Strips along Left Wall */}
                      <path
                        d={`M ${cx} ${cyTop + h * 0.45} L ${p1x} ${p1y + h * 0.45} L ${p1x} ${p1y + h * 0.55} L ${cx} ${cyTop + h * 0.55} Z`}
                        fill="url(#jamLayer)"
                      />
                      <path
                        d={`M ${cx} ${cyTop + h * 0.55} L ${p1x} ${p1y + h * 0.55} L ${p1x} ${p1y + h * 0.62} L ${cx} ${cyTop + h * 0.62} Z`}
                        fill="#fff"
                        opacity="0.9"
                      />

                      {/* Right Wall Slice (facing inward from endAngle) */}
                      <path
                        d={`M ${cx} ${cyTop} L ${p2x} ${p2y} L ${p2x} ${p2y + h} L ${cx} ${cyTop + h} Z`}
                        fill="url(#spongeWall)"
                        stroke="#fef08a"
                        strokeWidth="0.5"
                      />
                      {/* Jam Strip on Right Wall */}
                      <path
                        d={`M ${cx} ${cyTop + h * 0.45} L ${p2x} ${p2y + h * 0.45} L ${p2x} ${p2y + h * 0.55} L ${cx} ${cyTop + h * 0.55} Z`}
                        fill="url(#jamLayer)"
                      />
                    </>
                  )}

                  {/* Outer Frosted Curved Wall */}
                  <path
                    d={`M ${p1x} ${p1y} A ${rx} ${ry} 0 0 1 ${p2x} ${p2y} L ${p2x} ${p2y + h} A ${rx} ${ry} 0 0 0 ${p1x} ${p1y + h} Z`}
                    fill="url(#cutFrostingSide)"
                  />

                  {/* Top Frosted Wedge */}
                  <path
                    d={`M ${cx} ${cyTop} L ${p1x} ${p1y} A ${rx} ${ry} 0 0 1 ${p2x} ${p2y} Z`}
                    fill="url(#cutFrostingTop)"
                    stroke="#ffffff"
                    strokeWidth="0.5"
                  />

                  {/* Slice Cream Rosette on top edge */}
                  <circle
                    cx={cx + (rx * 0.85) * Math.cos(midAngle)}
                    cy={cyTop + (ry * 0.85) * Math.sin(midAngle)}
                    r="4"
                    fill="#fff"
                    stroke="#ebdcb9"
                    strokeWidth="0.5"
                    filter="url(#cakeCutShadow)"
                  />
                  {/* Strawberry Slice Topper on rosette */}
                  <circle
                    cx={cx + (rx * 0.85) * Math.cos(midAngle)}
                    cy={cyTop + (ry * 0.85) * Math.sin(midAngle)}
                    r="2"
                    fill="#e11d48"
                  />
                </g>
              );
            })}

            {/* Cut Lines across the cake (drawn progressively) */}
            {stage >= 1 && (
              <line
                x1={cx - rx}
                y1={cyTop}
                x2={cx + rx}
                y2={cyTop}
                stroke="#fff"
                strokeWidth="2.5"
                strokeDasharray="4 2"
                opacity="0.95"
              />
            )}
            {stage >= 2 && (
              <line
                x1={cx - rx * 0.5}
                y1={cyTop - ry * 0.866}
                x2={cx + rx * 0.5}
                y2={cyTop + ry * 0.866}
                stroke="#fff"
                strokeWidth="2.5"
                strokeDasharray="4 2"
                opacity="0.95"
              />
            )}
            {stage >= 3 && (
              <line
                x1={cx - rx * 0.5}
                y1={cyTop + ry * 0.866}
                x2={cx + rx * 0.5}
                y2={cyTop - ry * 0.866}
                stroke="#fff"
                strokeWidth="2.5"
                strokeDasharray="4 2"
                opacity="0.95"
              />
            )}

            {/* Animated Silver Knife */}
            {activeKnife !== null && (
              <motion.g
                initial={{
                  x: activeKnife === 0 ? cx - 140 : cx - 100,
                  y: activeKnife === 0 ? cyTop - 80 : cyTop - 100,
                  rotate: activeKnife === 0 ? 25 : activeKnife === 1 ? -35 : 45,
                  opacity: 0,
                }}
                animate={{
                  x: [
                    activeKnife === 0 ? cx - 140 : cx - 100,
                    cx,
                    activeKnife === 0 ? cx + 140 : cx + 100,
                  ],
                  y: [cyTop - 80, cyTop, cyTop + 70],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="pointer-events-none"
              >
                {/* Silver Blade */}
                <path
                  d="M -60 -4 L 40 -2 L 50 0 L 40 2 L -60 4 Z"
                  fill="url(#silverKnife)"
                  filter="url(#cakeCutShadow)"
                />
                {/* Golden Handle */}
                <rect x="-95" y="-6" width="35" height="12" rx="3" fill="url(#goldKnifeHandle)" />
                <circle cx="-77" cy="0" r="2" fill="#fff" opacity="0.6" />
              </motion.g>
            )}

            {/* Crumb & Sparkle Particles */}
            {particles.map((p) => (
              <circle
                key={p.id}
                cx={p.x}
                cy={p.y}
                r={p.size}
                fill={p.color}
                opacity={p.alpha}
              />
            ))}
          </svg>
        </div>

        {/* CTA Button once cutting is complete */}
        <div className="relative z-30 mt-3 min-h-[50px] flex items-center justify-center">
          {stage >= 5 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={() => onStage(6)}
                className="btn-pill-rose font-serif text-sm tracking-wide shadow-[0_0_25px_rgba(244,63,94,0.5)] cursor-pointer"
              >
                Share the Happiness ♥ →
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}


function HappinessIcon({ icon, className }: { icon: HappinessItem["icon"]; className?: string }) {
  const props = { className: cn("h-6 w-6", className || "text-gold glow-gold") };
  switch (icon) {
    case "smile":
      return <Smile {...props} />;
    case "laugh":
      return <Laugh {...props} />;
    case "eyes":
      return <Eye {...props} />;
    case "memories":
      return <ImageIcon {...props} />;
    case "adventures":
      return <Compass {...props} />;
    case "future":
      return <Sparkles {...props} />;
  }
}

function ShareHappinessScene({
  opened,
  onOpen,
  onContinue,
}: {
  opened: string[];
  onOpen: (id: string) => void;
  onContinue: () => void;
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const isFlippingRef = useRef(false);

  // Body scroll lock and Escape key listener
  useEffect(() => {
    if (activeIdx !== null) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setActiveIdx(null);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [activeIdx]);

  const handleFlip = useCallback(() => {
    if (isFlippingRef.current) return;
    isFlippingRef.current = true;
    setIsFlipped((f) => !f);
    setTimeout(() => {
      isFlippingRef.current = false;
    }, 450);
  }, []);

  const handleOpen = (idx: number) => {
    setActiveIdx(idx);
    setIsFlipped(false);
    const item = happiness[idx];
    if (!opened.includes(item.id)) {
      onOpen(item.id);
    }
    
    // Auto-flip to reason after initial reveal
    setTimeout(() => {
      setIsFlipped(true);
    }, 550);
  };

  // 6 Collectible Cake-Piece Flavors matching the romantic palette
  const cakeCards = [
    {
      id: "smile",
      flavor: "Strawberry Rose",
      flavorDesc: "Blush pink rose cream & strawberry",
      sliceImg: "/images/cake-strawberry.jpg",
      openedBg: "/images/bg-cake-1-strawberry.jpg",
      primaryColor: "#f472b6",
      glowColor: "rgba(244, 114, 182, 0.45)",
      borderColor: "rgba(244, 114, 182, 0.6)",
      bgGradient: "linear-gradient(145deg, rgba(46, 12, 24, 0.92) 0%, rgba(26, 6, 13, 0.96) 100%)",
      badgeStyle: "bg-pink-500/20 text-pink-300 border-pink-400/40",
      accentIcon: "🍓",
    },
    {
      id: "laugh",
      flavor: "Dark Chocolate Truffle",
      flavorDesc: "Rich cocoa ganache & gold leaf",
      sliceImg: "/images/cake-chocolate.jpg",
      openedBg: "/images/bg-cake-2-chocolate.jpg",
      primaryColor: "#fb923c",
      glowColor: "rgba(251, 146, 60, 0.45)",
      borderColor: "rgba(251, 146, 60, 0.6)",
      bgGradient: "linear-gradient(145deg, rgba(38, 18, 10, 0.92) 0%, rgba(20, 8, 4, 0.96) 100%)",
      badgeStyle: "bg-amber-600/20 text-amber-300 border-amber-500/40",
      accentIcon: "🍫",
    },
    {
      id: "eyes",
      flavor: "Vanilla Champagne",
      flavorDesc: "Ivory bean cream & gold pearls",
      sliceImg: "/images/cake-vanilla.jpg",
      openedBg: "/images/bg-cake-3-vanilla.jpg",
      primaryColor: "#facc15",
      glowColor: "rgba(250, 204, 21, 0.45)",
      borderColor: "rgba(250, 204, 21, 0.6)",
      bgGradient: "linear-gradient(145deg, rgba(38, 32, 12, 0.92) 0%, rgba(20, 16, 5, 0.96) 100%)",
      badgeStyle: "bg-yellow-500/20 text-yellow-300 border-yellow-400/40",
      accentIcon: "✨",
    },
    {
      id: "memories",
      flavor: "Red Velvet Royale",
      flavorDesc: "Crimson sponge & cream cheese",
      sliceImg: "/images/cake-redvelvet.jpg",
      openedBg: "/images/bg-cake-4-redvelvet.jpg",
      primaryColor: "#f43f5e",
      glowColor: "rgba(244, 63, 94, 0.45)",
      borderColor: "rgba(244, 63, 94, 0.6)",
      bgGradient: "linear-gradient(145deg, rgba(48, 8, 16, 0.92) 0%, rgba(26, 4, 9, 0.96) 100%)",
      badgeStyle: "bg-rose-500/20 text-rose-300 border-rose-400/40",
      accentIcon: "🌹",
    },
    {
      id: "adventures",
      flavor: "Blueberry Dream",
      flavorDesc: "Lavender glaze & wild berries",
      sliceImg: "/images/cake-blueberry.jpg",
      openedBg: "/images/bg-cake-5-blueberry.jpg",
      primaryColor: "#c084fc",
      glowColor: "rgba(192, 132, 252, 0.45)",
      borderColor: "rgba(192, 132, 252, 0.6)",
      bgGradient: "linear-gradient(145deg, rgba(28, 14, 46, 0.92) 0%, rgba(14, 6, 24, 0.96) 100%)",
      badgeStyle: "bg-purple-500/20 text-purple-300 border-purple-400/40",
      accentIcon: "🫐",
    },
    {
      id: "future",
      flavor: "Salted Caramel Glow",
      flavorDesc: "Warm amber drizzle & sea salt",
      sliceImg: "/images/cake-caramel.jpg",
      openedBg: "/images/bg-cake-6-caramel.jpg",
      primaryColor: "#f59e0b",
      glowColor: "rgba(245, 158, 11, 0.45)",
      borderColor: "rgba(245, 158, 11, 0.6)",
      bgGradient: "linear-gradient(145deg, rgba(42, 24, 10, 0.92) 0%, rgba(22, 11, 4, 0.96) 100%)",
      badgeStyle: "bg-amber-500/20 text-amber-300 border-amber-400/40",
      accentIcon: "🍯",
    },
  ];

  return (
    <div className="scene-container relative overflow-hidden">
      <BackgroundLayer src={assets.cinematicFlowerArch || assets.countdownGarden} overlay />
      <div className="absolute inset-0 bg-gradient-to-b from-[#080310]/85 via-black/40 to-[#040108]/90 pointer-events-none" />
      <ParticleField density="low" petals={true} dots={false} />

      <div className="relative z-10 flex min-h-full flex-1 flex-col items-center justify-start overflow-y-auto px-3 sm:px-6 py-6 sm:py-10 select-none w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl text-center w-full mt-1 mb-2 sm:mb-4"
        >
          <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.25em] text-gold font-medium">
            Sweet Collectibles
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl gradient-text glow-gold mt-1 font-bold">
            Yay! Let's share the happiness
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-rose-100/75 max-w-sm mx-auto font-sans leading-relaxed">
            Six sweet cake slices — each holding a treasured memory with you.
          </p>
        </motion.div>

        {/* 6 Cake-Piece Cards Grid (Compact 3x2 on desktop, 2x3 on mobile) */}
        <div className="grid w-full max-w-3xl grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5 px-1 sm:px-3">
          {happiness.map((h, i) => {
            const isOpened = opened.includes(h.id);
            const cake = cakeCards[i];
            return (
              <motion.button
                key={h.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{
                  y: -4,
                  scale: 1.025,
                  boxShadow: `0 14px 30px rgba(0, 0, 0, 0.6), 0 0 20px ${cake.glowColor}`,
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => handleOpen(i)}
                style={{
                  background: cake.bgGradient,
                  boxShadow: isOpened
                    ? `0 10px 22px rgba(0,0,0,0.55), 0 0 16px ${cake.glowColor}, inset 0 1px 1px rgba(255,255,255,0.15)`
                    : "0 8px 18px rgba(0,0,0,0.45), inset 0 1px 1px rgba(255,255,255,0.1)",
                  borderColor: isOpened ? cake.primaryColor : "rgba(255,255,255,0.15)",
                }}
                className={cn(
                  "group relative flex flex-col items-center justify-between rounded-xl p-2 sm:p-2.5 text-center border cursor-pointer select-none transition-all duration-300 min-h-[9.8rem] sm:min-h-[11.2rem] overflow-hidden",
                  "backdrop-blur-md"
                )}
              >
                {/* Top Cake Slice Photograph */}
                <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden shadow-sm border border-white/10 group-hover:scale-105 transition-transform duration-500 bg-black/40">
                  <img
                    src={cake.sliceImg}
                    alt={cake.flavor}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Slice number pill */}
                  <span className="absolute bottom-1 left-1.5 text-[8px] sm:text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-black/60 backdrop-blur-md text-white font-mono border border-white/20">
                    0{i + 1}
                  </span>
                  
                  {/* Heart status */}
                  <div className="absolute top-1 right-1">
                    <Heart
                      className={cn(
                        "h-3.5 w-3.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]",
                        isOpened ? "fill-rose-500 text-rose-500 animate-pulse" : "text-white/60"
                      )}
                    />
                  </div>
                </div>

                {/* Flavor & Title */}
                <div className="w-full my-auto pt-1 pb-0.5 px-0.5">
                  <span
                    className={cn(
                      "text-[8px] sm:text-[9px] uppercase tracking-wider font-serif font-bold px-1.5 py-0.5 rounded-full border inline-block mb-0.5",
                      cake.badgeStyle
                    )}
                  >
                    {cake.flavor}
                  </span>
                  <h3 className="font-serif text-xs sm:text-sm font-bold text-white tracking-wide leading-tight group-hover:text-gold transition-colors line-clamp-1">
                    {h.title}
                  </h3>
                </div>

                {/* Bottom Callout */}
                <div className="w-full pt-1 border-t border-white/10 flex items-center justify-center">
                  <span
                    className="text-[8px] sm:text-[9px] uppercase tracking-widest font-bold transition-colors"
                    style={{ color: isOpened ? cake.primaryColor : "rgba(255,255,255,0.6)" }}
                  >
                    {isOpened ? "♥ Read Memory" : "✦ Tap to taste"}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Continue button appears once all 6 cards have been opened */}
        {opened.length === happiness.length && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 sm:mt-10 mb-6 text-center z-20"
          >
            <PrimaryButton onClick={onContinue}>
              Discover More Memories ✦
            </PrimaryButton>
          </motion.div>
        )}
      </div>

      {/* 3D Cake Slice Modal Popup with UNIQUE Opened Background per Card */}
      <AnimatePresence>
        {activeIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveIdx(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md"
          >
            {/* 3D Perspective Wrapper */}
            <div
              className="relative w-full max-w-[340px] sm:max-w-md h-[500px] sm:h-[530px] max-h-[88vh] perspective-1000"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Card Container with Accessible Flip */}
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0, scale: isFlipped ? 1.02 : 1 }}
                transition={{ type: "spring", stiffness: 90, damping: 14 }}
                className="w-full h-full preserve-3d relative cursor-pointer outline-none rounded-3xl"
                tabIndex={0}
                role="button"
                aria-label="Flip collectible cake card"
                onClick={handleFlip}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleFlip();
                  }
                }}
              >
                {/* 1. FRONT FACE (Cake Slice Presentation) */}
                <div
                  className="absolute inset-0 rounded-3xl border-2 p-5 sm:p-7 flex flex-col items-center justify-between text-center backface-hidden overflow-hidden shadow-2xl"
                  style={{
                    borderColor: cakeCards[activeIdx].borderColor,
                    boxShadow: `0 25px 60px rgba(0,0,0,0.85), 0 0 35px ${cakeCards[activeIdx].glowColor}`,
                  }}
                >
                  {/* UNIQUE Opened Flavor Background Image */}
                  <img
                    src={cakeCards[activeIdx].openedBg}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />
                  {/* Contrast Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/65 to-black/90 backdrop-blur-sm pointer-events-none" />

                  {/* Top Bar with Number, Flavor, and Close Button */}
                  <div className="relative w-full flex justify-between items-center z-10 px-1">
                    <span className="text-[10px] uppercase tracking-[0.25em] font-mono text-white/70">
                      PIECE 0{activeIdx + 1} / 06
                    </span>
                    <span
                      className={cn(
                        "text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border font-bold shadow-sm",
                        cakeCards[activeIdx].badgeStyle
                      )}
                    >
                      {cakeCards[activeIdx].flavor}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveIdx(null);
                      }}
                      className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      title="Close Card"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Center Cake Image Medallion */}
                  <div className="relative flex flex-col items-center gap-3 z-10 my-auto">
                    <motion.div
                      animate={{ scale: [1, 1.04, 1] }}
                      transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                      className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden border-2 shadow-2xl bg-black/60"
                      style={{
                        borderColor: cakeCards[activeIdx].borderColor,
                        boxShadow: `0 12px 35px rgba(0,0,0,0.7), 0 0 25px ${cakeCards[activeIdx].glowColor}`,
                      }}
                    >
                      <img
                        src={cakeCards[activeIdx].sliceImg}
                        alt={cakeCards[activeIdx].flavor}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    </motion.div>

                    <div>
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide glow-gold">
                        {happiness[activeIdx].title}
                      </h3>
                      <p className="text-xs text-rose-100/80 font-sans tracking-wide mt-1">
                        {cakeCards[activeIdx].flavorDesc}
                      </p>
                    </div>
                  </div>

                  {/* Tap to Unveil Callout */}
                  <div className="relative flex flex-col items-center gap-1.5 z-10 pb-1">
                    <motion.span
                      animate={{ y: [0, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                      className="text-xs uppercase tracking-[0.2em] font-serif font-bold text-gold"
                    >
                      Tap to Unveil Reason ♥
                    </motion.span>
                    <div
                      className="w-14 h-0.5 rounded-full"
                      style={{ backgroundColor: cakeCards[activeIdx].primaryColor }}
                    />
                  </div>
                </div>

                {/* 2. BACK FACE (Revealed Reason Details with Unique Background) */}
                <div
                  className="absolute inset-0 rounded-3xl border-2 p-5 sm:p-7 flex flex-col justify-between text-center backface-hidden rotate-y-180 overflow-hidden shadow-2xl"
                  style={{
                    borderColor: cakeCards[activeIdx].borderColor,
                    boxShadow: `0 25px 60px rgba(0,0,0,0.85), 0 0 35px ${cakeCards[activeIdx].glowColor}`,
                  }}
                >
                  {/* UNIQUE Opened Flavor Background Image */}
                  <img
                    src={cakeCards[activeIdx].openedBg}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />
                  {/* Darkened readability overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/90 backdrop-blur-sm pointer-events-none" />

                  {/* Header */}
                  <div className="relative z-10 flex justify-between items-center px-1">
                    <span className="text-[10px] font-mono tracking-[0.3em] uppercase font-bold text-white/70">
                      Reason #{activeIdx + 1} of 6
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveIdx(null);
                      }}
                      className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      title="Close Card"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Content details with high-contrast readable HTML typography */}
                  <div className="relative z-10 my-auto py-2 flex flex-col items-center select-text">
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      className="mb-2"
                      style={{ color: cakeCards[activeIdx].primaryColor }}
                    >
                      <HappinessIcon icon={happiness[activeIdx].icon} className="h-9 w-9 drop-shadow-md" />
                    </motion.div>

                    <span
                      className={cn(
                        "text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-bold mb-2",
                        cakeCards[activeIdx].badgeStyle
                      )}
                    >
                      {cakeCards[activeIdx].flavor}
                    </span>

                    <h4 className="font-serif text-sm tracking-[0.25em] font-bold uppercase text-gold glow-gold mb-3">
                      {happiness[activeIdx].title}
                    </h4>

                    {/* Clear, readable, high-contrast message */}
                    <p className="font-serif italic text-xl sm:text-2xl leading-relaxed font-normal text-rose-50 px-3 py-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                      "{happiness[activeIdx].message}"
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest font-medium text-white/60">
                      Tap card to flip back
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveIdx(null);
                      }}
                      className="rounded-full px-6 py-2 text-xs font-serif font-bold uppercase tracking-wider text-[#2c1307] bg-gradient-to-r from-[#e7b876] via-[#f7d69e] to-[#e7b876] shadow-[0_0_20px_rgba(231,184,118,0.4)] active:scale-95 transition-all cursor-pointer"
                    >
                      Close Reason ♥
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 9 — Three Gifts                                              */
/* ------------------------------------------------------------------ */

function GiftBox3D({
  giftId,
  label,
  opened,
  onClick,
}: {
  giftId: string;
  label: string;
  opened: boolean;
  onClick: () => void;
}) {
  // Luxury Wrapping & Ribbon Palette
  let wrappingGrads = {
    top: ["#ffcbd7", "#fca1b5"],
    front: ["#fca1b5", "#e87a90"],
    side: ["#e87a90", "#cf576e"],
    lidTop: ["#ffcbd7", "#fca1b5"],
    lidFront: ["#fca1b5", "#e87a90"],
    lidSide: ["#e87a90", "#cf576e"],
  };
  let ribbonGrad = ["#ffe082", "#d9a85e", "#b8862e"]; // Gold satin

  if (giftId === "memories") {
    // Champagne gold box with deep crimson velvet ribbon
    wrappingGrads = {
      top: ["#fef4e5", "#ebdcb9"],
      front: ["#ebdcb9", "#d6c193"],
      side: ["#c5b080", "#a69365"],
      lidTop: ["#fef4e5", "#ebdcb9"],
      lidFront: ["#ebdcb9", "#d6c193"],
      lidSide: ["#c5b080", "#a69365"],
    };
    ribbonGrad = ["#fb7185", "#e11d48", "#9f1239"]; // Velvet Crimson
  } else if (giftId === "voice") {
    // Midnight lavender blue box with rose-gold ribbon
    wrappingGrads = {
      top: ["#e0e7ff", "#c7d2fe"],
      front: ["#a5b4fc", "#818cf8"],
      side: ["#6366f1", "#4f46e5"],
      lidTop: ["#e0e7ff", "#c7d2fe"],
      lidFront: ["#a5b4fc", "#818cf8"],
      lidSide: ["#6366f1", "#4f46e5"],
    };
    ribbonGrad = ["#fbcfe8", "#f472b6", "#db2777"]; // Rose Gold
  }

  return (
    <motion.button
      whileHover={{ y: -8, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={opened ? {} : { rotate: [0, -1.2, 1.2, -1.2, 1.2, 0] }}
      transition={opened ? {} : { repeat: Infinity, duration: 4.5, repeatDelay: 2 }}
      onClick={onClick}
      className="group relative block mx-auto w-48 sm:w-56 cursor-pointer focus:outline-none"
      aria-label={opened ? `Revisit ${label} gift` : `Open ${label} gift`}
    >
      {/* Radiant Glow Behind Box */}
      <div
        className={cn(
          "absolute inset-0 rounded-full blur-2xl transition-all duration-700 pointer-events-none",
          opened
            ? "opacity-75 blur-3xl scale-125"
            : "opacity-20 group-hover:opacity-60 group-hover:scale-110",
          giftId === "letter" && "bg-rose-500/30",
          giftId === "memories" && "bg-amber-400/30",
          giftId === "voice" && "bg-indigo-400/30"
        )}
      />

      <svg viewBox="0 0 200 220" className="w-full drop-shadow-[0_18px_35px_rgba(0,0,0,0.6)] overflow-visible">
        <defs>
          <filter id={`shadowFilter-${giftId}`}>
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id={`lightGlow-${giftId}`}>
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Gradients */}
          <linearGradient id={`topGrad-${giftId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={wrappingGrads.top[0]} />
            <stop offset="100%" stopColor={wrappingGrads.top[1]} />
          </linearGradient>
          <linearGradient id={`frontGrad-${giftId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={wrappingGrads.front[0]} />
            <stop offset="100%" stopColor={wrappingGrads.front[1]} />
          </linearGradient>
          <linearGradient id={`sideGrad-${giftId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={wrappingGrads.side[0]} />
            <stop offset="100%" stopColor={wrappingGrads.side[1]} />
          </linearGradient>
          
          <linearGradient id={`ribbonGrad-${giftId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={ribbonGrad[0]} />
            <stop offset="50%" stopColor={ribbonGrad[1]} />
            <stop offset="100%" stopColor={ribbonGrad[2]} />
          </linearGradient>

          <linearGradient id={`beamGrad-${giftId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fffdf0" stopOpacity="0.9" />
            <stop offset="45%" stopColor={giftId === "letter" ? "#fca1b5" : giftId === "memories" ? "#fef08a" : "#c7d2fe"} stopOpacity="0.45" />
            <stop offset="100%" stopColor="#d9a85e" stopOpacity="0" />
          </linearGradient>

          <radialGradient id={`innerGlow-${giftId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="40%" stopColor="#fef08a" stopOpacity="0.85" />
            <stop offset="75%" stopColor={giftId === "letter" ? "#fca1b5" : "#fed7aa"} stopOpacity="0.4" />
            <stop offset="100%" stopColor="#d9a85e" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Contact Shadow */}
        <motion.ellipse
          cx="100"
          cy="180"
          rx="72"
          ry="12"
          fill="#000"
          animate={opened ? { opacity: 0.3, rx: 66 } : { opacity: 0.5, rx: 72 }}
          transition={{ duration: 0.6 }}
          filter={`url(#shadowFilter-${giftId})`}
        />

        {/* Volumetric Beam of Light Emerging on Open */}
        {opened && (
          <motion.polygon
            points="100,105 160,80 175,-30 25,-30 40,80"
            fill={`url(#beamGrad-${giftId})`}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: [0, 0.95, 0.75], scaleY: [0, 1] }}
            transition={{ duration: 0.6 }}
            className="origin-bottom pointer-events-none"
            style={{ transformOrigin: "100px 105px", mixBlendMode: "screen" }}
          />
        )}

        {/* Inner Warm Glow Emanating from Inside */}
        {opened && (
          <ellipse
            cx="100"
            cy="105"
            rx="56"
            ry="24"
            fill={`url(#innerGlow-${giftId})`}
            className="animate-pulse"
            style={{ mixBlendMode: "screen" }}
          />
        )}

        {/* Revealed Keepsake Element Rising Up */}
        {opened && giftId === "letter" && (
          <motion.g
            initial={{ y: 45, opacity: 0, scale: 0.5 }}
            animate={{ y: 5, opacity: 1, scale: 1.05 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            style={{ transformOrigin: "100px 105px" }}
          >
            <path d="M 75,85 L 125,85 L 125,120 L 75,120 Z" fill="#faf6ee" stroke="#d9a85e" strokeWidth="1" />
            <polygon points="75,85 100,65 125,85" fill="#f5eedc" stroke="#d9a85e" strokeWidth="1" />
            <circle cx="100" cy="95" r="5" fill="#9f1239" />
            <path d="M 99,93 L 101,97 M 101,93 L 99,97" stroke="#fb7185" strokeWidth="0.5" />
          </motion.g>
        )}

        {opened && giftId === "memories" && (
          <motion.g
            initial={{ y: 45, opacity: 0, scale: 0.5 }}
            animate={{ y: 5, opacity: 1, scale: 1.05 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            style={{ transformOrigin: "100px 105px" }}
          >
            <g transform="translate(-12, -4) rotate(-12 85 95)">
              <rect x="75" y="70" width="22" height="28" fill="#faf8f5" rx="1" />
              <rect x="77" y="72" width="18" height="18" fill="#e0ab8b" />
              <circle cx="86" cy="81" r="2" fill="#faf8f5" opacity="0.6" />
            </g>
            <g transform="translate(12, -4) rotate(12 115 95)">
              <rect x="103" y="70" width="22" height="28" fill="#faf8f5" rx="1" />
              <rect x="105" y="72" width="18" height="18" fill="#88b5d3" />
              <circle cx="114" cy="81" r="2" fill="#faf8f5" opacity="0.6" />
            </g>
          </motion.g>
        )}

        {opened && giftId === "voice" && (
          <motion.g
            initial={{ y: 45, opacity: 0, scale: 0.5 }}
            animate={{ y: 5, opacity: 1, scale: 1.05 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            style={{ transformOrigin: "100px 105px" }}
          >
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              style={{ transformOrigin: "100px 92px" }}
            >
              <circle cx="100" cy="92" r="22" fill="#18181b" />
              <circle cx="100" cy="92" r="16" fill="none" stroke="#27272a" strokeWidth="1" />
              <circle cx="100" cy="92" r="10" fill="none" stroke="#27272a" strokeWidth="1" />
              <circle cx="100" cy="92" r="6" fill="#d9a85e" />
              <circle cx="100" cy="92" r="1.5" fill="#090d16" />
            </motion.g>
            <motion.path
              d="M 120,70 A 2,2 0 1,1 118,72 L 118,63 L 123,65 L 123,69 L 118,67"
              fill="#d9a85e"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: [0, 1, 0], y: [-5, -20] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
            />
          </motion.g>
        )}

        {/* Box Base Front Wall */}
        <polygon points="100,105 160,80 160,155 100,180" fill={`url(#frontGrad-${giftId})`} />
        {/* Box Base Side Wall */}
        <polygon points="100,105 40,80 40,155 100,180" fill={`url(#sideGrad-${giftId})`} />

        {/* Satin Ribbons around Base */}
        <polygon points="127,94 133,91.5 133,166 127,169" fill={`url(#ribbonGrad-${giftId})`} />
        <polygon points="73,94 67,91.5 67,166 73,169" fill={`url(#ribbonGrad-${giftId})`} />

        {/* Animated Box Lid with Ribbon Bow */}
        <motion.g
          animate={opened ? { y: -32, x: 26, rotate: 42, scale: 0.95 } : { y: 0, x: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 65, damping: 12 }}
          style={{ transformOrigin: "100px 42px" }}
        >
          {/* Lid Top */}
          <polygon points="100,95 165,68 100,42 35,68" fill={`url(#topGrad-${giftId})`} />
          {/* Lid Front */}
          <polygon points="100,95 165,68 165,82 100,108" fill={`url(#frontGrad-${giftId})`} />
          {/* Lid Side */}
          <polygon points="100,95 35,68 35,82 100,108" fill={`url(#sideGrad-${giftId})`} />

          {/* Ribbons on Lid */}
          <polygon points="67.5,55 132.5,82.5 132.5,95 67.5,67" fill={`url(#ribbonGrad-${giftId})`} opacity="0.95" />
          <polygon points="132.5,55 67.5,82.5 67.5,95 132.5,67" fill={`url(#ribbonGrad-${giftId})`} opacity="0.95" />
          <polygon points="127,94 133,91.5 133,105 127,108" fill={`url(#ribbonGrad-${giftId})`} />
          <polygon points="73,94 67,91.5 67,105 73,108" fill={`url(#ribbonGrad-${giftId})`} />

          {/* Tied Ribbon Bow */}
          <path d="M 98 70 C 85 90, 78 105, 81 115" stroke={`url(#ribbonGrad-${giftId})`} strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M 102 70 C 115 90, 122 105, 119 115" stroke={`url(#ribbonGrad-${giftId})`} strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M 100 68 C 70 42, 60 56, 100 68 Z" fill={`url(#ribbonGrad-${giftId})`} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
          <path d="M 100 68 C 130 42, 140 56, 100 68 Z" fill={`url(#ribbonGrad-${giftId})`} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
          <circle cx="100" cy="68" r="5.5" fill={`url(#ribbonGrad-${giftId})`} stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
        </motion.g>

        {/* Floating Sparkles from Inside Box */}
        {opened && (
          <g>
            <motion.circle cx="85" cy="100" r="2" fill="#d9a85e"
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: -80, opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} />
            <motion.circle cx="115" cy="95" r="1.8" fill="#fff5e6"
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: -90, opacity: [0, 1, 0] }}
              transition={{ duration: 2.3, repeat: Infinity, ease: "easeOut", delay: 0.3 }} />
            <motion.circle cx="95" cy="105" r="1.5" fill="#fca1b5"
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: -75, opacity: [0, 1, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.6 }} />
          </g>
        )}
      </svg>

      {/* Subtle indicator without text labels underneath */}
      <div className="mt-2 text-center h-5 flex items-center justify-center">
        {opened && (
          <span className="text-[11px] text-amber-200/80 font-serif italic">
            ✦ Unlocked ✦
          </span>
        )}
      </div>
    </motion.button>
  );
}

function GiftsScene({
  opened,
  onOpen,
  onContinue,
  goToGift,
}: {
  opened: string[];
  onOpen: (id: string) => void;
  onContinue: () => void;
  goToGift: (n: number, id: string) => void;
}) {
  const [opening, setOpening] = useState<string | null>(null);

  const gifts = useMemo(
    () => [
      { id: "letter", label: "A Letter For You", scene: 10, subtitle: "Written straight from my heart" },
      { id: "memories", label: "Collectible Memories", scene: 11, subtitle: "Our favorite moments captured in time" },
      { id: "voice", label: "Our Private Melody", scene: 12, subtitle: "A romantic soundtrack for us" },
    ],
    []
  );

  const handleGiftClick = (id: string) => {
    if (opened.includes(id)) {
      if (id === "letter") goToGift(10, "letter");
      else if (id === "memories") goToGift(11, "memories");
      else if (id === "voice") goToGift(12, "voice");
    } else {
      if (opening !== null) return;
      setOpening(id);
      setTimeout(() => {
        onOpen(id);
        if (id === "letter") goToGift(10, "letter");
        else if (id === "memories") goToGift(11, "memories");
        else if (id === "voice") goToGift(12, "voice");
        setOpening(null);
      }, 1000);
    }
  };

  return (
    <div className="scene-container relative">
      {/* Deep Romantic Gift Room Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#09040e] via-[#1a081a] to-[#08020b] z-0" />
      <div 
        className="absolute inset-0 pointer-events-none z-0 mix-blend-screen opacity-70"
        style={{
          background: "radial-gradient(circle at 50% 60%, rgba(217, 168, 94, 0.16) 0%, rgba(244, 63, 94, 0.1) 40%, transparent 75%)"
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.85)_100%)] pointer-events-none z-0" />
      
      {/* Hanging Lanterns / Fairy Lights at top */}
      <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-10 opacity-60 flex justify-around px-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-[1px] h-6 sm:h-8 bg-gradient-to-b from-white/20 via-gold/40 to-gold/70" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_8px_rgba(254,240,138,0.9)] animate-pulse" style={{ animationDelay: `${i * 0.4}s` }} />
          </div>
        ))}
      </div>

      <ParticleField density="low" petals={true} dots={false} />

      <div className="relative z-20 flex min-h-full flex-1 flex-col items-center justify-center overflow-y-auto p-4 sm:p-6 py-8 sm:py-10 text-center select-none">
        
        {/* Header - Neutral Romantic without Bindu */}
        <header className="max-w-xl z-30 mb-2">
          <NameRibbon
            badgeText="A Special Surprise"
            title="Three Little Gifts"
            subtitle="Each one holds something made just for you."
            compact={true}
          />
          <p className="text-[11px] sm:text-xs font-serif italic text-amber-200/70 mt-2 tracking-wider">
            Tap a gift to open ✦
          </p>
        </header>

        {/* 3 Interactive Gift Boxes Grid (Comfortable on both Mobile and Desktop) */}
        <div className="relative mt-4 sm:mt-8 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-6 px-2">
          {gifts.map((g, i) => {
            const isOpened = opened.includes(g.id);
            const isOpening = opening === g.id;
            return (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.7 }}
                className="relative flex flex-col items-center"
              >
                <GiftBox3D
                  giftId={g.id}
                  label={g.label}
                  opened={isOpened || isOpening}
                  onClick={() => handleGiftClick(g.id)}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Continue to Wish Tree CTA Button — Strictly Gated on all 3 gifts */}
        <div className="relative z-30 mt-8 min-h-[60px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {opened.includes("letter") && opened.includes("memories") && opened.includes("voice") ? (
              <motion.div
                key="unlocked-continue"
                initial={{ opacity: 0, scale: 0.88, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.7, type: "spring", stiffness: 350, damping: 22 }}
                className="flex flex-col items-center gap-2"
              >
                <PremiumButton
                  variant="gold"
                  size="lg"
                  onClick={onContinue}
                >
                  <span>Continue to Wish Tree ♥ →</span>
                  <Sparkles size={16} className="text-amber-300" />
                </PremiumButton>
                <span className="text-xs text-amber-200/90 font-serif italic">
                  ✦ All three keepsakes unlocked! The sacred Wish Tree awaits... ✦
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="locked-hint"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="px-5 py-2 rounded-full bg-black/45 border border-white/15 backdrop-blur-md text-xs sm:text-sm text-rose-200/90 font-serif flex items-center gap-2 shadow-sm">
                  <Lock size={13} className="text-rose-400" />
                  <span>Open all three gifts to continue ({opened.length} of 3 opened)</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}


function HandwritingText({
  paragraphs,
  greeting,
  signature,
  alreadyAnimated,
  onComplete,
}: {
  paragraphs: string[];
  greeting: string;
  signature: string;
  alreadyAnimated?: boolean;
  onComplete: () => void;
}) {
  const greetingText = greeting;
  const pTexts = paragraphs;

  const totalLength = greetingText.length + pTexts.reduce((sum, p) => sum + p.length, 0);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSignature, setShowSignature] = useState(alreadyAnimated);

  // Keep stable references to callbacks and texts to prevent restarts
  const onCompleteRef = useRef(onComplete);
  const greetingTextRef = useRef(greetingText);
  const pTextsRef = useRef(pTexts);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    greetingTextRef.current = greetingText;
    pTextsRef.current = pTexts;
  }, [onComplete, greetingText, pTexts]);

  useEffect(() => {
    if (alreadyAnimated) {
      setCurrentIndex(totalLength);
      setShowSignature(true);
      onCompleteRef.current();
      return;
    }

    let index = 0;
    let active = true;
    let timerId: any = null;

    const getCharAt = (idx: number) => {
      if (idx < greetingTextRef.current.length) {
        return greetingTextRef.current[idx];
      }
      let offset = greetingTextRef.current.length;
      for (let p = 0; p < pTextsRef.current.length; p++) {
        const pText = pTextsRef.current[p];
        if (idx < offset + pText.length) {
          return pText[idx - offset];
        }
        offset += pText.length;
      }
      return "";
    };

    const tick = () => {
      if (!active) return;
      if (index < totalLength) {
        index++;
        setCurrentIndex(index);

        let delay = 20 + Math.random() * 15; // 20-35ms per character

        const c = getCharAt(index - 1);
        if (c === "." || c === "!" || c === "?") {
          delay = 450; // Pause at end of sentence
        } else if (c === ",") {
          delay = 250; // Pause at comma
        }

        // Section boundary pauses
        if (index === greetingTextRef.current.length) {
          delay = 600;
        } else {
          let offset = greetingTextRef.current.length;
          for (let p = 0; p < pTextsRef.current.length; p++) {
            offset += pTextsRef.current[p].length;
            if (index === offset) {
              delay = 800;
              break;
            }
          }
        }

        timerId = setTimeout(tick, delay);
      } else {
        // Typing finished!
        timerId = setTimeout(() => {
          if (active) {
            setShowSignature(true);
            onCompleteRef.current();
          }
        }, 800); // 800ms delay before revealing signature
      }
    };

    timerId = setTimeout(tick, 500);

    return () => {
      active = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [alreadyAnimated, totalLength]);

  const dispGreeting = currentIndex <= greetingText.length 
    ? greetingText.substring(0, currentIndex) 
    : greetingText;

  const dispParagraphs = pTexts.map((pText, pIdx) => {
    let prevC = greetingText.length;
    for (let i = 0; i < pIdx; i++) {
      prevC += pTexts[i].length;
    }
    const currC = prevC + pText.length;
    if (currentIndex <= prevC) return "";
    if (currentIndex <= currC) return pText.substring(0, currentIndex - prevC);
    return pText;
  });

  return (
    <div className="text-left font-serif text-amber-950/90 leading-relaxed select-text flex flex-col gap-4 pt-4 pb-12">
      {/* Greeting */}
      <h3 className="font-script text-xl sm:text-2xl font-bold text-rose-800 min-h-[1.5rem]">
        {dispGreeting}
      </h3>

      {/* Paragraphs */}
      {pTexts.map((_p, idx) => (
        <p 
          key={idx} 
          className="text-sm sm:text-base leading-relaxed text-amber-950/80 font-serif indent-4 text-justify min-h-[2.5rem]"
        >
          {dispParagraphs[idx] || ""}
        </p>
      ))}

      {/* Signature */}
      <AnimatePresence>
        {showSignature && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mt-6 flex flex-col items-end text-right pr-6"
          >
            <span className="text-sm text-amber-950/70 font-serif italic min-h-[1rem]">
              With all my love,
            </span>
            <span className="font-script text-2xl font-bold text-rose-800 mt-1 min-h-[2rem]">
              {signature || "Yours forever ♥"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LetterScene({
  onBack,
  onContinue,
  cameFromGifts,
  onNext,
  onPrev,
}: {
  onBack: () => void;
  onContinue: () => void;
  cameFromGifts: boolean;
  onNext?: () => void;
  onPrev?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<"closed" | "pulsing" | "releasing" | "flap" | "slide" | "reveal" | "writing">("closed");
  const [state, setState] = useState(() => loadState() as SceneState);
  const [letterFinished, setLetterFinished] = useState(state.letterAnimated);
  
  // Particles states
  const [sealParticles, setSealParticles] = useState<{ id: number; x: number; y: number; vx: number; vy: number; color: string; size: number }[]>([]);
  const [stampParticles, setStampParticles] = useState<{ id: number; x: number; y: number; vx: number; vy: number; color: string; size: number }[]>([]);

  // Trigger sequential open sequence
  const handleOpenEnvelope = () => {
    if (stage !== "closed") return;
    setStage("pulsing");
    
    // Pulse for 900ms
    setTimeout(() => {
      setStage("releasing");
      // Spawn particles on release
      const colors = ["#b91c1c", "#d9a85e", "#ffcbd7", "#ffffff"];
      const newParticles = Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 4 + 2
      }));
      setSealParticles(newParticles);
      
      // Delay envelope opening
      setTimeout(() => {
        setOpen(true);
      }, 700);
    }, 900);
  };

  useEffect(() => {
    if (open) {
      setStage("flap");
      const t1 = setTimeout(() => setStage("slide"), 700);
      const t2 = setTimeout(() => setStage("reveal"), 1500);
      const t3 = setTimeout(() => setStage("writing"), 2300);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      setStage("closed");
    }
  }, [open]);

  // Update loop for seal particles
  useEffect(() => {
    if (sealParticles.length === 0) return;
    let active = true;
    let raf = 0;
    const update = () => {
      if (!active) return;
      setSealParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.1, // floating gravity
          }))
          .filter((p) => p.y < window.innerHeight && p.x > 0 && p.x < window.innerWidth)
      );
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [sealParticles.length]);

  // Update loop for stamp particles
  useEffect(() => {
    if (stampParticles.length === 0) return;
    let active = true;
    let raf = 0;
    const update = () => {
      if (!active) return;
      setStampParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.2, // gravity falling
          }))
          .filter((p) => p.y < 500)
      );
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [stampParticles.length]);

  const spawnStampParticles = () => {
    const colors = ["#b91c1c", "#d9a85e", "#ffcbd7", "#881337"];
    const cardEl = document.querySelector(".letter-card-container");
    const width = cardEl ? cardEl.clientWidth : 580;
    const height = cardEl ? cardEl.clientHeight : 490;

    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: width - 50 - Math.random() * 30, // dynamically near bottom right
      y: height - 50 - Math.random() * 30,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4 - 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 3 + 1.5
    }));
    setStampParticles(newParticles);
  };

  return (
    <div className="scene-container relative">
      <BackgroundLayer src={assets.loveLetter} overlay />
      <ParticleField density="low" petals />
      
      {/* Candlelit atmospheric warm overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(253,230,138,0.22),_rgba(8,4,12,0.85)_80%)] pointer-events-none z-10" />

      {/* Floating Seal Particles */}
      {sealParticles.map((p) => (
        <div
          key={p.id}
          className="fixed rounded-full pointer-events-none z-50 transition-opacity duration-1000"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 8px ${p.color}`,
          }}
        />
      ))}

      {/* Header controls (Visible only if letter is open) */}
      {open && (
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-30">
          <button
            onClick={onBack}
            className="flex min-h-[44px] min-w-[44px] px-4 items-center justify-center rounded-full glass border border-white/10 hover:border-gold/30 hover:scale-105 active:scale-95 text-white/95 text-sm transition-all duration-300 cursor-pointer gap-2"
          >
            <ChevronLeft size={16} /> Garden
          </button>
          <div className="flex gap-2">
            {onPrev && (
              <button
                onClick={onPrev}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full glass border border-white/10 hover:border-gold/30 hover:scale-105 active:scale-95 text-white/95 transition-all duration-300 cursor-pointer"
                aria-label="Previous present"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            {onNext && (
              <button
                onClick={onNext}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full glass border border-white/10 hover:border-gold/30 hover:scale-105 active:scale-95 text-white/95 transition-all duration-300 cursor-pointer"
                aria-label="Next present"
              >
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="relative z-10 flex min-h-full flex-1 flex-col items-center justify-center p-4 sm:p-6 py-10 sm:py-12 text-center w-full max-w-3xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="font-serif text-2xl sm:text-4xl lg:text-5xl gradient-text glow-gold mb-3 sm:mb-4 shrink-0"
        >
          {letterContent.heading}
        </motion.h2>

        {!open ? (
          /* Unopened Envelope */
          <div className="relative w-[310px] h-[210px] sm:w-[360px] sm:h-[240px] my-auto">
            {/* 1. Envelope Back Plate */}
            <div 
              className="absolute inset-0 rounded-lg shadow-xl"
              style={{
                background: "linear-gradient(135deg, #eaddc6 0%, #dbcbab 100%)",
                border: "1px solid rgba(139, 115, 85, 0.2)",
              }}
            >
              <div className="absolute inset-0 bg-black/10 rounded-lg" />
            </div>

            {/* Letter peek inside */}
            <div className="absolute inset-x-4 top-2 h-16 bg-[#fdfbf7] rounded-t border border-amber-900/10 shadow-inner" />

            {/* 2. Envelope Front Flaps */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(135deg, transparent 40%, rgba(0,0,0,0.05) 50%, transparent 60%)",
              }}
            >
              <div 
                className="absolute inset-x-0 bottom-0 h-[60%]"
                style={{
                  background: "linear-gradient(to top, #ebdcb9, #e8dcc6)",
                  clipPath: "polygon(0 100%, 100% 100%, 50% 0)",
                  borderTop: "1px solid rgba(139, 115, 85, 0.15)",
                }}
              />
              <div 
                className="absolute inset-y-0 left-0 w-[55%]"
                style={{
                  background: "linear-gradient(to right, #ebdcb9, #ebdcc6)",
                  clipPath: "polygon(0 0, 100% 50%, 0 100%)",
                  borderRight: "1px solid rgba(139, 115, 85, 0.12)",
                }}
              />
              <div 
                className="absolute inset-y-0 right-0 w-[55%]"
                style={{
                  background: "linear-gradient(to left, #e8dcb9, #ebdcc6)",
                  clipPath: "polygon(100% 0, 0 50%, 100% 100%)",
                  borderLeft: "1px solid rgba(139, 115, 85, 0.12)",
                }}
              />
            </div>

            {/* 3. Top Flap with Wax Seal */}
            <div className="absolute inset-x-0 top-0 h-[55%] pointer-events-none">
              <div 
                className="w-full h-full"
                style={{
                  background: "linear-gradient(to bottom, #fcfbf8, #ebdcb9)",
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
                }}
              />
              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 pointer-events-auto">
                <motion.button
                  onClick={handleOpenEnvelope}
                  animate={{ 
                    scale: [1, 1.08, 1], 
                    boxShadow: [
                      "0 4px 10px rgba(0,0,0,0.3), 0 0 10px rgba(185,28,28,0.25)",
                      "0 4px 14px rgba(0,0,0,0.35), 0 0 25px rgba(185,28,28,0.6), 0 0 12px rgba(217,168,94,0.3)",
                      "0 4px 10px rgba(0,0,0,0.3), 0 0 10px rgba(185,28,28,0.25)"
                    ] 
                  }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                  className="w-13 h-13 rounded-full flex items-center justify-center shadow-lg border border-rose-800/40 relative cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                  style={{
                    background: "radial-gradient(circle at 35% 35%, #b91c1c 0%, #881337 70%, #4c0519 100%)",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.25)"
                  }}
                  aria-label="Open envelope"
                >
                  <Heart className="w-5 h-5 fill-rose-100/90 text-rose-100/90 filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />
                </motion.button>
              </div>
            </div>
            
            <p className="absolute -bottom-10 inset-x-0 text-center text-xs sm:text-sm text-champagne/70 font-serif italic">
              Tap the seal to open ♥
            </p>
          </div>
        ) : (
          /* Opened Letter Card: Flex Column Architecture */
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col min-h-0 w-full max-w-2xl h-[74vh] sm:h-[78vh] max-h-[660px] rounded-2xl p-4 sm:p-7 md:p-8 bg-[#fdfbf7] border border-amber-900/15 shadow-[0_25px_60px_rgba(0,0,0,0.5),_0_0_40px_rgba(217,168,94,0.12)] relative paper-texture letter-card-container overflow-hidden"
          >
            {/* Double-gold foil border frame */}
            <div className="absolute inset-2.5 sm:inset-3 border border-[#d9a85e]/35 rounded-lg pointer-events-none" />
            <div className="absolute inset-[11px] sm:inset-[15px] border-[0.5px] border-[#d9a85e]/20 rounded-lg pointer-events-none shadow-[0_0_8px_rgba(217,168,94,0.1)]" />

            {/* Corner flourishes */}
            <div className="absolute top-2.5 left-2.5 pointer-events-none text-gold/40">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M 6,18 L 6,6 L 18,6" />
              </svg>
            </div>
            <div className="absolute top-2.5 right-2.5 rotate-90 pointer-events-none text-gold/40">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M 6,18 L 6,6 L 18,6" />
              </svg>
            </div>
            <div className="absolute bottom-2.5 left-2.5 -rotate-90 pointer-events-none text-gold/40">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M 6,18 L 6,6 L 18,6" />
              </svg>
            </div>
            <div className="absolute bottom-2.5 right-2.5 rotate-180 pointer-events-none text-gold/40">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M 6,18 L 6,6 L 18,6" />
              </svg>
            </div>

            {/* Scrollable Letter Content */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-2 sm:pr-4 custom-scrollbar select-text">
              <HandwritingText
                paragraphs={letterContent.paragraphs}
                greeting={letterContent.greeting}
                signature={letterContent.signature}
                alreadyAnimated={state.letterAnimated}
                onComplete={() => {
                  setLetterFinished(true);
                  if (!state.letterAnimated) {
                    setState((s) => {
                      const next = { ...s, letterAnimated: true };
                      saveState(next);
                      return next;
                    });
                  }
                }}
              />
            </div>

            {/* Navigation Actions: Flex-Shrink-0, never overlaps text */}
            <div className="flex-shrink-0 pt-3 sm:pt-4 mt-2 border-t border-amber-900/15 flex items-center justify-between gap-3 relative z-30">
              <div className="flex items-center gap-2">
                {cameFromGifts && (
                  <button
                    onClick={onBack}
                    className="px-4 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-serif text-amber-900/80 bg-amber-100/70 hover:bg-amber-100 border border-amber-800/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <ChevronLeft size={16} /> Back to Gifts
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {letterFinished && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -25 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      rotate: -8,
                      boxShadow: [
                        "0 4px 8px rgba(0,0,0,0.3)",
                        "0 0 25px rgba(185, 28, 28, 0.75), 0 0 15px rgba(217, 168, 94, 0.6)",
                        "0 4px 8px rgba(0,0,0,0.3)"
                      ]
                    }}
                    transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                    onAnimationComplete={spawnStampParticles}
                    className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center shadow-md border border-rose-800/40 relative shadow-[0_0_15px_rgba(185,28,28,0.4)]"
                    style={{
                      background: "radial-gradient(circle at 35% 35%, #b91c1c 0%, #881337 70%, #4c0519 100%)",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.3), inset 0 2px 3px rgba(255,255,255,0.25)"
                    }}
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-100/90 text-rose-100/90 filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />
                  </motion.div>
                )}

                {letterFinished && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={onContinue}
                    className="px-6 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-serif font-bold tracking-wide bg-gradient-to-r from-[#d9a85e] to-[#b8862e] text-[#1a0f05] shadow-[0_4px_16px_rgba(217,168,94,0.35)] hover:shadow-[0_6px_22px_rgba(217,168,94,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    Cherish This Letter ♥
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 11 — Memories Gallery                                        */
/* ------------------------------------------------------------------ */

function MemoriesScene({
  onBack,
  onContinue,
  onNext,
  onPrev,
}: {
  onBack: () => void;
  onContinue: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  const next = () => setSelected((s) => (s === null ? null : (s + 1) % memories.length));
  const prev = () => setSelected((s) => (s === null ? null : (s - 1 + memories.length) % memories.length));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (selected === null) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected]);

  const rotations = [-2, 1, -1.5, 2, -1, 1.5];
  const partnerName = birthdayContent.herName;

  return (
    <div className="scene-container relative bg-gradient-to-br from-[#0b0d1c]/85 via-[#1a0f1a]/75 to-[#0b0d1c]/95 z-50">
      <BackgroundLayer src={assets.couplePhoto} overlay />
      <ParticleField density="medium" petals={false} />

      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-30">
        <button
          onClick={onBack}
          className="flex min-h-[44px] min-w-[44px] px-4 items-center justify-center rounded-full glass border border-white/10 hover:border-gold/30 hover:scale-105 active:scale-95 text-white/95 text-sm transition-all duration-300 cursor-pointer gap-2"
        >
          <ChevronLeft size={16} /> Garden
        </button>
        <div className="flex gap-2">
          {onPrev && (
            <button
              onClick={onPrev}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full glass border border-white/10 hover:border-gold/30 hover:scale-105 active:scale-95 text-white/95 transition-all duration-300 cursor-pointer"
              aria-label="Previous present"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          {onNext && (
            <button
              onClick={onNext}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full glass border border-white/10 hover:border-gold/30 hover:scale-105 active:scale-95 text-white/95 transition-all duration-300 cursor-pointer"
              aria-label="Next present"
            >
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="relative z-10 flex min-h-full flex-1 flex-col items-center overflow-y-auto p-6 py-16">
        <h2 className="font-serif text-3xl font-semibold sm:text-5xl gradient-text glow-gold mt-6">
          Moments & Memories
        </h2>
        <p className="mt-2 text-white/70 text-sm">Tap a Polaroid to relive the moment</p>

        <div className="mt-8 grid w-full max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3">
          {memories.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
            >
              <Polaroid
                image={m.image}
                caption={m.caption}
                date={m.date}
                rotate={rotations[i % rotations.length]}
                onClick={() => setSelected(i)}
              />
            </motion.div>
          ))}
        </div>

        <div className="my-8">
          <PrimaryButton onClick={onContinue}>Cherish Every Memory →</PrimaryButton>
        </div>
      </div>

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, rotateY: 15, y: 15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm sm:max-w-md border border-[#d9a85e]/30 shadow-[0_25px_60px_rgba(0,0,0,0.65),_0_0_35px_rgba(217,168,94,0.18)] rounded-2xl p-0.5 overflow-hidden bg-gradient-to-br from-[#d9a85e]/30 via-[#fb7185]/10 to-[#d9a85e]/20"
            >
              <div className="paper-texture relative rounded-[14px] p-5 pb-6 bg-[#fdfbf7] flex flex-col justify-between h-full min-h-[460px]">
                {/* Close Button */}
                <button
                  onClick={() => setSelected(null)}
                  className="absolute right-3 top-3 z-30 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white text-slate-800 shadow-md hover:bg-slate-100 transition-colors border border-amber-900/10 cursor-pointer"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>

                {/* Inner double border */}
                <div className="absolute inset-3 border border-gold/15 rounded-lg pointer-events-none" />

                {/* Polaroid content inside modal */}
                <div className="relative z-10 p-1 flex flex-col">
                  {/* Polaroid Photo Frame */}
                  <div className="p-2 pb-4 bg-white border border-amber-950/10 shadow-md rounded-sm">
                    <SafeImage
                      src={memories[selected].image}
                      alt={memories[selected].caption}
                      className="aspect-[4/3] w-full rounded-sm object-cover filter brightness-[98%]"
                    />
                  </div>

                  {/* Caption & Info */}
                  <div className="mt-4 px-2 select-text">
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-amber-900/40 uppercase">
                      {memories[selected].date}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-amber-950 mt-1 leading-tight">
                      {memories[selected].caption}
                    </h3>
                    {memories[selected].subtitle && (
                      <p className="font-serif text-xs italic text-gold font-medium mt-0.5">
                        {memories[selected].subtitle}
                      </p>
                    )}
                    <p className="mt-3 font-serif text-sm leading-relaxed text-slate-700 min-h-[4.5rem]">
                      {memories[selected].description}
                    </p>
                  </div>
                </div>

                {/* Navigation inside modal */}
                <div className="mt-6 flex justify-between gap-4 z-10 px-2">
                  <button
                    onClick={prev}
                    className="flex-1 py-2.5 min-h-[44px] rounded-full text-xs font-medium border border-amber-900/20 text-slate-800 bg-amber-900/5 hover:bg-amber-900/10 hover:border-gold/30 active:scale-97 transition-all cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    onClick={next}
                    className="flex-1 py-2.5 min-h-[44px] rounded-full text-xs font-medium border border-gold/40 text-gold bg-gold/5 hover:bg-gold/15 active:scale-97 transition-all cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 12 — Voice Message                                           */
/* ------------------------------------------------------------------ */

export function VoiceScene({
  audio,
  onBack,
  onContinue,
  onNext,
  onPrev,
}: {
  audio: ReturnType<typeof useAudioEngine>;
  onBack: () => void;
  onContinue: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}) {
  const isPlaying = audio.isPlayingVoice;
  const currentTrack = audio.currentTrack;
  const isFav = audio.favorites.includes(currentTrack.title);

  // Stop music on leaving scene
  useEffect(() => {
    return () => {
      audio.pause();
    };
  }, []);

  // Scrubber Seek Handler
  const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    audio.seek(ratio);
  };

  // 18 equalizer bars for left and right flanks
  const eqBars = [
    12, 22, 38, 28, 48, 32, 60, 42, 70, 52, 64, 45, 55, 36, 46, 26, 32, 16
  ];

  return (
    <div className="scene-container relative bg-[#070308] overflow-hidden select-none">
      {/* 1. Deep Romantic Stage Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a040b] via-[#170615] to-[#060207] z-0" />
      
      {/* Soft Overheard Spotlights descending like in reference */}
      <div 
        className="absolute -top-24 left-1/4 w-96 h-96 rounded-full pointer-events-none mix-blend-screen opacity-20 filter blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(244, 63, 94, 0.45) 0%, transparent 70%)" }}
      />
      <div 
        className="absolute -top-24 right-1/4 w-96 h-96 rounded-full pointer-events-none mix-blend-screen opacity-20 filter blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(217, 168, 94, 0.45) 0%, transparent 70%)" }}
      />
      {/* Ambient center warm glow behind vinyl */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 mix-blend-screen opacity-55"
        style={{ background: "radial-gradient(circle at 50% 48%, rgba(244, 63, 94, 0.22) 0%, rgba(217, 168, 94, 0.12) 35%, transparent 65%)" }}
      />
      {/* Cinematic vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_35%,_rgba(0,0,0,0.88)_100%)] pointer-events-none z-0" />

      {/* Hanging crystal heart ornaments from top */}
      <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-10 opacity-75 flex justify-between px-8 sm:px-16">
        <div className="flex items-center gap-10">
          <div className="flex flex-col items-center">
            <div className="w-[1px] h-14 bg-gradient-to-b from-white/10 via-rose-300/30 to-rose-300/70" />
            <Heart size={14} className="text-rose-300/80 fill-rose-300/40 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
          </div>
          <div className="hidden sm:flex flex-col items-center">
            <div className="w-[1px] h-20 bg-gradient-to-b from-white/10 via-amber-200/30 to-amber-200/70" />
            <Sparkles size={12} className="text-amber-200 drop-shadow-[0_0_8px_rgba(254,240,138,0.8)]" />
          </div>
        </div>
        <div className="flex items-center gap-10">
          <div className="hidden sm:flex flex-col items-center">
            <div className="w-[1px] h-20 bg-gradient-to-b from-white/10 via-amber-200/30 to-amber-200/70" />
            <Sparkles size={12} className="text-amber-200 drop-shadow-[0_0_8px_rgba(254,240,138,0.8)]" />
          </div>
          <div className="flex flex-col items-center">
            <div className="w-[1px] h-14 bg-gradient-to-b from-white/10 via-rose-300/30 to-rose-300/70" />
            <Heart size={14} className="text-rose-300/80 fill-rose-300/40 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
          </div>
        </div>
      </div>

      <ParticleField density="low" petals={true} dots={false} />

      {/* Navigation Bar (Top Left / Right) */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-30">
        <button
          onClick={onBack}
          className="flex min-h-[40px] px-3.5 items-center justify-center rounded-full glass border border-white/15 hover:border-rose-400/40 hover:scale-105 active:scale-95 text-white/90 text-xs transition-all cursor-pointer gap-1.5"
        >
          <ChevronLeft size={15} /> Gifts
        </button>
        <div className="flex gap-2">
          {onPrev && (
            <button
              onClick={onPrev}
              className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full glass border border-white/15 hover:border-rose-400/40 hover:scale-105 active:scale-95 text-white/90 transition-all cursor-pointer"
              aria-label="Previous gift"
            >
              <ArrowLeft size={15} />
            </button>
          )}
          {onNext && (
            <button
              onClick={onNext}
              className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full glass border border-white/15 hover:border-rose-400/40 hover:scale-105 active:scale-95 text-white/90 transition-all cursor-pointer"
              aria-label="Next gift"
            >
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>

      <div className="relative z-10 flex min-h-full flex-1 flex-col items-center justify-between p-4 sm:p-6 py-12 sm:py-14 text-center max-w-2xl mx-auto w-full">
        
        {/* TOP HEADER: Matches Reference Exactly */}
        <header className="flex flex-col items-center pt-2 sm:pt-4">
          <div className="flex items-center gap-2.5 text-rose-300/80 mb-1">
            <span className="w-8 sm:w-12 h-[1px] bg-gradient-to-r from-transparent to-rose-300/50" />
            <Heart size={13} className="text-rose-400 fill-rose-400/80 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
            <span className="text-[10px] sm:text-xs font-serif uppercase tracking-[0.3em] text-[#fed7aa] font-medium">
              OUR MELODY
            </span>
            <Heart size={13} className="text-rose-400 fill-rose-400/80 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
            <span className="w-8 sm:w-12 h-[1px] bg-gradient-to-l from-transparent to-rose-300/50" />
          </div>

          <h1 className="font-calligraphy text-4xl sm:text-6xl text-white glow-gold leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            Listen With Me <span className="text-rose-400 font-calligraphy">♡</span>
          </h1>

          <p className="text-xs sm:text-sm font-serif italic text-rose-100/75 mt-0.5 tracking-wide">
            Some songs don't just play, they bring back our moments...
          </p>
        </header>

        {/* CENTER: LARGE ROTATING VINYL WITH SOUNDWAVE FLANKS */}
        <div className="relative my-auto w-full flex items-center justify-center py-4">
          
          {/* Left Waveform Flank */}
          <div className="hidden sm:flex items-center gap-1.5 h-24 mr-4 flex-1 justify-end opacity-85">
            {eqBars.map((baseH, idx) => {
              return (
                <motion.div
                  key={`left-${idx}`}
                  animate={isPlaying ? { height: [baseH * 0.4, baseH, baseH * 0.5] } : { height: 8 }}
                  transition={isPlaying ? { repeat: Infinity, duration: 1.1 + (idx % 4) * 0.2, ease: "easeInOut" } : { duration: 0.5 }}
                  className="w-1 rounded-full bg-gradient-to-t from-rose-500/70 via-rose-300 to-amber-200/90 shadow-[0_0_6px_rgba(244,63,94,0.5)]"
                  style={{ height: `${baseH}px` }}
                />
              );
            })}
          </div>

          {/* Central Vinyl Player Disc */}
          <div className="relative flex items-center justify-center shrink-0">
            {/* Outer Circular Aura Ring */}
            <div 
              className={cn(
                "absolute rounded-full transition-all duration-1000 pointer-events-none",
                isPlaying
                  ? "w-64 h-64 sm:w-72 sm:h-72 opacity-90 shadow-[0_0_50px_rgba(244,63,94,0.45)]"
                  : "w-56 h-56 sm:w-64 sm:h-64 opacity-30 shadow-[0_0_20px_rgba(217,168,94,0.2)]"
              )}
              style={{
                border: "1px solid rgba(244, 114, 182, 0.35)",
              }}
            />

            {/* Rotating Vinyl Record */}
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={
                isPlaying
                  ? { repeat: Infinity, duration: 6, ease: "linear" }
                  : { duration: 1.2, ease: "easeOut" }
              }
              className="relative w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-[#121216] border-4 border-[#2c2226] shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex items-center justify-center overflow-hidden cursor-pointer group"
              onClick={audio.togglePlay}
              role="button"
              tabIndex={0}
              aria-label={isPlaying ? "Pause music" : "Play music"}
            >
              {/* Concentric Grooves */}
              <div className="absolute inset-3 rounded-full border border-white/[0.07]" />
              <div className="absolute inset-6 rounded-full border border-white/[0.05]" />
              <div className="absolute inset-9 rounded-full border border-white/[0.07]" />
              <div className="absolute inset-12 rounded-full border border-white/[0.05]" />
              <div className="absolute inset-15 rounded-full border border-white/[0.07]" />
              
              {/* Metallic Satin Reflection */}
              <div 
                className="absolute inset-0 rounded-full pointer-events-none opacity-40 mix-blend-overlay"
                style={{
                  background: "conic-gradient(from 45deg, transparent 0deg, rgba(255,255,255,0.2) 60deg, transparent 120deg, rgba(255,255,255,0.2) 240deg, transparent 300deg)"
                }}
              />

              {/* Center Medallion Label */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#9f1239] via-[#881337] to-[#4c0519] border-2 border-rose-300/60 shadow-inner flex flex-col items-center justify-center">
                <Heart
                  size={24}
                  className={cn(
                    "text-rose-300 transition-all duration-300",
                    isPlaying ? "fill-rose-300 scale-110 drop-shadow-[0_0_10px_rgba(244,63,94,0.9)] animate-pulse" : "fill-none"
                  )}
                />
              </div>
            </motion.div>
          </div>

          {/* Right Waveform Flank */}
          <div className="hidden sm:flex items-center gap-1.5 h-24 ml-4 flex-1 justify-start opacity-85">
            {[...eqBars].reverse().map((baseH, idx) => {
              return (
                <motion.div
                  key={`right-${idx}`}
                  animate={isPlaying ? { height: [baseH * 0.4, baseH, baseH * 0.5] } : { height: 8 }}
                  transition={isPlaying ? { repeat: Infinity, duration: 1.1 + (idx % 4) * 0.2, ease: "easeInOut" } : { duration: 0.5 }}
                  className="w-1 rounded-full bg-gradient-to-t from-rose-500/70 via-rose-300 to-amber-200/90 shadow-[0_0_6px_rgba(244,63,94,0.5)]"
                  style={{ height: `${baseH}px` }}
                />
              );
            })}
          </div>
        </div>

        {/* BOTTOM SECTION: TRACK INFO, SCRUBBER, CONTROLS & CTA */}
        <div className="w-full max-w-md flex flex-col items-center gap-4">
          
          {/* Track Information & Favorite Heart */}
          <div className="flex items-center justify-center gap-3">
            <div className="text-center">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center justify-center gap-2">
                <span>{currentTrack.title}</span>
              </h3>
              <p className="text-xs sm:text-sm text-rose-200/70 font-sans tracking-wider mt-0.5">
                {currentTrack.artist}
              </p>
            </div>
            {/* Favorite / Heart Button */}
            <button
              onClick={() => audio.toggleFavorite(currentTrack.title)}
              className="p-2 rounded-full hover:bg-white/10 text-rose-400 active:scale-90 transition-all cursor-pointer"
              aria-label={isFav ? "Unlike track" : "Like track"}
            >
              <Heart
                size={18}
                className={cn(
                  "transition-all duration-300",
                  isFav ? "fill-rose-500 text-rose-500 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.8)] scale-110" : "text-white/50"
                )}
              />
            </button>
          </div>

          {/* Interactive Scrubber & Timers */}
          <div className="w-full flex items-center gap-3 px-2">
            <span className="font-mono text-[11px] text-white/60 w-9 text-right">
              {formatTime(audio.currentTime)}
            </span>
            
            <div
              onClick={handleSeek}
              onTouchStart={handleSeek}
              className="relative flex-1 h-6 flex items-center cursor-pointer group"
            >
              {/* Background Track */}
              <div className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden">
                {/* Glowing Progress Fill */}
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 via-rose-400 to-amber-300 shadow-[0_0_10px_rgba(244,63,94,0.7)]"
                  style={{ width: `${Math.min(100, Math.max(0, audio.voiceProgress * 100))}%` }}
                />
              </div>
              {/* Draggable Thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] transition-transform group-hover:scale-125"
                style={{ left: `${Math.min(100, Math.max(0, audio.voiceProgress * 100))}%` }}
              />
            </div>

            <span className="font-mono text-[11px] text-white/60 w-9 text-left">
              {formatTime(audio.voiceDuration)}
            </span>
          </div>

          {/* Player Buttons Row: Shuffle, Prev, Play/Pause, Next, Repeat */}
          <div className="flex items-center justify-center gap-5 sm:gap-7">
            {/* Shuffle */}
            <button
              onClick={audio.toggleShuffle}
              className={cn(
                "p-2 rounded-full transition-all cursor-pointer",
                audio.isShuffle ? "text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.7)] scale-110" : "text-white/50 hover:text-white"
              )}
              title="Shuffle"
              aria-label="Toggle shuffle"
            >
              <Shuffle size={18} />
            </button>

            {/* Previous */}
            <button
              onClick={audio.prev}
              className="p-2 rounded-full text-white/80 hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="Previous song"
              aria-label="Previous track"
            >
              <SkipBack size={22} />
            </button>

            {/* Play / Pause Primary Button */}
            <button
              onClick={audio.togglePlay}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-rose-300/60 bg-gradient-to-br from-rose-950/90 via-rose-900/70 to-black flex items-center justify-center shadow-[0_0_25px_rgba(244,63,94,0.5)] hover:scale-105 active:scale-95 transition-all text-white cursor-pointer"
              aria-label={isPlaying ? "Pause music" : "Play music"}
            >
              {isPlaying ? (
                <Pause size={24} className="fill-white" />
              ) : (
                <Play size={24} className="fill-white ml-1" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={audio.next}
              className="p-2 rounded-full text-white/80 hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="Next song"
              aria-label="Next track"
            >
              <SkipForward size={22} />
            </button>

            {/* Repeat */}
            <button
              onClick={audio.toggleLoop}
              className={cn(
                "p-2 rounded-full transition-all cursor-pointer",
                audio.isLooping ? "text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.7)] scale-110" : "text-white/50 hover:text-white"
              )}
              title="Repeat"
              aria-label="Toggle repeat"
            >
              <Repeat size={18} />
            </button>
          </div>

          {/* Bottom CTA Button: Continue to Wish Tree */}
          <div className="pt-2">
            <button
              onClick={onContinue}
              className="btn-pill-rose font-serif text-sm tracking-wide shadow-[0_0_25px_rgba(244,63,94,0.5)] cursor-pointer"
            >
              Continue to Wish Tree ♥ →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


function WishTreePopupCard({ 
  text, 
  id = 1,
  onClose 
}: { 
  text: string; 
  id?: number;
  onClose: () => void; 
}) {
  const cardMeta = collectibleCardDetails[id] || collectibleCardDetails[1];

  return (
    <div 
      className="relative w-full max-w-[280px] sm:max-w-[310px] select-none flex flex-col items-center"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Hanging Golden Twine suspended from Branch */}
      <div className="w-0.5 h-8 bg-gradient-to-b from-[#e7b876] via-[#b45309] to-[#78350f] mx-auto opacity-80" />

      {/* Tactile Narrow Paper Strip Unfolding from Branch */}
      <motion.div
        initial={{ scaleY: 0.15, opacity: 0, y: -20 }}
        animate={{ scaleY: 1, opacity: 1, y: 0 }}
        exit={{ scaleY: 0.15, opacity: 0, y: -20 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        style={{ transformOrigin: "top center" }}
        className="w-full relative rounded-b-xl rounded-t-sm p-5 sm:p-6 flex flex-col items-center text-center overflow-hidden border border-[#b38a53]/70 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_35px_rgba(254,240,138,0.3)]"
      >
        {/* Warm Ivory Textured Parchment Background */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(175deg, #fffdf8 0%, #faf4e6 45%, #f4e8cf 100%)",
          }}
        />

        {/* Deckle / Torn Paper Edge Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#b38a53] via-[#fef08a] to-[#b38a53]" />
        <div className="absolute bottom-0 inset-x-0 h-2 bg-[radial-gradient(ellipse_at_bottom,_#b38a53_30%,_transparent_70%)] opacity-40" />
        <div className="absolute inset-2 border border-dashed border-[#b38a53]/30 rounded-lg pointer-events-none" />

        {/* Top Hanging Brass Grommet */}
        <div className="relative z-10 -mt-2 mb-2 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full border-2 border-[#b38a53] bg-[#3a1d0f] flex items-center justify-center shadow-inner">
            <div className="w-1.5 h-1.5 rounded-full bg-[#fef08a]" />
          </div>
        </div>

        {/* Header: Strip Counter & Title */}
        <div className="relative z-10 w-full flex items-center justify-between pb-2 border-b border-[#b38a53]/20 px-1">
          <span className="text-[10px] uppercase font-serif tracking-[0.25em] text-[#78350f] font-bold">
            ✦ Wish Scroll
          </span>
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#78350f] px-2 py-0.5 rounded-full border border-[#b38a53]/35 bg-[#b38a53]/10">
            0{id} / 06
          </span>
        </div>

        {/* Wax Seal Stamp Emblem */}
        <div className="relative z-10 my-3 flex flex-col items-center">
          <div 
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 p-1 flex items-center justify-center shadow-md bg-white/95"
            style={{ borderColor: cardMeta.sealColor }}
          >
            <picture className="w-full h-full flex items-center justify-center pointer-events-none">
              <source srcSet={cardMeta.stickerSrc} type="image/webp" />
              <img 
                src={cardMeta.stickerSrc.replace(".webp", ".gif")} 
                alt={cardMeta.stickerAlt} 
                className="w-full h-full object-contain filter drop-shadow-sm" 
              />
            </picture>
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#451a03] mt-2">
            {cardMeta.title}
          </h3>
          <span className="text-[10.5px] font-serif text-[#78350f] italic">
            {cardMeta.themeSubtitle}
          </span>
        </div>

        {/* Handwritten Wish Message */}
        <div className="relative z-10 w-full my-1 py-3 px-3 rounded-lg bg-white/60 border border-[#b38a53]/25 shadow-sm flex flex-col items-center">
          <span className="font-serif text-2xl text-[#b45309] leading-none mb-0.5 select-none font-bold">“</span>
          <p className="font-serif italic text-sm sm:text-base text-[#3d1908] leading-relaxed font-semibold select-text text-center px-1">
            {text}
          </p>
          <span className="font-serif text-2xl text-[#b45309] leading-none mt-0.5 select-none font-bold">”</span>
        </div>

        {/* Bottom Filigree and Close Action */}
        <div className="relative z-10 mt-3 pt-2 w-full flex flex-col items-center gap-2">
          <div className="text-[10px] text-[#8c6d3b] tracking-[0.2em] uppercase font-serif">
            ~ ✦ Wish Sealed in Starlight ✦ ~
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="rounded-full px-5 py-1.5 text-[11px] font-serif font-bold uppercase tracking-widest text-white bg-[#78350f] hover:bg-[#58260a] border border-[#b38a53] active:scale-95 transition-all shadow-md cursor-pointer"
          >
            Fold Back to Tree ♥
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function WishTreeScene({ onContinue }: { onContinue: () => void }) {
  const [active, setActive] = useState<{ text: string; id: number } | null>(null);
  const [discovered, setDiscovered] = useState<number[]>([]);

  // Body scroll lock and Escape key listener for Wish Tree popup
  useEffect(() => {
    if (active !== null) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setActive(null);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [active]);

  const positions = useMemo(
    () => [
      { top: "26%", left: "18%", delay: 0 },
      { top: "24%", left: "82%", delay: 0.2 },
      { top: "42%", left: "25%", delay: 0.4 },
      { top: "38%", left: "75%", delay: 0.6 },
      { top: "58%", left: "20%", delay: 0.8 },
      { top: "56%", left: "80%", delay: 1 },
    ],
    []
  );

  const reveal = (w: (typeof wishTreeWishes)[0]) => {
    setActive({ text: w.text, id: w.id });
    if (!discovered.includes(w.id)) setDiscovered((d) => [...d, w.id]);
  };

  const close = () => setActive(null);

  return (
    <div className="scene-container relative overflow-hidden">
      <BackgroundLayer src={assets.wishTree} overlay className={cn("transition-all duration-[2000ms]", discovered.length === wishTreeWishes.length && "brightness-125 saturate-[110%]")} />
      <ParticleField density={discovered.length === wishTreeWishes.length ? "medium" : "low"} petals={true} />

      {/* Cinematic Golden Light flare blend overlay when all wishes are revealed */}
      {discovered.length === wishTreeWishes.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_#ffe8a3_0%,_transparent_70%)] pointer-events-none z-10 mix-blend-color-dodge"
        />
      )}

      <div className="relative z-20 flex min-h-full flex-1 flex-col items-center justify-center p-6 py-12 text-center select-none">
        <div className="z-30 mt-4">
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-serif text-3xl font-semibold sm:text-5xl gradient-text glow-gold">
            My Wishes For You ♥
          </motion.h2>
          <p className="mt-2 text-white/75 text-sm">Tap a hanging paper strip to unroll my wish for you</p>
        </div>

        {/* Full-Screen Hanging Physical Paper Strips Container */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-hidden">
          {wishTreeWishes.map((w, i) => (
            <motion.button
              key={w.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: [0, 4, -4, 0],
              }}
              transition={{
                opacity: { delay: positions[i].delay, duration: 0.6 },
                scale: { delay: positions[i].delay, duration: 0.6 },
                rotate: { repeat: Infinity, duration: 5 + i * 0.8, ease: "easeInOut" }
              }}
              whileHover={{ scale: 1.15, rotate: 0 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => reveal(w)}
              className={cn(
                "absolute w-8 sm:w-10 h-28 sm:h-34 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-b-md rounded-t-xs border border-[#b38a53]/80 backdrop-blur-md flex flex-col items-center justify-between p-1.5 pb-2 pointer-events-auto transition-all duration-300 group shadow-[0_12px_28px_rgba(0,0,0,0.6)]",
                discovered.includes(w.id)
                  ? "bg-gradient-to-b from-[#fffefc] via-[#fbf4e4] to-[#f4e7cd] shadow-[0_0_24px_rgba(254,240,138,0.7),0_8px_20px_rgba(0,0,0,0.5)] border-[#d9a85e]"
                  : "bg-gradient-to-b from-[#fffef9] via-[#faf5e8] to-[#f1e6ce] hover:border-[#d9a85e] hover:shadow-[0_0_18px_rgba(254,240,138,0.5)]"
              )}
              style={{
                top: positions[i].top,
                left: positions[i].left,
                transformOrigin: "center top",
              }}
              aria-label={`Paper Wish Strip ${i + 1}`}
            >
              {/* Delicate hanging string loop from branch */}
              <svg className="absolute -top-[90px] left-1/2 -translate-x-1/2 h-[90px] w-4 pointer-events-none" overflow="visible">
                <line x1="8" y1="0" x2="8" y2="90" stroke="#b3874e" strokeWidth="1.4" strokeDasharray="3 1.5" />
                <circle cx="8" cy="4" r="2.5" fill="#452b14" stroke="#d9a85e" strokeWidth="1.2" />
              </svg>

              {/* Brass Grommet hole */}
              <div className="w-2.5 h-2.5 rounded-full border border-[#b38a53] bg-[#2a1408] flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[#fef08a]" />
              </div>

              {/* Hanging Wax Seal Stamp */}
              <div 
                className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-[9px] text-white font-serif font-bold shadow-sm relative border border-white/60 group-hover:scale-110 transition-transform my-auto"
                style={{ backgroundColor: collectibleCardDetails[w.id]?.sealColor || "#b45309" }}
              >
                ♥
              </div>

              {/* Slender strip number and torn/deckle bottom edge */}
              <div className="flex flex-col items-center w-full">
                <span className="text-[10px] sm:text-[11px] font-mono text-[#58260a] font-bold tracking-widest">
                  0{i + 1}
                </span>
                <div className="w-full h-1 mt-1 border-t border-dotted border-[#b38a53]/40" />
              </div>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6 backdrop-blur-md"
            >
              <WishTreePopupCard text={active.text} id={active.id} onClose={close} />
            </motion.div>
          )}
        </AnimatePresence>

        {discovered.length === wishTreeWishes.length && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 font-script text-2xl text-gold glow-gold font-semibold z-30"
          >
            All my wishes are for you ♥
          </motion.p>
        )}

        <div className="mt-8 relative z-30">
          <PrimaryButton onClick={onContinue}>Make a Wish ✧</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 14 — Memory Journey                                          */
/* ------------------------------------------------------------------ */

export function MemoryJourneyScene({ onContinue }: { onContinue: () => void }) {
  const [, setActiveIndex] = useState(0);
  const [mobileChapter, setMobileChapter] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const milestones = stories;

  // Dynamic atmospheric tints per milestone
  const atmospheres = [
    "from-[#14080e] via-[#240c18] to-[#0a0309]", // 1
    "from-[#0e0c1a] via-[#1b152d] to-[#080711]", // 2
    "from-[#1c140a] via-[#2d1e0d] to-[#0d0904]", // 3
    "from-[#07091a] via-[#10142e] to-[#050611]", // 4
    "from-[#0d1a14] via-[#14291f] to-[#060e0a]", // 5
    "from-[#1c112a] via-[#2e1a47] to-[#0e0816]", // 6
    "from-[#25101a] via-[#3d1629] to-[#12070c]", // 7
    "from-[#1f1112] via-[#331718] to-[#0f0708]", // 8
  ];

  // Observer on desktop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = container.querySelectorAll("[data-timeline-card]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-index") || "0", 10);
            setActiveIndex(index);
          }
        });
      },
      {
        root: container,
        rootMargin: "0px 0px -15% 0px",
        threshold: 0.1,
      }
    );

    cards.forEach((card) => observer.observe(card));
    return () => {
      cards.forEach((card) => observer.unobserve(card));
    };
  }, []);

  const handleMobileNext = () => {
    if (mobileChapter < milestones.length - 1) {
      const next = mobileChapter + 1;
      setMobileChapter(next);
      setActiveIndex(next);
    }
  };

  const handleMobilePrev = () => {
    if (mobileChapter > 0) {
      const prev = mobileChapter - 1;
      setMobileChapter(prev);
      setActiveIndex(prev);
    }
  };

  const currentAtmosphere = atmospheres[mobileChapter] || atmospheres[0];

  return (
    <div className="scene-container relative bg-[#070308] overflow-hidden select-none">
      {/* 1. Multi-layered Cinematic Background */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-b transition-all duration-1000 z-0",
          currentAtmosphere
        )}
      />
      <div 
        className="absolute inset-0 pointer-events-none z-0 mix-blend-screen opacity-50"
        style={{ background: "radial-gradient(circle at 50% 40%, rgba(217, 168, 94, 0.18) 0%, rgba(244, 63, 94, 0.1) 40%, transparent 75%)" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.85)_100%)] pointer-events-none z-0" />

      {/* Hanging string lights along top */}
      <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-10 opacity-60 flex justify-around px-8">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-[1px] h-6 sm:h-8 bg-gradient-to-b from-white/20 via-gold/40 to-gold/70" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_8px_rgba(254,240,138,0.9)] animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
          </div>
        ))}
      </div>

      <ParticleField density="low" petals={true} dots={false} />

      <div 
        ref={containerRef} 
        className="relative z-10 flex min-h-full flex-1 flex-col items-center overflow-y-auto p-4 sm:p-6 py-10 sm:py-12"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-10 mt-2 sm:mt-4 z-20"
        >
          <div className="flex items-center justify-center gap-2 mb-1 text-rose-300/80">
            <span className="w-6 sm:w-10 h-[1px] bg-gradient-to-r from-transparent to-rose-300/50" />
            <Heart size={12} className="text-rose-400 fill-rose-400/80" />
            <span className="text-[10px] sm:text-xs font-serif uppercase tracking-[0.25em] text-[#fed7aa] font-medium">
              Reliving Our Path
            </span>
            <Heart size={12} className="text-rose-400 fill-rose-400/80" />
            <span className="w-6 sm:w-10 h-[1px] bg-gradient-to-l from-transparent to-rose-300/50" />
          </div>
          <h2 className="font-calligraphy text-4xl sm:text-6xl text-[#fef08a] glow-gold leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            Our Story
          </h2>
          <p className="mt-1 text-white/75 text-xs sm:text-sm font-serif italic">
            "The moments that quietly became my whole world"
          </p>
        </motion.div>

        {/* ======================================================== */}
        {/* MOBILE STORYBOOK CHAPTER VIEW (< 640px)                  */}
        {/* ======================================================== */}
        <div className="w-full max-w-sm sm:hidden flex flex-col items-center my-auto pb-8 z-20">
          {/* Chapter indicator */}
          <div className="w-full mb-4 flex flex-col items-center gap-1.5">
            <div className="flex justify-between items-center w-full px-1 text-xs">
              <span className="text-white/60 font-mono text-[11px]">Chapter {mobileChapter + 1} of {milestones.length}</span>
              <span className="text-gold font-serif text-[11px] tracking-wide font-medium">
                {milestones[mobileChapter].date}
              </span>
            </div>
            {/* Segmented bar */}
            <div className="grid grid-cols-8 gap-1.5 h-1.5 w-full">
              {milestones.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setMobileChapter(idx);
                    setActiveIndex(idx);
                  }}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                    idx === mobileChapter
                      ? "bg-gold shadow-[0_0_8px_rgba(217,168,94,0.8)] scale-y-125"
                      : idx < mobileChapter
                      ? "bg-gold/40"
                      : "bg-white/15"
                  )}
                  aria-label={`Jump to Chapter ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Frosted Glass Memory Book Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mobileChapter}
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -15 }}
              transition={{ duration: 0.45 }}
              className="w-full flex flex-col items-center p-5 rounded-3xl bg-black/60 border border-white/15 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] text-center relative overflow-hidden"
            >
              {/* Corner Accents */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-gold/40 rounded-tl-sm pointer-events-none" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-gold/40 rounded-tr-sm pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-gold/40 rounded-bl-sm pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-gold/40 rounded-br-sm pointer-events-none" />

              {/* Polaroid Image */}
              <div className="my-2">
                <Polaroid
                  image={milestones[mobileChapter].image}
                  caption={milestones[mobileChapter].label}
                  rotate={milestones[mobileChapter].rotate || 0}
                  className="w-48 sm:w-56"
                />
              </div>

              {/* Title & Description */}
              <div className="mt-3">
                <h3 className="font-serif text-xl font-bold text-[#fef08a] glow-gold">
                  {milestones[mobileChapter].label}
                </h3>
                <p className="text-xs text-white/85 font-sans leading-relaxed mt-2 px-2">
                  {milestones[mobileChapter].description}
                </p>
              </div>

              {/* Navigation controls */}
              <div className="flex items-center justify-between w-full mt-6 pt-3 border-t border-white/10">
                <button
                  onClick={handleMobilePrev}
                  disabled={mobileChapter === 0}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-serif flex items-center gap-1 transition-all",
                    mobileChapter === 0 ? "opacity-30 cursor-not-allowed" : "text-white/80 hover:text-white active:scale-95 cursor-pointer"
                  )}
                >
                  <ArrowLeft size={14} /> Previous
                </button>

                {mobileChapter < milestones.length - 1 ? (
                  <button
                    onClick={handleMobileNext}
                    className="btn-pill-rose text-xs py-2 px-5 cursor-pointer flex items-center gap-1"
                  >
                    Next Chapter <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={onContinue}
                    className="btn-pill-gold text-xs py-2 px-5 cursor-pointer flex items-center gap-1"
                  >
                    Continue <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ======================================================== */}
        {/* DESKTOP VERTICAL TIMELINE VIEW (>= 640px)                */}
        {/* ======================================================== */}
        <div className="hidden sm:block relative w-full max-w-4xl my-8">
          {/* Golden Vertical Connecting Thread */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-transparent via-gold/50 to-transparent" />

          <div className="flex flex-col gap-14 py-6">
            {milestones.map((m, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={idx}
                  data-timeline-card
                  data-index={idx}
                  className={cn(
                    "relative flex items-center w-full",
                    isEven ? "flex-row" : "flex-row-reverse"
                  )}
                >
                  {/* Milestone Card */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className={cn(
                      "w-[45%] flex flex-col items-center p-6 rounded-3xl bg-black/60 border border-white/15 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] text-center relative",
                      isEven ? "mr-auto" : "ml-auto"
                    )}
                  >
                    {/* Corner filigree */}
                    <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-gold/40 rounded-tl-sm pointer-events-none" />
                    <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-gold/40 rounded-tr-sm pointer-events-none" />

                    <div className="my-2">
                      <Polaroid
                        image={m.image}
                        caption={m.label}
                        rotate={m.rotate || 0}
                        className="w-56"
                      />
                    </div>
                    <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-gold mt-2">
                      {m.date}
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-[#fef08a] glow-gold mt-0.5">
                      {m.label}
                    </h3>
                    <p className="text-xs text-white/85 font-sans leading-relaxed mt-2 max-w-sm">
                      {m.description}
                    </p>
                  </motion.div>

                  {/* Central Node Badge on Thread */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-midnight border-2 border-gold shadow-[0_0_15px_rgba(217,168,94,0.6)] flex items-center justify-center z-20">
                    <span className="text-[10px] font-mono text-gold font-bold">{m.index}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Continue CTA */}
          <div className="mt-12 text-center flex flex-col items-center gap-3">
            <button
              onClick={onContinue}
              className="btn-pill-rose font-serif text-sm tracking-wide shadow-[0_0_25px_rgba(244,63,94,0.5)] cursor-pointer"
            >
              Continue to Surprise ♥ →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


function HiddenSurpriseScene({ onContinue }: { onContinue: () => void }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="scene-container">
      <BackgroundLayer overlay />
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0f2e]/90 via-[#2d1b4e]/85 to-[#0b0d1c]/95" />
      <ParticleField density="low" petals={false} />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif text-3xl font-semibold sm:text-5xl gradient-text glow-gold">
          Shhh... something hidden is here ♥
        </h2>

        <div className="relative mt-10 flex h-64 w-64 items-center justify-center">
          {!revealed ? (
            <div className="relative flex h-48 w-48 items-center justify-center">
              {/* Expanding glowing halos (waves of light) */}
              <motion.div
                animate={{ scale: [1, 1.6, 2.3], opacity: [0.6, 0.2, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
                className="absolute inset-4 rounded-full bg-rose/25 filter blur-md"
              />
              <motion.div
                animate={{ scale: [1, 1.6, 2.3], opacity: [0.6, 0.2, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut", delay: 0.5 }}
                className="absolute inset-4 rounded-full bg-rose/15 filter blur-lg"
              />

              {/* Floating Embers */}
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-1.5 w-1.5 rounded-full bg-rose-300/80 filter drop-shadow-[0_0_4px_rgba(244,63,94,0.6)]"
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{
                    x: [0, (Math.random() - 0.5) * 70, (Math.random() - 0.5) * 100],
                    y: [0, -70, -180],
                    opacity: [0, 0.9, 0],
                    scale: [0.6, 1.2, 0.4],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.2 + Math.random() * 1.5,
                    delay: i * 0.22,
                    ease: "easeOut",
                  }}
                  style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
                />
              ))}

              {/* Double-pulse beating heart button */}
              <motion.button
                animate={{ scale: [1, 1.08, 1, 1.05, 1, 1, 1] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                onClick={() => setRevealed(true)}
                className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[#1b0a1d]/80 border border-rose/30 shadow-[0_0_30px_rgba(244,63,94,0.35)] cursor-pointer z-10 hover:border-rose/50"
                aria-label="Open surprise"
              >
                <Heart className="h-12 w-12 fill-rose text-rose filter drop-shadow-[0_0_12px_rgba(244,63,94,0.85)] animate-pulse" />
              </motion.button>
            </div>
          ) : (
            <>
              {/* Expanding Gold-Pink Halo transition layer */}
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 12, opacity: 0 }}
                transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute h-16 w-16 rounded-full bg-gradient-to-r from-[#d9a85e] via-[#d4869a] to-[#a855f7] z-30 pointer-events-none filter blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.2, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.25 }}
                className="relative"
              >
                {/* Premium Flapping Butterfly */}
                <svg width="150" height="150" viewBox="0 0 120 120" fill="none" className="drop-shadow-[0_0_20px_rgba(168,85,247,0.7)]">
                  <defs>
                    <linearGradient id="leftWingGrad" x1="60" y1="40" x2="20" y2="80">
                      <stop offset="0%" stopColor="#d8b4fe" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                    <linearGradient id="rightWingGrad" x1="60" y1="40" x2="100" y2="80">
                      <stop offset="0%" stopColor="#f472b6" />
                      <stop offset="100%" stopColor="#db2777" />
                    </linearGradient>
                  </defs>

                  {/* Left Wing Group */}
                  <motion.g
                    animate={{ rotateY: [0, 45, 0] }}
                    transition={{ repeat: Infinity, duration: 0.75, ease: "easeInOut" }}
                    style={{ transformOrigin: "60px 70px" }}
                  >
                    <path d="M 60 45 C 30 15, 10 30, 25 60 C 35 75, 55 75, 60 70 Z" fill="url(#leftWingGrad)" />
                    <path d="M 60 70 C 45 75, 30 85, 38 100 C 48 110, 58 95, 60 85 Z" fill="url(#leftWingGrad)" opacity="0.9" />
                  </motion.g>

                  {/* Right Wing Group */}
                  <motion.g
                    animate={{ rotateY: [0, -45, 0] }}
                    transition={{ repeat: Infinity, duration: 0.75, ease: "easeInOut" }}
                    style={{ transformOrigin: "60px 70px" }}
                  >
                    <path d="M 60 45 C 90 15, 110 30, 95 60 C 85 75, 65 75, 60 70 Z" fill="url(#rightWingGrad)" />
                    <path d="M 60 70 C 75 75, 90 85, 82 100 C 72 110, 62 95, 60 85 Z" fill="url(#rightWingGrad)" opacity="0.9" />
                  </motion.g>

                  {/* Antennae */}
                  <path d="M 58 40 Q 52 28 48 30" stroke="#4a3b52" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  <path d="M 62 40 Q 68 28 72 30" stroke="#4a3b52" strokeWidth="1.5" strokeLinecap="round" fill="none" />

                  {/* Butterfly Body */}
                  <line x1="60" y1="35" x2="60" y2="88" stroke="#31193f" strokeWidth="4" strokeLinecap="round" />

                  {/* Glowing Sparkle Trail */}
                  {Array.from({ length: 6 }).map((_, pIdx) => (
                    <motion.circle
                      key={pIdx}
                      cx={60 + Math.sin(pIdx) * 12}
                      cy={92 + pIdx * 8}
                      r={1.5 + Math.random() * 2}
                      fill="#f472b6"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: [0, 0.9, 0], scale: [0.5, 1.2, 0.5], y: [0, 18] }}
                      transition={{ repeat: Infinity, duration: 1.4, delay: pIdx * 0.2 }}
                    />
                  ))}
                </svg>
              </motion.div>
            </>
          )}
        </div>

        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-6 max-w-md"
          >
            <p className="font-serif text-xl text-purple-200">You are the most beautiful surprise life ever gave me.</p>
            <PrimaryButton onClick={onContinue} className="mt-6">Watch Our Special Video 🎬</PrimaryButton>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 16 — Special Video                                           */
/* ------------------------------------------------------------------ */

function SpecialVideoScene({
  onContinue,
  audio,
}: {
  onContinue: () => void;
  audio: any;
}) {
  const [phase, setPhase] = useState<
    "intro-text-1" | "intro-text-2" | "video-reveal" | "video-playing" | "video-ended" | "outro-text-1" | "outro-text-2"
  >("intro-text-1");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Timers for the intro text sequences
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPhase("intro-text-2");
    }, 3600);
    return () => clearTimeout(timer1);
  }, []);

  useEffect(() => {
    if (phase === "intro-text-2") {
      const timer2 = setTimeout(() => {
        setPhase("video-reveal");
      }, 3800);
      return () => clearTimeout(timer2);
    }
  }, [phase]);

  // Timers for the outro text sequences
  useEffect(() => {
    if (phase === "outro-text-1") {
      const timer3 = setTimeout(() => {
        setPhase("outro-text-2");
      }, 3200);
      return () => clearTimeout(timer3);
    }
  }, [phase]);

  // Audio integration
  useEffect(() => {
    const wasAmbientPlaying = audio.enabled;
    const wasMusicPlaying = audio.isPlayingVoice;
    
    if (wasAmbientPlaying) // Background music removed
    if (wasMusicPlaying) audio.pause();
    
    return () => {
      if (wasAmbientPlaying) // Background music removed
      if (wasMusicPlaying) audio.play();
    };
  }, [audio]);

  // Autoplay handler when video is revealed
  useEffect(() => {
    if (phase === "video-reveal") {
      const video = videoRef.current;
      if (video) {
        video.play()
          .then(() => {
            setIsPlaying(true);
            setPhase("video-playing");
          })
          .catch(() => {
            // If autoplay with sound is blocked, fallback to muted autoplay
            video.muted = true;
            setIsMuted(true);
            video.play()
              .then(() => {
                setIsPlaying(true);
                setPhase("video-playing");
              })
              .catch(() => {
                // User click needed
                setIsPlaying(false);
              });
          });
      }
    }
  }, [phase]);

  const handlePlay = () => {
    setIsPlaying(true);
    if (phase === "video-reveal") setPhase("video-playing");
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setPhase("video-ended");
    setTimeout(() => {
      setPhase("outro-text-1");
    }, 1200);
  };

  const handleUnmute = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };

  const handleLoadedMetadata = () => {
    setHasError(false);
  };

  const isVideoVisible = phase === "video-reveal" || phase === "video-playing" || phase === "video-ended";

  return (
    <div ref={containerRef} className="scene-container bg-[#070811] relative overflow-hidden flex flex-col items-center justify-center">
      {/* Deep cinematic background with subtle warm burgundy and golden radial lighting */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#05060e] via-[#160814] to-[#070811] opacity-95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(217,168,94,0.12)_0%,_transparent_75%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,134,154,0.06)_0%,_transparent_60%)] pointer-events-none" />
      
      {/* Soft floating golden particles */}
      <ParticleField density="low" petals={false} dots={true} />

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center w-full h-full p-2 sm:p-6 md:p-8">
        
        {/* Responsive Full-Viewport Cinematic Video Theater Wrapper */}
        <div className={cn(
          "relative flex flex-col items-center justify-center w-full h-[100dvh] max-h-[100dvh] mx-auto transition-all duration-[1200ms] ease-out",
          isVideoVisible ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none absolute"
        )}>
          {/* Outer glow & shadow frame */}
          <div className="relative w-full h-full flex items-center justify-center bg-black/95">
            <video
              ref={videoRef}
              src="/assets/special_video.mp4"
              className="w-full h-full max-h-[100dvh] object-contain shadow-[0_0_80px_rgba(0,0,0,0.9)]"
              playsInline
              preload="metadata"
              controls={isVideoVisible && isPlaying}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleEnded}
              onError={() => {
                console.error("Failed to load video at /assets/special_video.mp4");
                setHasError(true);
              }}
            />

            {/* Cinematic Center Play Overlay when paused or beginning */}
            {!isPlaying && isVideoVisible && !hasError && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.play().then(() => {
                      setIsPlaying(true);
                      setPhase("video-playing");
                    }).catch(() => {
                      // Muted play fallback
                      if (videoRef.current) {
                        videoRef.current.muted = true;
                        setIsMuted(true);
                        videoRef.current.play().then(() => {
                          setIsPlaying(true);
                          setPhase("video-playing");
                        }).catch(() => {});
                      }
                    });
                  }
                }}
                className="absolute flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-[#1b0a1d]/85 border border-gold/40 shadow-[0_0_40px_rgba(217,168,94,0.45)] hover:border-gold/70 hover:scale-105 cursor-pointer transition-all duration-300 active:scale-95 z-20"
                aria-label="Play video"
              >
                <Play className="h-8 w-8 sm:h-10 sm:w-10 fill-gold text-gold ml-1 filter drop-shadow-[0_0_10px_rgba(217,168,94,0.7)]" />
              </motion.button>
            )}

            {/* Floating Unmute indicator on mobile / autoplay */}
            {isMuted && isPlaying && isVideoVisible && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={handleUnmute}
                className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 flex items-center gap-2 rounded-full bg-[#1b0a1d]/90 border border-gold/40 px-4 py-2.5 text-xs font-medium text-gold shadow-lg hover:bg-[#28102b] active:scale-95 transition-all cursor-pointer"
              >
                <VolumeX size={15} /> Tap to Unmute
              </motion.button>
            )}

            {/* Clean Romantic Error State if video file is missing or unplayable */}
            {hasError && isVideoVisible && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-black/90 backdrop-blur-md">
                <Sparkles className="w-10 h-10 text-gold mb-3 animate-pulse" />
                <h4 className="font-serif text-xl sm:text-2xl text-champagne mb-2">Our Special Moments Video</h4>
                <p className="text-white/70 text-sm max-w-md mb-6">A collection of our cherished memories together ♥</p>
                <PrimaryButton onClick={onContinue}>Continue to Final Surprise →</PrimaryButton>
              </div>
            )}
          </div>
        </div>

        {/* Text phases overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 text-center pointer-events-none">
          <AnimatePresence mode="wait">
            {phase === "intro-text-1" && (
              <motion.div
                key="intro1"
                initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-xl px-4"
              >
                <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-champagne/90 tracking-wide glow-gold font-light">
                  Before the final surprise...
                </h3>
              </motion.div>
            )}

            {phase === "intro-text-2" && (
              <motion.div
                key="intro2"
                initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-xl px-4"
              >
                <h3 className="font-script text-4xl sm:text-5xl lg:text-6xl text-gold glow-gold leading-relaxed">
                  I made something special for you. ♥
                </h3>
              </motion.div>
            )}

            {phase === "outro-text-1" && (
              <motion.div
                key="outro1"
                initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-xl px-4"
              >
                <h3 className="font-script text-4xl sm:text-5xl lg:text-6xl text-gold glow-gold leading-relaxed">
                  That was just for you. ♥
                </h3>
              </motion.div>
            )}

            {phase === "outro-text-2" && (
              <motion.div
                key="outro2"
                initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-xl flex flex-col items-center gap-8 pointer-events-auto px-4"
              >
                <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-champagne/90 tracking-wide glow-gold font-light">
                  Ready for the final surprise?
                </h3>
                <PrimaryButton 
                  onClick={onContinue}
                  className="px-10 py-3.5 text-base tracking-widest bg-gradient-to-r from-gold via-amber-500 to-gold text-midnight border border-gold/40 shadow-[0_0_25px_rgba(217,168,94,0.45)] hover:shadow-[0_0_35px_rgba(217,168,94,0.65)] hover:scale-105 transition-all duration-300"
                >
                  Reveal Final Surprise ♥
                </PrimaryButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 17 — Final                                                   */
/* ------------------------------------------------------------------ */

function FinalScene({ onReplay }: { onReplay: () => void }) {
  const [index, setIndex] = useState(0);
  const [showReplay, setShowReplay] = useState(false);

  useEffect(() => {
    const delays = [3000, 5800, 8600, 12400, 16200];
    const timers = delays.slice(0, -1).map((d, i) => setTimeout(() => setIndex(i + 1), d));
    const replayTimer = setTimeout(() => setShowReplay(true), 21000);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(replayTimer);
    };
  }, []);

  const renderText = (idx: number) => {
    switch (idx) {
      case 0:
        return (
          <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl leading-tight text-champagne/90 glow-gold">
            Thank you for being<br />a part of my story.
          </h2>
        );
      case 1:
        return (
          <h2 className="leading-tight">
            <span className="font-script text-5xl sm:text-7xl lg:text-8xl text-gold glow-gold block mb-2">Our Journey,</span>
            <span className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white/90">this isn't the end...</span>
          </h2>
        );
      case 2:
        return (
          <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl leading-tight text-champagne/90 glow-gold">
            It's just another chapter<br />of us.
          </h2>
        );
      case 3:
        return (
          <h2 className="leading-tight">
            <span className="font-serif text-4xl sm:text-6xl lg:text-7xl text-champagne/90 block">Happy Birthday</span>
            <span className="font-script text-5xl sm:text-7xl lg:text-8xl text-rose glow-rose block mt-3">Bindu ♥</span>
          </h2>
        );
      case 4:
        return (
          <h2 className="leading-tight">
            <span className="font-serif text-4xl sm:text-6xl lg:text-7xl text-champagne/90 block">I Love You</span>
            <span className="font-script text-5xl sm:text-7xl lg:text-8xl text-gold glow-gold block mt-3">Forever & Always</span>
          </h2>
        );
      default:
        return null;
    }
  };

  return (
    <div className="scene-container">
      <BackgroundLayer src={assets.finalSunset} overlay={false} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d1c]/80 via-[#3d0f18]/25 to-[#0b0d1c]/50" />
      <ParticleField density="medium" petals />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center overflow-y-auto p-6 py-8 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 60, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -60, filter: "blur(10px)" }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            {renderText(index)}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {showReplay && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="mt-12 flex flex-col items-center gap-4">
              <PrimaryButton onClick={onReplay}>
                <RotateCcw size={16} className="mr-2 inline" /> Replay Our Story
              </PrimaryButton>
              <p className="text-sm text-white/60">Made with ♥</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
