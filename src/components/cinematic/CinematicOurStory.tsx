import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ArrowRight, Image as ImageIcon, Heart } from "lucide-react";
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
    } else if (currentSrc.endsWith(".webp")) {
      setCurrentSrc(currentSrc.replace(/\.webp$/, ".png"));
    } else if (currentSrc.endsWith(".png")) {
      setCurrentSrc(currentSrc.replace(/\.png$/, ".jpg"));
    } else {
      setErr(true);
    }
  };

  if (err || !currentSrc) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-rose-900/40 to-slate-900",
          className
        )}
      >
        <ImageIcon className="h-10 w-10 text-white/30" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {!loaded && (
        <div className="absolute inset-0 bg-stone-200/20 animate-pulse pointer-events-none" />
      )}
      <img
        src={currentSrc}
        alt={alt || ""}
        className={cn(className, "transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0")}
        onError={handleError}
        onLoad={() => setLoaded(true)}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

interface PolaroidProps {
  image: string;
  caption: string;
  date?: string;
  rotate?: number;
  className?: string;
  onClick?: () => void;
}

function Polaroid({
  image,
  caption,
  rotate = 0,
  className,
  onClick,
}: PolaroidProps) {
  return (
    <motion.button
      whileHover={{ y: -6, scale: 1.03, rotate: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "polaroid block w-full p-2.5 pb-4 text-left border-2 border-[#d9a85e]/40 hover:border-gold rounded-xl bg-gradient-to-b from-[#fdfbf7] to-[#f8f3ea] shadow-[0_14px_35px_rgba(0,0,0,0.65),0_0_15px_rgba(217,168,94,0.15)] ring-1 ring-gold/20 cursor-pointer group focus:outline-none transition-all duration-300",
        className
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className="relative border border-[#d9a85e]/25 group-hover:border-gold/50 p-1 rounded-lg bg-black/5 transition-colors duration-300 overflow-hidden shadow-inner">
        <SafeImage
          src={image}
          alt={caption}
          className="polaroid-img aspect-square w-full rounded-md object-cover filter contrast-[102%] brightness-[98%] group-hover:scale-103 transition-all duration-500"
        />
        {/* Subtle inner gold frame highlight on hover */}
        <div className="absolute inset-0 border border-transparent group-hover:border-gold/30 rounded-lg pointer-events-none transition-colors duration-300" />
      </div>
      <div className="mt-3 flex items-center justify-between px-1.5">
        <span className="font-serif italic text-xs sm:text-sm text-[#451a03] font-bold truncate tracking-wide">
          {caption}
        </span>
        <Heart size={12} className="text-rose-500 fill-rose-500/90 drop-shadow-[0_0_4px_rgba(244,63,94,0.5)]" />
      </div>
    </motion.button>
  );
}

interface CinematicOurStoryProps {
  onContinue: () => void;
}

export function CinematicOurStory({ onContinue }: CinematicOurStoryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileChapter, setMobileChapter] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const milestones = stories;

  // Dynamic backgrounds corresponding to the active index
  const atmospheres = [
    "bg-[#14080e] bg-[radial-gradient(circle_at_center,rgba(212,134,154,0.15),transparent_75%)]", // 1
    "bg-[#0e0c1a] bg-[radial-gradient(circle_at_center,rgba(217,168,94,0.15),transparent_75%)]",  // 2
    "bg-[#1c140a] bg-[radial-gradient(circle_at_center,rgba(243,203,180,0.18),transparent_75%)]", // 3
    "bg-[#07091a] bg-[radial-gradient(circle_at_center,rgba(134,147,204,0.15),transparent_75%)]", // 4
    "bg-[#131a14] bg-[radial-gradient(circle_at_center,rgba(167,243,208,0.15),transparent_75%)]", // 5 (Emerald/Greenish)
    "bg-[#1c112a] bg-[radial-gradient(circle_at_center,rgba(196,181,253,0.15),transparent_75%)]", // 6 (Lavender/Purple)
    "bg-[#25101a] bg-[radial-gradient(circle_at_center,rgba(253,164,196,0.15),transparent_75%)]", // 7 (Pink/Rose)
    "bg-[#1f1112] bg-[radial-gradient(circle_at_center,rgba(217,168,94,0.22),transparent_75%)]",  // 8 (Sunrise gold conclusion)
  ];

  // Track the active milestone as the user scrolls on desktop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = container.querySelectorAll("[data-timeline-card]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-index") || "0", 10);
            setActiveIndex(index);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -20% 0px",
        threshold: 0.1,
      }
    );

    cards.forEach((card) => observer.observe(card));
    return () => {
      cards.forEach((card) => observer.unobserve(card));
    };
  }, []);

  const handleMobileNext = () => {
    if (mobileChapter < milestones.length - 1) {
      const next = mobileChapter + 1;
      setMobileChapter(next);
      setActiveIndex(next);
    }
  };

  const handleMobilePrev = () => {
    if (mobileChapter > 0) {
      const prev = mobileChapter - 1;
      setMobileChapter(prev);
      setActiveIndex(prev);
    }
  };

  return (
    <div className="scene-container relative min-h-screen min-h-[100dvh] bg-[#05060d] text-white overflow-x-hidden overflow-y-auto">
      {/* Smooth Crossfading Atmospheric Backgrounds */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {atmospheres.map((style, idx) => (
          <motion.div
            key={idx}
            className={cn("absolute inset-0 transition-all duration-[1200ms]", style)}
            initial={{ opacity: 0 }}
            animate={{ opacity: activeIndex === idx || mobileChapter === idx ? 1 : 0 }}
            transition={{ duration: 1.2 }}
          />
        ))}
        {/* Top/bottom vignette overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05060d]/70 via-transparent to-[#05060d]/85 pointer-events-none" />
      </div>

      <div
        ref={containerRef}
        className="relative z-10 flex min-h-full flex-1 flex-col items-center p-4 sm:p-6 py-10 sm:py-14 max-w-5xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-14 mt-2 sm:mt-4"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-gold font-medium">Reliving Our Path</span>
          <h2 className="font-serif text-3xl font-bold mt-2 sm:text-5xl gradient-text glow-gold">Our Story</h2>
          <p className="mt-2 text-white/70 text-xs sm:text-sm italic">"The moments that became us"</p>
        </motion.div>

        {/* ======================================================== */}
        {/* MOBILE CONTINUOUS VERTICAL TIMELINE (< 640px)            */}
        {/* ======================================================== */}
        <div className="w-full sm:hidden relative px-2 pb-12">
          {/* Vertical Golden Spine on Left */}
          <div className="absolute left-4 top-2 bottom-6 w-[2px] bg-gradient-to-b from-gold/30 via-gold/80 to-rose-400/30" />

          <div className="space-y-12">
            {milestones.map((item, idx) => {
              if (item.index === "08") {
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.7 }}
                    className="relative pl-9 flex flex-col items-center text-center"
                  >
                    {/* Chapter Node */}
                    <div className="absolute left-[9px] top-1.5 -translate-x-1/2 w-4 h-4 rounded-full bg-gold shadow-[0_0_10px_#d9a85e] border-2 border-midnight z-10" />

                    <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium">
                      Final Chapter
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-champagne mt-0.5">
                      {item.label}
                    </h3>
                    <span className="font-script text-xl text-rose-300 mt-1 block italic">
                      "This isn't the end of our story."
                    </span>

                    {/* Stacked Polaroids on mobile */}
                    <div className="relative w-full max-w-[280px] h-[220px] my-4 flex items-center justify-center">
                      <div className="absolute w-[100px] left-1 top-2">
                        <Polaroid image="/story/story 1.png" caption="First Chat" rotate={-8} />
                      </div>
                      <div className="absolute w-[100px] right-1 top-2">
                        <Polaroid image="/story/story 2.png" caption="First Call" rotate={8} />
                      </div>
                      <div className="absolute w-[115px] z-10 shadow-2xl">
                        <Polaroid image="/story/story 7.png" caption="Our Future" rotate={0} />
                      </div>
                    </div>

                    <p className="font-serif italic text-sm text-white/90 leading-relaxed px-2">
                      "There are still so many moments waiting for us."
                    </p>
                    <p className="text-[10px] text-white/40 tracking-[0.2em] uppercase mt-1 mb-6">
                      Our story is just beginning
                    </p>

                    <PremiumButton variant="gold" size="md" onClick={onContinue} className="w-full min-h-[48px]">
                      <span>Walk Down Memory Lane 📸</span>
                      <ArrowRight size={15} />
                    </PremiumButton>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6 }}
                  className="relative pl-9 flex flex-col"
                >
                  {/* Glowing Node on Line */}
                  <div className="absolute left-[9px] top-1.5 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-gold/90 shadow-[0_0_8px_rgba(217,168,94,0.7)] border-2 border-midnight z-10" />

                  {/* Header Badge */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-semibold">
                      Chapter {item.index}
                    </span>
                    <span className="text-[10px] text-white/40">&bull;</span>
                    <span className="text-[11px] font-script text-rose-300 italic">
                      {item.date}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-white mb-2">
                    {item.label}
                  </h3>

                  {/* Full-width Polaroid Card */}
                  <div className="w-full max-w-[240px] my-1">
                    <Polaroid
                      image={item.image}
                      caption={item.label}
                      rotate={item.rotate ? item.rotate * 0.5 : 0}
                      className="shadow-xl"
                    />
                  </div>

                  {/* Romantic Story Text Box */}
                  <div className="mt-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md text-left shadow-md">
                    <p className="text-xs leading-relaxed text-white/90 font-serif">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* DESKTOP TIMELINE ROADMAP (>= 640px)                      */}
        {/* ======================================================== */}
        <div className="hidden sm:block relative w-full max-w-4xl px-4 space-y-24 mb-16">
          {/* Curved glowing path (SVG) connecting the markers */}
          <div className="absolute left-1/2 top-10 bottom-10 -translate-x-1/2 pointer-events-none w-[20px]">
            <svg className="w-full h-full" overflow="visible" preserveAspectRatio="none" viewBox="0 0 20 1000">
              <defs>
                <linearGradient id="goldPathGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d9a85e" stopOpacity="0.1" />
                  <stop offset="25%" stopColor="#d9a85e" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#d4869a" stopOpacity="0.8" />
                  <stop offset="75%" stopColor="#d9a85e" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#d9a85e" stopOpacity="0.15" />
                </linearGradient>
              </defs>
              <path
                d="M 10,0 C -5,150 25,300 10,450 C -5,600 25,750 10,900 L 10,1000"
                fill="none"
                stroke="url(#goldPathGrad)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>
          </div>

          {milestones.map((item, i) => {
            const isEven = i % 2 === 0;
            const isMarkerActive = activeIndex === i;

            // Render Chapter 8 conclusion custom layout
            if (item.index === "08") {
              return (
                <div
                  key={item.label}
                  data-timeline-card
                  data-index={i}
                  className="w-full flex flex-col items-center text-center py-12 relative min-h-[70vh] justify-center"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-2xl"
                  >
                    <span className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-1 block">
                      Chapter {item.index}
                    </span>
                    <h3 className="font-serif text-3xl sm:text-4xl font-bold text-champagne/90 leading-tight">
                      {item.label}
                    </h3>
                    <span className="font-script text-2xl text-rose mt-2 block italic">
                      "This isn't the end of our story."
                    </span>
                  </motion.div>

                  <div className="relative w-full max-w-lg h-[280px] sm:h-[340px] mt-10 overflow-visible flex items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, rotate: -20, x: 0 }}
                      whileInView={{ opacity: 1, scale: 1, rotate: -10, x: -90, y: -20 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.0, ease: "easeOut" }}
                      className="absolute w-[100px] sm:w-[130px] pointer-events-auto"
                    >
                      <Polaroid image="/story/story 1.png" caption="First Chat" rotate={-8} />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, rotate: 20, x: 0 }}
                      whileInView={{ opacity: 1, scale: 1, rotate: 12, x: 90, y: -40 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.0, ease: "easeOut" }}
                      className="absolute w-[100px] sm:w-[130px] pointer-events-auto"
                    >
                      <Polaroid image="/story/story 2.png" caption="First Call" rotate={10} />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, rotate: -15, x: 0 }}
                      whileInView={{ opacity: 1, scale: 1, rotate: -6, x: -70, y: 70 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.0, ease: "easeOut", delay: 0.15 }}
                      className="absolute w-[100px] sm:w-[130px] pointer-events-auto"
                    >
                      <Polaroid image="/story/stoty 3.png" caption="First Meet" rotate={-4} />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, rotate: 15, x: 0 }}
                      whileInView={{ opacity: 1, scale: 1, rotate: 8, x: 70, y: 80 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.0, ease: "easeOut", delay: 0.15 }}
                      className="absolute w-[100px] sm:w-[130px] pointer-events-auto"
                    >
                      <Polaroid image="/story/story 4.png" caption="First Trip" rotate={6} />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 30 }}
                      whileInView={{ opacity: 1, scale: 1.05, y: 10 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.0, ease: "easeOut", delay: 0.3 }}
                      className="absolute w-[115px] sm:w-[150px] z-10 pointer-events-auto"
                    >
                      <Polaroid image="/story/story 7.png" caption="Our Future" rotate={2} />
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mt-14 max-w-md px-4"
                  >
                    <p className="font-serif italic text-lg sm:text-xl text-white/95 leading-relaxed">
                      "There are still so many moments waiting for us."
                    </p>
                    <p className="text-[10px] text-white/40 tracking-[0.2em] uppercase mt-2">
                      Our story is just beginning
                    </p>
                  </motion.div>
                </div>
              );
            }

            return (
              <div
                key={item.label}
                data-timeline-card
                data-index={i}
                className={cn(
                  "relative flex flex-col sm:flex-row items-center gap-8 w-full",
                  isEven ? "sm:flex-row" : "sm:flex-row-reverse"
                )}
              >
                <span
                  className="absolute text-8xl sm:text-[10rem] font-serif font-black text-white/5 opacity-[0.03] pointer-events-none select-none"
                  style={{
                    left: isEven ? "calc(50% + 2rem)" : "auto",
                    right: isEven ? "auto" : "calc(50% + 2rem)",
                  }}
                >
                  {item.index}
                </span>

                {/* Text Content Panel */}
                <div
                  className={cn(
                    "w-full sm:w-1/2 flex flex-col px-4 text-center sm:text-left",
                    isEven ? "sm:items-end sm:text-right" : "sm:items-start"
                  )}
                >
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.6 }}
                    className="text-xs uppercase tracking-[0.2em] text-gold font-medium"
                  >
                    Chapter {item.index}
                  </motion.span>

                  <motion.h3
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1"
                  >
                    {item.label}
                  </motion.h3>

                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="font-script text-xl text-rose mt-1 block"
                  >
                    {item.date}
                  </motion.span>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="mt-4 p-5 rounded-2xl glass-premium border border-white/5 max-w-sm shadow-md bg-midnight/35 min-h-[4.5rem]"
                  >
                    <p className="text-sm leading-relaxed text-white/80 font-sans">
                      {item.description}
                    </p>
                  </motion.div>
                </div>

                {/* Connector point on line */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <motion.div
                    animate={isMarkerActive ? { scale: 1.35 } : { scale: 1 }}
                    className={cn(
                      "w-3.5 h-3.5 rounded-full border-4 border-midnight transition-colors duration-500",
                      isMarkerActive ? "bg-gold shadow-[0_0_10px_#d9a85e]" : "bg-gold/30"
                    )}
                  />
                </div>

                {/* Polaroid Photo Panel */}
                <div className="w-full sm:w-1/2 flex justify-center px-4">
                  <div className="max-w-[210px] w-full">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)", rotate: 0 }}
                      whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)", rotate: item.rotate }}
                      viewport={{ once: true, amount: 0.15 }}
                      transition={{ duration: 1.0, ease: "easeOut" }}
                    >
                      <Polaroid
                        image={item.image}
                        caption={item.label}
                        rotate={0}
                        className="shadow-xl"
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Scroll End Continue trigger */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="hidden sm:flex flex-col items-center mt-4 pb-12 relative z-30"
        >
          <PremiumButton variant="gold" size="lg" onClick={onContinue}>
            <span>Walk Down Memory Lane 📸</span>
            <ArrowRight size={16} />
          </PremiumButton>
        </motion.div>
      </div>
    </div>
  );
}

export default CinematicOurStory;
