import { useState, useRef, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Sparkles, Calendar, Image as ImageIcon } from "lucide-react";
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

const SafeImage = memo(function SafeImage({ src, alt, className, fallbackSrc }: SafeImageProps) {
  // Prefer WebP version if available for 10x faster mobile decoding
  const initialSrc = src.endsWith(".png") ? src.replace(/\.png$/, ".webp") : src;
  const [currentSrc, setCurrentSrc] = useState(initialSrc);
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState(false);

  useEffect(() => {
    const webpSrc = src.endsWith(".png") ? src.replace(/\.png$/, ".webp") : src;
    setCurrentSrc(webpSrc);
    setErr(false);
    setLoaded(false);
  }, [src]);

  const handleError = () => {
    // If WebP fails, try original PNG; if PNG fails, try fallbackSrc
    if (currentSrc.endsWith(".webp")) {
      setCurrentSrc(currentSrc.replace(/\.webp$/, ".png"));
    } else if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
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
        <div className="absolute inset-0 bg-stone-900/30 animate-pulse pointer-events-none" />
      )}
      <img
        src={currentSrc}
        alt={alt || ""}
        className={cn(
          className,
          "transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0"
        )}
        onError={handleError}
        onLoad={() => setLoaded(true)}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
});

interface CinematicOurStoryProps {
  onContinue: () => void;
}

