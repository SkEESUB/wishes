import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

interface PageCountdownTimerProps {
  secondsLeft: number;
  totalSeconds?: number;
  onAdvance?: () => void;
  isVisible?: boolean;
  reducedMotion?: boolean;
}

export function PageCountdownTimer({
  secondsLeft,
  totalSeconds = 10,
  onAdvance,
  isVisible = true,
  reducedMotion = false,
}: PageCountdownTimerProps) {
  if (!isVisible || secondsLeft <= 0) return null;

  // Circular progress stroke calculation (r=9 -> C = 2 * PI * 9 ~= 56.548)
  const circumference = 56.548;
  const progressRatio = Math.max(0, Math.min(1, secondsLeft / totalSeconds));
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <motion.aside
      initial={{ opacity: 0, y: -10, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.92 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed z-50 pointer-events-auto"
      style={{
        top: "max(0.75rem, calc(0.5rem + env(safe-area-inset-top, 0px)))",
        right: "max(0.75rem, calc(0.5rem + env(safe-area-inset-right, 0px)))",
      }}
      aria-label={`Page timer: ${secondsLeft} seconds remaining before advancing`}
      aria-live="polite"
    >
      <div
        onClick={onAdvance}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onAdvance?.();
          }
        }}
        title="Click to advance to the next page now"
        className="group flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full bg-[#0c0414]/85 hover:bg-[#190624]/92 border border-[#e7b876]/45 hover:border-[#fef08a]/80 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.7),0_0_16px_rgba(217,168,94,0.22)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.85),0_0_24px_rgba(254,240,138,0.38)] transition-all duration-300 cursor-pointer select-none active:scale-95"
      >
        {/* Glowing circular progress indicator */}
        <div className="relative w-4.5 h-4.5 sm:w-5 sm:h-5 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="rgba(217, 168, 94, 0.18)"
              strokeWidth="2.5"
              fill="none"
            />
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="url(#pageTimerGradient)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
            <defs>
              <linearGradient id="pageTimerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="55%" stopColor="#e7b876" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>
          </svg>
          <Sparkles
            size={8}
            className="absolute text-[#fef08a] animate-pulse pointer-events-none drop-shadow-[0_0_4px_rgba(254,240,138,0.8)]"
          />
        </div>

        {/* Animated Seconds Number */}
        <div className="relative h-4 sm:h-5 flex items-center justify-center min-w-[20px] overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={secondsLeft}
              initial={reducedMotion ? { opacity: 0 } : { y: -6, opacity: 0 }}
              animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { y: 6, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="font-mono text-xs sm:text-sm font-bold text-[#fef08a] drop-shadow-[0_0_8px_rgba(254,240,138,0.55)] tabular-nums"
            >
              {secondsLeft}s
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Subtle Next Label with Arrow */}
        <div className="flex items-center gap-1 pl-0.5 border-l border-white/15">
          <span className="font-serif italic text-[11px] sm:text-xs text-[#fed7aa]/90 tracking-wide">
            Next
          </span>
          <ArrowRight
            size={11}
            className="text-[#e7b876]/80 group-hover:translate-x-0.5 transition-transform duration-200"
          />
        </div>
      </div>
    </motion.aside>
  );
}

export default PageCountdownTimer;
