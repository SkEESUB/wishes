import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { birthdayContent } from "../../data/content";
import { NameRibbon } from "../NameRibbon";
import { PremiumButton } from "../PremiumButton";

interface CinematicCakeCutProps {
  stage: number;
  onStage: (n: number) => void;
  onComplete?: () => void;
}

export function CinematicCakeCut({ stage, onStage, onComplete }: CinematicCakeCutProps) {
  const [isCutting, setIsCutting] = useState(false);
  const [cutStep, setCutStep] = useState(stage >= 5 ? 3 : stage); // 0: initial, 1: knife moved, 2: sliced, 3: slice pulled
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; vx: number; vy: number; color: string; size: number }[]>([]);

  const spawnParticles = (x: number, y: number, count = 28) => {
    const colors = ["#d9a85e", "#f43f5e", "#fed7aa", "#ffffff", "#fda4af", "#b91c1c"];
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 30,
      vx: (Math.random() - 0.5) * 7,
      vy: -2 - Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 5 + 3,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
  };

  const handleCut = () => {
    if (isCutting || cutStep >= 3) return;

    setIsCutting(true);

    // Step 1: Knife lifts and moves above cake
    setCutStep(1);
    onStage(1);

    setTimeout(() => {
      // Step 2: Knife slices down through cake
      setCutStep(2);
      onStage(2);
      spawnParticles(50, 55, 32);

      setTimeout(() => {
        // Step 3: Slice pulls away, exposing inside layers
        setCutStep(3);
        onStage(5);
        spawnParticles(55, 60, 36);
        setIsCutting(false);
      }, 900);
    }, 800);
  };

  // Particle physics
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
            x: p.x + p.vx * 0.15,
            y: p.y + p.vy * 0.15,
            vy: p.vy + 0.14,
          }))
          .filter((p) => p.y < 110)
      );
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [particles.length]);

  return (
    <div className="relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden flex flex-col justify-between select-none">
      {/* Background Environment Plate matching Reference 2 */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/cinematic/cake-cut-clean.jpg"
          alt="Sunset Cake Cutting Atmosphere"
          className="w-full h-full object-cover object-center filter contrast-[102%] brightness-[98%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/70 pointer-events-none" />
      </div>

      {/* Floating subtle ambient particles */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-rose-200/50"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: "0 0 8px rgba(244, 63, 94, 0.6)",
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.75, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Crumb & Sparkle Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute pointer-events-none z-40 rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            boxShadow: `0 0 8px ${p.color}`,
          }}
        />
      ))}

      {/* TOP HEADER: Matches Target Reference 2 */}
      <header className="relative z-30 pt-6 sm:pt-8 px-4 text-center max-w-2xl mx-auto flex flex-col items-center">
        <NameRibbon
          name={birthdayContent.herName}
          badgeText="Shared Sweetness"
          title="Cake Cutting Time"
          subtitle={
            cutStep >= 3
              ? "Every slice holds a special reason I adore you ♥"
              : "Let's cut the cake and make this moment sweeter together..."
          }
          compact={true}
        />
      </header>

      {/* CENTER INTERACTIVE AREA: Animated Cake Cutting Action */}
      <div
        className="relative z-20 flex-1 w-full max-w-4xl mx-auto flex items-center justify-center cursor-pointer"
        onClick={handleCut}
        role="button"
        tabIndex={0}
        aria-label="Click to cut the cake"
      >
        <div className="relative w-full max-w-lg h-[280px] sm:h-[340px] flex items-center justify-center">
          {/* Animated Interactive Knife */}
          <motion.div
            className="absolute pointer-events-none z-30"
            initial={{ x: 130, y: 90, rotate: -25, opacity: 0.95 }}
            animate={
              cutStep === 0
                ? { x: 130, y: 90, rotate: -25, opacity: 0.95 }
                : cutStep === 1
                ? { x: 25, y: -45, rotate: -65, scale: 1.1, opacity: 1 }
                : cutStep === 2
                ? { x: 10, y: 35, rotate: -45, scale: 1.05, opacity: 1 }
                : { x: 140, y: 95, rotate: -25, opacity: 0.7 } // Settles back down after cut
            }
            transition={{
              duration: cutStep === 2 ? 0.4 : 0.8,
              ease: cutStep === 2 ? "easeIn" : "easeInOut",
            }}
          >
            {/* Ornate Knife with Pink Ribbon Bow */}
            <svg width="140" height="45" viewBox="0 0 140 45" className="filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
              <defs>
                <linearGradient id="bladeGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#d1d5db" />
                  <stop offset="40%" stopColor="#ffffff" />
                  <stop offset="70%" stopColor="#9ca3af" />
                  <stop offset="100%" stopColor="#f3f4f6" />
                </linearGradient>
                <linearGradient id="handleGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
              </defs>
              {/* Blade */}
              <path d="M 0 20 Q 30 15, 80 18 L 80 26 Q 30 25, 0 20 Z" fill="url(#bladeGrad)" />
              {/* Handle */}
              <rect x="80" y="16" width="45" height="10" rx="4" fill="url(#handleGrad)" />
              {/* Pink Ribbon Bow */}
              <g transform="translate(78, 11)">
                <ellipse cx="6" cy="4" rx="7" ry="4" fill="#f43f5e" transform="rotate(-30 6 4)" />
                <ellipse cx="6" cy="16" rx="7" ry="4" fill="#f43f5e" transform="rotate(30 6 16)" />
                <circle cx="6" cy="10" r="4" fill="#fb7185" />
                <path d="M 6 10 Q 14 18, 18 24" stroke="#f43f5e" strokeWidth="2.5" fill="none" />
                <path d="M 6 10 Q 2 18, 0 24" stroke="#f43f5e" strokeWidth="2.5" fill="none" />
              </g>
            </svg>
          </motion.div>

          {/* Sliced Wedge Separation Animation */}
          <AnimatePresence>
            {cutStep >= 3 && (
              <motion.div
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.95 }}
                animate={{ opacity: 1, x: 45, y: 20, scale: 1.05 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="absolute z-20 pointer-events-none"
                style={{ right: "28%", bottom: "26%" }}
              >
                {/* Dimensional Cut Cake Slice with Interior Layers */}
                <svg width="150" height="120" viewBox="0 0 150 120" className="filter drop-shadow-[0_16px_30px_rgba(0,0,0,0.85)]">
                  <defs>
                    <linearGradient id="chocSponge" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3d141d" />
                      <stop offset="50%" stopColor="#581c2b" />
                      <stop offset="100%" stopColor="#2a0d13" />
                    </linearGradient>
                    <linearGradient id="creamLayer" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fffdf8" />
                      <stop offset="100%" stopColor="#fef3c7" />
                    </linearGradient>
                    <linearGradient id="jamLayer" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#e11d48" />
                      <stop offset="100%" stopColor="#9f1239" />
                    </linearGradient>
                  </defs>
                  {/* Slice Wedge Body */}
                  <path d="M 75 10 L 130 50 L 130 90 L 75 105 L 20 80 L 20 40 Z" fill="#fff" opacity="0.95" />
                  {/* Inside Face (Layers visible) */}
                  <path d="M 75 10 L 75 105 L 20 80 L 20 40 Z" fill="url(#chocSponge)" />
                  {/* Cream & Raspberry Filling Stripes */}
                  <path d="M 20 48 L 75 18 L 75 24 L 20 54 Z" fill="url(#creamLayer)" />
                  <path d="M 20 54 L 75 24 L 75 28 L 20 58 Z" fill="url(#jamLayer)" />
                  <path d="M 20 66 L 75 36 L 75 42 L 20 72 Z" fill="url(#creamLayer)" />
                  <path d="M 20 72 L 75 42 L 75 46 L 20 76 Z" fill="url(#jamLayer)" />
                  {/* Outside Pink Frosting Drip */}
                  <path d="M 75 10 L 130 50 L 130 90 L 75 105 Z" fill="#fda4af" />
                  <path d="M 75 10 L 130 50 L 125 58 Q 115 50, 105 60 Q 95 48, 85 58 L 75 10 Z" fill="#f43f5e" />
                  {/* Strawberry on Top */}
                  <circle cx="75" cy="10" r="10" fill="#dc2626" />
                  <circle cx="73" cy="8" r="2" fill="#fef08a" opacity="0.7" />
                  <circle cx="77" cy="12" r="1.5" fill="#fef08a" opacity="0.7" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* BOTTOM CONTROLS & CTA PILL: Matches Target Reference 2 */}
      <footer className="relative z-30 pb-8 sm:pt-4 sm:pb-10 px-4 text-center flex flex-col items-center gap-3">
        {/* Status Prompt */}
        <div className="min-h-[2.5rem] flex items-center justify-center">
          {cutStep < 3 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs sm:text-sm font-serif italic text-white/80"
            >
              {isCutting ? "Cutting the sweetest birthday slice..." : "Tap the button or cake to make the first cut ♥"}
            </motion.p>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-1"
            >
              <p className="font-calligraphy text-2xl sm:text-3xl text-[#fef08a] glow-gold">
                ✨ Cake Cut with Love ♥ ✨
              </p>
              <p className="text-white/70 text-xs font-serif italic">
                Every slice brings happiness and sweet memories.
              </p>
            </motion.div>
          )}
        </div>

        {/* CTA Button */}
        {cutStep < 3 ? (
          <PremiumButton
            variant="rose"
            size="md"
            onClick={handleCut}
            disabled={isCutting}
          >
            <span className="text-lg">🎂</span>
            <span>Cut the Cake</span>
            <ArrowRight size={16} className="text-rose-200" />
          </PremiumButton>
        ) : (
          <PremiumButton
            variant="gold"
            size="lg"
            onClick={onComplete}
          >
            <span className="text-lg">🎁</span>
            <span>Continue to Gifts →</span>
            <Sparkles size={16} className="text-amber-200" />
          </PremiumButton>
        )}
      </footer>
    </div>
  );
}