export function CinematicOurStory({ onContinue }: CinematicOurStoryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const milestones = stories;
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div
      ref={containerRef}
      className="scene-container relative min-h-screen min-h-[100dvh] bg-[#070209] text-white overflow-x-hidden overflow-y-auto select-none"
    >
      {/* 1. CINEMATIC LIGHTWEIGHT AMBIENT ATMOSPHERE (No heavy blur-3xl repaint lag) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Deep romantic gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#130310] via-[#1c061a] to-[#070209]" />
        {/* Soft champagne & rose radial spotlights (Clean gradients without blur-3xl GPU invalidation) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-[radial-gradient(ellipse_at_center,rgba(217,168,94,0.12)_0%,rgba(244,114,182,0.06)_45%,transparent_70%)]" />
        <div className="absolute top-[45%] left-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(159,18,57,0.12)_0%,transparent_70%)]" />
        <div className="absolute bottom-[5%] right-0 w-[650px] h-[650px] bg-[radial-gradient(circle_at_center,rgba(217,168,94,0.1)_0%,transparent_70%)]" />
        {/* Vignette frame */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(5,1,6,0.85)_100%)]" />
      </div>

      {/* Lightweight CSS Stardust Points */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-amber-200/40"
            style={{
              width: `${(i % 3) + 2}px`,
              height: `${(i % 3) + 2}px`,
              left: `${(i * 19) % 96}%`,
              top: `${(i * 29) % 94}%`,
              opacity: 0.45,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 py-8 sm:py-14 flex flex-col items-center">
        {/* 2. EDITORIAL PAGE HEADER */}
        <motion.div
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-[#d9a85e]/30 backdrop-blur-md mb-4 shadow-[0_4px_20px_rgba(217,168,94,0.15)]">
            <Sparkles size={12} className="text-[#d9a85e]" />
            <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.28em] uppercase text-[#fed7aa] font-semibold">
              OUR CHERISHED JOURNEY
            </span>
            <Sparkles size={12} className="text-[#d9a85e]" />
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
          <div className="md:hidden absolute left-3.5 sm:left-4 top-2 bottom-16 w-[2px] bg-gradient-to-b from-[#d9a85e]/70 via-[#d9a85e]/50 to-transparent pointer-events-none" />

          <div className="space-y-12 sm:space-y-18 md:space-y-24">
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
                    initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full max-w-3xl mx-auto pt-6 pb-10 flex flex-col items-center text-center pl-7 sm:pl-8 md:pl-0"
                  >
                    {/* Glowing Milestone Marker */}
                    <div className="md:absolute md:left-1/2 md:top-0 md:-translate-x-1/2 absolute left-3.5 sm:left-4 top-6 -translate-x-1/2 w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 shadow-[0_0_16px_#d9a85e] border-2 border-[#160314] z-20" />

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-300 text-[10px] font-mono tracking-widest uppercase mb-3">
                      <span>THE CHAPTERS AHEAD</span>
                    </div>

                    <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-[#fff4e3] leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.85)]">
                      {item.label}
                    </h2>

                    <p className="font-serif italic text-sm sm:text-lg text-rose-200/90 mt-2 mb-4">
                      "This isn't the end of our story..."
                    </p>

                    {/* Cascading Memory Mosaic (Balanced responsive sizing to avoid mobile clipping) */}
                    <div className="relative w-full max-w-md sm:max-w-lg h-64 sm:h-80 md:h-92 my-4 flex items-center justify-center overflow-visible">
                      <div className="story-card-glow absolute left-0 xs:left-2 sm:left-4 w-28 xs:w-32 sm:w-44 md:w-48 aspect-[3/4] rotate-[-5deg] p-1 sm:p-1.5 shadow-xl">
                        <div className="relative z-10 w-full h-full rounded-lg sm:rounded-xl overflow-hidden bg-black/60">
                          <SafeImage
                            src="/story/story 1.webp"
                            fallbackSrc="/story/story 1.png"
                            alt="First Chat"
                            className="w-full h-full object-cover object-top"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2 sm:p-2.5">
                            <span className="text-[10px] sm:text-xs font-serif text-rose-100 font-semibold truncate">First Chat</span>
                          </div>
                        </div>
                      </div>

                      <div className="story-card-glow absolute right-0 xs:right-2 sm:right-4 w-28 xs:w-32 sm:w-44 md:w-48 aspect-[3/4] rotate-[5deg] p-1 sm:p-1.5 shadow-xl">
                        <div className="relative z-10 w-full h-full rounded-lg sm:rounded-xl overflow-hidden bg-black/60">
                          <SafeImage
                            src="/story/story 2.webp"
                            fallbackSrc="/story/story 2.png"
                            alt="First Call"
                            className="w-full h-full object-cover object-top"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2 sm:p-2.5">
                            <span className="text-[10px] sm:text-xs font-serif text-rose-100 font-semibold truncate">First Call</span>
                          </div>
                        </div>
                      </div>

                      <div className="story-card-glow relative z-10 w-36 xs:w-40 sm:w-52 md:w-56 aspect-[3/4] p-1.5 sm:p-2 shadow-2xl">
                        <div className="relative z-10 w-full h-full rounded-lg sm:rounded-xl overflow-hidden bg-black">
                          <SafeImage
                            src="/story/story 7.webp"
                            fallbackSrc="/story/story 7.png"
                            alt="Our Future"
                            className="w-full h-full object-cover object-top"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-2.5 sm:p-3">
                            <span className="text-[11px] sm:text-sm font-serif text-[#fed7aa] font-bold">Our Beautiful Tomorrow</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 max-w-lg mx-auto bg-gradient-to-b from-[#21091f]/90 via-[#150514]/90 to-[#0e020d] border border-[#d9a85e]/30 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md">
                      <p className="font-serif italic text-xs sm:text-base text-rose-100/90 leading-relaxed">
                        "There are still so many moments waiting for us. Every road, every quiet sunset, and every shared dream will be ours to live."
                      </p>
                      <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d9a85e] mt-2.5 font-semibold">
                        OUR STORY IS JUST BEGINNING ✧
                      </p>
                    </div>

                    <div className="mt-7">
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
                  className="relative flex flex-col md:flex-row items-center gap-5 sm:gap-8 md:gap-14 w-full pl-7 sm:pl-8 md:pl-0"
                >
                  {/* Glowing Timeline Marker */}
                  <div className="md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 absolute left-3.5 sm:left-4 top-7 -translate-x-1/2 w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-gradient-to-tr from-[#d9a85e] to-rose-400 shadow-[0_0_12px_rgba(217,168,94,0.7)] border-2 border-[#160314] z-20" />

                  {/* Photo Panel with Refined Dimensions */}
                  <motion.div
                    initial={prefersReduced ? { opacity: 1 } : { opacity: 0, x: isEven ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      "w-full md:w-1/2 flex",
                      isEven ? "md:order-1 md:justify-end" : "md:order-2 md:justify-start"
                    )}
                  >
                    {/* Story Card with Luxury Balanced Proportions */}
                    <div className="group story-card-glow relative w-full max-w-[310px] sm:max-w-[360px] lg:max-w-[390px] p-2 sm:p-2.5">
                      {/* Photo Container with Balanced Portrait Dimensions */}
                      <div className="relative z-10 aspect-[4/5] min-h-[280px] sm:min-h-[330px] lg:min-h-[360px] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-black/90 shadow-inner flex items-center justify-center">
                        {/* Soft subtle radial backdrop */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(217,168,94,0.08)_0%,transparent_75%)] pointer-events-none" />

                        <SafeImage
                          src={item.image}
                          alt={item.label}
                          className="relative z-10 w-full h-full object-contain sm:object-cover object-top sm:object-center group-hover:scale-[1.02] transition-transform duration-500 filter contrast-[103%]"
                        />

                        {/* Soft Gradient Vignette */}
                        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-transparent to-black/25 pointer-events-none" />

                        {/* Chapter Pill Badge */}
                        <div className="absolute top-3 left-3 z-20 px-3 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-[#d9a85e]/40 text-[9px] sm:text-[10px] font-mono tracking-widest text-[#fed7aa] uppercase font-semibold shadow-lg">
                          CHAPTER {item.index}
                        </div>

                        {/* Title Watermark on Bottom */}
                        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between text-white pointer-events-none">
                          <span className="font-serif text-xs sm:text-base font-bold text-[#fff7ed] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] truncate pr-2">
                            {item.label}
                          </span>
                          <Heart size={14} className="text-rose-400 fill-rose-400 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.9)] shrink-0" />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Text Story Panel */}
                  <motion.div
                    initial={prefersReduced ? { opacity: 1 } : { opacity: 0, x: isEven ? 20 : -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.55, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      "w-full md:w-1/2 flex flex-col",
                      isEven ? "md:order-2 md:items-start md:text-left" : "md:order-1 md:items-end md:text-right"
                    )}
                  >
                    <div className="w-full max-w-[320px] sm:max-w-md lg:max-w-lg">
                      {/* Subtitle / Date Badge */}
                      <div
                        className={cn(
                          "flex items-center gap-2 mb-1.5",
                          isEven ? "md:justify-start" : "md:justify-end"
                        )}
                      >
                        <div className="px-2.5 py-0.5 rounded-full bg-[#d9a85e]/15 border border-[#d9a85e]/30 flex items-center gap-1.5 shadow-sm">
                          <Calendar size={12} className="text-[#d9a85e]" />
                          <span className="font-serif italic text-[11px] sm:text-xs text-[#fed7aa] font-medium tracking-wide">
                            {item.date}
                          </span>
                        </div>
                      </div>

                      {/* Main Title */}
                      <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                        {item.label}
                      </h2>

                      {/* Story Card */}
                      <div className="mt-2.5 sm:mt-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-white/[0.08] via-white/[0.04] to-black/30 border border-white/15 hover:border-[#d9a85e]/50 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.7)] transition-all">
                        <p className="font-serif text-xs sm:text-sm lg:text-[15px] leading-relaxed text-rose-100/95 font-normal">
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

