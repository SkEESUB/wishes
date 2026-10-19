import React, { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { CosmicStarfield } from "./CosmicStarfield";

interface CosmicStoryIntroSceneProps {
  page: 1 | 2;
  onContinue: () => void;
  onBack?: () => void;
}

export function CosmicStoryIntroScene({
  page,
  onContinue,
  onBack,
}: CosmicStoryIntroSceneProps) {
  const hasNavigatedRef = useRef(false);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleNext = useCallback(() => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    onContinue();
  }, [onContinue]);

  const handleBack = useCallback(() => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    onBack?.();
  }, [onBack]);

  useEffect(() => {
    hasNavigatedRef.current = false;
  }, [page]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" && onBack) {
      e.preventDefault();
      handleBack();
    }
  };

  const config =
    page === 1
      ? {
          chapter: "A QUIET MOMENT",
          headline: "Some moments are beautiful...",
          supporting: "A quiet breath before the celebration begins.",
        }
      : {
          chapter: "UNFORGETTABLE",
          headline: "But some people make those moments unforgettable.",
          supporting: "And every day with you has become my favorite memory.",
        };

  return (
    <div
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label={`Introduction Part ${page}: ${config.chapter}`}
      aria-live="polite"
      className="scene-container relative h-[100dvh] max-h-[100dvh] w-full overflow-hidden select-none flex flex-col items-center justify-between p-5 sm:p-8 cursor-default focus:outline-none"
      style={{
        backgroundColor: "#050407",
        paddingBottom: "max(1.75rem, calc(1rem + env(safe-area-inset-bottom, 0px)))",
        paddingTop: "max(1.5rem, calc(0.75rem + env(safe-area-inset-top, 0px)))",
      }}
    >
      {/* 1. Black Cosmic Background with Twinkling Stars (No Shooting Stars) */}
      <CosmicStarfield showShootingStars={false} twinkleCount={60} />

      {/* 2. Top Navigation Bar (Back) */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between shrink-0 px-2 sm:px-4">
        {onBack && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              handleBack();
            }}
            className="min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-serif text-[#fff5ea]/75 hover:text-[#fff5ea] bg-black/40 hover:bg-black/60 border border-[rgba(217,168,94,0.25)] hover:border-[rgba(217,168,94,0.55)] backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            aria-label="Go back to previous page"
          >
            <ArrowLeft size={13} />
            <span>Back</span>
          </motion.button>
        )}
      </div>

      {/* 3. Centerstage: Elegant Centered Typography */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center justify-center my-auto px-4 text-center w-full">
        <motion.div
          key={`intro-page-${page}`}
          initial={
            prefersReduced
              ? { opacity: 0 }
              : { opacity: 0, y: 16, filter: "blur(6px)" }
          }
          animate={
            prefersReduced
              ? { opacity: 1 }
              : { opacity: 1, y: 0, filter: "blur(0px)" }
          }
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center w-full max-w-3xl"
        >
          {/* Chapter Label */}
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4 text-[#d9a85e]">
            <span className="w-6 sm:w-10 h-[1px] bg-gradient-to-r from-transparent to-[#d9a85e]/60" />
            <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#fed7aa] drop-shadow-[0_0_8px_rgba(217,168,94,0.4)]">
              ✦ {config.chapter} ✦
            </span>
            <span className="w-6 sm:w-10 h-[1px] bg-gradient-to-l from-transparent to-[#d9a85e]/60" />
          </div>

          {/* Headline: Single line on desktop/laptop, fluid responsive clamp */}
          <h1 className="intro-headline text-[#fff5ea] max-w-full px-2">
            “{config.headline}”
          </h1>

          {/* Supporting Text */}
          <p className="mt-3.5 sm:mt-4 text-xs sm:text-sm md:text-base font-serif italic text-rose-100/80 tracking-wide max-w-md mx-auto leading-relaxed">
            {config.supporting}
          </p>
        </motion.div>
      </div>

      {/* 4. Bottom Continue Action */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative z-10 w-full flex items-center justify-center shrink-0 pt-2 pb-1"
      >
        <button
          onClick={handleNext}
          className="btn-cinematic-pill cursor-pointer"
          aria-label={page === 1 ? "Continue to next reflection" : "Continue to our videos"}
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4 text-[#fed7aa] ml-0.5 inline-block" />
        </button>
      </motion.div>
    </div>
  );
}

export default CosmicStoryIntroScene;
