import { useState } from "react";
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
  const [isShuffle, setIsShuffle] = useState(false);

  // Floating musical notes
  const notes = ["♪", "♫", "♩", "♬", "♪", "♫"];

  const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clickPos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    audio.seek(clickPos);
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

      {/* Background Environment Plate matching Reference 5 */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/cinematic/audio-player-clean.jpg"
          alt="Romantic Listen With Me Environment"
          className="w-full h-full object-cover object-center filter contrast-[103%] brightness-[97%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/75 pointer-events-none" />
      </div>

      {/* Floating Musical Notes Animation */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {notes.map((note, i) => (
          <motion.div
            key={i}
            className="absolute text-rose-300/40 font-serif text-lg sm:text-2xl"
            style={{
              left: `${20 + i * 12}%`,
              bottom: "25%",
            }}
            animate={
              audio.isPlayingVoice
                ? {
                    y: [0, -180],
                    x: [0, (i % 2 === 0 ? 25 : -25)],
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

      {/* TOP HEADER: Matches Target Reference 5 */}
      <header className="relative z-30 pt-8 sm:pt-10 px-4 text-center max-w-2xl mx-auto flex flex-col items-center">
        {/* Heart icon with divider lines */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-3 text-rose-300/80 mb-1.5"
        >
          <span className="w-10 sm:w-16 h-[1px] bg-gradient-to-r from-transparent to-rose-300/60" />
          <Heart size={14} className="text-rose-400 fill-rose-400/80 filter drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
          <span className="w-10 sm:w-16 h-[1px] bg-gradient-to-l from-transparent to-rose-300/60" />
        </motion.div>

        {/* Small spaced label: OUR MELODY */}
        <span className="text-[10px] sm:text-xs font-serif uppercase tracking-[0.35em] text-[#fed7aa] font-medium mb-1">
          OUR MELODY
        </span>

        {/* Title: Listen With Me ♥ */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.1 }}
          className="flex items-baseline justify-center flex-wrap gap-x-3 text-center"
        >
          <span className="font-serif text-3xl sm:text-5xl md:text-6xl text-white font-semibold tracking-wide drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            Listen
          </span>
          <span className="font-calligraphy text-4xl sm:text-6xl md:text-7xl text-rose-300 drop-shadow-[0_0_20px_rgba(244,63,94,0.6)] flex items-center gap-2">
            With Me <Heart size={22} className="inline text-rose-400 fill-rose-400/80 -mt-2" />
          </span>
        </motion.h1>

        {/* Small heart accent */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="my-1.5"
        >
          <Heart size={11} className="text-rose-400/80 fill-rose-400/80" />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white/85 text-xs sm:text-sm font-serif italic tracking-wide max-w-lg drop-shadow-md text-center"
        >
          Some songs don't just play, they bring back our moments...
        </motion.p>
      </header>

      {/* CENTER INTERACTIVE VINYL & WAVEFORM PLAYER */}
      <div className="relative z-20 flex-1 w-full max-w-3xl mx-auto flex flex-col items-center justify-center px-4 py-2">
        {/* Waveforms & Vinyl Container */}
        <div className="relative w-full flex items-center justify-center my-auto">
          {/* Left Waveform Bars */}
          <div className="hidden sm:flex items-center gap-1.5 mr-6 opacity-75">
            {Array.from({ length: 14 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-gradient-to-t from-rose-500/30 via-rose-300 to-rose-500/30 rounded-full"
                animate={
                  audio.isPlayingVoice
                    ? {
                        height: [12 + (i % 5) * 6, 28 + ((i * 3) % 7) * 5, 12 + (i % 5) * 6],
                        opacity: [0.5, 0.9, 0.5],
                      }
                    : { height: 10, opacity: 0.25 }
                }
                transition={{
                  duration: 0.8 + (i % 4) * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>

          {/* Central Rotating Vinyl Record with Progress Glow Arc */}
          <div className="relative flex items-center justify-center p-3">
            {/* Glowing circular progress track */}
            <svg
              className="absolute w-56 sm:w-72 h-56 sm:h-72 -rotate-90 pointer-events-none"
              viewBox="0 0 200 200"
            >
              <circle
                cx="100"
                cy="100"
                r="92"
                stroke="rgba(244, 63, 94, 0.15)"
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
              className={`relative w-48 sm:w-60 h-48 sm:h-60 rounded-full cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex items-center justify-center record-spin ${
                !audio.isPlayingVoice ? "paused" : ""
              }`}
              style={{
                background:
                  "conic-gradient(from 0deg, #0f0a12 0deg, #2b1824 45deg, #0f0a12 90deg, #2b1824 135deg, #0f0a12 180deg, #2b1824 225deg, #0f0a12 270deg, #2b1824 315deg, #0f0a12 360deg)",
                boxShadow:
                  "0 0 0 4px rgba(255,255,255,0.06), 0 0 35px rgba(244,63,94,0.35)",
              }}
            >
              {/* Concentric Grooves */}
              <div className="absolute inset-4 rounded-full border border-white/[0.07]" />
              <div className="absolute inset-8 rounded-full border border-white/[0.07]" />
              <div className="absolute inset-12 rounded-full border border-white/[0.07]" />

              {/* Center Spindle Label */}
              <div className="relative w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-gradient-to-tr from-[#3f0f1c] via-[#5c1629] to-[#881337] border-2 border-rose-400/50 flex items-center justify-center shadow-inner">
                {/* Center Heart Icon */}
                <Heart
                  size={24}
                  className="text-rose-300 fill-rose-400/80 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]"
                />
              </div>
            </motion.div>
          </div>

          {/* Right Waveform Bars */}
          <div className="hidden sm:flex items-center gap-1.5 ml-6 opacity-75">
            {Array.from({ length: 14 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-gradient-to-t from-rose-500/30 via-rose-300 to-rose-500/30 rounded-full"
                animate={
                  audio.isPlayingVoice
                    ? {
                        height: [12 + ((14 - i) % 5) * 6, 28 + (((14 - i) * 3) % 7) * 5, 12 + ((14 - i) % 5) * 6],
                        opacity: [0.5, 0.9, 0.5],
                      }
                    : { height: 10, opacity: 0.25 }
                }
                transition={{
                  duration: 0.8 + (i % 4) * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>
        </div>

        {/* Track Information & Favorite Heart */}
        <div className="flex flex-col items-center text-center mt-3 mb-2">
          <div className="flex items-center justify-center gap-3">
            <h2 className="font-serif text-xl sm:text-2xl text-white font-semibold tracking-wide flex items-center gap-1.5">
              <span>{audio.currentTrack?.title || "Perfect"}</span>
              <Heart size={16} className="text-rose-400 fill-rose-400/80 inline" />
            </h2>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="text-rose-400 hover:scale-110 active:scale-95 transition-transform"
              aria-label="Add to favorites"
            >
              <Heart
                size={18}
                className={isFavorite ? "fill-rose-400 text-rose-400" : "text-white/40"}
              />
            </button>
          </div>
          <span className="text-xs sm:text-sm text-rose-200/70 font-sans mt-0.5">
            {audio.currentTrack?.artist || "Ed Sheeran"}
          </span>
        </div>

        {/* Interactive Scrubber Bar & Timers */}
        <div className="w-full max-w-md flex flex-col gap-1.5 px-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-white/60">
            <span>{formatTime(audio.currentTime)}</span>
            <span>{formatTime(audio.voiceDuration)}</span>
          </div>

          <div
            onClick={handleSeek}
            className="group relative h-2.5 w-full rounded-full bg-white/10 cursor-pointer flex items-center"
          >
            {/* Progress track */}
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-rose-500 to-rose-300 relative shadow-[0_0_10px_rgba(244,63,94,0.6)]"
              style={{ width: `${(audio.voiceProgress || 0) * 100}%` }}
            >
              {/* Scrubber bead handle */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_8px_rgba(244,63,94,0.9)] ring-2 ring-rose-400 scale-100 group-hover:scale-125 transition-transform" />
            </div>
          </div>
        </div>

        {/* Audio Controls Bar: Shuffle, Prev, Play/Pause, Next, Repeat */}
        <div className="flex items-center justify-center gap-5 sm:gap-8 mt-5">
          {/* Shuffle */}
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={`transition-colors p-2 ${
              isShuffle ? "text-rose-400" : "text-white/50 hover:text-white"
            }`}
            aria-label="Shuffle"
          >
            <Shuffle size={17} />
          </button>

          {/* Previous */}
          <button
            onClick={audio.prev}
            className="text-white/80 hover:text-white hover:scale-110 active:scale-95 transition-all p-2"
            aria-label="Previous track"
          >
            <SkipBack size={20} />
          </button>

          {/* Large Play/Pause Glow Circular Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={audio.togglePlay}
            className="w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-gradient-to-tr from-[#9f1239] via-[#e11d48] to-[#f43f5e] flex items-center justify-center text-white shadow-[0_0_28px_rgba(244,63,94,0.7)] border border-rose-300/40"
            aria-label={audio.isPlayingVoice ? "Pause" : "Play"}
          >
            {audio.isPlayingVoice ? (
              <Pause size={24} className="fill-white text-white" />
            ) : (
              <Play size={24} className="fill-white text-white ml-0.5" />
            )}
          </motion.button>

          {/* Next */}
          <button
            onClick={audio.next}
            className="text-white/80 hover:text-white hover:scale-110 active:scale-95 transition-all p-2"
            aria-label="Next track"
          >
            <SkipForward size={20} />
          </button>

          {/* Repeat */}
          <button
            onClick={audio.toggleLoop}
            className={`transition-colors p-2 ${
              audio.isLooping ? "text-rose-400" : "text-white/50 hover:text-white"
            }`}
            aria-label="Repeat track"
          >
            <Repeat size={17} />
          </button>
        </div>
      </div>

      {/* BOTTOM CTA: Matches Target Reference 5 */}
      <footer className="relative z-30 pb-8 sm:pb-10 px-4 text-center flex flex-col items-center gap-3">
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
