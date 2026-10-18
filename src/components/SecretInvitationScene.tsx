import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import { CosmicStarfield } from "./cinematic/CosmicStarfield";

interface SecretInvitationSceneProps {
  onContinue: () => void;
}

export function SecretInvitationScene({ onContinue }: SecretInvitationSceneProps) {
  const [isActivating, setIsActivating] = useState(false);
  const hasTriggeredRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const handleActivate = () => {
    if (hasTriggeredRef.current || isActivating) return;
    hasTriggeredRef.current = true;
    setIsActivating(true);

    // Smooth cinematic pacing before transitioning to the hidden surprise page
    timeoutRef.current = setTimeout(() => {
      onContinue();
    }, prefersReduced ? 400 : 1050);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleActivate();
    }
  };

  return (
    <div
      className="scene-container relative h-[100dvh] max-h-[100dvh] w-full overflow-hidden select-none flex flex-col items-center justify-between p-6 sm:p-10 cursor-default"
      style={{
        backgroundColor: "#050407",
        paddingBottom: "max(2rem, calc(1rem + env(safe-area-inset-bottom, 0px)))",
        paddingTop: "max(2rem, calc(1rem + env(safe-area-inset-top, 0px)))",
      }}
    >
      {/* 1. Black Cosmic Background with Twinkling Stars (No Shooting Stars) */}
      <CosmicStarfield showShootingStars={false} twinkleCount={50} />

      {/* 2. TOP ROMANTIC LABEL */}
      <motion.div
        animate={{ opacity: isActivating ? 0 : 1, y: isActivating ? -10 : 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center shrink-0 pt-2"
      >
        <span className="text-[10px] sm:text-xs font-sans tracking-[0.3em] uppercase text-[#d9a85e] font-semibold drop-shadow-[0_0_8px_rgba(217,168,94,0.4)]">
          ✦ A SECRET INVITATION ✦
        </span>
      </motion.div>

      {/* 3. CENTERPIECE: COMPACT & ELEGANT VERTICALLY & HORIZONTALLY CENTERED HEART BUTTON */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto w-full">
        <div className="relative flex items-center justify-center">
          {/* Expanding ring of warm champagne light on activation */}
          <AnimatePresence>
            {isActivating && (
              <>
                <motion.div
                  initial={{ scale: 0.85, opacity: 0.95 }}
                  animate={{ scale: 3.2, opacity: 0 }}
                  transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-[#fef08a] shadow-[0_0_35px_rgba(254,240,138,0.7)] pointer-events-none"
                />
                <motion.div
                  initial={{ scale: 0.7, opacity: 0.75 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 0.85, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-[rgba(217,168,94,0.6)] shadow-[0_0_25px_rgba(217,168,94,0.5)] pointer-events-none"
                />
              </>
            )}
          </AnimatePresence>

          {/* Very faint warm-gold ambient glow around button */}
          <div
            className="absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(217, 168, 94, 0.12) 0%, transparent 70%)",
            }}
          />

          {/* Elegant Circular Heart Button */}
          <motion.button
            onClick={handleActivate}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label="Touch to reveal your secret surprise"
            whileHover={prefersReduced || isActivating ? {} : { scale: 1.06, y: -1.5 }}
            whileTap={prefersReduced || isActivating ? {} : { scale: 0.96 }}
            animate={
              isActivating
                ? { scale: [1, 1.25, 1.6], opacity: [1, 0.9, 0] }
                : prefersReduced
                ? {}
                : {
                    boxShadow: [
                      "0 4px 20px rgba(0,0,0,0.7), 0 0 14px rgba(217,168,94,0.18)",
                      "0 6px 26px rgba(0,0,0,0.8), 0 0 22px rgba(217,168,94,0.32)",
                      "0 4px 20px rgba(0,0,0,0.7), 0 0 14px rgba(217,168,94,0.18)",
                    ],
                  }
            }
            transition={{
              duration: isActivating ? 0.9 : 3.2,
              repeat: isActivating ? 0 : Infinity,
              ease: "easeInOut",
            }}
            className="group relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#0a0810]/85 border border-[rgba(217,168,94,0.55)] hover:border-[#fef08a] backdrop-blur-md flex flex-col items-center justify-center cursor-pointer shadow-xl transition-all duration-300 focus:outline-none focus-visible:ring-3 focus-visible:ring-[#fef08a]"
          >
            {/* Subtle inner highlight sweep on hover */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />

            {/* Heart Motif with Calm, Subtle Heartbeat */}
            <motion.div
              animate={
                isActivating
                  ? { scale: [1, 1.35, 0.5], rotate: [0, -8, 8, 0] }
                  : prefersReduced
                  ? {}
                  : {
                      scale: [1, 1.05, 1],
                    }
              }
              transition={{
                duration: isActivating ? 0.7 : 2.6,
                repeat: isActivating ? 0 : Infinity,
                ease: "easeInOut",
              }}
              className="relative flex items-center justify-center text-rose-300 group-hover:text-rose-200 transition-colors"
            >
              <Heart
                size={28}
                className="fill-rose-400/90 text-rose-300 filter drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]"
              />
              <Sparkles
                size={12}
                className="absolute -top-1 -right-1 text-[#fed7aa] filter drop-shadow-[0_0_5px_rgba(254,215,170,0.8)]"
              />
            </motion.div>

            <span className="mt-1 text-[8.5px] sm:text-[9.5px] font-serif font-bold uppercase tracking-[0.2em] text-[#fed7aa] opacity-90 group-hover:opacity-100 transition-opacity">
              Touch
            </span>
          </motion.button>
        </div>

        {/* Instruction placed directly beneath the button on ONE LINE */}
        <motion.p
          animate={{ opacity: isActivating ? 0 : 0.85, y: isActivating ? 10 : 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-4 sm:mt-5 text-xs sm:text-sm font-serif italic text-[#fff5ea]/80 tracking-wide text-center whitespace-nowrap select-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
        >
          Touch to reveal your secret surprise ♥
        </motion.p>
      </div>

      {/* 4. BALANCED BOTTOM SPACER */}
      <div className="h-6 shrink-0" aria-hidden="true" />
    </div>
  );
}

export default SecretInvitationScene;
