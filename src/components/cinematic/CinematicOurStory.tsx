import { useRef } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles, ChevronDown, ArrowRight } from "lucide-react";
import { stories, birthdayContent } from "../../data/content";
import { NameRibbon } from "../NameRibbon";
import { AmbientParticles } from "../AmbientParticles";
import { PremiumButton } from "../PremiumButton";

interface CinematicOurStoryProps {
  onContinue: () => void;
}

export function CinematicOurStory({ onContinue }: CinematicOurStoryProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getChapterImage = (item: (typeof stories)[0], index: number) => {
    if (index === 0) return "/story/story 1.png";
    if (index === 1) return "/story/story 2.png";
    if (index === 2) return "/story/stoty 3.png";
    return item.image;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen h-auto bg-[#070308] text-white select-none pb-28 overflow-visible"
    >
      {/* 1. CINEMATIC MEMORY WORLD ATMOSPHERE */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/images/cinematic/our-story-clean.jpg"
          alt="Our Story Midnight Background"
          className="w-full h-full object-cover object-center filter contrast-[105%] brightness-[85%]"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        {/* Deep midnight blue, soft burgundy, romantic purple, warm champagne highlights */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060814]/90 via-[#1e0a1c]/65 to-[#08030c]/92" />
        <div
          className="absolute inset-0 opacity-45 mix-blend-screen pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 25%, rgba(136, 19, 55, 0.35) 0%, rgba(217, 168, 94, 0.18) 35%, rgba(15, 23, 42, 0.4) 70%, transparent 100%)",
          }}
        />
        {/* Soft bokeh & cinematic vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.88)_100%)] pointer-events-none" />
      </div>

      {/* 2. FIXED AMBIENT PARTICLES & PETALS */}
      <div className="fixed inset-0 pointer-events-none z-10">
        <AmbientParticles density="medium" petals={true} dots={true} />
      </div>

      {/* 3. TOP HEADER: DECORATIVE HEADER (No Bindu per prompt) */}
      <header className="relative z-20 pt-10 sm:pt-14 px-4 text-center max-w-2xl mx-auto flex flex-col items-center">
        <NameRibbon
          badgeText="OUR MEMORY JOURNEY"
          title="Our Story"
          subtitle="Some moments don't stay in the past — they live in our hearts forever."
        />

        {/* Soft scroll prompt */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="mt-6 flex flex-col items-center gap-1 text-gold/60 text-xs font-serif"
        >
          <span>Scroll down through our memories</span>
          <ChevronDown size={16} className="text-gold/70" />
        </motion.div>
      </header>

      {/* 4. CINEMATIC MEMORY STAGES (Not a standard grid, an emotional sequence of memories) */}
      <div className="relative z-20 max-w-3xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-28 sm:gap-36">
        {stories.map((story, idx) => {
          const imgSrc = getChapterImage(story, idx);
          const rotationAngle = idx % 2 === 0 ? -1.5 : 1.5;

          return (
            <motion.section
              key={story.index}
              initial={{ opacity: 0, y: 60, scale: 0.92, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col items-center text-center"
            >
              {/* Soft Radial Ambient Spotlight behind current memory */}
              <div
                className="absolute inset-0 -m-16 rounded-full pointer-events-none mix-blend-screen opacity-50 blur-3xl"
                style={{
                  background:
                    idx % 2 === 0
                      ? "radial-gradient(circle, rgba(244,63,94,0.25) 0%, transparent 65%)"
                      : "radial-gradient(circle, rgba(217,168,94,0.22) 0%, transparent 65%)",
                }}
              />

              {/* A. MEMORY IMAGE (Tactile high-end physical photograph / memory frame) */}
              <div className="relative group max-w-md w-full flex justify-center mb-6">
                {/* Floating romantic wireframe heart accent */}
                <div className="absolute -top-5 -left-3 sm:-left-6 text-rose-400/50 pointer-events-none select-none">
                  <Heart size={26} className="stroke-1 stroke-rose-400/70 fill-rose-500/10" />
                </div>
                <div className="absolute -bottom-5 -right-3 sm:-right-6 text-amber-300/40 pointer-events-none select-none">
                  <Sparkles size={22} className="text-amber-300" />
                </div>

                <motion.div
                  whileHover={{ scale: 1.03, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-[#faf7f2] p-3.5 sm:p-4.5 pb-8 sm:pb-10 rounded-sm shadow-[0_22px_55px_rgba(0,0,0,0.85),0_0_28px_rgba(217,168,94,0.28)] border border-[#d9a85e]/40 cursor-pointer transition-all duration-300 max-w-[340px] sm:max-w-[400px] w-full"
                  style={{ transform: `rotate(${rotationAngle}deg)` }}
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-xs bg-neutral-900 border border-black/15 shadow-inner">
                    <img
                      src={imgSrc}
                      alt={story.label}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter contrast-[103%] brightness-[98%]"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/images/couple-photo.jpg";
                      }}
                    />
                    {/* Subtle warm foil shine overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-rose-950/20 via-transparent to-amber-100/15 pointer-events-none" />
                  </div>

                  <div className="mt-3.5 px-2 flex items-center justify-between text-[#451a03]">
                    <span className="font-serif italic text-xs sm:text-sm font-semibold truncate">
                      {story.label}
                    </span>
                    <Heart size={12} className="fill-rose-500 text-rose-500" />
                  </div>
                </motion.div>
              </div>

              {/* B. DATE / SMALL LABEL */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15, duration: 0.6 }}
                className="inline-flex items-center justify-center gap-2 px-4 py-1 rounded-full bg-white/[0.07] border border-[#e7b876]/35 backdrop-blur-md mb-2 shadow-sm"
              >
                <Sparkles size={11} className="text-amber-300" />
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#fed7aa] font-bold">
                  Chapter {story.index} • {story.date}
                </span>
                <Sparkles size={11} className="text-amber-300" />
              </motion.div>

              {/* C. CHAPTER TITLE */}
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-wide mt-1 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
              >
                {story.label}
              </motion.h2>

              {/* D. HANDWRITTEN MESSAGE */}
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25, duration: 0.6 }}
                className="font-calligraphy text-2xl sm:text-3xl text-rose-300 glow-rose mt-2 max-w-xl leading-relaxed"
              >
                “{story.description}”
              </motion.p>

              {/* E. CONNECTING STARLIGHT THREAD TO NEXT MEMORY */}
              {idx < stories.length - 1 && (
                <div className="mt-14 sm:mt-18 flex flex-col items-center">
                  <div className="w-[1.5px] h-14 sm:h-20 bg-gradient-to-b from-[#e7b876]/80 via-rose-400/50 to-transparent" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-200 shadow-[0_0_10px_rgba(254,240,138,0.9)] animate-pulse" />
                </div>
              )}
            </motion.section>
          );
        })}
      </div>

      {/* 5. FINALE OF MEMORY JOURNEY & PROCEED CTA */}
      <footer className="relative z-30 pt-16 pb-20 px-4 text-center max-w-xl mx-auto flex flex-col items-center gap-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="p-6 rounded-3xl bg-black/60 border border-[#fef08a]/35 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_35px_rgba(254,240,138,0.25)] flex flex-col items-center gap-2"
        >
          <span className="text-xl">✨</span>
          <h3 className="font-calligraphy text-3xl sm:text-4xl text-[#fef08a] glow-gold leading-tight">
            Every moment with you is my favorite chapter
          </h3>
          <p className="text-xs sm:text-sm font-serif italic text-rose-100/80 max-w-md">
            And the best pages of our story are still waiting to be written...
          </p>
        </motion.div>

        <PremiumButton
          variant="gold"
          size="lg"
          onClick={onContinue}
        >
          <span>Continue Our Journey ♥</span>
          <ArrowRight size={18} />
        </PremiumButton>
      </footer>
    </div>
  );
}

export default CinematicOurStory;
