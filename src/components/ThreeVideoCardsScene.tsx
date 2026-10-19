import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  X,
  Sparkles,
  Film,
  ArrowRight,
  ArrowLeft,
  Heart,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { videosConfig, type VideoMemoryItem, type VideoTransitionConfig } from "../data/videos";
import { PremiumButton } from "./PremiumButton";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

interface ThreeVideoCardsSceneProps {
  onContinue: () => void;
  audio?: any;
}

/* ------------------------------------------------------------------ */
/* Cinematic Transition Typography Component                          */
/* ------------------------------------------------------------------ */

function VideoTransitionTypography({
  config,
  prefersReduced,
}: {
  config: VideoTransitionConfig;
  prefersReduced: boolean;
}) {
  if (config.type === "staggered-words") {
    // Transition 2 — Memories: Staggered word animation
    const words = config.line.split(" ");
    return (
      <div className="flex flex-col items-center text-center">
        <motion.p
          className="font-serif italic text-rose-100 font-normal leading-relaxed text-[clamp(1.25rem,3.2vw,2rem)] max-w-lg mx-auto flex flex-wrap justify-center gap-x-2 gap-y-1 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: prefersReduced ? 0 : 0.08,
                delayChildren: 0.15,
              },
            },
          }}
        >
          {words.map((word, idx) => (
            <motion.span
              key={idx}
              variants={{
                hidden: { opacity: 0, y: prefersReduced ? 0 : 12 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.45, ease: "easeOut" },
                },
              }}
              className="inline-block"
            >
              {word}
            </motion.span>
          ))}
        </motion.p>
        {config.subtext && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-2 text-xs sm:text-sm font-sans text-rose-200/80 tracking-wide"
          >
            {config.subtext}
          </motion.p>
        )}
      </div>
    );
  }

  if (config.type === "gold-shimmer") {
    // Transition 3 — Something Special: Gentle letter-spacing and warm champagne-gold accent
    return (
      <div className="flex flex-col items-center text-center">
        <motion.h2
          initial={
            prefersReduced
              ? { opacity: 0 }
              : { opacity: 0, letterSpacing: "-0.03em", y: 10 }
          }
          animate={
            prefersReduced
              ? { opacity: 1 }
              : { opacity: 1, letterSpacing: "0.02em", y: 0 }
          }
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-[clamp(1.25rem,3.2vw,2rem)] font-medium leading-relaxed max-w-lg mx-auto text-transparent bg-clip-text bg-gradient-to-r from-[#fed7aa] via-[#fef08a] to-[#d9a85e] drop-shadow-[0_2px_14px_rgba(217,168,94,0.4)]"
        >
          {config.line}
        </motion.h2>
        {config.subtext && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 0.85, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-2 text-xs sm:text-sm font-serif italic text-rose-100/80 tracking-wide"
          >
            {config.subtext}
          </motion.p>
        )}
      </div>
    );
  }

  // Transition 1 — Opening (Default): Soft fade-in with slight upward movement and blur-to-clear
  return (
    <div className="flex flex-col items-center text-center">
      <motion.h2
        initial={
          prefersReduced
            ? { opacity: 0 }
            : { opacity: 0, y: 14, filter: "blur(10px)" }
        }
        animate={
          prefersReduced
            ? { opacity: 1 }
            : { opacity: 1, y: 0, filter: "blur(0px)" }
        }
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="font-serif italic text-[clamp(1.25rem,3.2vw,2rem)] text-[#fff5ea] font-normal leading-relaxed max-w-lg mx-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
      >
        “{config.line}”
      </motion.h2>
      {config.subtext && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-2 text-xs sm:text-sm font-sans text-rose-200/80 tracking-wide"
        >
          {config.subtext}
        </motion.p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main ThreeVideoCardsScene Component                                 */
/* ------------------------------------------------------------------ */

export function ThreeVideoCardsScene({ onContinue, audio }: ThreeVideoCardsSceneProps) {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isMobile =
    typeof window !== "undefined" &&
    (window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

  // Intro is handled seamlessly by CosmicStoryIntroScene preceding this scene
  const [showIntro, setShowIntro] = useState<boolean>(false);

  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
  const [showTransitionCard, setShowTransitionCard] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [requiresUserInteraction, setRequiresUserInteraction] = useState<boolean>(false);
  const [watchedVideos, setWatchedVideos] = useState<string[]>([]);
  const [activeSourceUrl, setActiveSourceUrl] = useState<string>("");

  const modalContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const transitionTimerRef = useRef<any>(null);

  const activeVideo = activeVideoIndex !== null ? videosConfig[activeVideoIndex] : null;

  // Auto transition from opening intro text to cards after 6.5s
  useEffect(() => {
    if (!showIntro) return;
    const timer = setTimeout(() => {
      setShowIntro(false);
      try {
        sessionStorage.setItem("video_cards_intro_shown", "true");
      } catch {}
    }, 6500);

    return () => clearTimeout(timer);
  }, [showIntro]);

  const handleDismissIntro = () => {
    setShowIntro(false);
    try {
      sessionStorage.setItem("video_cards_intro_shown", "true");
    } catch {}
  };

  // Pause ambient background music whenever viewing or playing video
  useEffect(() => {
    if (activeVideo && audio) {
      if (audio.isPlayingVoice || audio.isPlayingSong) {
        audio.pause?.();
      }
    }
  }, [activeVideo, audio]);

  // Compute best source URL for the active video
  const resolveVideoSource = useCallback(
    (item: VideoMemoryItem, useFallback = false): string => {
      if (useFallback && item.fallbackSrc) {
        return item.fallbackSrc;
      }
      if (isMobile && item.mobileSrc) {
        return item.mobileSrc;
      }
      if (item.webSrc) {
        return item.webSrc;
      }
      return item.src;
    },
    [isMobile]
  );

  // Open video modal
  const handleOpenVideo = (index: number) => {
    const item = videosConfig[index];
    if (!item) return;

    setActiveVideoIndex(index);
    setShowTransitionCard(true);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setHasError(false);
    setIsLoading(true);
    setRequiresUserInteraction(false);
    setActiveSourceUrl(resolveVideoSource(item));

    if (!watchedVideos.includes(item.id)) {
      setWatchedVideos((prev) => [...prev, item.id]);
    }

    // Auto-advance from transition card into video playback after 4.8s (unhurried reading)
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => {
      setShowTransitionCard(false);
      startPlayback();
    }, 4800);
  };

  const handleStartWatchingNow = () => {
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    setShowTransitionCard(false);
    startPlayback();
  };

  const startPlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    video
      .play()
      .then(() => {
        setIsPlaying(true);
        setRequiresUserInteraction(false);
      })
      .catch((err) => {
        console.warn("Autoplay blocked by mobile browser policy; awaiting user tap", err);
        setRequiresUserInteraction(true);
        setIsPlaying(false);
      });
  };

  const handleCloseModal = () => {
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setActiveVideoIndex(null);
    setShowTransitionCard(false);
    setIsPlaying(false);
    setIsLoading(false);
    setHasError(false);
    setRequiresUserInteraction(false);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          setRequiresUserInteraction(false);
        })
        .catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().then(() => setIsPlaying(true)).catch(() => {});
        });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!modalContainerRef.current) return;
    if (!document.fullscreenElement) {
      modalContainerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  const handleScrub = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!progressRef.current || !videoRef.current || duration === 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = ratio * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Chapter navigation inside cinema modal
  const handleNextChapter = () => {
    if (activeVideoIndex === null) return;
    if (activeVideoIndex < videosConfig.length - 1) {
      handleOpenVideo(activeVideoIndex + 1);
    } else {
      handleCloseModal();
      onContinue();
    }
  };

  const handlePrevChapter = () => {
    if (activeVideoIndex !== null && activeVideoIndex > 0) {
      handleOpenVideo(activeVideoIndex - 1);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (activeVideoIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseModal();
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === "ArrowRight" && e.altKey) {
        handleNextChapter();
      }
      if (e.key === "ArrowLeft" && e.altKey) {
        handlePrevChapter();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeVideoIndex, isPlaying]);

  // Card themes
  const cardThemes = [
    {
      borderColor: "hover:border-rose-400/60",
      badgeClass: "bg-rose-500/20 text-rose-300 border-rose-400/30",
      glowColor: "from-rose-500/10",
      icon: Film,
    },
    {
      borderColor: "hover:border-amber-400/60",
      badgeClass: "bg-amber-500/20 text-amber-300 border-amber-400/30",
      glowColor: "from-amber-500/10",
      icon: Sparkles,
    },
    {
      borderColor: "hover:border-[#f43f5e]/60",
      badgeClass: "bg-pink-500/20 text-pink-300 border-pink-400/30",
      glowColor: "from-pink-500/10",
      icon: Heart,
    },
  ];

  return (
    <div className="scene-container relative min-h-screen min-h-[100dvh] bg-[#070209] text-white overflow-x-hidden overflow-y-auto select-none flex flex-col justify-between py-5 sm:py-8">
      {/* Background Environment */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#140412] via-[#1f0618] to-[#070208]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_15%,_rgba(244,114,182,0.15)_0%,_rgba(217,168,94,0.1)_35%,_transparent_75%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_45%,_rgba(6,1,6,0.9)_100%)]" />
      </div>

      {/* Floating Stardust Particles */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {[...Array(14)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-amber-200/40 shadow-[0_0_6px_rgba(254,240,138,0.7)]"
            style={{
              width: `${(i % 3) + 2}px`,
              height: `${(i % 3) + 2}px`,
              left: `${(i * 19) % 95}%`,
              top: `${(i * 27) % 90}%`,
            }}
            animate={
              prefersReduced
                ? {}
                : {
                    y: [0, -20, 0],
                    opacity: [0.2, 0.75, 0.2],
                  }
            }
            transition={{
              duration: 4.5 + (i % 3) * 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: (i % 4) * 0.7,
            }}
          />
        ))}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. SEPARATE INTRO: TRANSITION 1 — OPENING                     */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="video-intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02, transition: { duration: 0.8, ease: "easeInOut" } }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#08020a]/96 backdrop-blur-xl text-center"
          >
            {/* Top Right Skip Button */}
            <div className="absolute top-5 right-5 sm:top-7 sm:right-7 z-20">
              <button
                onClick={handleDismissIntro}
                className="min-h-[44px] px-4 py-2 rounded-full text-xs font-serif text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95"
                aria-label="Skip to video memories"
              >
                <span>Explore Films</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-xl mx-auto flex flex-col items-center px-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-gold mb-3.5 shadow-[0_0_20px_rgba(244,63,94,0.4)]"
              >
                <Film size={22} className="text-[#fed7aa]" />
              </motion.div>

              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] text-[#fed7aa] font-semibold mb-2">
                ✦ THE NIGHT IS QUIET ✦
              </span>

              {/* TRANSITION 1 — OPENING: Short, elegant line with blur-to-clear */}
              <motion.h2
                initial={prefersReduced ? {} : { opacity: 0, y: 14, filter: "blur(10px)" }}
                animate={prefersReduced ? {} : { opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="font-serif italic text-[clamp(1.4rem,3.6vw,2.4rem)] text-white font-normal leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)] max-w-lg"
              >
                “Some beautiful moments begin with a little mystery.”
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.85 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mt-3 text-xs sm:text-sm font-sans text-rose-100/80 leading-relaxed max-w-md"
              >
                The night is quiet. The stars are whispering your name.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.7 }}
                className="mt-6 sm:mt-7"
              >
                <PremiumButton variant="gold" size="md" onClick={handleDismissIntro}>
                  <span>Explore Our Memories 🎬</span>
                  <ArrowRight size={15} />
                </PremiumButton>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN SCENE CONTENT & 3 VIDEO CARDS                         */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center flex-1">
        {/* Editorial Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-xl mx-auto mb-5 sm:mb-7 shrink-0"
        >
          <div className="flex items-center justify-center gap-2 mb-1.5 text-gold/80">
            <span className="w-8 sm:w-14 h-[1px] bg-gradient-to-r from-transparent to-[#d9a85e]/60" />
            <Film size={13} className="text-[#fed7aa]" />
            <span className="text-[10px] sm:text-[11px] font-sans uppercase tracking-[0.28em] text-[#fed7aa] font-bold">
              MEMORIES IN MOTION
            </span>
            <Film size={13} className="text-[#fed7aa]" />
            <span className="w-8 sm:w-14 h-[1px] bg-gradient-to-l from-transparent to-[#d9a85e]/60" />
          </div>

          <h1 className="font-serif text-[clamp(1.5rem,3.4vw,2.35rem)] font-bold text-white tracking-wide mt-1 drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
            Our Video Memories
          </h1>

          <p className="mt-1.5 text-rose-100/80 text-xs sm:text-sm font-serif italic max-w-md mx-auto leading-relaxed">
            Three special chapters of our laughter, smiles, and timeless moments.
          </p>
        </motion.div>

        {/* The 3 Video Cards */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch mb-6 sm:mb-8">
          {videosConfig.map((item, idx) => {
            const isWatched = watchedVideos.includes(item.id);
            const theme = cardThemes[idx % cardThemes.length];
            const IconComponent = theme.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "group relative rounded-2xl bg-gradient-to-b from-[#1c0819]/90 via-[#130310]/90 to-[#0b020a] border border-rose-300/20 shadow-[0_15px_35px_rgba(0,0,0,0.7)] transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1",
                  theme.borderColor,
                  "hover:shadow-[0_20px_45px_rgba(217,168,94,0.2)]"
                )}
              >
                {/* Glow Backdrop */}
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-tr via-transparent to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                    theme.glowColor
                  )}
                />

                {/* Aspect-Ratio Aware Thumbnail Container */}
                <div
                  onClick={() => handleOpenVideo(idx)}
                  className="relative aspect-[16/10] w-full overflow-hidden bg-black/70 cursor-pointer"
                  role="button"
                  aria-label={`Play ${item.title}`}
                >
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter contrast-[105%]"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/images/card-featured-1.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  {/* Chapter Badge */}
                  <div
                    className={cn(
                      "absolute top-3 left-3 px-2.5 py-1 rounded-full backdrop-blur-md text-[10px] font-mono tracking-widest uppercase font-semibold shadow-md flex items-center gap-1",
                      theme.badgeClass
                    )}
                  >
                    <IconComponent size={10} />
                    <span>{item.badge}</span>
                  </div>

                  {/* Duration Tag */}
                  {item.duration && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-[10px] font-serif text-rose-200/90 shadow-md">
                      {item.duration}
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.92 }}
                      className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#9f1239] via-[#e11d48] to-[#f43f5e] flex items-center justify-center text-white shadow-[0_0_25px_rgba(244,63,94,0.75)] border-2 border-rose-200/70 group-hover:shadow-[0_0_35px_rgba(244,63,94,0.95)] transition-all cursor-pointer"
                    >
                      <Play className="w-6 h-6 fill-white text-white ml-0.5" />
                    </motion.div>
                  </div>

                  {/* Watched pill */}
                  {isWatched && (
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-950/85 border border-emerald-400/40 text-[9px] font-serif text-emerald-300 flex items-center gap-1 shadow-sm">
                      <span>Watched</span>
                      <Heart size={8} className="fill-emerald-400" />
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#d9a85e] font-semibold">
                      {item.subtitle}
                    </span>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-white mt-1 group-hover:text-rose-200 transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-white/70 text-xs sm:text-[13px] font-sans leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Watch Action Bar */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenVideo(idx)}
                      className="min-h-[44px] inline-flex items-center gap-2 text-xs font-serif font-semibold text-rose-300 hover:text-[#fed7aa] transition-colors cursor-pointer"
                      aria-label={`Play chapter ${item.title}`}
                    >
                      <Play size={12} className="fill-current" />
                      <span>Play Film</span>
                    </button>
                    <Heart size={13} className="text-rose-400/60" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Transition CTA to Final Personal Birthday Wish Video */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center pt-1 pb-4 flex flex-col items-center gap-2.5 shrink-0"
        >
          <div className="flex items-center gap-2 text-xs text-rose-200/80 font-serif italic">
            <Sparkles size={13} className="text-[#d9a85e]" />
            <span>Ready for the personal birthday message?</span>
            <Sparkles size={13} className="text-[#d9a85e]" />
          </div>

          <PremiumButton
            variant="gold"
            size="lg"
            onClick={onContinue}
            className="btn-breathe-glow min-h-[48px] px-8"
          >
            <span>A Personal Birthday Wish For You ♥</span>
            <ArrowRight size={18} />
          </PremiumButton>
        </motion.div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. MODAL CINEMA THEATER WITH CINEMATIC TRANSITIONS & CONTROLS */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/94 backdrop-blur-xl"
            onClick={handleCloseModal}
          >
            <motion.div
              ref={modalContainerRef}
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "relative w-full bg-[#100512] rounded-2xl sm:rounded-3xl border border-rose-300/30 overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col mx-auto my-auto max-h-[94dvh]",
                activeVideo.aspectRatio === "portrait" ? "max-w-sm sm:max-w-md" : "max-w-4xl"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Bar */}
              <div className="p-3 px-4 sm:px-6 flex items-center justify-between border-b border-white/10 bg-black/50 shrink-0">
                <div className="flex items-center gap-2.5 truncate">
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono uppercase tracking-widest border border-rose-400/30">
                    {activeVideo.badge}
                  </span>
                  <h3 className="font-serif text-xs sm:text-sm md:text-base font-bold text-white truncate">
                    {activeVideo.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {/* Chapter Quick Switcher */}
                  <div className="hidden sm:flex items-center gap-1 mr-2 text-[11px] font-sans text-white/70">
                    <button
                      onClick={handlePrevChapter}
                      disabled={activeVideoIndex === 0}
                      className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      title="Previous Film"
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <span>
                      {(activeVideoIndex ?? 0) + 1} / {videosConfig.length}
                    </span>
                    <button
                      onClick={handleNextChapter}
                      className="p-1 rounded hover:bg-white/10 cursor-pointer"
                      title={
                        activeVideoIndex === videosConfig.length - 1
                          ? "Next: Birthday Wish Video"
                          : "Next Film"
                      }
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  <button
                    onClick={handleCloseModal}
                    className="min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                    aria-label="Close video player"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Video Player Container */}
              <div
                className={cn(
                  "relative w-full bg-black flex items-center justify-center overflow-hidden",
                  activeVideo.aspectRatio === "portrait"
                    ? "aspect-[9/16] max-h-[calc(92dvh-110px)] sm:max-h-[70vh]"
                    : "aspect-video max-h-[calc(92dvh-110px)] sm:max-h-[70vh]"
                )}
              >
                {/* HTML5 Video Element */}
                <video
                  key={`${activeVideo.id}-${activeSourceUrl}`}
                  ref={videoRef}
                  src={activeSourceUrl}
                  poster={activeVideo.poster}
                  playsInline
                  preload="metadata"
                  onTimeUpdate={() => {
                    if (videoRef.current) {
                      setCurrentTime(videoRef.current.currentTime);
                    }
                  }}
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      setDuration(videoRef.current.duration);
                    }
                  }}
                  onLoadedData={() => {
                    setIsLoading(false);
                  }}
                  onCanPlay={() => {
                    setIsLoading(false);
                  }}
                  onWaiting={() => setIsLoading(true)}
                  onPlaying={() => {
                    setIsLoading(false);
                    setIsPlaying(true);
                    setRequiresUserInteraction(false);
                  }}
                  onEnded={() => {
                    setIsPlaying(false);
                  }}
                  onError={() => {
                    // Try fallback source if available
                    if (
                      activeVideo.fallbackSrc &&
                      activeSourceUrl !== activeVideo.fallbackSrc
                    ) {
                      console.warn("Primary video source failed, falling back to:", activeVideo.fallbackSrc);
                      setActiveSourceUrl(activeVideo.fallbackSrc);
                      setIsLoading(true);
                    } else {
                      setIsLoading(false);
                      setHasError(true);
                    }
                  }}
                  onClick={togglePlay}
                  className="w-full h-full object-contain cursor-pointer"
                >
                  <source src={activeSourceUrl} type="video/mp4" />
                  {activeVideo.fallbackSrc && activeVideo.fallbackSrc !== activeSourceUrl && (
                    <source src={activeVideo.fallbackSrc} type="video/mp4" />
                  )}
                </video>

                {/* ----------------------------------------------------------- */}
                {/* CINEMATIC TRANSITION OVERLAY BEFORE PLAYING                */}
                {/* ----------------------------------------------------------- */}
                <AnimatePresence>
                  {showTransitionCard && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black/85 backdrop-blur-md text-center"
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-md flex flex-col items-center"
                      >
                        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] text-[#fed7aa] font-semibold mb-2">
                          {activeVideo.transition.chapter}
                        </span>

                        {/* Distinct transition animation */}
                        <VideoTransitionTypography
                          config={activeVideo.transition}
                          prefersReduced={prefersReduced}
                        />

                        <button
                          onClick={handleStartWatchingNow}
                          className="mt-6 min-h-[44px] px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white font-serif text-xs sm:text-sm font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Play size={14} className="fill-white" />
                          <span>Watch Chapter Now</span>
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Loading Indicator */}
                {isLoading && !hasError && !showTransitionCard && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 pointer-events-none z-20">
                    <div className="w-10 h-10 border-2 border-rose-400/30 border-t-rose-400 rounded-full animate-spin mb-2" />
                    <span className="text-xs font-serif text-white/80">Loading memory...</span>
                  </div>
                )}

                {/* User Gesture Play Prompt (iOS/Mobile Autoplay Policy Fallback) */}
                {requiresUserInteraction && !showTransitionCard && !hasError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/65 backdrop-blur-sm p-4"
                    onClick={startPlayback}
                  >
                    <button
                      onClick={startPlayback}
                      className="min-h-[46px] px-7 py-3 rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white font-serif text-sm sm:text-base font-medium shadow-2xl flex items-center gap-2.5 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                    >
                      <Play size={18} className="fill-white" />
                      <span>Tap to Play Film ♥</span>
                    </button>
                    <p className="mt-2.5 text-[11px] text-white/70 font-mono">
                      Tap once to start with sound
                    </p>
                  </motion.div>
                )}

                {/* Paused Play Icon Overlay */}
                {!isPlaying && !isLoading && !hasError && !showTransitionCard && !requiresUserInteraction && (
                  <button
                    onClick={togglePlay}
                    className="absolute w-15 h-15 rounded-full bg-black/65 hover:bg-black/85 border border-white/30 text-white flex items-center justify-center shadow-2xl transition-all cursor-pointer hover:scale-105 active:scale-95 z-10"
                    aria-label="Play video"
                  >
                    <Play className="w-7 h-7 fill-white text-white ml-0.5" />
                  </button>
                )}

                {/* Error Fallback */}
                {hasError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/92 z-30">
                    <AlertCircle className="w-9 h-9 text-rose-400 mb-2" />
                    <h4 className="font-serif text-base text-white font-bold">Video loading took a breath</h4>
                    <p className="text-xs text-white/70 max-w-sm mt-1 mb-4">
                      Tap retry below to reload this memory chapter.
                    </p>
                    <button
                      onClick={() => {
                        setHasError(false);
                        setIsLoading(true);
                        if (videoRef.current) {
                          videoRef.current.load();
                          videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setRequiresUserInteraction(true));
                        }
                      }}
                      className="min-h-[44px] px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw size={13} />
                      <span>Retry Playback</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Player Scrubber & Controls */}
              <div className="p-3 sm:p-4 px-4 sm:px-6 bg-[#0e0310] flex flex-col gap-2 shrink-0">
                {/* Scrubber Progress Bar */}
                <div
                  ref={progressRef}
                  onPointerDown={handleScrub}
                  className="relative w-full h-3 flex items-center cursor-pointer group"
                >
                  <div className="w-full h-1 rounded-full bg-white/20 group-hover:h-1.5 transition-all overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 via-rose-400 to-[#d9a85e] rounded-full relative"
                      style={{
                        width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div
                    className="absolute -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-md pointer-events-none group-hover:scale-125 transition-transform"
                    style={{
                      left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                    }}
                  />
                </div>

                {/* Bottom Control Buttons */}
                <div className="flex items-center justify-between text-white text-xs pt-0.5">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={togglePlay}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center p-1 hover:text-[#fed7aa] transition-colors cursor-pointer"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>

                    <span className="font-mono text-[11px] text-white/70 select-none">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Next Chapter Button right on the bar */}
                    <button
                      onClick={handleNextChapter}
                      className="min-h-[44px] px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-serif text-[#fed7aa] flex items-center gap-1.5 cursor-pointer transition-colors"
                      title={
                        activeVideoIndex === videosConfig.length - 1
                          ? "Proceed to Birthday Wish"
                          : "Next Chapter"
                      }
                    >
                      <span>
                        {activeVideoIndex === videosConfig.length - 1
                          ? "Birthday Wish"
                          : "Next Part"}
                      </span>
                      <ArrowRight size={12} />
                    </button>

                    {/* Volume */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={toggleMute}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center p-1 text-white/70 hover:text-white transition-colors cursor-pointer"
                        aria-label={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.02"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-14 sm:w-20 h-1 accent-rose-500 bg-white/20 rounded-full cursor-pointer"
                        aria-label="Volume slider"
                      />
                    </div>

                    {/* Fullscreen */}
                    <button
                      onClick={toggleFullscreen}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center p-1 text-white/70 hover:text-[#fed7aa] transition-colors cursor-pointer"
                      aria-label="Fullscreen"
                    >
                      {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ThreeVideoCardsScene;
