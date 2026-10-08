import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";
import { PremiumButton } from "../PremiumButton";

interface AudioEngineProps {
  isPlayingVoice: boolean;
  voiceProgress: number;
  voiceDuration: number;
  currentTime: number;
  currentTrackIndex: number;
  currentTrack: {
    title: string;
    artist: string;
    src: string;
    artwork?: string;
  };
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (prog: number) => void;
  volume: number;
  setVolume: (v: number) => void;
  isLooping: boolean;
  toggleLoop: () => void;
  isShuffle?: boolean;
  toggleShuffle?: () => void;
}

interface CinematicAudioPlayerProps {
  audio: AudioEngineProps;
  onBack?: () => void;
  onContinue: () => void;
}

function formatTime(seconds: number) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function CinematicAudioPlayer({
  audio,
  onBack,
  onContinue,
}: CinematicAudioPlayerProps) {
  const [isFavorite, setIsFavorite] = useState(true);
  const [localShuffle, setLocalShuffle] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  // Floating musical notes
  const notes = ["♪", "♫", "♩", "♬", "♪", "♫"];

  const seekFromClientX = (clientX: number) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickPos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    audio.seek(clickPos);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    seekFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      seekFromClientX(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const isShuffleActive = audio.isShuffle ?? localShuffle;
  const handleShuffleToggle = () => {
    if (audio.toggleShuffle) {
      audio.toggleShuffle();
    } else {
      setLocalShuffle((prev) => !prev);
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden flex flex-col justify-between select-none bg-[#08020a]">
      {/* Optional Back to Chests Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-40 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/45 border border-white/15 hover:border-gold/45 text-rose-200/90 text-xs backdrop-blur-md transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
        >
          <ChevronLeft size={14} /> Back to Chests
        </button>
      )}

      {/* Background Environment Plate matching Romantic Aesthetic */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/cinematic/audio-player-clean.jpg"
          alt="Romantic Listen With Me Environment"
          className="w-full h-full object-cover object-center filter contrast-[103%] brightness-[97%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/80 pointer-events-none" />
      </div>

      {/* Floating Musical Notes Animation */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {notes.map((note, i) => (
          <motion.div
            key={i}
            className="absolute text-rose-300/40 font-serif text-base sm:text-2xl"
            style={{
              left: `${18 + i * 13}%`,
              bottom: "22%",
            }}
            animate={
              audio.isPlayingVoice
                ? {
                    y: [0, -180],
                    x: [0, i % 2 === 0 ? 25 : -25],
                    opacity: [0, 0.75, 0],
                    rotate: [0, i % 2 === 0 ? 20 : -20],
                  }
                : { opacity: 0 }
            }
            transition={{
              duration: 4.5 + i * 0.8,
              repeat: Infinity,
              ease: "easeOut",
              delay: i * 0.9,
            }}
          >
            {note}
          </motion.div>
        ))}
      </div>

      {/* 1. TOP HEADER: OUR MELODY & Romantic Invitation */}
      <header className="relative z-30 pt-4 sm:pt-8 px-4 text-center max-w-xl mx-auto flex flex-col items-center">
        {/* Heart icon with divider lines */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-2.5 sm:gap-3 text-rose-300/80 mb-1"
        >
          <span className="w-8 sm:w-16 h-[1px] bg-gradient-to-r from-transparent to-rose-300/60" />
          <Heart size={13} className="text-rose-400 fill-rose-400/80 filter drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
          <span className="w-8 sm:w-16 h-[1px] bg-gradient-to-l from-transparent to-rose-300/60" />
        </motion.div>

        {/* Small spaced label: OUR MELODY */}
        <span className="text-[10px] sm:text-xs font-serif uppercase tracking-[0.3em] text-[#fed7aa] font-medium mb-1">
          OUR MELODY
        </span>

        {/* Title: Listen With Me ❤️ */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="flex items-center justify-center gap-2 text-center"
        >
          <span className="font-serif text-2xl sm:text-4xl md:text-5xl text-white font-semibold tracking-wide drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            Listen
          </span>
          <span className="font-calligraphy text-3xl sm:text-5xl md:text-6xl text-rose-300 drop-shadow-[0_0_20px_rgba(244,63,94,0.6)] flex items-center gap-1.5">
            With Me <Heart size={18} className="inline text-rose-400 fill-rose-400 -mt-1 sm:-mt-2" />
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-rose-100/80 text-xs sm:text-sm font-serif italic tracking-wide max-w-sm sm:max-w-md drop-shadow-md text-center mt-1 leading-relaxed"
        >
          Some songs don't just play, they bring back our moments...
        </motion.p>
      </header>

      {/* 2. CENTER INTERACTIVE VINYL & COMPACT CONTROLS */}
      <div className="relative z-20 flex-1 w-full max-w-2xl mx-auto flex flex-col items-center justify-center px-4 py-2 my-auto">
        {/* Vinyl Disc Container */}
        <div className="relative flex items-center justify-center my-2 sm:my-3">
          {/* Subtle Ambient Radial Glow behind Vinyl */}
          <div
            className={`absolute -inset-4 sm:-inset-6 rounded-full transition-all duration-1000 pointer-events-none ${
              audio.isPlayingVoice
                ? "bg-rose-500/20 blur-2xl scale-105"
                : "bg-rose-500/10 blur-xl scale-95"
            }`}
          />

          {/* Glowing Circular Progress Track */}
          <svg
            className="absolute w-44 h-44 xs:w-48 xs:h-48 sm:w-68 sm:h-68 -rotate-90 pointer-events-none"
            viewBox="0 0 200 200"
          >
            <circle
              cx="100"
              cy="100"
              r="92"
              stroke="rgba(244, 63, 94, 0.18)"
              strokeWidth="2.5"
              fill="none"
            />
            <circle
              cx="100"
              cy="100"
              r="92"
              stroke="#f43f5e"
              strokeWidth="3.5"
              fill="none"
              strokeDasharray={2 * Math.PI * 92}
              strokeDashoffset={
                2 * Math.PI * 92 * (1 - (audio.voiceProgress || 0))
              }
              strokeLinecap="round"
              className="filter drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]"
            />
          </svg>

          {/* Vinyl Record Disc */}
          <motion.div
            onClick={audio.togglePlay}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`relative w-36 h-36 xs:w-40 xs:h-40 sm:w-56 sm:h-56 rounded-full cursor-pointer shadow-[0_16px_40px_rgba(0,0,0,0.9)] flex items-center justify-center record-spin ${
              !audio.isPlayingVoice ? "paused" : ""
            }`}
            style={{
              background:
                "conic-gradient(from 0deg, #0e0711 0deg, #24111e 45deg, #0e0711 90deg, #24111e 135deg, #0e0711 180deg, #24111e 225deg, #0e0711 270deg, #24111e 315deg, #0e0711 360deg)",
              boxShadow:
                "0 0 0 3px rgba(255,255,255,0.06), 0 0 28px rgba(244,63,94,0.3)",
            }}
          >
            {/* Concentric Grooves */}
            <div className="absolute inset-3 xs:inset-3.5 sm:inset-5 rounded-full border border-white/[0.07]" />
            <div className="absolute inset-6 xs:inset-7 sm:inset-10 rounded-full border border-white/[0.07]" />
            <div className="absolute inset-9 xs:inset-10 sm:inset-14 rounded-full border border-white/[0.07]" />

            {/* Center Spindle Label */}
            <div className="relative w-12 h-12 xs:w-14 xs:h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#3f0f1c] via-[#5c1629] to-[#881337] border-2 border-rose-400/50 flex items-center justify-center shadow-inner">
              {/* Center Heart Icon - Gently pulses when playing */}
              <Heart
                size={20}
                className={`text-rose-300 fill-rose-400/90 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.9)] transition-transform ${
                  audio.isPlayingVoice ? "animate-pulse scale-105" : "scale-100"
                }`}
              />
            </div>
          </motion.div>
        </div>

        {/* Track Title & Artist */}
        <div className="flex flex-col items-center text-center mt-2.5 sm:mt-3 mb-2">
          <div className="flex items-center justify-center gap-2 sm:gap-2.5">
            <h2 className="font-serif text-lg sm:text-2xl text-white font-semibold tracking-wide flex items-center gap-1.5">
              <span>{audio.currentTrack?.title || "Perfect"}</span>
              <Heart size={14} className="text-rose-400 fill-rose-400 inline" />
            </h2>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="text-rose-400 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              aria-label="Add to favorites"
            >
              <Heart
                size={16}
                className={isFavorite ? "fill-rose-400 text-rose-400" : "text-white/40"}
              />
            </button>
          </div>
          <span className="text-xs sm:text-sm text-rose-200/75 font-serif mt-0.5">
            {audio.currentTrack?.artist || "Ed Sheeran"}
          </span>
        </div>

        {/* Interactive Progress Bar & Timers */}
        <div className="w-full max-w-xs xs:max-w-sm sm:max-w-md flex flex-col gap-1.5 px-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-white/60 select-none">
            <span>{formatTime(audio.currentTime)}</span>
            <span>{formatTime(audio.voiceDuration)}</span>
          </div>

          <div
            ref={progressRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="group relative h-2.5 w-full rounded-full bg-white/15 cursor-pointer flex items-center touch-none py-1"
          >
            {/* Progress track */}
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-rose-500 via-rose-400 to-[#fed7aa] relative shadow-[0_0_10px_rgba(244,63,94,0.6)]"
              style={{ width: `${Math.max(0, Math.min(100, (audio.voiceProgress || 0) * 100))}%` }}
            >
              {/* Scrubber bead handle */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-white shadow-[0_0_8px_rgba(254,240,138,0.9)] ring-2 ring-rose-400 scale-100 group-hover:scale-125 transition-transform" />
            </div>
          </div>
        </div>

        {/* 3. MOBILE-OPTIMIZED AUDIO CONTROLS (Shuffle, Previous, Play/Pause, Next, Repeat) */}
        <div className="flex items-center justify-between sm:justify-center gap-1.5 xs:gap-3 sm:gap-6 w-full max-w-[280px] xs:max-w-[320px] sm:max-w-md px-2 flex-nowrap mt-3.5 sm:mt-5 select-none">
          {/* Shuffle */}
          <button
            onClick={handleShuffleToggle}
            className={`p-2 rounded-full transition-all shrink-0 cursor-pointer ${
              isShuffleActive
                ? "text-rose-400 bg-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                : "text-white/50 hover:text-white"
            }`}
            aria-label="Shuffle"
          >
            <Shuffle className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5" />
          </button>

          {/* Previous */}
          <button
            onClick={audio.prev}
            className="p-2 rounded-full text-white/80 hover:text-white hover:scale-110 active:scale-90 transition-all shrink-0 cursor-pointer"
            aria-label="Previous track"
          >
            <SkipBack className="w-4.5 h-4.5 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Play / Pause — Prominent glowing circular button */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            onClick={audio.togglePlay}
            className="w-12 h-12 xs:w-13 xs:h-13 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#9f1239] via-[#e11d48] to-[#f43f5e] flex items-center justify-center text-white shadow-[0_0_24px_rgba(244,63,94,0.65)] border border-rose-300/40 shrink-0 cursor-pointer"
            aria-label={audio.isPlayingVoice ? "Pause" : "Play"}
          >
            {audio.isPlayingVoice ? (
              <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white" />
            ) : (
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white ml-0.5" />
            )}
          </motion.button>

          {/* Next */}
          <button
            onClick={audio.next}
            className="p-2 rounded-full text-white/80 hover:text-white hover:scale-110 active:scale-90 transition-all shrink-0 cursor-pointer"
            aria-label="Next track"
          >
            <SkipForward className="w-4.5 h-4.5 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Repeat */}
          <button
            onClick={audio.toggleLoop}
            className={`p-2 rounded-full transition-all shrink-0 cursor-pointer ${
              audio.isLooping
                ? "text-rose-400 bg-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                : "text-white/50 hover:text-white"
            }`}
            aria-label="Repeat track"
          >
            <Repeat className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* 4. BOTTOM CTA: Continue to Wish Tree */}
      <footer className="relative z-30 pb-6 sm:pb-10 pt-2 px-4 text-center flex flex-col items-center gap-2">
        <PremiumButton
          variant="rose"
          size="md"
          onClick={onContinue}
        >
          <span>Continue to Wish Tree</span>
          <ArrowRight size={16} className="text-rose-200" />
        </PremiumButton>
      </footer>
    </div>
  );
}

export default CinematicAudioPlayer;
