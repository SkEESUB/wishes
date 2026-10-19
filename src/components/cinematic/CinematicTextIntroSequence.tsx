import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { type IntroSceneItem } from "../../data/introSequences";
import { CosmicStarfield } from "./CosmicStarfield";

interface CinematicTextIntroSequenceProps {
  scenes: IntroSceneItem[];
  onComplete: () => void;
  theme?: "wishes" | "video";
  className?: string;
}

export function CinematicTextIntroSequence({
  scenes,
  onComplete,
  theme = "wishes",
  className = "",
}: CinematicTextIntroSequenceProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTransitioningRef = useRef<boolean>(false);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const currentScene = scenes[currentIndex] || scenes[0];
  const isLastScene = currentIndex === scenes.length - 1;

  // Clear existing timer safely
  const clearAutoTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Advance to next scene or complete
  const handleAdvance = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setIsTransitioning(true);
    clearAutoTimer();

    if (currentIndex < scenes.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  }, [currentIndex, scenes.length, onComplete, clearAutoTimer]);

  // Set up auto-advance timer for the active scene
  useEffect(() => {
    clearAutoTimer();
    isTransitioningRef.current = false;
    setIsTransitioning(false);

    // If it's the last scene with an explicit CTA button, don't auto-rush, but still provide generous duration
    const delay = currentScene.durationMs ?? (isLastScene ? 6000 : 4500);

    timerRef.current = setTimeout(() => {
      handleAdvance();
    }, delay);

    return () => {
      clearAutoTimer();
    };
  }, [currentIndex, currentScene.durationMs, isLastScene, handleAdvance, clearAutoTimer]);

  // Keyboard navigation support (Space / Enter / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        handleAdvance();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAdvance]);

  // Split words for staggered word reveal
  const words = currentScene.mainText.split(" ");

  // Themes visual palettes
  const bgGradient =
    theme === "video"
      ? "radial-gradient(ellipse at 50% 35%, #19051d 0%, #100315 50%, #060109 100%)"
      : "radial-gradient(ellipse at 50% 35%, #180824 0%, #0e051a 50%, #070310 100%)";

  const ambientGlowColor =
    theme === "video"
      ? "rgba(244, 63, 94, 0.16)"
      : "rgba(217, 168, 94, 0.16)";

  return (
    <div
      className={`fixed inset-0 w-full h-full select-none flex flex-col items-center justify-between p-4 sm:p-6 text-center z-40 cursor-default overflow-hidden ${isTransitioning ? "pointer-events-none" : ""} ${className}`}
      style={{
        background: bgGradient,
        paddingBottom: "max(1.5rem, calc(1rem + env(safe-area-inset-bottom, 0px)))",
        paddingTop: "max(1.25rem, calc(0.75rem + env(safe-area-inset-top, 0px)))",
      }}
      role="region"
      aria-label="Cinematic introduction"
      aria-live="polite"
    >
      {/* Ambient background glow aura */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${ambientGlowColor} 0%, transparent 70%)`,
        }}
      />

      {/* 1. Sophisticated Pure Black Cosmic Background with Twinkling Stars (No Shooting Stars) */}
      <CosmicStarfield showShootingStars={false} twinkleCount={50} />

      {/* 2. TOP HEADER: BADGE */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between shrink-0 px-2 sm:px-4">
        {/* Badge or chapter label */}
        <div className="flex items-center gap-2">
          {currentScene.badge && (
            <motion.span
              key={`badge-${currentIndex}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[9px] sm:text-[10px] font-mono tracking-[0.28em] text-[#fed7aa]/90 uppercase font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-[rgba(217,168,94,0.3)] backdrop-blur-sm"
            >
              {currentScene.badge}
            </motion.span>
          )}
        </div>
      </div>

      {/* 3. CENTER STAGE: CINEMATIC SCENE TEXT WITH WAITING ANIMATION */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center justify-center my-auto px-4 sm:px-6 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene.id}
            initial={
              prefersReduced
                ? { opacity: 0 }
                : { opacity: 0, y: 20, filter: "blur(6px)" }
            }
            animate={
              prefersReduced
                ? { opacity: 1 }
                : { opacity: 1, y: 0, filter: "blur(0px)" }
            }
            exit={
              prefersReduced
                ? { opacity: 0 }
                : { opacity: 0, y: -14, filter: "blur(8px)", scale: 0.98 }
            }
            transition={{
              duration: 0.75,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex flex-col items-center text-center w-full"
          >
            {/* Eyebrow marker */}
            {currentScene.eyebrow && (
              <motion.div
                initial={prefersReduced ? {} : { opacity: 0, y: -8 }}
                animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex items-center justify-center gap-2 mb-3 sm:mb-4 text-[#d9a85e]"
              >
                <span className="w-6 sm:w-10 h-[1px] bg-gradient-to-r from-transparent to-[#d9a85e]/60" />
                <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#fed7aa] drop-shadow-[0_0_8px_rgba(217,168,94,0.4)]">
                  {currentScene.eyebrow}
                </span>
                <span className="w-6 sm:w-10 h-[1px] bg-gradient-to-l from-transparent to-[#d9a85e]/60" />
              </motion.div>
            )}

            {/* Main Statement (Single line on desktop/laptop, fluid responsive clamp) */}
            <motion.h2
              className="intro-headline text-[#fff5ea] max-w-full drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] flex flex-wrap justify-center gap-x-2 gap-y-1.5"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: prefersReduced ? 0 : 0.07,
                    delayChildren: 0.2,
                  },
                },
              }}
            >
              {words.map((word, wIdx) => {
                const isHeartWord = word.includes("♡") || word.includes("❤️") || word.includes("♥");
                const isSparkleWord = word.includes("✨");

                return (
                  <motion.span
                    key={wIdx}
                    variants={{
                      hidden: {
                        opacity: 0,
                        y: prefersReduced ? 0 : 14,
                      },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.55,
                          ease: [0.16, 1, 0.3, 1],
                        },
                      },
                    }}
                    className={`inline-block ${
                      isHeartWord
                        ? "text-rose-400 drop-shadow-[0_0_12px_rgba(244,114,182,0.9)]"
                        : isSparkleWord
                        ? "text-[#fed7aa] drop-shadow-[0_0_12px_rgba(254,215,170,0.85)]"
                        : ""
                    }`}
                  >
                    {isHeartWord ? (
                      <motion.span
                        animate={prefersReduced ? {} : { scale: [1, 1.22, 1] }}
                        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                        className="inline-block"
                      >
                        {word}
                      </motion.span>
                    ) : isSparkleWord ? (
                      <motion.span
                        animate={prefersReduced ? {} : { rotate: [0, 14, -14, 0], scale: [1, 1.15, 1] }}
                        transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                        className="inline-block"
                      >
                        {word}
                      </motion.span>
                    ) : (
                      word
                    )}
                  </motion.span>
                );
              })}
            </motion.h2>

            {/* Emotional supporting subtext */}
            {currentScene.subtext && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.85, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7 }}
                className="mt-3.5 text-xs sm:text-sm font-sans text-rose-200/80 tracking-wide max-w-md leading-relaxed"
              >
                {currentScene.subtext}
              </motion.p>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* 4. Balanced Bottom Spacer (No Continue button or manual indicator) */}
      <div className="h-6 shrink-0" aria-hidden="true" />
    </div>
  );
}
