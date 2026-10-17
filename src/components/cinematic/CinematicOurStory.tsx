import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Sparkles, Calendar, Compass, Image as ImageIcon } from "lucide-react";
import { stories } from "../../data/content";
import { PremiumButton } from "../PremiumButton";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

interface SafeImageProps {
  src: string;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
}

function SafeImage({ src, alt, className, fallbackSrc }: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setErr(false);
    setLoaded(false);
  }, [src]);

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else if (currentSrc.includes("stoty")) {
      setCurrentSrc(currentSrc.replace("stoty", "story"));
    } else if (currentSrc.endsWith(".png")) {
      setCurrentSrc(currentSrc.replace(/\.png$/, ".webp"));
    } else if (currentSrc.endsWith(".webp")) {
      setCurrentSrc(currentSrc.replace(/\.webp$/, ".jpg"));
    } else {
      setErr(true);
    }
  };

  if (err || !currentSrc) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-[#2a0820] to-[#0d0312]",
          className
        )}
      >
        <ImageIcon className="h-10 w-10 text-rose-300/30" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-black/40">
      {!loaded && (
        <div className="absolute inset-0 bg-stone-900/40 animate-pulse pointer-events-none" />
      )}
      <img
        src={currentSrc}
        alt={alt || ""}
        className={cn(
          className,
          "transition-all duration-700",
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
        )}
        onError={handleError}
        onLoad={() => setLoaded(true)}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

interface CinematicOurStoryProps {
  onContinue: () => void;
}

