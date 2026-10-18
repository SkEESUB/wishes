import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Volume1,
  ChevronLeft,
  ListMusic,
  Music,
  Gift,
} from "lucide-react";

export interface AudioEngineProps {
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
  playlist?: Array<{
    title: string;
    artist: string;
    src: string;
    artwork?: string;
  }>;
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
  loadTrack?: (index: number, shouldPlay: boolean) => void;
  audioError?: boolean;
  favorites?: string[];
  toggleFavorite?: (title: string) => void;
}

interface CinematicAudioPlayerProps {
  audio: AudioEngineProps;
  onBack?: () => void;
  onContinue?: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function CinematicAudioPlayer({
  audio,
  onBack,
}: CinematicAudioPlayerProps) {
  const [isFavorite, setIsFavorite] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [lastVolume, setLastVolume] = useState(audio.volume || 0.85);

  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Floating musical notes
  const notes = ["♪", "♫", "♩", "♬", "♡", "♪", "♫"];

  // Waveform bar data (24 bars for a balanced, compact display)
  const [waveformBars, setWaveformBars] = useState<number[]>(() =>
    Array.from({ length: 24 }, (_, i) => 0.25 + 0.15 * Math.sin(i * 0.4))
  );

  // Animated waveform loop when audio is playing
  useEffect(() => {
    if (prefersReduced) return;
    let raf = 0;
    let angle = 0;

    const animateWave = () => {
      if (audio.isPlayingVoice) {
        angle += 0.08;
        setWaveformBars((prev) =>
          prev.map((_, i) => {
            const wave1 = Math.sin(angle + i * 0.45);
            const wave2 = Math.cos(angle * 1.3 + i * 0.3);
            const amplitude = 0.2 + 0.75 * Math.abs(wave1 * 0.6 + wave2 * 0.4);
            return Math.min(1, Math.max(0.12, amplitude));
          })
        );
      } else {
        // Calm settled waveform
        setWaveformBars((prev) =>
          prev.map((val, i) => {
            const target = 0.18 + 0.12 * Math.sin(i * 0.3);
            return val + (target - val) * 0.1;
          })
        );
      }
      raf = requestAnimationFrame(animateWave);
    };

    raf = requestAnimationFrame(animateWave);
    return () => cancelAnimationFrame(raf);
  }, [audio.isPlayingVoice, prefersReduced]);

  // Scrubber seeking
  const seekFromClientX = useCallback(
    (clientX: number) => {
      if (!progressRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      audio.seek(ratio);
    },
    [audio]
  );

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

  // Volume control
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    audio.setVolume(val);
    if (val > 0) setLastVolume(val);
  };

  const toggleMute = () => {
    if (audio.volume > 0) {
      setLastVolume(audio.volume);
      audio.setVolume(0);
    } else {
      audio.setVolume(lastVolume || 0.85);
    }
  };

  const playlist = audio.playlist || [
    { title: "Perfect", artist: "Ed Sheeran", src: "/assets/audio/song1.mp3" },
    { title: "Until I Found You", artist: "Stephen Sanchez", src: "/assets/audio/song2.mp3" },
    { title: "Lover", artist: "Taylor Swift", src: "/assets/audio/song3.mp3" },
  ];

  return (
    <div className="relative w-full h-full min-h-screen min-h-[100dvh] overflow-y-auto overflow-x-hidden flex flex-col justify-between select-none bg-[#07030a] py-3 sm:py-5">
      {/* Top Navigation Back to Gifts Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 z-40 flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-black/60 border border-white/15 hover:border-gold/50 text-rose-200/90 hover:text-white text-xs font-serif backdrop-blur-md transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95 min-h-[44px]"
          aria-label="Back to Gifts"
        >
          <ChevronLeft size={15} /> <span>Back to Gifts</span>
        </button>
      )}

      {/* Background Environment Plate with Deep Romantic Midnight-Burgundy Gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/images/cinematic/audio-player-clean.jpg"
          alt="Romantic Audio Environment"
          className="w-full h-full object-cover object-center filter contrast-[105%] brightness-[92%]"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07030a] via-[#160614]/80 to-[#07030a]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(244,63,94,0.12)_0%,_transparent_65%)]" />
      </div>

      {/* Floating Musical Notes Animation */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden" aria-hidden="true">
        {notes.map((note, i) => (
          <motion.div
            key={i}
            className="absolute text-rose-300/35 font-serif text-sm sm:text-xl select-none"
            style={{
              left: `${15 + i * 12}%`,
              bottom: "20%",
            }}
            animate={
              audio.isPlayingVoice && !prefersReduced
                ? {
                    y: [0, -180],
                    x: [0, i % 2 === 0 ? 25 : -25],
                    opacity: [0, 0.75, 0],
                    rotate: [0, i % 2 === 0 ? 20 : -20],
                    scale: [0.8, 1.1, 0.9],
                  }
                : { opacity: 0 }
            }
            transition={{
              duration: 4.5 + i * 0.7,
              repeat: Infinity,
              ease: "easeOut",
              delay: i * 0.8,
            }}
          >
            {note}
          </motion.div>
        ))}
      </div>

      {/* 1. TOP HEADER: Romantic Title & Dedication (Compact) */}
      <header className="relative z-30 pt-8 sm:pt-4 px-4 text-center max-w-lg mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 text-rose-300/80 mb-0.5"
        >
          <span className="w-6 sm:w-12 h-[1px] bg-gradient-to-r from-transparent to-rose-300/60" />
          <Heart size={11} className="text-rose-400 fill-rose-400/80 filter drop-shadow-[0_0_6px_rgba(244,63,94,0.7)]" />
          <span className="w-6 sm:w-12 h-[1px] bg-gradient-to-l from-transparent to-rose-300/60" />
        </motion.div>

        <span className="text-[9px] sm:text-[10px] font-serif uppercase tracking-[0.25em] text-[#fed7aa] font-medium">
          OUR MELODY &middot; PRIVATE LOUNGE
        </span>

        <motion.h1
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center justify-center gap-1.5 text-center mt-0.5"
        >
          <span className="font-serif text-xl sm:text-3xl text-white font-semibold tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            Listen
          </span>
          <span className="font-calligraphy text-2xl sm:text-4xl text-rose-300 drop-shadow-[0_0_16px_rgba(244,63,94,0.6)] flex items-center gap-1">
            With Me <Heart size={14} className="inline text-rose-400 fill-rose-400 -mt-1" />
          </span>
        </motion.h1>

        <p className="text-rose-100/75 text-[11px] sm:text-xs font-serif italic tracking-wide max-w-xs sm:max-w-md drop-shadow-md text-center mt-0.5 leading-tight">
          Some songs don't just play, they bring back our sweetest moments...
        </p>
      </header>

      {/* 2. CENTER INTERACTIVE AUDIO PLAYER (Compact, Centered Composition) */}
      <div className="relative z-20 flex-1 w-full max-w-lg mx-auto flex flex-col items-center justify-center px-4 py-2 my-auto">
        
        {/* Compact Vinyl Turntable Stage */}
        <div className="relative flex items-center justify-center my-2 sm:my-3">
          {/* Ambient Pulsing Glow Halo */}
          <div
            className={`absolute -inset-6 sm:-inset-8 rounded-full transition-all duration-1000 pointer-events-none ${
              audio.isPlayingVoice
                ? "bg-rose-500/25 blur-2xl scale-105 opacity-100"
                : "bg-rose-500/10 blur-xl scale-95 opacity-50"
            }`}
          />

          {/* Golden/Rose Circular Progress Ring */}
          <svg
            className="absolute w-40 h-40 sm:w-52 sm:h-52 -rotate-90 pointer-events-none"
            viewBox="0 0 200 200"
          >
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="rgba(244, 63, 94, 0.15)"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="url(#progressGoldRoseGradient)"
              strokeWidth="3"
              fill="none"
              strokeDasharray={2 * Math.PI * 90}
              strokeDashoffset={
                2 * Math.PI * 90 * (1 - (audio.voiceProgress || 0))
              }
              strokeLinecap="round"
              className="filter drop-shadow-[0_0_8px_rgba(244,63,94,0.7)] transition-all duration-150"
            />
            <defs>
              <linearGradient id="progressGoldRoseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="60%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#d9a85e" />
              </linearGradient>
            </defs>
          </svg>

          {/* Animated Compact Vinyl Record Disc */}
          <motion.div
            onClick={audio.togglePlay}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative w-34 h-34 sm:w-44 sm:h-44 rounded-full cursor-pointer shadow-[0_15px_35px_rgba(0,0,0,0.95)] flex items-center justify-center border border-white/10 group"
            style={{
              background:
                "conic-gradient(from 0deg, #0e0511 0deg, #260d21 45deg, #0e0511 90deg, #260d21 135deg, #0e0511 180deg, #260d21 225deg, #0e0511 270deg, #260d21 315deg, #0e0511 360deg)",
              boxShadow:
                "0 0 0 3px rgba(255,255,255,0.05), 0 0 25px rgba(244,63,94,0.3), inset 0 0 16px rgba(0,0,0,0.9)",
            }}
          >
            {/* Spinning Groove Plate */}
            <div
              className={`absolute inset-0 rounded-full flex items-center justify-center record-spin ${
                !audio.isPlayingVoice ? "paused" : ""
              }`}
            >
              {/* Concentric Realistic Microgrooves */}
              <div className="absolute inset-2.5 sm:inset-3 rounded-full border border-white/[0.06]" />
              <div className="absolute inset-5 sm:inset-6 rounded-full border border-white/[0.07]" />
              <div className="absolute inset-7.5 sm:inset-9 rounded-full border border-white/[0.06]" />
              <div className="absolute inset-10 sm:inset-12 rounded-full border border-white/[0.07]" />

              {/* Realistic Vinyl Sheen Overlay */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none opacity-40 mix-blend-screen"
                style={{
                  background:
                    "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.2) 0%, transparent 60%)",
                }}
              />

              {/* Center Spindle Label */}
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#3a0d1a] via-[#63142c] to-[#9f1239] border border-[#d9a85e]/60 flex items-center justify-center shadow-inner overflow-hidden">
                {audio.currentTrack?.artwork ? (
                  <img
                    src={audio.currentTrack.artwork}
                    alt={audio.currentTrack.title}
                    className="w-full h-full object-cover rounded-full opacity-80"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : null}

                {/* Center Spindle Hole & Glowing Heart */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#08020a] border border-gold/40 flex items-center justify-center">
                    <Heart
                      size={8}
                      className={`text-rose-400 fill-rose-400 ${
                        audio.isPlayingVoice ? "animate-pulse" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tonearm */}
            <div
              className="absolute -top-1 -right-3 sm:-right-5 w-12 sm:w-16 h-18 sm:h-24 pointer-events-none transition-transform duration-700 ease-out origin-top-right z-30"
              style={{
                transform: audio.isPlayingVoice
                  ? "rotate(20deg) translateY(0px)"
                  : "rotate(2deg) translateY(-6px)",
              }}
            >
              <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-gradient-to-b from-[#2a1b14] to-[#120a0b] border border-gold/60 shadow-md flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-gold/80" />
              </div>
              <div className="absolute top-2 right-1.5 w-0.5 h-14 sm:h-18 bg-gradient-to-b from-stone-300 via-amber-200 to-stone-400 rounded-full shadow-lg" />
              <div className="absolute bottom-0 right-0.5 w-2 h-3.5 bg-[#3a1520] border border-rose-400/80 rounded-xs shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
            </div>
          </motion.div>
        </div>

        {/* 3. Song Title, Artist & Quick Controls */}
        <div className="flex flex-col items-center text-center mt-1 mb-1.5">
          <div className="flex items-center justify-center gap-2">
            <h2 className="font-serif text-base sm:text-xl text-white font-semibold tracking-wide flex items-center gap-1.5">
              <span>{audio.currentTrack?.title || "Perfect"}</span>
              <Heart size={13} className="text-rose-400 fill-rose-400 inline" />
            </h2>
            <button
              onClick={() => {
                if (audio.toggleFavorite && audio.currentTrack?.title) {
                  audio.toggleFavorite(audio.currentTrack.title);
                }
                setIsFavorite(!isFavorite);
              }}
              className="p-2 rounded-full text-white/50 hover:text-rose-400 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={
                (audio.favorites?.includes(audio.currentTrack?.title || "") || isFavorite)
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
            >
              <Heart
                size={14}
                className={
                  (audio.favorites?.includes(audio.currentTrack?.title || "") || isFavorite)
                    ? "fill-rose-500 text-rose-500"
                    : ""
                }
              />
            </button>
            {playlist.length > 1 && (
              <button
                onClick={() => setShowPlaylist(!showPlaylist)}
                className={`p-1 rounded-full transition-colors cursor-pointer ${
                  showPlaylist ? "text-gold" : "text-white/50 hover:text-white"
                }`}
                aria-label="Toggle playlist"
                title="Playlist"
              >
                <ListMusic size={14} />
              </button>
            )}
          </div>
          <p className="text-rose-200/70 text-xs font-serif mt-0.5">
            {audio.currentTrack?.artist || "Ed Sheeran"}
          </p>
        </div>

        {/* Collapsible Playlist Drawer */}
        <AnimatePresence>
          {showPlaylist && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-xs mb-2 overflow-hidden bg-black/60 border border-white/10 rounded-xl backdrop-blur-md"
            >
              <div className="p-2 space-y-1 max-h-36 overflow-y-auto">
                {playlist.map((track, idx) => {
                  const isCurrent = (audio.currentTrackIndex ?? 0) === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (audio.loadTrack) audio.loadTrack(idx, true);
                        else if (idx > (audio.currentTrackIndex ?? 0)) audio.next();
                        else if (idx < (audio.currentTrackIndex ?? 0)) audio.prev();
                        setShowPlaylist(false);
                      }}
                      className={`w-full flex items-center justify-between p-1.5 px-2.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? "bg-rose-500/20 text-gold border border-rose-400/30 font-medium"
                          : "text-white/70 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Music size={11} className={isCurrent ? "text-gold" : "text-white/40"} />
                        <span className="truncate">{track.title}</span>
                      </div>
                      <span className="text-[10px] text-white/40 shrink-0 ml-2">{track.artist}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. AUDIO WAVEFORM VISUALIZER: Compact Rose & Champagne Gold */}
        <div className="w-full max-w-xs sm:max-w-sm my-1 flex flex-col items-center">
          <div
            className="flex items-center justify-center gap-1 sm:gap-1.5 h-6 sm:h-7 w-full px-2"
            aria-label="Audio Waveform Visualizer"
          >
            {waveformBars.map((heightScale, idx) => (
              <motion.div
                key={idx}
                className="w-1 rounded-full transition-all"
                style={{
                  height: `${Math.max(4, heightScale * 26)}px`,
                  background:
                    idx % 3 === 0
                      ? "linear-gradient(to top, #d9a85e, #fef08a)"
                      : idx % 2 === 0
                      ? "linear-gradient(to top, #be123c, #fb7185)"
                      : "linear-gradient(to top, #e11d48, #fda4af)",
                  opacity: audio.isPlayingVoice ? 0.9 : 0.35,
                  boxShadow: audio.isPlayingVoice
                    ? "0 0 5px rgba(244,63,94,0.5)"
                    : "none",
                }}
              />
            ))}
          </div>
          <div className="text-[9px] uppercase font-mono tracking-widest text-[#fed7aa]/60 mt-0.5">
            {audio.isPlayingVoice ? "Playing Melody &bull; Stereo Ambient" : "Melody Paused &bull; Tap Record to Play"}
          </div>
        </div>

        {/* 5. Playback Progress Scrubber Bar & Timestamps */}
        <div className="w-full max-w-xs sm:max-w-sm mt-1 mb-2 px-1">
          <div
            ref={progressRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative w-full h-4 flex items-center cursor-pointer group"
            role="slider"
            aria-label="Audio playback scrubber"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round((audio.voiceProgress || 0) * 100)}
          >
            {/* Scrubber Background Track */}
            <div className="w-full h-1 rounded-full bg-white/15 overflow-hidden relative group-hover:h-1.5 transition-all">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-500 via-rose-400 to-gold relative shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                style={{
                  width: `${Math.max(0, Math.min(100, (audio.voiceProgress || 0) * 100))}%`,
                }}
              />
            </div>

            {/* Glowing Scrubber Thumb */}
            <div
              className="absolute -translate-x-1/2 w-3 h-3 rounded-full bg-white ring-2 ring-rose-400 shadow-md group-hover:scale-125 transition-transform pointer-events-none"
              style={{
                left: `${Math.max(0, Math.min(100, (audio.voiceProgress || 0) * 100))}%`,
              }}
            />
          </div>

          {/* Time Labels */}
          <div className="flex justify-between items-center text-[10px] font-mono text-white/60 px-0.5 -mt-0.5">
            <span>{formatTime(audio.currentTime || 0)}</span>
            <span>{formatTime(audio.voiceDuration || 0)}</span>
          </div>
        </div>

        {/* 6. Playback Control Buttons: Shuffle, Prev, Play/Pause, Next, Repeat */}
        <div className="flex items-center justify-center gap-2 sm:gap-3.5 my-1">
          {/* Shuffle */}
          <button
            onClick={audio.toggleShuffle}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-full transition-all shrink-0 cursor-pointer ${
              audio.isShuffle
                ? "text-gold bg-gold/15 shadow-[0_0_8px_rgba(217,168,94,0.4)] border border-gold/30"
                : "text-white/50 hover:text-white"
            }`}
            aria-label="Shuffle"
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          {/* Previous Track */}
          <button
            onClick={audio.prev}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-full text-white/80 hover:text-white hover:scale-110 active:scale-90 transition-all shrink-0 cursor-pointer"
            aria-label="Previous track"
            title="Previous"
          >
            <SkipBack className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
          </button>

          {/* Play / Pause — Prominent Glowing Circular Button */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={audio.togglePlay}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#9f1239] via-[#e11d48] to-[#f43f5e] flex items-center justify-center text-white shadow-[0_0_20px_rgba(244,63,94,0.65)] border-2 border-rose-300/50 shrink-0 cursor-pointer"
            aria-label={audio.isPlayingVoice ? "Pause" : "Play"}
          >
            {audio.isPlayingVoice ? (
              <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white" />
            ) : (
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white ml-0.5" />
            )}
          </motion.button>

          {/* Next Track */}
          <button
            onClick={audio.next}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-full text-white/80 hover:text-white hover:scale-110 active:scale-90 transition-all shrink-0 cursor-pointer"
            aria-label="Next track"
            title="Next"
          >
            <SkipForward className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
          </button>

          {/* Repeat / Loop */}
          <button
            onClick={audio.toggleLoop}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-full transition-all shrink-0 cursor-pointer ${
              audio.isLooping
                ? "text-rose-400 bg-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.5)] border border-rose-400/40"
                : "text-white/50 hover:text-white"
            }`}
            aria-label="Repeat track"
            title="Repeat"
          >
            <Repeat className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </div>

        {/* 7. Working Volume Control Slider & Mute Toggle */}
        <div
          ref={volumeRef}
          className="mt-2 flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 hover:border-gold/30 transition-all"
        >
          <button
            onClick={toggleMute}
            className="text-white/70 hover:text-rose-300 transition-colors cursor-pointer"
            aria-label={audio.volume === 0 ? "Unmute" : "Mute"}
          >
            {audio.volume === 0 ? (
              <VolumeX size={13} />
            ) : audio.volume < 0.5 ? (
              <Volume1 size={13} />
            ) : (
              <Volume2 size={13} />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={audio.volume}
            onChange={handleVolumeChange}
            className="w-16 sm:w-22 h-1 accent-rose-500 bg-white/20 rounded-full cursor-pointer"
            aria-label="Volume slider"
          />
          <span className="text-[9px] font-mono text-white/50 min-w-[24px]">
            {Math.round(audio.volume * 100)}%
          </span>
        </div>

        {/* 8. Bottom Navigation: Dedicated Back to Gifts Button */}
        {onBack && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3.5 sm:mt-4 flex justify-center w-full"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="min-h-[44px] px-6 py-2 rounded-full bg-gradient-to-r from-[#2c0926]/90 via-[#1b0518]/90 to-[#2c0926]/90 border border-[#d9a85e]/45 hover:border-gold text-rose-200 hover:text-white text-xs sm:text-sm font-serif flex items-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.7),0_0_15px_rgba(217,168,94,0.15)] hover:shadow-[0_6px_25px_rgba(217,168,94,0.3)] transition-all cursor-pointer backdrop-blur-md"
              aria-label="Back to Gifts"
            >
              <ChevronLeft size={16} className="text-gold" />
              <span>Back to Gifts</span>
              <Gift size={15} className="text-rose-400 ml-0.5" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default CinematicAudioPlayer;
