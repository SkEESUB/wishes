import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mic } from "lucide-react";
import { useBlowDetector } from "../../utils/useBlowDetector";
import { birthdayContent } from "../../data/content";
import { NameRibbon } from "../NameRibbon";
import { PremiumButton } from "../PremiumButton";

interface CinematicCakeWishProps {
  onBlown: () => void;
}

export function CinematicCakeWish({ onBlown }: CinematicCakeWishProps) {
  // 7 tall slender candles across the cake
  const candlePositions = [
    { id: 0, x: 43.6, y: 53.2, h: 42, delay: 0 },
    { id: 1, x: 46.1, y: 50.8, h: 48, delay: 0.1 },
    { id: 2, x: 48.7, y: 51.8, h: 46, delay: 0.2 },
    { id: 3, x: 50.3, y: 48.2, h: 54, delay: 0.05 },
    { id: 4, x: 53.4, y: 49.8, h: 50, delay: 0.15 },
    { id: 5, x: 55.6, y: 51.2, h: 47, delay: 0.25 },
    { id: 6, x: 57.0, y: 53.6, h: 42, delay: 0.08 },
  ];

  const [lit, setLit] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [smokePuffs, setSmokePuffs] = useState<{ id: number; x: number; y: number }[]>([]);
  const [micRequestAsked, setMicRequestAsked] = useState(false);
  const [, setStage] = useState<"active" | "smoke" | "sparkles" | "celebrate" | "ready">("active");
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; vx: number; vy: number; color: string; size: number; rot: number; rotSpeed: number }[]>([]);

  const blowCandle = (targetIdx?: number) => {
    if (lit.length === 0) return;
    
    // Choose specific candle or next available
    const candleToBlow = targetIdx !== undefined && lit.includes(targetIdx) ? targetIdx : lit[Math.floor(Math.random() * lit.length)];
    const pos = candlePositions[candleToBlow];

    // Spawn smoke puff
    if (pos) {
      setSmokePuffs((prev) => [...prev, { id: Date.now() + Math.random(), x: pos.x, y: pos.y }]);
    }

    if (lit.length <= 1) {
      // Last candle extinguished!
      setLit([]);
      setStage("smoke");

      setTimeout(() => {
        setStage("sparkles");

        setTimeout(() => {
          setStage("celebrate");

          // Burst confetti
          const colors = ["#d9a85e", "#f43f5e", "#fb7185", "#ffffff", "#fed7aa", "#fbcfe8"];
          const newConfetti = Array.from({ length: 70 }).map((_, i) => ({
            id: i,
            x: 50,
            y: 50,
            vx: (Math.random() - 0.5) * 6,
            vy: -4 - Math.random() * 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 8 + 4,
            rot: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 15,
          }));
          setConfetti(newConfetti);

          setTimeout(() => {
            setStage("ready");
          }, 1200);
        }, 800);
      }, 700);
    } else {
      setLit((prev) => prev.filter((id) => id !== candleToBlow));
    }
  };

  const { start, stop, status, blowIntensity } = useBlowDetector(() => blowCandle());

  useEffect(() => {
    if (!micRequestAsked) {
      setMicRequestAsked(true);
      start();
    }
  }, [micRequestAsked, start]);

  useEffect(() => () => stop(), [stop]);

  useEffect(() => {
    if (lit.length === 0) stop();
  }, [lit.length, stop]);

  // Confetti physics
  useEffect(() => {
    if (confetti.length === 0) return;
    let active = true;
    let raf = 0;
    const update = () => {
      if (!active) return;
      setConfetti((prev) =>
        prev
          .map((c) => ({
            ...c,
            x: c.x + c.vx * 0.15,
            y: c.y + c.vy * 0.15,
            vy: c.vy + 0.12,
            rot: c.rot + c.rotSpeed,
          }))
          .filter((c) => c.y < 110)
      );
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [confetti.length]);

  return (
    <div className="relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden flex flex-col justify-between select-none">
      {/* Background Environmental Plate matching Reference 1 */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/cinematic/cake-wish-clean.jpg"
          alt="Sunset Birthday Cake Setting"
          className="w-full h-full object-cover object-center filter contrast-[102%] brightness-[98%]"
        />
        {/* Soft vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/70 pointer-events-none" />
        
        {/* Room dimming upon extinguishing all candles */}
        <div
          className="absolute inset-0 bg-black/65 transition-opacity duration-1000 pointer-events-none"
          style={{ opacity: lit.length === 0 ? 1 : 0 }}
        />
      </div>

      {/* Floating subtle ambient golden particles */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-amber-200/50"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: "0 0 8px rgba(251, 191, 36, 0.8)",
            }}
            animate={{
              y: [0, -35, 0],
              opacity: [0.2, 0.8, 0.2],
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

      {/* Confetti Particles */}
      {confetti.map((c) => (
        <div
          key={c.id}
          className="absolute pointer-events-none z-40 rounded-sm"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: `${c.size}px`,
            height: `${c.size * 0.7}px`,
            backgroundColor: c.color,
            transform: `rotate(${c.rot}deg)`,
            boxShadow: `0 0 6px ${c.color}`,
          }}
        />
      ))}

      {/* TOP HEADER: Premium NameRibbon & Wish Titles */}
      <header className="relative z-30 pt-6 sm:pt-8 px-4 text-center max-w-2xl mx-auto flex flex-col items-center">
        <NameRibbon
          name={birthdayContent.herName}
          badgeText="A Special Wish For"
          title="Make a Wish & Blow the Candles"
          subtitle={
            lit.length > 0
              ? "Blow softly into your microphone or tap the candles to extinguish them ♥"
              : "Your wishes are whispered into the stars..."
          }
          compact={true}
        />
      </header>

      {/* CENTER INTERACTIVE AREA: Candle Flames & Smoke */}
      <div
        className="relative z-20 flex-1 w-full max-w-4xl mx-auto flex items-center justify-center cursor-pointer"
        onClick={() => blowCandle()}
        role="button"
        tabIndex={0}
        aria-label="Tap to blow out candles"
      >
        {/* Interactive Candle Flames Overlay positioned over the 7 candles */}
        <div className="relative w-full h-[320px] sm:h-[400px] pointer-events-auto">
          {candlePositions.map((candle) => {
            const isLit = lit.includes(candle.id);
            return (
              <div
                key={candle.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer p-3 group"
                style={{
                  left: `${candle.x}%`,
                  top: `${candle.y}%`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  blowCandle(candle.id);
                }}
              >
                {/* Flame Halo & Candle Flame */}
                <AnimatePresence>
                  {isLit && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="relative flex flex-col items-center justify-center"
                    >
                      {/* Dynamic Warm Radial Glow */}
                      <motion.div
                        className="absolute w-20 h-20 -top-5 rounded-full pointer-events-none"
                        style={{
                          background: "radial-gradient(circle, rgba(254, 215, 170, 0.45) 0%, rgba(244, 63, 94, 0.2) 45%, transparent 70%)",
                        }}
                        animate={{
                          scale: [1, 1.18, 0.95, 1.1, 1],
                          opacity: [0.8, 1, 0.75, 0.95, 0.8],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.8 + candle.delay,
                          ease: "easeInOut",
                        }}
                      />

                      {/* Flame Core */}
                      <motion.div
                        className="relative w-3.5 h-7 rounded-full origin-bottom"
                        style={{
                          background: "radial-gradient(ellipse at 50% 80%, #ffffff 0%, #fef08a 35%, #fb923c 70%, #f43f5e 95%)",
                          boxShadow: "0 0 12px #fbbf24, 0 0 20px #f43f5e",
                        }}
                        animate={{
                          scaleY: [1, 1.15, 0.9, 1.08, 1],
                          scaleX: [1, 0.92, 1.05, 0.95, 1],
                          rotate: [-2, 3, -1, 2, -2],
                          y: [0, -1, 1, -1, 0],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.2 + candle.delay * 2,
                          ease: "easeInOut",
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Smoke Puffs */}
          {smokePuffs.map((smoke) => (
            <motion.div
              key={smoke.id}
              className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${smoke.x}%`, top: `${smoke.y}%` }}
              initial={{ opacity: 0.8, y: 0, scale: 0.4 }}
              animate={{ opacity: 0, y: -65, scale: 2.2 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
            >
              <div className="w-6 h-6 rounded-full bg-white/30 filter blur-sm" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* BOTTOM CONTROLS & CTA PILL: Matches Target Reference */}
      <footer className="relative z-30 pb-8 sm:pb-10 px-4 text-center flex flex-col items-center gap-3">
        {/* Microphone status or tip */}
        {lit.length > 0 && status === "listening" && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-gold/30 text-[11px] text-[#fed7aa] backdrop-blur-md">
            <Mic size={12} className="text-gold animate-pulse" />
            <span>Blow softly into mic or tap candles</span>
            {blowIntensity > 0.05 && (
              <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden ml-1">
                <div
                  className="h-full bg-gold transition-all duration-75"
                  style={{ width: `${Math.min(100, blowIntensity * 120)}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Celebratory message when finished */}
        {lit.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-1 mb-1"
          >
            <p className="font-calligraphy text-2xl sm:text-3xl text-[#fef08a] glow-gold">
              ✨ Happy Birthday, {birthdayContent.herName}! ✨
            </p>
            <p className="text-white/70 text-xs font-serif italic">
              Your wishes are whispered into the stars...
            </p>
          </motion.div>
        )}

        {/* CTA Button */}
        {lit.length > 0 ? (
          <PremiumButton
            variant="rose"
            size="md"
            onClick={() => blowCandle()}
          >
            <span className="text-lg">🎂</span>
            <span>Tap the candles or cake to blow them out</span>
            <Sparkles size={15} className="text-amber-200" />
          </PremiumButton>
        ) : (
          <PremiumButton
            variant="gold"
            size="lg"
            onClick={onBlown}
          >
            <span className="text-lg">🍰</span>
            <span>Continue to Cake Cutting →</span>
            <Sparkles size={16} className="text-amber-200" />
          </PremiumButton>
        )}
      </footer>
    </div>
  );
}
