import { useState, useRef, useEffect } from "react";
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
  Heart,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { videosConfig, type VideoMemoryItem } from "../data/videos";
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

export function ThreeVideoCardsScene({ onContinue, audio }: ThreeVideoCardsSceneProps) {
  const [activeVideo, setActiveVideo] = useState<VideoMemoryItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [watchedVideos, setWatchedVideos] = useState<string[]>([]);

  const modalContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Pause background music when viewing or playing video
  useEffect(() => {
    if (activeVideo && audio) {
      if (audio.isPlayingVoice || audio.isPlayingSong) {
        audio.pause?.();
      }
    }
  }, [activeVideo, audio]);

  // Keyboard controls for modal video
  useEffect(() => {
    if (!activeVideo) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseModal();
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeVideo, isPlaying]);

  const handleOpenVideo = (item: VideoMemoryItem) => {
    setActiveVideo(item);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);
    setHasError(false);
    setIsLoading(true);
    if (!watchedVideos.includes(item.id)) {
      setWatchedVideos((prev) => [...prev, item.id]);
    }
  };

  const handleCloseModal = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setActiveVideo(null);
    setIsPlaying(false);
    setIsLoading(false);
    setHasError(false);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
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
      modalContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
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

  return (
    <div className="scene-container relative min-h-screen min-h-[100dvh] bg-[#090209] text-white overflow-x-hidden overflow-y-auto select-none flex flex-col justify-between py-6 sm:py-10">
      {/* Background Environment */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#160412] via-[#24081c] to-[#0a0209]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_15%,_rgba(244,114,182,0.18)_0%,_rgba(217,168,94,0.12)_35%,_transparent_75%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_45%,_rgba(6,1,6,0.85)_100%)]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center flex-1">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-xl mx-auto mb-6 sm:mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-1 text-gold/80">
            <span className="w-8 sm:w-14 h-[1px] bg-gradient-to-r from-transparent to-gold/60" />
            <Film size={13} className="text-gold" />
            <span className="text-[10px] sm:text-[11px] font-serif uppercase tracking-[0.28em] text-[#fed7aa] font-bold">
              MEMORIES IN MOTION
            </span>
            <Film size={13} className="text-gold" />
            <span className="w-8 sm:w-14 h-[1px] bg-gradient-to-l from-transparent to-gold/60" />
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-wide mt-1 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            Our Video Memories
          </h1>

          <p className="mt-2 text-rose-100/85 text-xs sm:text-sm font-serif italic max-w-md mx-auto leading-relaxed">
            Three special chapters of our laughter, smiles, and timeless moments captured in film.
          </p>
        </motion.div>

        {/* Three Video Cards Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 items-stretch mb-8 sm:mb-12">
          {videosConfig.map((item, idx) => {
            const isWatched = watchedVideos.includes(item.id);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="group relative rounded-2xl bg-gradient-to-b from-[#1f0a1b]/90 via-[#150512]/90 to-[#0e020c] border border-rose-300/20 hover:border-gold/50 shadow-[0_15px_35px_rgba(0,0,0,0.7)] hover:shadow-[0_20px_45px_rgba(217,168,94,0.25)] transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Glow Backdrop */}
                <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/5 via-transparent to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Video Thumbnail / Preview Container */}
                <div
                  onClick={() => handleOpenVideo(item)}
                  className={cn(
                    "relative w-full overflow-hidden bg-black/60 cursor-pointer transition-all duration-300",
                    item.aspectRatio === "portrait" ? "aspect-[4/5]" : "aspect-video"
                  )}
                >
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter contrast-[105%]"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/images/card-featured-1.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Chapter Badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono tracking-widest uppercase text-gold font-semibold shadow-md">
                    {item.badge}
                  </div>

                  {/* Duration / Tag */}
                  {item.duration && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-serif text-rose-200/90 shadow-md">
                      {item.duration}
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.94 }}
                      className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-gradient-to-tr from-[#9f1239] via-[#e11d48] to-[#f43f5e] flex items-center justify-center text-white shadow-[0_0_25px_rgba(244,63,94,0.75)] border-2 border-rose-200/70 group-hover:shadow-[0_0_35px_rgba(244,63,94,0.95)] transition-all cursor-pointer"
                    >
                      <Play className="w-6 h-6 fill-white text-white ml-0.5" />
                    </motion.div>
                  </div>

                  {/* Watched pill */}
                  {isWatched && (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-[9px] font-serif text-emerald-300 flex items-center gap-1 shadow-sm">
                      <span>Watched</span>
                      <Heart size={8} className="fill-emerald-400" />
                    </div>
                  )}
                </div>

                {/* Card Information */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#d9a85e] font-semibold">
                      {item.subtitle}
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-white mt-1 group-hover:text-rose-200 transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-white/70 text-xs sm:text-[13px] font-sans leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Watch Button */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenVideo(item)}
                      className="inline-flex items-center gap-2 text-xs font-serif font-semibold text-rose-300 hover:text-gold transition-colors cursor-pointer"
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

        {/* Sequence Transition CTA to Personal Birthday Wish Video */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center pt-2 pb-6 flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-2 text-xs text-rose-200/80 font-serif italic">
            <Sparkles size={14} className="text-gold" />
            <span>Finished watching our films? A personal wish awaits you next...</span>
            <Sparkles size={14} className="text-gold" />
          </div>

          <PremiumButton
            variant="gold"
            size="lg"
            onClick={onContinue}
            className="btn-breathe-glow"
          >
            <span>A Personal Birthday Wish For You ♥</span>
            <ArrowRight size={18} />
          </PremiumButton>
        </motion.div>
      </div>

      {/* MODAL CINEMA THEATER */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/92 backdrop-blur-xl"
            onClick={handleCloseModal}
          >
            <motion.div
              ref={modalContainerRef}
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "relative w-full bg-[#110513] rounded-2xl sm:rounded-3xl border border-rose-300/30 overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col mx-auto",
                activeVideo.aspectRatio === "portrait" ? "max-w-md sm:max-w-lg" : "max-w-4xl"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-3 sm:p-4 px-4 sm:px-6 flex items-center justify-between border-b border-white/10 bg-black/40">
                <div className="flex items-center gap-2.5 truncate">
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono uppercase tracking-widest border border-rose-400/30">
                    {activeVideo.badge}
                  </span>
                  <h3 className="font-serif text-sm sm:text-base font-bold text-white truncate">
                    {activeVideo.title}
                  </h3>
                </div>

                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                  aria-label="Close video player"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Video Player Box */}
              <div
                className={cn(
                  "relative w-full bg-black flex items-center justify-center overflow-hidden",
                  activeVideo.aspectRatio === "portrait" ? "aspect-[9/16] max-h-[72vh]" : "aspect-video"
                )}
              >
                <video
                  ref={videoRef}
                  src={activeVideo.src}
                  poster={activeVideo.poster}
                  playsInline
                  autoPlay
                  preload="metadata"
                  onTimeUpdate={() => {
                    if (videoRef.current) {
                      setCurrentTime(videoRef.current.currentTime);
                    }
                  }}
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      setDuration(videoRef.current.duration);
                      setIsLoading(false);
                    }
                  }}
                  onWaiting={() => setIsLoading(true)}
                  onPlaying={() => {
                    setIsLoading(false);
                    setIsPlaying(true);
                  }}
                  onEnded={() => {
                    setIsPlaying(false);
                  }}
                  onError={() => {
                    // Try fallbackSrc if available
                    if (activeVideo.fallbackSrc && videoRef.current && videoRef.current.src !== activeVideo.fallbackSrc) {
                      videoRef.current.src = activeVideo.fallbackSrc;
                      videoRef.current.load();
                      videoRef.current.play().catch(() => {});
                    } else {
                      setIsLoading(false);
                      setHasError(true);
                    }
                  }}
                  onClick={togglePlay}
                  className="w-full h-full object-contain cursor-pointer"
                >
                  <source src={activeVideo.src} type="video/mp4" />
                  {activeVideo.fallbackSrc && <source src={activeVideo.fallbackSrc} type="video/mp4" />}
                </video>

                {/* Loading Spinner */}
                {isLoading && !hasError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 pointer-events-none">
                    <div className="w-10 h-10 border-2 border-rose-400/30 border-t-rose-400 rounded-full animate-spin mb-2" />
                    <span className="text-xs font-serif text-white/70">Loading memory...</span>
                  </div>
                )}

                {/* Error Fallback */}
                {hasError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/90">
                    <AlertCircle className="w-10 h-10 text-rose-400 mb-2" />
                    <h4 className="font-serif text-lg text-white font-bold">Video file not loaded</h4>
                    <p className="text-xs text-white/70 max-w-sm mt-1 mb-4">
                      Could not stream <code className="text-gold font-mono">{activeVideo.src}</code>. Please verify the file is placed in your project's assets.
                    </p>
                    <button
                      onClick={() => {
                        setHasError(false);
                        setIsLoading(true);
                        if (videoRef.current) {
                          videoRef.current.load();
                          videoRef.current.play().catch(() => {});
                        }
                      }}
                      className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw size={13} /> Retry playback
                    </button>
                  </div>
                )}

                {/* Center Play Indicator Overlay When Paused */}
                {!isPlaying && !isLoading && !hasError && (
                  <button
                    onClick={togglePlay}
                    className="absolute w-16 h-16 rounded-full bg-black/60 hover:bg-black/80 border border-white/30 text-white flex items-center justify-center shadow-2xl transition-all cursor-pointer hover:scale-105 active:scale-95"
                    aria-label="Play video"
                  >
                    <Play className="w-8 h-8 fill-white text-white ml-1" />
                  </button>
                )}
              </div>

              {/* Player Scrubber & Controls */}
              <div className="p-3 sm:p-4 px-4 sm:px-6 bg-[#0f0311] flex flex-col gap-2">
                {/* Scrubber Progress Bar */}
                <div
                  ref={progressRef}
                  onPointerDown={handleScrub}
                  className="relative w-full h-3 flex items-center cursor-pointer group"
                >
                  <div className="w-full h-1 rounded-full bg-white/20 group-hover:h-1.5 transition-all overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 via-rose-400 to-gold rounded-full relative"
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

                {/* Bottom Buttons Bar */}
                <div className="flex items-center justify-between text-white text-xs pt-1">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="p-1 hover:text-gold transition-colors cursor-pointer"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>

                    <span className="font-mono text-[11px] text-white/70">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Volume */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={toggleMute}
                        className="p-1 text-white/70 hover:text-white transition-colors cursor-pointer"
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
                        className="w-16 sm:w-20 h-1 accent-rose-500 bg-white/20 rounded-full cursor-pointer"
                        aria-label="Volume slider"
                      />
                    </div>

                    {/* Fullscreen */}
                    <button
                      onClick={toggleFullscreen}
                      className="p-1 text-white/70 hover:text-gold transition-colors cursor-pointer"
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
