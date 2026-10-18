import { useMemo } from "react";
import { motion } from "framer-motion";

interface CosmicStarfieldProps {
  className?: string;
  twinkleCount?: number;
  showShootingStars?: boolean;
}

export function CosmicStarfield({
  className = "",
  twinkleCount = 55,
  showShootingStars: _showShootingStars = false,
}: CosmicStarfieldProps) {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Generate deterministic star positions for consistency between renders
  const stars = useMemo(() => {
    return Array.from({ length: twinkleCount }, (_, i) => {
      // Deterministic pseudo-random distribution
      const seed1 = ((i * 137.5) % 100);
      const seed2 = ((i * 269.3) % 100);
      const sizeSeed = (i * 17) % 10;
      const size = sizeSeed < 6 ? 1 : sizeSeed < 9 ? 1.5 : 2;
      const duration = 2.8 + (i % 5) * 0.8;
      const delay = (i * 0.35) % 4;
      const isWarmGold = i % 4 === 0;

      return {
        id: i,
        x: seed1,
        y: seed2,
        size,
        duration,
        delay,
        color: isWarmGold ? "#fef3c7" : "#fffdf9",
        maxOpacity: 0.7 + (i % 3) * 0.12,
        minOpacity: 0.12 + (i % 4) * 0.05,
      };
    });
  }, [twinkleCount]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}
      style={{
        background: "radial-gradient(ellipse at 50% 40%, #08060c 0%, #050407 70%, #020204 100%)",
      }}
      aria-hidden="true"
    >
      {/* 1. Extremely subtle, warm champagne-gold ambient highlight (no purple/pink/cyan) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(217, 168, 94, 0.04) 0%, transparent 65%)",
        }}
      />

      {/* 2. Soft cosmic vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050407]/60 via-transparent to-[#050407]/90" />

      {/* 3. Twinkling Subtle Background Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            top: `${star.y}%`,
            left: `${star.x}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.color,
            boxShadow:
              star.size > 1.2
                ? `0 0 4px ${star.color}`
                : "none",
          }}
          animate={
            prefersReduced
              ? { opacity: star.maxOpacity * 0.6 }
              : {
                  opacity: [star.minOpacity, star.maxOpacity, star.minOpacity],
                  scale: star.size > 1 ? [0.9, 1.25, 0.9] : [1, 1, 1],
                }
          }
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* 5. Delicate Floating Stardust Drift */}
      {!prefersReduced &&
        [...Array(6)].map((_, i) => (
          <motion.div
            key={`drift-${i}`}
            className="absolute rounded-full bg-[#fef3c7]"
            style={{
              width: "1.5px",
              height: "1.5px",
              top: `${15 + i * 14}%`,
              left: `${20 + (i * 27) % 65}%`,
              boxShadow: "0 0 6px rgba(254, 240, 138, 0.7)",
            }}
            animate={{
              y: [0, 45, 90],
              x: [0, (i % 2 === 0 ? 12 : -12), (i % 2 === 0 ? 24 : -24)],
              opacity: [0, 0.65, 0],
            }}
            transition={{
              duration: 7 + i * 1.5,
              repeat: Infinity,
              delay: i * 1.8,
              ease: "linear",
            }}
          />
        ))}
    </div>
  );
}

export default CosmicStarfield;
