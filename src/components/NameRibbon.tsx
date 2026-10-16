import { motion } from "framer-motion";
import { Heart } from "lucide-react";

interface NameRibbonProps {
  name?: string | null;
  badgeText?: string;
  title: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
}

export function NameRibbon({
  name,
  badgeText = "A Special Wish",
  title,
  subtitle,
  className = "",
  compact = false,
}: NameRibbonProps) {
  return (
    <div className={`relative flex flex-col items-center justify-center select-none text-center ${className}`}>
      {/* 1. TOP DECORATIVE FLORAL & LIGHT ELEMENTS ARCH */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative flex items-center justify-center gap-2 sm:gap-3 mb-1.5"
      >
        {/* Left Botanical Vine & Gold Filigree */}
        <div className="flex items-center gap-1.5 text-gold/75">
          <span className="hidden sm:inline text-xs filter drop-shadow-[0_0_6px_rgba(254,240,138,0.5)]">✨</span>
          <span className="text-sm sm:text-base transform -rotate-12 filter drop-shadow-[0_2px_6px_rgba(244,63,94,0.6)]">🌸</span>
          <svg className="w-10 sm:w-16 h-3 text-[#d9a85e]" viewBox="0 0 60 12" fill="none">
            <path
              d="M2 6 C15 11, 35 2, 58 6"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <circle cx="2" cy="6" r="1.5" fill="#fef08a" />
            <circle cx="30" cy="4" r="1.2" fill="#fda4af" />
          </svg>
        </div>

        {/* Central Heart Jewel with Hanging Fairy Light Accent */}
        <div className="relative flex items-center justify-center px-1">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
            className="absolute inset-0 m-auto w-6 h-6 rounded-full bg-rose-500/30 blur-sm pointer-events-none"
          />
          <Heart className="h-4 w-4 sm:h-5 sm:w-5 fill-rose-500 text-rose-300 drop-shadow-[0_0_10px_rgba(244,63,94,0.9)]" />
        </div>

        {/* Right Botanical Vine & Gold Filigree */}
        <div className="flex items-center gap-1.5 text-gold/75">
          <svg className="w-10 sm:w-16 h-3 text-[#d9a85e] transform -scale-x-100" viewBox="0 0 60 12" fill="none">
            <path
              d="M2 6 C15 11, 35 2, 58 6"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <circle cx="2" cy="6" r="1.5" fill="#fef08a" />
            <circle cx="30" cy="4" r="1.2" fill="#fda4af" />
          </svg>
          <span className="text-sm sm:text-base transform rotate-12 filter drop-shadow-[0_2px_6px_rgba(244,63,94,0.6)]">🌸</span>
          <span className="hidden sm:inline text-xs filter drop-shadow-[0_0_6px_rgba(254,240,138,0.5)]">✨</span>
        </div>
      </motion.div>

      {/* 2. PREMIUM NAME RIBBON BANNER */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex items-center justify-center my-0.5 sm:my-1"
      >
        {/* Left Ribbon Fold & Tail */}
        <div className="relative hidden sm:block -mr-2 z-0">
          <svg width="28" height="34" viewBox="0 0 28 34" fill="none">
            <path
              d="M28 2 L6 2 L14 17 L6 32 L28 32 Z"
              fill="url(#ribbonTailLeft)"
              stroke="#d9a85e"
              strokeWidth="1"
            />
            <defs>
              <linearGradient id="ribbonTailLeft" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4c0519" />
                <stop offset="100%" stopColor="#881337" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Central Ribbon Plate */}
        <div className="relative z-10 px-5 sm:px-8 py-1.5 sm:py-2 rounded-sm bg-gradient-to-r from-[#881337] via-[#be123c] to-[#881337] border-y border-[#fef08a]/80 shadow-[0_8px_24px_rgba(0,0,0,0.6),0_0_20px_rgba(244,63,94,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2">
          {/* Subtle Stitched Gold Border inside ribbon */}
          <div className="absolute inset-x-2 top-0.5 h-[1px] bg-gradient-to-r from-transparent via-[#fef08a]/60 to-transparent" />
          <div className="absolute inset-x-2 bottom-0.5 h-[1px] bg-gradient-to-r from-transparent via-[#fef08a]/60 to-transparent" />

          <span className="text-[9px] sm:text-[10px] text-amber-200/90 font-serif tracking-[0.25em] uppercase font-semibold">
            ✦ {badgeText} ✦
          </span>
        </div>

        {/* Right Ribbon Fold & Tail */}
        <div className="relative hidden sm:block -ml-2 z-0">
          <svg width="28" height="34" viewBox="0 0 28 34" fill="none">
            <path
              d="M0 2 L22 2 L14 17 L22 32 L0 32 Z"
              fill="url(#ribbonTailRight)"
              stroke="#d9a85e"
              strokeWidth="1"
            />
            <defs>
              <linearGradient id="ribbonTailRight" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#881337" />
                <stop offset="100%" stopColor="#4c0519" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </motion.div>

      {/* 3. PERSON'S NAME (Cinematic Romantic Script) */}
      {name && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex items-center justify-center gap-2 my-0.5"
        >
          <span className="text-xs sm:text-sm text-gold/60">~</span>
          <h3 className="font-script text-3xl sm:text-5xl md:text-6xl text-[#fef08a] glow-gold drop-shadow-[0_4px_20px_rgba(254,240,138,0.5)] tracking-wide font-normal">
            {name}
          </h3>
          <Heart size={14} className="fill-rose-400 text-rose-300 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)] inline -mt-2" />
          <span className="text-xs sm:text-sm text-gold/60">~</span>
        </motion.div>
      )}

      {/* 4. SECTION TITLE */}
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`font-serif ${
          compact
            ? "text-2xl sm:text-3xl md:text-4xl"
            : "text-3xl sm:text-4xl md:text-5xl"
        } font-semibold text-white/95 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] leading-tight tracking-tight mt-0.5`}
      >
        {title}
      </motion.h2>

      {/* 5. SUBTITLE (Optional) */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="text-xs sm:text-sm font-serif italic text-rose-100/80 mt-1 max-w-md mx-auto leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

export default NameRibbon;