export function CinematicOurStory({ onContinue }: CinematicOurStoryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const milestones = stories;

  return (
    <div
      ref={containerRef}
      className="scene-container relative min-h-screen min-h-[100dvh] bg-[#070209] text-white overflow-x-hidden overflow-y-auto select-none"
    >
      {/* 1. CINEMATIC MULTI-LAYER AMBIENT ATMOSPHERE */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Deep romantic gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#130310] via-[#1c061a] to-[#070209]" />
        {/* Soft champagne & rose radial spotlights */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(217,168,94,0.12)_0%,rgba(244,114,182,0.08)_40%,transparent_75%)] blur-2xl" />
        <div className="absolute top-[50%] left-[20%] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(159,18,57,0.14)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute bottom-[10%] right-[15%] w-[700px] h-[700px] bg-[radial-gradient(circle_at_center,rgba(217,168,94,0.1)_0%,transparent_70%)] blur-3xl" />
        {/* Vignette frame */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(5,1,6,0.85)_100%)]" />
      </div>

      {/* Floating Stardust Particles */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {[...Array(16)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-amber-200/40"
            style={{
              width: `${(i % 3) + 2}px`,
              height: `${(i % 3) + 2}px`,
              left: `${(i * 17) % 96}%`,
              top: `${(i * 23) % 94}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.7, 0.2],
              scale: [0.9, 1.2, 0.9],
            }}
            transition={{
              duration: 4 + (i % 4) * 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: (i % 5) * 0.6,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col items-center">
        {/* 2. EDITORIAL PAGE HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-14 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-[#d9a85e]/30 backdrop-blur-md mb-4 shadow-[0_4px_20px_rgba(217,168,94,0.15)]">
            <Sparkles size={12} className="text-gold" />
            <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.28em] uppercase text-[#fed7aa] font-semibold">
              OUR CHERISHED JOURNEY
            </span>
            <Sparkles size={12} className="text-gold" />
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
            The Story of Us
          </h1>

          <p className="mt-3 sm:mt-4 text-xs sm:text-base font-serif italic text-rose-100/85 leading-relaxed max-w-lg mx-auto">
            "Every memory, every whispered conversation, and every glance that brought us to this beautiful day."
          </p>

          <div className="flex items-center justify-center gap-3 mt-5">
            <span className="w-12 sm:w-20 h-[1px] bg-gradient-to-r from-transparent via-[#d9a85e]/60 to-transparent" />
            <Heart size={14} className="text-rose-400 fill-rose-400/80 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            <span className="w-12 sm:w-20 h-[1px] bg-gradient-to-r from-transparent via-[#d9a85e]/60 to-transparent" />
          </div>
        </motion.div>

        {/* 3. EDITORIAL TIMELINE / STORY CHAPTERS */}
        <div className="w-full relative">
          {/* Central Golden Spine on Desktop (>= 768px) */}
          <div className="hidden md:block absolute left-1/2 top-4 bottom-20 -translate-x-1/2 w-[2px] bg-gradient-to-b from-transparent via-[#d9a85e]/60 to-[#d9a85e]/10 pointer-events-none" />

          {/* Left Golden Spine on Mobile (< 768px) */}
          <div className="md:hidden absolute left-4 top-2 bottom-16 w-[2px] bg-gradient-to-b from-[#d9a85e]/70 via-[#d9a85e]/50 to-transparent pointer-events-none" />

          <div className="space-y-16 sm:space-y-24 md:space-y-32">
            {milestones.map((item, idx) => {
              const isEven = idx % 2 === 0;
              const isConclusion = item.index === "08";

              // -------------------------------------------------------------
              // CHAPTER 8: GRAND ROMANTIC CONCLUSION CLIMAX
              // -------------------------------------------------------------
              if (isConclusion) {
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 35 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full max-w-3xl mx-auto pt-8 pb-12 flex flex-col items-center text-center pl-8 md:pl-0"
                  >
                    {/* Glowing Milestone Marker */}
                    <div className="md:absolute md:left-1/2 md:top-0 md:-translate-x-1/2 absolute left-4 top-8 -translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 shadow-[0_0_20px_#d9a85e] border-2 border-[#160314] z-20" />

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-300 text-[10px] font-mono tracking-widest uppercase mb-3">
                      <span>THE CHAPTERS AHEAD</span>
                    </div>

                    <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#fff4e3] leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.85)]">
                      {item.label}
                    </h2>

                    <p className="font-serif italic text-base sm:text-xl text-rose-200/90 mt-2 mb-6">
                      "This isn't the end of our story..."
                    </p>

                    {/* Cascading Memory Mosaic */}
                    <div className="relative w-full max-w-lg sm:max-w-xl h-72 sm:h-96 my-4 flex items-center justify-center">
                      <motion.div
                        whileHover={{ scale: 1.05, rotate: -6 }}
                        className="absolute left-2 sm:left-6 w-40 sm:w-52 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#d9a85e]/60 shadow-[0_15px_35px_rgba(0,0,0,0.85)] rotate-[-6deg] bg-black/60"
                      >
                        <SafeImage
                          src="/story/story 1.png"
                          alt="First Chat"
                          className="w-full h-full object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                          <span className="text-xs font-serif text-rose-100 font-semibold">First Chat</span>
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05, rotate: 6 }}
                        className="absolute right-2 sm:right-6 w-40 sm:w-52 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#d9a85e]/60 shadow-[0_15px_35px_rgba(0,0,0,0.85)] rotate-[6deg] bg-black/60"
                      >
                        <SafeImage
                          src="/story/story 2.png"
                          alt="First Call"
                          className="w-full h-full object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                          <span className="text-xs font-serif text-rose-100 font-semibold">First Call</span>
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.08, rotate: 0 }}
                        className="relative z-10 w-48 sm:w-60 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-gold shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_35px_rgba(217,168,94,0.35)] bg-black"
                      >
                        <SafeImage
                          src="/story/story 7.png"
                          alt="Our Future"
                          className="w-full h-full object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-3.5">
                          <span className="text-xs sm:text-sm font-serif text-[#fed7aa] font-bold">Our Beautiful Tomorrow</span>
                        </div>
                      </motion.div>
                    </div>

                    <div className="mt-6 max-w-lg mx-auto bg-gradient-to-b from-[#21091f]/90 via-[#150514]/90 to-[#0e020d] border border-[#d9a85e]/30 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md">
                      <p className="font-serif italic text-sm sm:text-base text-rose-100/90 leading-relaxed">
                        "There are still so many moments waiting for us. Every road, every quiet sunset, and every shared dream will be ours to live."
                      </p>
                      <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-gold/80 mt-3 font-semibold">
                        OUR STORY IS JUST BEGINNING ✧
                      </p>
                    </div>

                    <div className="mt-8">
                      <PremiumButton
                        variant="gold"
                        size="lg"
                        onClick={onContinue}
                        className="btn-breathe-glow min-h-[48px] px-8"
                      >
                        <span>Walk Down Memory Lane 📸</span>
                        <ArrowRight size={16} />
                      </PremiumButton>
                    </div>
                  </motion.div>
                );
              }

              // -------------------------------------------------------------
              // CHAPTERS 01 TO 07: EDITORIAL MEMORY COMPOSITION
              // -------------------------------------------------------------
              return (
                <div
                  key={item.label}
                  className="relative flex flex-col md:flex-row items-center gap-6 sm:gap-10 md:gap-16 w-full pl-8 md:pl-0"
                >
                  {/* Glowing Timeline Marker */}
                  <div className="md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 absolute left-4 top-8 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-tr from-[#d9a85e] to-rose-400 shadow-[0_0_12px_rgba(217,168,94,0.7)] border-2 border-[#160314] z-20" />

                  {/* Desktop Alternating: Even is Photo Left, Odd is Photo Right */}
                  {/* Photo Panel */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      "w-full md:w-1/2 flex",
                      isEven ? "md:order-1 md:justify-end" : "md:order-2 md:justify-start"
                    )}
                  >
                    <div className="group relative w-full max-w-[400px] sm:max-w-[480px] lg:max-w-[530px] rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 bg-gradient-to-b from-[#2e0e2a]/90 via-[#1a0618]/90 to-[#0e020c] border-2 border-[#d9a85e]/45 hover:border-gold shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(217,168,94,0.25)] hover:shadow-[0_30px_75px_rgba(217,168,94,0.35)] transition-all duration-500">
                      {/* Photo Container with Portrait-Friendly Large Dimensions */}
                      <div className="relative aspect-[3/4] sm:aspect-[4/5] min-h-[360px] sm:min-h-[460px] lg:min-h-[500px] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-black shadow-inner flex items-center justify-center">
                        {/* Ambient blurred backdrop so any aspect ratio looks complete and uncropped */}
                        <img
                          src={item.image}
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
                        />
                        <SafeImage
                          src={item.image}
                          alt={item.label}
                          className="relative z-10 w-full h-full object-contain sm:object-cover object-top sm:object-center group-hover:scale-[1.03] transition-transform duration-700 filter contrast-[103%]"
                        />
                        {/* Soft Gradient Vignette */}
                        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-black/25 pointer-events-none" />

                        {/* Chapter Pill Badge */}
                        <div className="absolute top-3.5 left-3.5 z-20 px-3.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-gold/40 text-[10px] sm:text-[11px] font-mono tracking-widest text-[#fed7aa] uppercase font-semibold shadow-lg">
                          CHAPTER {item.index}
                        </div>

                        {/* Title Watermark on Bottom */}
                        <div className="absolute bottom-3.5 left-3.5 right-3.5 z-20 flex items-center justify-between text-white pointer-events-none">
                          <span className="font-serif text-sm sm:text-lg font-bold text-[#fff7ed] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                            {item.label}
                          </span>
                          <Heart size={15} className="text-rose-400 fill-rose-400 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]" />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Text Story Panel */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? 30 : -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      "w-full md:w-1/2 flex flex-col",
                      isEven ? "md:order-2 md:items-start md:text-left" : "md:order-1 md:items-end md:text-right"
                    )}
                  >
                    <div className="w-full max-w-lg lg:max-w-xl">
                      {/* Subtitle / Date Badge */}
                      <div
                        className={cn(
                          "flex items-center gap-2 mb-2",
                          isEven ? "md:justify-start" : "md:justify-end"
                        )}
                      >
                        <div className="px-3 py-1 rounded-full bg-[#d9a85e]/15 border border-[#d9a85e]/30 flex items-center gap-1.5 shadow-sm">
                          <Calendar size={13} className="text-gold" />
                          <span className="font-serif italic text-xs sm:text-sm text-[#fed7aa] font-medium tracking-wide">
                            {item.date}
                          </span>
                        </div>
                      </div>

                      {/* Main Title */}
                      <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                        {item.label}
                      </h2>

                      {/* Story Card */}
                      <div className="mt-3.5 sm:mt-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-white/[0.08] via-white/[0.04] to-black/30 border border-white/15 hover:border-[#d9a85e]/50 backdrop-blur-md shadow-[0_12px_35px_rgba(0,0,0,0.7)] transition-all">
                        <p className="font-serif text-sm sm:text-base lg:text-[17px] leading-relaxed text-rose-100/95 font-normal">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CinematicOurStory;
