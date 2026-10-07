import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface CinematicScrollSceneProps {
  children: React.ReactNode;
  backgroundContent?: React.ReactNode;
  midgroundContent?: React.ReactNode;
  foregroundContent?: React.ReactNode;
  className?: string;
}

export function CinematicScrollScene({
  children,
  backgroundContent,
  midgroundContent,
  foregroundContent,
  className = "",
}: CinematicScrollSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Scroll World layered depth transformation:
  // Background moves slowest (depth illusion)
  const bgY = useTransform(scrollYProgress, [0, 1], [-20, 20]);
  // Midground moves moderately
  const midY = useTransform(scrollYProgress, [0, 1], [-45, 45]);
  // Foreground particles move fastest (closest to camera)
  const fgY = useTransform(scrollYProgress, [0, 1], [-90, 90]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className}`}
    >
      {/* 1. BACKGROUND LAYER (Slowest parallax) */}
      {backgroundContent && (
        <motion.div
          style={{ y: bgY }}
          className="absolute inset-0 pointer-events-none z-0 will-change-transform"
        >
          {backgroundContent}
        </motion.div>
      )}

      {/* 2. MIDGROUND LAYER (Moderate parallax: vines, lanterns, ambient light) */}
      {midgroundContent && (
        <motion.div
          style={{ y: midY }}
          className="absolute inset-0 pointer-events-none z-10 will-change-transform"
        >
          {midgroundContent}
        </motion.div>
      )}

      {/* 3. CONTENT LAYER (Interactive UI) */}
      <div className="relative z-20 w-full">{children}</div>

      {/* 4. FOREGROUND LAYER (Fastest parallax: petals, bokeh, light leaks) */}
      {foregroundContent && (
        <motion.div
          style={{ y: fgY }}
          className="absolute inset-0 pointer-events-none z-30 will-change-transform"
        >
          {foregroundContent}
        </motion.div>
      )}
    </div>
  );
}

export default CinematicScrollScene;
