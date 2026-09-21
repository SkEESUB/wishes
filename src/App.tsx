import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Lock,
  Unlock,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  Mail,
  Image as ImageIcon,
  Sparkles,
  Calendar,
  X,
  Smile,
  Laugh,
  Eye,
  Compass,
  SkipBack,
  SkipForward,
  Repeat,
  BookOpen,
  ZoomIn,
} from "lucide-react";
import assets from "./data/assets";
import {
  config,
  birthdayWish,
  letterContent,
  memories,
  wishTreeWishes,
  gifts,
  happiness,
  type HappinessItem,
  birthdayContent,
  stories,
} from "./data/content";


/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type SceneState = {
  scene: number;
  started: boolean;
  countdownSkipped: boolean;
  passwordCorrect: boolean;
  openedGifts: string[];
  visitedGifts: string[];
  letterAnimated: boolean;
  cakeBlown: boolean;
  cakeStage: number;
  happinessOpened: string[];
  audioEnabled: boolean;
  audioVolume: number;
  experienceCompleted: boolean;
  reducedMotion: boolean;
};

/* ------------------------------------------------------------------ */
/* Utilities                                                          */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "birthdayExperience";

function getTargetBirthdayDate() {
  return new Date(config.birthdayDate);
}

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function loadState(): Partial<SceneState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveState(state: SceneState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/* Shared Components                                                  */
/* ------------------------------------------------------------------ */

function BackgroundLayer({
  src,
  overlay = true,
  className,
  animate = false,
}: {
  src?: string;
  overlay?: boolean;
  className?: string;
  animate?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
      className={cn("absolute inset-0 z-0", className)}
    >
      {src ? (
        <div className={cn("absolute inset-0 overflow-hidden", animate && "slow-zoom-bg")}>
          <img
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      ) : null}
      <div
        className={cn(
          "absolute inset-0",
          overlay &&
            "bg-gradient-to-b from-[#0b0d1c]/75 via-[#1a0f1a]/60 to-[#0b0d1c]/92"
        )}
      />
    </motion.div>
  );
}

function ParticleField({
  density = "medium",
  petals = true,
  dots = true,
}: {
  density?: "low" | "medium" | "high";
  petals?: boolean;
  dots?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = window.innerWidth;
    let h = window.innerHeight;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const mobileMultiplier = isMobile ? 0.45 : 1.0;
    const baseCount = density === "low" ? 20 : density === "medium" ? 40 : 70;
    const count = Math.max(8, Math.min(Math.floor(baseCount * mobileMultiplier), Math.floor((w * h) / (isMobile ? 36000 : 22000))));

    type P = {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      alpha: number;
      type: "dot" | "petal";
      rot: number;
      rotSpeed: number;
      color: string;
    };

    const palette = ["#d9a85e", "#d4869a", "#f3cbb4", "#ffffff", "#b06b7d"];
    const particles: P[] = [];
    for (let i = 0; i < count; i++) {
      const isPetal = petals && (!dots || Math.random() > 0.65);
      if (!isPetal && !dots) continue;
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: isPetal ? Math.random() * 4 + 3 : Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * (isPetal ? 0.4 : 0.2),
        vy: (Math.random() * -0.4) - (isPetal ? 0.2 : 0.06),
        alpha: Math.random() * 0.5 + 0.2,
        type: isPetal ? "petal" : "dot",
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        color: palette[Math.floor(Math.random() * palette.length)],
      });
    }

    let isPaused = false;
    const handleVisibility = () => {
      isPaused = document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const draw = () => {
      if (!isPaused) {
        ctx.clearRect(0, 0, w, h);
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.rotSpeed;
          if (p.y < -30) {
            p.y = h + 30;
            p.x = Math.random() * w;
          }
          if (p.x < -30) p.x = w + 30;
          if (p.x > w + 30) p.x = -30;

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          if (p.type === "petal") {
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.r, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });
      }
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [density, petals, prefersReducedMotion]);

  return <canvas ref={canvasRef} className="petal-canvas will-change-transform" aria-hidden="true" />;
}

function PrimaryButton({
  children,
  onClick,
  className,
  type = "button",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? {} : { 
        y: -2, 
        scale: 1.02,
        boxShadow: "0 10px 25px -5px rgba(217, 168, 94, 0.45), 0 0 18px rgba(217, 168, 94, 0.3)" 
      }}
      whileTap={disabled ? {} : { 
        scale: 0.97, 
        y: 0 
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "btn-primary inline-flex min-h-[48px] items-center justify-center rounded-full px-8 py-3 font-medium tracking-wide shadow-md transition-shadow duration-300",
        className
      )}
    >
      {children}
    </motion.button>
  );
}

function GlassButton({
  children,
  onClick,
  className,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { 
        y: -2, 
        scale: 1.02,
        boxShadow: "0 10px 20px -5px rgba(255, 255, 255, 0.15), 0 0 12px rgba(255, 255, 255, 0.1)" 
      }}
      whileTap={disabled ? {} : { 
        scale: 0.97, 
        y: 0 
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn("btn-glass inline-flex min-h-[44px] items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium shadow-sm transition-shadow duration-300", className)}
    >
      {children}
    </motion.button>
  );
}

function CountdownCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="glass-premium flex aspect-square w-20 flex-col items-center justify-center rounded-2xl border border-gold/20 shadow-[0_0_15px_rgba(217,168,94,0.15)] sm:w-24">
      <span className="font-serif text-3xl font-bold text-gold glow-gold sm:text-4xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-widest text-white/60 sm:text-xs">
        {label}
      </span>
    </div>
  );
}

function SafeImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const [err, setErr] = useState(false);
  if (err || !src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-rose-900/40 to-midnight",
          className
        )}
      >
        <ImageIcon className="h-10 w-10 text-white/30" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt || ""}
      className={className}
      onError={() => setErr(true)}
      loading="lazy"
    />
  );
}

function Polaroid({
  image,
  caption,
  date,
  rotate = 0,
  className,
  onClick,
}: {
  image: string;
  caption: string;
  date?: string;
  rotate?: number;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileHover={{ y: -6, scale: 1.03, rotate: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "polaroid block w-full p-2.5 pb-4 text-left border border-amber-950/10 hover:border-gold/30 hover:shadow-[0_12px_28px_rgba(217,168,94,0.15)] rounded bg-[#faf8f5] shadow-md cursor-pointer group focus:outline-none transition-colors duration-300",
        className
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className="relative border border-amber-900/5 group-hover:border-gold/20 p-0.5 rounded-sm transition-colors duration-300">
        <SafeImage
          src={image}
          alt={caption}
          className="polaroid-img aspect-square w-full rounded-sm bg-stone-100 object-cover filter sepia-[15%] saturate-[90%] brightness-[96%] group-hover:sepia-0 group-hover:saturate-100 group-hover:brightness-102 transition-all duration-300"
        />
        {/* Subtle inner gold frame highlight on hover */}
        <div className="absolute inset-0 border border-transparent group-hover:border-gold/15 rounded-sm pointer-events-none transition-colors duration-300" />
      </div>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* Audio Engine                                                       */
/* ------------------------------------------------------------------ */

function useAudioEngine() {
  const ctxRef = useRef<AudioContext | null>(null);
  const ambientNodes = useRef<{
    oscs: OscillatorNode[];
    gain: GainNode;
    lfo: OscillatorNode;
    lfoGain: GainNode;
  } | null>(null);

  // Unified playlist configuration
  const playlist = useMemo(() => birthdayContent.playlist, []);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const currentTrack = playlist[currentTrackIndex] || playlist[0];

  // Playback state
  const [enabled, setEnabled] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [audioError, setAudioError] = useState(false);

  // Synth state
  const [isPlayingSynth, setIsPlayingSynth] = useState(false);
  const [synthProgress, setSynthProgress] = useState(0);
  const [synthCurrentTime, setSynthCurrentTime] = useState(0);
  const SYNTH_DURATION = 24;
  const synthRef = useRef<{
    oscs: OscillatorNode[];
    gain: GainNode;
    startTime: number;
    raf: number;
  } | null>(null);

  // HTML5 Audio element state
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const init = useCallback(() => {
    if (!ctxRef.current) {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return false;
      ctxRef.current = new AudioCtx();
    }
    const ctx = ctxRef.current!;
    if (ctx.state === "suspended") ctx.resume();
    return true;
  }, []);

  // Sync volume to both synth nodes and HTML5 audio element
  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (ambientNodes.current) {
      ambientNodes.current.gain.gain.setTargetAtTime(v * 0.12, ctxRef.current?.currentTime || 0, 0.1);
    }
    if (synthRef.current) {
      synthRef.current.gain.gain.setTargetAtTime(v * 0.25, ctxRef.current?.currentTime || 0, 0.1);
    }
    if (audioElRef.current) {
      audioElRef.current.volume = v;
    }
  }, []);

  const startAmbient = useCallback(() => {
    if (!init() || ambientNodes.current) return;
    const ctx = ctxRef.current!;
    const master = ctx.createGain();
    master.gain.value = volume * 0.12;
    master.connect(ctx.destination);

    const oscs: OscillatorNode[] = [];
    const freqs = [110, 164.81, 196];
    freqs.forEach((f) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.2;
      osc.connect(g).connect(master);
      osc.start();
      oscs.push(osc);
    });

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.12;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.04;
    lfo.connect(lfoGain).connect(master.gain);
    lfo.start();

    ambientNodes.current = { oscs, gain: master, lfo, lfoGain };
    setEnabled(true);
  }, [init, volume]);

  const stopAmbient = useCallback(() => {
    if (!ambientNodes.current) return;
    ambientNodes.current.oscs.forEach((o) => o.stop());
    ambientNodes.current.lfo.stop();
    ambientNodes.current = null;
    setEnabled(false);
  }, []);

  const toggleAmbient = useCallback(() => {
    if (enabled) stopAmbient();
    else startAmbient();
  }, [enabled, startAmbient, stopAmbient]);

  // --- SYNTH MELODY PLAYBACK ENGINE ---
  const playSynthMelody = useCallback((startOffset = 0) => {
    if (!init()) return;
    if (synthRef.current) {
      synthRef.current.oscs.forEach((o) => o.stop());
      cancelAnimationFrame(synthRef.current.raf);
      synthRef.current = null;
    }
    const ctx = ctxRef.current!;
    const gain = ctx.createGain();
    gain.gain.value = volume * 0.25;
    gain.connect(ctx.destination);

    const notes = [
      261.63, 293.66, 329.63, 392, 440, 392, 329.63, 293.66,
      261.63, 246.94, 261.63, 293.66, 329.63, 392, 440, 523.25,
      494.88, 440, 392, 349.23, 329.63, 293.66, 261.63,
    ];
    const step = SYNTH_DURATION / notes.length;
    const now = ctx.currentTime;
    const oscs: OscillatorNode[] = [];

    notes.forEach((freq, i) => {
      const noteStart = i * step;
      const noteEnd = (i + 1) * step;
      if (noteEnd <= startOffset) return;

      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const ng = ctx.createGain();

      const playDelay = Math.max(0, noteStart - startOffset);
      const endDelay = noteEnd - startOffset;

      ng.gain.setValueAtTime(0, now + playDelay);
      ng.gain.linearRampToValueAtTime(0.25, now + playDelay + 0.08);
      ng.gain.exponentialRampToValueAtTime(0.001, now + endDelay - 0.05);
      osc.connect(ng).connect(gain);
      osc.start(now + playDelay);
      osc.stop(now + endDelay);
      oscs.push(osc);
    });

    const startTime = performance.now() - startOffset * 1000;
    synthRef.current = { oscs, gain, startTime, raf: 0 };
    setIsPlayingSynth(true);

    const update = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      const prog = Math.min(elapsed / SYNTH_DURATION, 1);
      setSynthProgress(prog);
      setSynthCurrentTime(elapsed);
      if (prog < 1 && synthRef.current) {
        synthRef.current.raf = requestAnimationFrame(update);
      } else {
        setIsPlayingSynth(false);
        setSynthProgress(0);
        setSynthCurrentTime(0);
      }
    };
    update();
  }, [init, volume]);

  const pauseSynthMelody = useCallback(() => {
    if (!synthRef.current) return;
    synthRef.current.oscs.forEach((o) => o.stop());
    cancelAnimationFrame(synthRef.current.raf);
    synthRef.current = null;
    setIsPlayingSynth(false);
  }, []);

  const [isLooping, setIsLooping] = useState(false);
  const toggleLoop = useCallback(() => {
    setIsLooping((prev) => {
      const next = !prev;
      if (audioElRef.current) {
        audioElRef.current.loop = next;
      }
      return next;
    });
  }, []);

  // --- HTML5 AUDIO PLAYBACK ENGINE ---
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audio.loop = isLooping;

    const initialTrack = playlist[currentTrackIndex] || playlist[0];
    if (initialTrack && initialTrack.src) {
      audio.src = initialTrack.src;
      audio.load();
    }

    const onTimeUpdate = () => {
      setAudioCurrentTime(audio.currentTime);
      if (audio.duration) {
        setAudioProgress(audio.currentTime / audio.duration);
      }
    };

    const onLoadedMetadata = () => {
      setAudioDuration(audio.duration);
    };

    const onPlay = () => setIsPlayingAudio(true);
    const onPause = () => setIsPlayingAudio(false);
    
    const onEnded = () => {
      if (!audio.loop) {
        setIsPlayingAudio(false);
        setAudioProgress(0);
        setAudioCurrentTime(0);
        // Auto-advance next song
        handleNext();
      }
    };

    const onError = () => {
      setAudioError(true);
      setIsPlayingAudio(false);
      // Automatically fallback to Web Audio synthetic melody player on error
      setTimeout(() => {
        playSynthMelody(audio.currentTime || 0);
      }, 50);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    audioElRef.current = audio;

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [volume, playSynthMelody, isLooping]);

  // Handle switching tracks
  const loadTrack = useCallback((index: number, shouldPlay: boolean) => {
    // Stop synth and audio
    pauseSynthMelody();
    setSynthProgress(0);
    setSynthCurrentTime(0);
    setAudioError(false); // Reset error state on new track load

    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.currentTime = 0;
      setAudioProgress(0);
      setAudioCurrentTime(0);
    }

    setCurrentTrackIndex(index);
    const track = playlist[index];
    if (track && track.src) {
      if (audioElRef.current) {
        audioElRef.current.src = track.src;
        audioElRef.current.load();
        if (shouldPlay) {
          audioElRef.current.play().catch(() => {});
        }
      }
    } else {
      // Empty src: it's synthetic melody
      if (shouldPlay) {
        setTimeout(() => playSynthMelody(0), 50);
      }
    }
  }, [playlist, pauseSynthMelody, playSynthMelody]);

  // Global control interface
  const play = useCallback(() => {
    if (currentTrack.src && !audioError) {
      if (audioElRef.current) {
        if (!audioElRef.current.src || !audioElRef.current.src.includes(currentTrack.src)) {
          audioElRef.current.src = currentTrack.src;
          audioElRef.current.load();
        }
        audioElRef.current.play().catch((err) => {
          console.warn("Audio play prevented:", err);
        });
      }
    } else {
      playSynthMelody(synthCurrentTime || audioCurrentTime);
    }
  }, [currentTrack, playSynthMelody, synthCurrentTime, audioCurrentTime, audioError]);

  const pause = useCallback(() => {
    if (currentTrack.src && !audioError) {
      audioElRef.current?.pause();
    } else {
      pauseSynthMelody();
    }
  }, [currentTrack, pauseSynthMelody, audioError]);

  const togglePlay = useCallback(() => {
    const isPlaying = (currentTrack.src && !audioError) ? isPlayingAudio : isPlayingSynth;
    if (isPlaying) pause();
    else play();
  }, [currentTrack, isPlayingAudio, isPlayingSynth, play, pause, audioError]);

  const handleNext = useCallback(() => {
    const isPlaying = (currentTrack.src && !audioError) ? isPlayingAudio : isPlayingSynth;
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(nextIndex, isPlaying);
  }, [currentTrackIndex, playlist, currentTrack, isPlayingAudio, isPlayingSynth, loadTrack, audioError]);

  const handlePrev = useCallback(() => {
    const isPlaying = (currentTrack.src && !audioError) ? isPlayingAudio : isPlayingSynth;
    const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadTrack(prevIndex, isPlaying);
  }, [currentTrackIndex, playlist, currentTrack, isPlayingAudio, isPlayingSynth, loadTrack, audioError]);

  const seek = useCallback((prog: number) => {
    if (currentTrack.src && !audioError) {
      if (audioElRef.current && audioDuration) {
        const targetTime = prog * audioDuration;
        audioElRef.current.currentTime = targetTime;
        setAudioProgress(prog);
        setAudioCurrentTime(targetTime);
      }
    } else {
      // Seek synth melody
      const targetTime = prog * SYNTH_DURATION;
      const isPlaying = isPlayingSynth;
      pauseSynthMelody();
      setSynthProgress(prog);
      setSynthCurrentTime(targetTime);
      if (isPlaying) {
        playSynthMelody(targetTime);
      }
    }
  }, [currentTrack, audioDuration, isPlayingSynth, pauseSynthMelody, playSynthMelody, audioError]);

  const isPlaying = (currentTrack.src && !audioError) ? isPlayingAudio : isPlayingSynth;
  const progress = (currentTrack.src && !audioError) ? audioProgress : synthProgress;
  const currentTime = (currentTrack.src && !audioError) ? audioCurrentTime : synthCurrentTime;
  const duration = (currentTrack.src && !audioError) ? audioDuration : SYNTH_DURATION;

  return {
    enabled,
    volume,
    setVolume,
    startAmbient,
    stopAmbient,
    toggleAmbient,
    isPlayingVoice: isPlaying,
    voiceProgress: progress,
    voiceDuration: duration,
    currentTime,
    currentTrackIndex,
    currentTrack,
    playlist,
    play,
    pause,
    togglePlay,
    next: handleNext,
    prev: handlePrev,
    seek,
    isLooping,
    toggleLoop,
    loadTrack,
    audioError,
    playVoiceMelody: play,
    pauseVoiceMelody: pause,
    replayVoiceMelody: () => seek(0),
  };
}

/* ------------------------------------------------------------------ */
/* Microphone Blow Detection                                          */
/* ------------------------------------------------------------------ */

function useBlowDetector(onBlow: () => void) {
  const [status, setStatus] = useState<"idle" | "listening" | "denied" | "unavailable">("idle");
  const [blowIntensity, setBlowIntensity] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);
  const consecutiveRef = useRef(0);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStatus("idle");
    setBlowIntensity(0);
    consecutiveRef.current = 0;
  }, []);

  const start = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("unavailable");
        return;
      }
      setStatus("listening");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const data = new Uint8Array(analyser.fftSize);

      let smoothedIntensity = 0;

      const detect = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        const rawIntensity = Math.min(1, rms / 0.3);
        smoothedIntensity = smoothedIntensity * 0.7 + rawIntensity * 0.3;
        setBlowIntensity(smoothedIntensity);

        if (rms > 0.18) {
          consecutiveRef.current += 1;
          if (consecutiveRef.current > 8) {
            onBlow();
            consecutiveRef.current = 0; // Reset to allow subsequent blowing
          }
        } else {
          consecutiveRef.current = Math.max(0, consecutiveRef.current - 1);
        }
        rafRef.current = requestAnimationFrame(detect);
      };
      detect();
    } catch {
      setStatus("denied");
    }
  }, [onBlow, stop]);

  useEffect(() => () => stop(), [stop]);

  return { start, stop, status, blowIntensity };
}

function FireworkCanvas({ edgesOnly = false }: { edgesOnly?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    let raf = 0;
    let w = window.innerWidth;
    let h = window.innerHeight;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    type Spark = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      decay: number;
      size: number;
      gravity: number;
    };

    let sparks: Spark[] = [];
    const colors = ["#d9a85e", "#fffdfa", "#f3cbb4", "#d4869a", "#fff5e6"];

    const createFirework = (x: number, y: number) => {
      const count = 35 + Math.floor(Math.random() * 25);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.5 + 1;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.015 + 0.01,
          size: Math.random() * 1.5 + 1.2,
          gravity: 0.04,
        });
      }
    };

    let timer = 0;
    let nextExplosionFrame = 60;

    // Elegant entrance firework bursts
    const t1 = setTimeout(() => {
      const x = edgesOnly ? w * (0.08 + Math.random() * 0.12) : w * 0.25;
      createFirework(x, h * 0.28);
    }, 350);
    const t2 = setTimeout(() => {
      const x = edgesOnly ? w * (0.8 + Math.random() * 0.12) : w * 0.75;
      createFirework(x, h * 0.24);
    }, 850);

    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      timer++;
      if (timer >= nextExplosionFrame) {
        let fireworkX;
        if (edgesOnly) {
          fireworkX = Math.random() > 0.5 
            ? w * (0.06 + Math.random() * 0.15) 
            : w * (0.79 + Math.random() * 0.15);
        } else {
          fireworkX = w * (0.2 + Math.random() * 0.6);
        }
        createFirework(
          fireworkX,
          h * (0.15 + Math.random() * 0.25)
        );
        nextExplosionFrame = timer + 120 + Math.floor(Math.random() * 100);
      }

      sparks = sparks.filter((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.vy += s.gravity;
        s.vx *= 0.98;
        s.vy *= 0.98;
        s.alpha -= s.decay;

        if (s.alpha <= 0) return false;

        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = s.color;
        // High fidelity glowing spark filter
        ctx.shadowBlur = 5;
        ctx.shadowColor = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      });

      raf = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10 w-full h-full" />;
}

function TypewriterText({ text, speed = 30 }: { text: string; speed?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setIndex(text.length);
      return;
    }

    setIndex(0);
    let curr = 0;
    let timer: NodeJS.Timeout;

    const type = () => {
      if (curr < text.length) {
        setIndex(curr + 1);
        curr++;
        const variation = Math.random() * 20 - 10;
        timer = setTimeout(type, Math.max(10, speed + variation));
      }
    };

    type();
    return () => clearTimeout(timer);
  }, [text, speed]);

  const visiblePart = text.slice(0, index);
  const invisiblePart = text.slice(index);

  return (
    <span className="relative">
      <span>{visiblePart}</span>
      <span className="opacity-0 pointer-events-none select-none" aria-hidden="true">
        {invisiblePart}
      </span>
      {index < text.length && (
        <span
          className="inline-block w-1.5 h-4 bg-rose/80 ml-0.5 animate-pulse"
          style={{ verticalAlign: "middle" }}
        />
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                */
/* ------------------------------------------------------------------ */

export default function App() {
  const [state, setState] = useState<SceneState>(() => {
    const saved = loadState();
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return {
      scene: saved.scene ?? 0,
      started: saved.started ?? false,
      countdownSkipped: saved.countdownSkipped ?? false,
      passwordCorrect: saved.passwordCorrect ?? false,
      openedGifts: saved.openedGifts ?? [],
      visitedGifts: saved.visitedGifts ?? [],
      letterAnimated: saved.letterAnimated ?? false,
      cakeBlown: saved.cakeBlown ?? false,
      cakeStage: saved.cakeStage ?? 0,
      happinessOpened: saved.happinessOpened ?? [],
      audioEnabled: saved.audioEnabled ?? false,
      audioVolume: saved.audioVolume ?? 0.5,
      experienceCompleted: saved.experienceCompleted ?? false,
      reducedMotion,
    };
  });

  const audio = useAudioEngine();
  const [targetDate] = useState(() => getTargetBirthdayDate());
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });

  const goTo = useCallback((scene: number) => {
    setState((s) => {
      const next = { ...s, scene };
      saveState(next);
      return next;
    });
  }, []);

  const startExperience = useCallback(() => {
    setState((s) => {
      const next = { ...s, started: true };
      saveState(next);
      return next;
    });
    audio.startAmbient();
    const now = new Date().getTime();
    if (targetDate.getTime() - now <= 0 || state.countdownSkipped) {
      goTo(3);
    } else {
      goTo(1);
    }
  }, [audio, goTo, targetDate, state.countdownSkipped]);

  const unlockPassword = useCallback(() => {
    setState((s) => {
      const next = { ...s, passwordCorrect: true };
      saveState(next);
      return next;
    });
    goTo(5);
  }, [goTo]);

  const openGift = useCallback(
    (id: string) => {
      setState((s) => {
        const opened = s.openedGifts.includes(id)
          ? s.openedGifts
          : [...s.openedGifts, id];
        const next = { ...s, openedGifts: opened };
        saveState(next);
        return next;
      });
    },
    []
  );

  const goToGift = useCallback((sceneIndex: number, giftId: string) => {
    setState((s) => {
      const visited = s.visitedGifts.includes(giftId)
        ? s.visitedGifts
        : [...s.visitedGifts, giftId];
      const next = { ...s, scene: sceneIndex, visitedGifts: visited };
      saveState(next);
      return next;
    });
  }, []);

  const handleGiftContinue = useCallback((giftId: string) => {
    setState((s) => {
      const opened = s.openedGifts.includes(giftId)
        ? s.openedGifts
        : [...s.openedGifts, giftId];
      const next = { ...s, openedGifts: opened, scene: 9 };
      saveState(next);
      return next;
    });
  }, []);

  const backToGifts = useCallback(() => goTo(9), [goTo]);

  const completeExperience = useCallback(() => {
    setState((s) => {
      const next = { ...s, experienceCompleted: true };
      saveState(next);
      return next;
    });
    goTo(17);
  }, [goTo]);

  const replay = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      scene: 0,
      started: false,
      countdownSkipped: false,
      passwordCorrect: false,
      openedGifts: [],
      visitedGifts: [],
      letterAnimated: false,
      cakeBlown: false,
      cakeStage: 0,
      happinessOpened: [],
      audioEnabled: false,
      audioVolume: 0.5,
      experienceCompleted: false,
      reducedMotion: state.reducedMotion,
    });
    audio.stopAmbient();
  }, [audio, state.reducedMotion]);

  /* Countdown */
  useEffect(() => {
    const tick = () => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;
      if (diff <= 0) {
        setCountdown({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }
      const totalSecs = Math.ceil(diff / 1000);
      const d = Math.floor(totalSecs / (60 * 60 * 24));
      const h = Math.floor((totalSecs / (60 * 60)) % 24);
      const m = Math.floor((totalSecs / 60) % 60);
      const s = totalSecs % 60;
      setCountdown({ d, h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate, state.scene, goTo]);

  useEffect(() => {
    audio.setVolume(state.audioVolume);
  }, [state.audioVolume]);

  const skipCountdown = useCallback(() => {
    setState((s) => {
      const next = { ...s, countdownSkipped: true };
      saveState(next);
      return next;
    });
    goTo(3);
  }, [goTo]);

  const scenes = useMemo(
    () => [
      <WelcomeScene key="welcome" onStart={startExperience} />,
      <CountdownStartScene key="cdstart" onBegin={() => goTo(2)} onSkip={skipCountdown} />,
      <CountdownRunningScene key="cdrun" countdown={countdown} targetDate={targetDate} onSkip={skipCountdown} />,
      <BirthdayRevealScene key="reveal" onContinue={() => goTo(4)} />,
      <PasswordScene key="password" onUnlock={unlockPassword} />,
      <WishesScene key="wishes" onContinue={() => goTo(6)} />,
      <CakeScene key="cake" onBlown={() => goTo(7)} />,
      <CakeCuttingScene
        key="cutcake"
        stage={state.cakeStage}
        onStage={(n) => {
          setState((s) => {
            const next = { ...s, cakeStage: n };
            saveState(next);
            return next;
          });
          if (n >= 6) setTimeout(() => goTo(8), 1000);
        }}
      />,
      <ShareHappinessScene
        key="happiness"
        opened={state.happinessOpened}
        onOpen={(id) => {
          setState((s) => {
            const opened = s.happinessOpened.includes(id)
              ? s.happinessOpened
              : [...s.happinessOpened, id];
            const next = { ...s, happinessOpened: opened };
            saveState(next);
            return next;
          });
        }}
        onContinue={() => goTo(9)}
      />,
      <GiftsScene key="gifts" opened={state.openedGifts} onOpen={openGift} onContinue={() => goTo(13)} goToGift={goToGift} />,
      <LetterScene
        key="letter"
        onBack={() => goTo(9)}
        onContinue={() => handleGiftContinue("letter")}
        cameFromGifts={true}
        onNext={() => goToGift(11, "memories")}
        onPrev={() => goToGift(12, "voice")}
      />,
      <MemoriesScene
        key="memories"
        onBack={() => goTo(9)}
        onContinue={() => handleGiftContinue("memories")}
        onNext={() => goToGift(12, "voice")}
        onPrev={() => goToGift(10, "letter")}
      />,
      <VoiceScene
        key="voice"
        audio={audio}
        onBack={() => goTo(9)}
        onContinue={() => handleGiftContinue("voice")}
        onNext={() => goToGift(10, "letter")}
        onPrev={() => goToGift(11, "memories")}
      />,

      <WishTreeScene key="wishtree" onContinue={() => goTo(14)} />,
      <MemoryJourneyScene key="memoryjourney" onContinue={() => goTo(15)} />,
      <HiddenSurpriseScene key="surprise" onContinue={() => goTo(16)} />,
      <SpecialVideoScene key="specialvideo" onContinue={completeExperience} audio={audio} />,
      <FinalScene key="final" onReplay={replay} />,
    ],
    [
      startExperience,
      goTo,
      skipCountdown,
      countdown,
      targetDate,
      unlockPassword,
      state.cakeStage,
      state.happinessOpened,
      state.openedGifts,
      state.visitedGifts,
      openGift,
      goToGift,
      handleGiftContinue,
      backToGifts,
      audio,
      completeExperience,
      replay,
    ]
  );

  return (
    <div className="relative h-full w-full overflow-hidden bg-midnight text-white safe-top safe-bottom">


      <AnimatePresence mode="wait">
        <motion.div
          key={state.scene}
          initial={{ opacity: 0, scale: 0.98, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.98, y: -10, filter: "blur(4px)" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {scenes[state.scene]}
        </motion.div>
      </AnimatePresence>

        <div className="fixed right-4 top-4 z-50 flex items-center gap-2">
        <button
          onClick={() => {
            const next = !audio.enabled;
            if (next) audio.startAmbient();
            else audio.stopAmbient();
            setState((s) => ({ ...s, audioEnabled: next }));
          }}
          className="glass rounded-full p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-white/90 hover:text-white"
          aria-label={audio.enabled ? "Mute music" : "Play music"}
        >
          {audio.enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={state.audioVolume}
          onChange={(e) => setState((s) => ({ ...s, audioVolume: parseFloat(e.target.value) }))}
          className="hidden w-20 sm:block"
          aria-label="Volume"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 0 — Welcome                                                  */
/* ------------------------------------------------------------------ */

function WelcomeScene({ onStart }: { onStart: () => void }) {
  return (
    <div
      className="scene-container cursor-pointer"
      onClick={onStart}
      onKeyDown={(e) => e.key === "Enter" && onStart()}
      role="button"
      tabIndex={0}
      aria-label="Begin our story"
    >
      <BackgroundLayer src={assets.welcomeFlowers} overlay animate />
      <ParticleField density="medium" petals />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="flex flex-col items-center"
        >
          <span className="mb-6 text-xs uppercase tracking-[0.4em] text-gold font-medium">
            A Special Journey Awaits
          </span>

          {/* Sealed envelope breathing visual */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="relative h-28 w-44 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center mb-10 overflow-hidden"
          >
            {/* Inner envelope lines */}
            <div className="absolute inset-x-4 top-6 h-0.5 bg-white/10" />
            <div className="absolute inset-x-4 top-10 h-0.5 bg-white/10" />
            <div className="absolute inset-x-8 top-14 h-0.5 bg-white/10" />
            
            {/* Wax seal heart icon */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              >
                <Heart className="h-8 w-8 fill-rose text-rose filter drop-shadow-[0_0_10px_rgba(212,134,154,0.85)]" />
              </motion.div>
            </div>
          </motion.div>

          <h1 className="font-serif text-4xl font-bold leading-tight sm:text-6xl max-w-xl mx-auto">
            <span className="gradient-text glow-gold block">Tonight is a little different...</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md font-serif italic text-base text-white/70 sm:text-lg">
            There&apos;s a little story waiting for you.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-10"
          >
            <PrimaryButton onClick={onStart}>Begin Our Story ♥</PrimaryButton>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 1 & 2 — Countdown                                            */
/* ------------------------------------------------------------------ */

function CountdownStartScene({ onBegin, onSkip }: { onBegin: () => void; onSkip: () => void }) {
  return (
    <div className="scene-container">
      <BackgroundLayer src={assets.countdownGarden} overlay />
      <ParticleField density="low" petals={false} />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="max-w-xl">
          <Sparkles className="mx-auto mb-4 h-8 w-8 text-gold" />
          <h2 className="font-serif text-4xl font-semibold leading-tight sm:text-6xl gradient-text glow-gold">
            Something special is coming...
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">
            The stars are aligning, the flowers are waking, and a little magic is being prepared just for you.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <PrimaryButton onClick={onBegin}>Begin Countdown</PrimaryButton>
            <GlassButton onClick={onSkip}>Skip Countdown</GlassButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function CountdownRunningScene({
  countdown,
  targetDate,
  onSkip,
}: {
  countdown: { d: number; h: number; m: number; s: number };
  targetDate: Date;
  onSkip: () => void;
}) {
  const dateStr = targetDate.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  return (
    <div className="scene-container">
      <BackgroundLayer src={assets.countdownGarden} overlay />
      <ParticleField density="low" petals={false} />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          <h2 className="font-serif text-3xl font-semibold sm:text-5xl gradient-text glow-gold">
            A special day is almost here
          </h2>
          <div className="mx-auto mt-8 flex flex-wrap justify-center gap-3 sm:gap-5">
            <CountdownCard value={countdown.d} label="Days" />
            <CountdownCard value={countdown.h} label="Hours" />
            <CountdownCard value={countdown.m} label="Minutes" />
            <CountdownCard value={countdown.s} label="Seconds" />
          </div>
          <p className="mt-8 flex items-center justify-center gap-2 text-sm text-white/70 sm:text-base">
            <Calendar size={16} />
            Counting down to {dateStr} • 12:00 AM
          </p>
          <div className="mt-8">
            <GlassButton onClick={onSkip}>Skip Countdown</GlassButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 3 — Birthday Reveal                                          */
/* ------------------------------------------------------------------ */

function BirthdayRevealScene({ onContinue }: { onContinue: () => void }) {
  const [stage, setStage] = useState(1);
  const partnerName = birthdayContent.herName;

  useEffect(() => {
    const t1 = setTimeout(() => setStage(2), 3500);
    const t2 = setTimeout(() => setStage(3), 7000);
    const t3 = setTimeout(() => setStage(4), 10500);
    const t4 = setTimeout(() => setStage(5), 14000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const skip = () => {
    setStage(5);
  };

  return (
    <div className="scene-container bg-[#05060f]">
      {/* Background layer changes intensity based on stage */}
      <AnimatePresence mode="wait">
        {stage >= 3 ? (
          <BackgroundLayer key="reveal-bg" src={assets.birthdayReveal} overlay />
        ) : (
          <motion.div
            key="dark-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-b from-[#05060f] via-[#0b0c16] to-[#05060f]"
          />
        )}
      </AnimatePresence>

      {/* Particle field density builds up */}
      {stage === 1 && <ParticleField density="low" petals={false} />}
      {stage === 2 && <ParticleField density="medium" petals={false} />}
      {stage >= 3 && <ParticleField density="high" petals={true} />}

      {/* Subtle background light bloom */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-3000 pointer-events-none",
        stage === 1 ? "opacity-10" : stage === 2 ? "opacity-25" : "opacity-40",
        "bg-[radial-gradient(circle_at_center,_rgba(217,168,94,0.15),_transparent_65%)]"
      )} />

      {/* Celebration fireworks effect on Stage 4 and 5 */}
      {stage >= 4 && <FireworkCanvas />}

      <div className="relative z-20 flex flex-1 flex-col items-center justify-center p-6 text-center">
        <AnimatePresence mode="wait">
          {stage === 1 && (
            <motion.div
              key="stage1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 1.5 }}
              className="max-w-md"
            >
              <p className="font-serif italic text-xl text-champagne/80 tracking-wide leading-relaxed">
                "Close your eyes... and take a deep breath."
              </p>
            </motion.div>
          )}

          {stage === 2 && (
            <motion.div
              key="stage2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 1.5 }}
              className="max-w-md"
            >
              <p className="text-xs uppercase tracking-[0.4em] text-white/50 mb-3">The night is quiet</p>
              <p className="font-serif italic text-xl text-champagne/80 tracking-wide leading-relaxed">
                "Listen to the stars whispering your name..."
              </p>
            </motion.div>
          )}

          {stage === 3 && (
            <motion.div
              key="stage3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.5 }}
              className="max-w-2xl"
            >
              <motion.h1
                initial={{ filter: "blur(12px)", opacity: 0 }}
                animate={{ filter: "blur(0px)", opacity: 1 }}
                transition={{ duration: 1.8 }}
                className="font-serif text-5xl font-bold leading-tight sm:text-7xl lg:text-8xl gradient-text glow-gold"
              >
                Happy Birthday
              </motion.h1>
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1.2 }}
                className="mt-4 font-script text-5xl text-rose glow-rose sm:text-7xl"
              >
                {partnerName} ♥
              </motion.h2>
            </motion.div>
          )}

          {stage === 4 && (
            <motion.div
              key="stage4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="max-w-xl"
            >
              <h1 className="font-serif text-4xl font-bold leading-tight sm:text-6xl gradient-text glow-gold">
                Happy Birthday
              </h1>
              <h2 className="mt-3 font-script text-5xl text-rose glow-rose sm:text-7xl">
                Pandi ♥
              </h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="mt-6 font-serif italic text-lg text-white/80 sm:text-xl"
              >
                "Every moment with you is a gift..."
              </motion.p>
            </motion.div>
          )}

          {stage === 5 && (
            <motion.div
              key="stage5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5 }}
              className="max-w-2xl"
            >
              <h1 className="font-serif text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl gradient-text glow-gold">
                Happy Birthday Bangaram ♥ 
              </h1>
              <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
                On this beautiful day, a small journey of memories, wishes, and love is waiting for you. Let's step inside.
              </p>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="mt-10"
              >
                <PrimaryButton onClick={onContinue}>
                  Step Inside ♥
                </PrimaryButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tiny subtle skip button for convenience during preview */}
      {stage < 5 && (
        <button
          onClick={skip}
          className="absolute bottom-6 right-6 z-30 min-h-[44px] min-w-[44px] px-3 py-2 flex items-center justify-center text-xs text-white/40 hover:text-white/80 tracking-widest uppercase transition-colors cursor-pointer"
        >
          Skip Intro
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 4 — Password                                                 */
/* ------------------------------------------------------------------ */

function PasswordScene({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (value.trim() === config.password) {
      setError(false);
      setSuccess(true);
      setTimeout(() => onUnlock(), 1200);
    } else {
      setError(true);
      setSuccess(false);
      // Let the hearts scatter outwards by clearing typed text after a delay
      setTimeout(() => {
        setValue("");
        setError(false);
      }, 700);
    }
  };

  return (
    <div className="scene-container">
      <BackgroundLayer src={assets.couplePhoto} overlay />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d1c]/92 via-[#1a0f1a]/55 to-[#0b0d1c]/80" />
      <ParticleField density="low" petals />
      <div className="relative z-10 flex min-h-full flex-1 flex-col items-center justify-center overflow-y-auto p-6 py-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="w-full max-w-sm"
        >
          {/* Main Card Container */}
          <motion.div
            animate={error ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
            transition={{ duration: 0.5 }}
            className={cn(
              "w-full rounded-3xl glass-premium border p-8 transition-all duration-500",
              error ? "border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.25)] bg-rose-950/5" : "border-white/10",
              success ? "border-gold/40 shadow-[0_0_40px_rgba(217,168,94,0.35)] bg-gold/5" : ""
            )}
          >
            {/* Lock / Unlock Icon */}
            <motion.div
              animate={success ? { scale: [1, 1.25, 1], rotate: [0, 15, -15, 0] } : {}}
              transition={{ duration: 0.8 }}
              className={cn(
                "mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full glass-strong border transition-all duration-300",
                success ? "border-gold/30 text-gold shadow-gold" : "border-white/10 text-white/70"
              )}
            >
              {success ? <Unlock className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
            </motion.div>

            <h2 className="font-serif text-3xl font-bold gradient-text glow-gold">
              Only one person
            </h2>
            <p className="mt-2 text-base text-white/80">can unlock this...</p>

            <form onSubmit={submit} className="mt-8 space-y-5">
              {/* Custom Input Wrapper */}
              <div 
                onClick={() => inputRef.current?.focus()}
                className={cn(
                  "w-full rounded-2xl border px-5 py-4 flex items-center justify-center min-h-[64px] relative transition-all duration-300 cursor-text",
                  isFocused ? "border-gold/40 ring-2 ring-gold/25" : "border-white/20 bg-white/5 hover:border-white/30"
                )}
              >
                {/* Hidden Real Input */}
                <input
                  ref={inputRef}
                  type="password"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  disabled={success}
                  className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-text outline-none"
                  aria-label="Enter Password"
                />

                {/* Masked Hearts Visual Layer */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <AnimatePresence>
                    {Array.from({ length: value.length }).map((_, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: [0.4, 1.25, 1], opacity: 1 }}
                        exit={error ? {
                          scale: 0.2,
                          opacity: 0,
                          x: (Math.random() - 0.5) * 120,
                          y: (Math.random() - 0.5) * 120,
                          rotate: (Math.random() - 0.5) * 180
                        } : { scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 16 }}
                      >
                        <Heart className={cn(
                          "h-6 w-6", 
                          success ? "fill-gold text-gold" : "fill-rose text-rose"
                        )} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {value.length === 0 && (
                    <span className="text-white/40 text-sm font-sans tracking-wide">
                      Tap here to type
                    </span>
                  )}
                </div>
              </div>

              {/* Feedback messages */}
              <div className="min-h-[20px] text-xs">
                {error && <p className="text-rose/90 glow-rose animate-bounce">Not quite... that&apos;s our little secret ♥</p>}
                {success && <p className="text-gold glow-gold">Welcome, Into my Heart ♥</p>}
              </div>

              <PrimaryButton type="submit" className="w-full" disabled={success}>
                Unlock <Heart className="ml-2 inline-block h-4 w-4 fill-current" />
              </PrimaryButton>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Animated Sticker Component                                         */
/* ------------------------------------------------------------------ */

interface AnimatedStickerProps {
  src: string;
  alt: string;
  className?: string;
  delay?: number;
  rotate?: number;
  floatY?: number;
}

function AnimatedSticker({
  src,
  alt,
  className,
  delay = 0,
  rotate = 0,
  floatY = 8,
}: AnimatedStickerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.75, y: 15 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -floatY, 0],
        rotate: [rotate - 2, rotate + 2, rotate - 2],
      }}
      transition={{
        opacity: { duration: 0.8, delay },
        scale: { duration: 0.8, delay, ease: [0.34, 1.56, 0.64, 1] },
        y: {
          duration: 3.2 + (delay % 2) * 0.8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: delay * 0.5,
        },
        rotate: {
          duration: 4.2 + (delay % 2) * 1.2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: delay * 0.5,
        },
      }}
      whileHover={{ scale: 1.1, rotate: 0 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative flex items-center justify-center select-none filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition-transform duration-300",
        className
      )}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain pointer-events-none"
        loading="eager"
      />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 5 — Wishes                                                   */
/* ------------------------------------------------------------------ */

function WishesScene({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="scene-container">
      <BackgroundLayer src={assets.birthdayReveal} overlay />
      <ParticleField density="medium" petals={true} dots={false} />
      <FireworkCanvas />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-start sm:justify-center overflow-y-auto p-6 py-12 text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="w-full max-w-3xl my-auto">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1 }} className="font-serif text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl gradient-text glow-gold">
            {birthdayWish.heading}
          </motion.h1>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 1 }} className="mt-1 font-script text-3.5xl text-rose glow-rose sm:text-5xl">
            {birthdayWish.subheading}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="mt-6 sm:mt-8 flex flex-row items-center justify-center gap-3 sm:gap-8 md:gap-12 w-full px-2 max-w-2xl mx-auto"
          >
            <AnimatedSticker
              src="/assets/stickers/teddy-1.gif"
              alt="Cute teddy animation blowing love kisses"
              className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 shrink-0"
              delay={0.2}
              rotate={-3}
              floatY={7}
            />
            <AnimatedSticker
              src="/assets/stickers/teddy-2.gif"
              alt="Cute teddy bears hugging animation"
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-44 md:h-44 -mt-2 sm:-mt-3 shrink-0"
              delay={0.4}
              rotate={2}
              floatY={10}
            />
            <AnimatedSticker
              src="/assets/stickers/teddy-3.gif"
              alt="Cute teddy cuddles animation"
              className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 shrink-0"
              delay={0.6}
              rotate={4}
              floatY={8}
            />
          </motion.div>

          <p className="mx-auto mt-6 max-w-xl text-sm sm:text-base md:text-lg leading-relaxed text-white/85 min-h-[5.5rem] px-2 select-text">
            <TypewriterText text={birthdayWish.message} speed={25} />
          </p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 6.8, duration: 1 }} className="mt-4 font-script text-2.5xl sm:text-3.5xl text-gold glow-gold">
            {birthdayWish.closing}
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 7.2, duration: 0.8 }} className="mt-8">
            <PrimaryButton onClick={onContinue}>Continue →</PrimaryButton>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 6 — Blow the Candles                                         */
/* ------------------------------------------------------------------ */

function CakeScene({ onBlown }: { onBlown: () => void }) {
  const [lit, setLit] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [smoke, setSmoke] = useState<number | null>(null);
  const [micRequestAsked, setMicRequestAsked] = useState(false);
  const [blowStage, setBlowStage] = useState<"active" | "shrinking" | "smoke" | "sparkles" | "celebrate" | "ready">("active");
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [celebrationConfetti, setCelebrationConfetti] = useState<{ id: number; x: number; y: number; color: string; size: number; vx: number; vy: number; rot: number; rotSpeed: number }[]>([]);
  
  const blowOne = () => {
    if (lit.length === 0 || blowStage !== "active") return;
    const removed = lit[0];
    
    if (lit.length === 1) {
      // Last candle blowout sequence:
      // 1. Flame shrinks
      setBlowStage("shrinking");
      setTimeout(() => {
        // 2. Flame disappears
        setLit([]);
        setBlowStage("smoke");
        setSmoke(removed);
        
        // 3. Smoke appears
        setTimeout(() => {
          setSmoke(null);
          setBlowStage("sparkles");
          
          // 4. Tiny sparkles appear around cake
          const newSparkles = Array.from({ length: 18 }).map((_, i) => ({
            id: i,
            x: 130 + Math.random() * 140,
            y: 100 + Math.random() * 50
          }));
          setSparkles(newSparkles);
          
          setTimeout(() => {
            setBlowStage("celebrate");
            // 5. Celebration particles trigger (confetti)
            const confettiColors = ["#d9a85e", "#d4869a", "#f3cbb4", "#ffffff", "#b06b7d"];
            const newConfetti = Array.from({ length: 50 }).map((_, i) => ({
              id: i,
              x: 200,
              y: 135,
              color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
              size: Math.random() * 6 + 4,
              vx: (Math.random() - 0.5) * 8,
              vy: -4 - Math.random() * 8,
              rot: Math.random() * 360,
              rotSpeed: (Math.random() - 0.5) * 10
            }));
            setCelebrationConfetti(newConfetti);
            
            // 6. Transition becomes available
            setTimeout(() => {
              setBlowStage("ready");
            }, 1200);
          }, 800);
        }, 1000);
      }, 600);
    } else {
      // Normal candle blowout
      const next = lit.slice(1);
      setLit(next);
      setSmoke(removed);
      setTimeout(() => setSmoke(null), 1200);
    }
  };

  const { start, stop, status, blowIntensity } = useBlowDetector(() => blowOne());

  // Proactively request mic permission on scene enter
  useEffect(() => {
    if (!micRequestAsked) {
      setMicRequestAsked(true);
      start();
    }
  }, [micRequestAsked, start]);

  // Clean up mic listening when scene leaves
  useEffect(() => () => stop(), [stop]);

  // Stop mic blow detector once all candles are blown out or inactive
  useEffect(() => {
    if (lit.length === 0 || blowStage !== "active") {
      stop();
    }
  }, [lit.length, blowStage, stop]);

  // Confetti update loop
  useEffect(() => {
    if (celebrationConfetti.length === 0) return;
    let active = true;
    let raf = 0;
    const update = () => {
      if (!active) return;
      setCelebrationConfetti((prev) =>
        prev
          .map((c) => ({
            ...c,
            x: c.x + c.vx,
            y: c.y + c.vy,
            vy: c.vy + 0.18, // gravity
            rot: c.rot + c.rotSpeed,
          }))
          .filter((c) => c.y < 240 && c.x > 0 && c.x < 400)
      );
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [celebrationConfetti.length]);

  // Organic coordinates on the top surface of the round cake
  const candles = [
    { x: 135, y: 145, color: "#e08da2", stripe: "#fff0f5" },
    { x: 160, y: 135, color: "#d9a85e", stripe: "#fcf7eb" },
    { x: 180, y: 154, color: "#b06b7d", stripe: "#ede3cf" },
    { x: 200, y: 138, color: "#e08da2", stripe: "#fff0f5" },
    { x: 220, y: 154, color: "#d9a85e", stripe: "#fcf7eb" },
    { x: 240, y: 135, color: "#b06b7d", stripe: "#ede3cf" },
    { x: 265, y: 145, color: "#e08da2", stripe: "#fff0f5" },
  ];

  return (
    <div className="scene-container relative">
      {/* Premium Burgundy/Plum/Black Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0e050c] via-[#240615] to-[#0a0309] z-0" />
      
      {/* Soft spotlight behind the cake */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(224,141,162,0.14),_transparent_60%)] pointer-events-none z-0 mix-blend-screen" />
      
      {/* Cinematic vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.85)_100%)] pointer-events-none z-0" />

      {/* Edge-only Fireworks (Tasteful gold/rose bursts around borders) */}
      {(blowStage === "celebrate" || blowStage === "ready") && (
        <FireworkCanvas edgesOnly={true} />
      )}

      <ParticleField density="low" petals={true} dots={false} />

      {/* Ambient room darkening overlay when all candles are blown out */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-[2000ms] pointer-events-none z-20",
        lit.length === 0 ? "bg-black/80 opacity-100" : "opacity-0"
      )} />

      <div className="relative z-10 flex min-h-full flex-1 flex-col items-center justify-center p-6 py-10 text-center">
        
        {/* Calligraphy heading */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-4 z-30"
        >
          <h2 className="font-script text-4xl sm:text-5xl text-gold glow-gold leading-tight">
            Make a wish & blow the candles
          </h2>
        </motion.div>

        {/* Realistic circular pink cake centerpiece */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: lit.length === 0 ? 1.04 : 1 }}
          transition={{ duration: 1.2 }}
          className={cn(
            "relative w-full max-w-[42rem] h-[55vh] sm:h-[62vh] cursor-pointer transition-all duration-1000 flex items-center justify-center",
            lit.length === 0 ? "z-30" : "z-10"
          )}
          onClick={blowOne}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && blowOne()}
          aria-label="Tap to blow out a candle"
        >
          <svg viewBox="0 0 400 240" className="w-full drop-shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
            <defs>
              <linearGradient id="cakeTop" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffcbd7" />
                <stop offset="100%" stopColor="#fca1b5" />
              </linearGradient>
              <linearGradient id="cakeFront" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fca1b5" />
                <stop offset="60%" stopColor="#e87a90" />
                <stop offset="100%" stopColor="#cf576e" />
              </linearGradient>
              <linearGradient id="goldCalligraphy" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#a37d37" />
                <stop offset="50%" stopColor="#d9a85e" />
                <stop offset="100%" stopColor="#8c6623" />
              </linearGradient>
              <radialGradient id="flameOuter" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffe082" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#ff8a65" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#ff5722" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="flameInner" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#fff59d" />
                <stop offset="100%" stopColor="#ffb300" />
              </linearGradient>
              <filter id="cakeShadow">
                <feDropShadow dx="0" dy="15" stdDeviation="12" floodColor="#000" floodOpacity="0.5" />
              </filter>
              <filter id="flameGlowFilter">
                <feGaussianBlur stdDeviation="3.0" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="frostingGlow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0.5" dy="1.5" stdDeviation="0.8" floodColor="#3d1f05" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* Porcelain Plate */}
            <ellipse cx="200" cy="195" rx="150" ry="24" fill="#faf8f5" filter="url(#cakeShadow)" />
            <ellipse cx="200" cy="195" rx="146" ry="21" fill="none" stroke="#ebdcb9" strokeWidth="1.5" opacity="0.6" />

            {/* Circular Cake Cylinder Body */}
            {/* Front Wall */}
            <path d="M 100 135 L 100 185 A 100 24 0 0 0 300 185 L 300 135 A 100 24 0 0 1 100 135 Z" fill="url(#cakeFront)" />
            {/* Top Surface */}
            <ellipse cx="200" cy="135" rx="100" ry="24" fill="url(#cakeTop)" />

            {/* Central Calligraphy Message on Cake Top */}
            <text
              x="200"
              y="140"
              fontFamily="Dancing Script"
              fontSize="16"
              fontWeight="bold"
              fill="url(#goldCalligraphy)"
              filter="url(#frostingGlow)"
              textAnchor="middle"
              letterSpacing="0.8"
            >
              Happy Birthday {birthdayContent.herName}
            </text>

            {/* Frosting Border Swirls (Around Top Perimeter) */}
            <g opacity="0.95">
              {Array.from({ length: 18 }).map((_, i) => {
                const angle = (i * 2 * Math.PI) / 18;
                const cx = 200 + 98 * Math.cos(angle);
                const cy = 135 + 22.5 * Math.sin(angle);
                const isEven = i % 2 === 0;
                return (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r={isEven ? 5 : 4.2}
                    fill={isEven ? "#fffdfa" : "#d4869a"}
                    stroke="#ebdcb9"
                    strokeWidth="0.5"
                  />
                );
              })}
            </g>

            {/* Frosting Drips on the Front Face */}
            <path
              d="M 100 135 Q 105 148 110 135 Q 120 152 128 135 Q 138 142 144 135 Q 160 151 168 135 Q 185 147 194 135 Q 210 152 218 135 Q 228 141 233 135 Q 248 152 256 135 Q 272 148 284 135 Q 295 144 300 135"
              fill="none"
              stroke="#fffdf8"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.92"
            />

            {/* 7 Candles Standing on Top Surface */}
            {candles.map((candle, idx) => (
              <g key={idx}>
                {/* Candle Body */}
                <rect
                  x={candle.x - 2.2}
                  y={candle.y - 28}
                  width="4.4"
                  height="28"
                  fill={candle.color}
                  rx="0.8"
                />
                {/* Candle Stripes */}
                <path
                  d={`M ${candle.x - 2.2} ${candle.y - 23} L ${candle.x + 2.2} ${candle.y - 19}
                     M ${candle.x - 2.2} ${candle.y - 15} L ${candle.x + 2.2} ${candle.y - 11}
                     M ${candle.x - 2.2} ${candle.y - 7} L ${candle.x + 2.2} ${candle.y - 3}`}
                  stroke={candle.stripe}
                  strokeWidth="1.2"
                />
                {/* Wick */}
                <line
                  x1={candle.x}
                  y1={candle.y - 28}
                  x2={candle.x}
                  y2={candle.y - 32}
                  stroke="#4a3b32"
                  strokeWidth="0.8"
                />

                {/* Animated Wind-responsive Candle Flame (SVG-rendered) */}
                {lit.includes(idx) && (
                  <motion.g
                    animate={
                      blowStage === "shrinking" && lit.length === 1 && lit[0] === idx
                        ? { scale: 0, opacity: 0 }
                        : {
                            scaleY: [1, 1.08, 0.95, 1.04, 1],
                            scaleX: [1, 1.05, 0.96, 1.03, 1],
                            y: [0, -0.5, 0.3, -0.3, 0],
                            skewX: blowIntensity * 32,
                            scale: 1 - blowIntensity * 0.65,
                            opacity: 1 - blowIntensity * 0.3,
                          }
                    }
                    transition={
                      blowStage === "shrinking" && lit.length === 1 && lit[0] === idx
                        ? { duration: 0.5, ease: "easeIn" }
                        : {
                            repeat: Infinity,
                            duration: 0.7 + idx * 0.12,
                            ease: "easeInOut",
                          }
                    }
                    className="origin-bottom"
                    style={{ transformOrigin: `${candle.x}px ${candle.y - 32}px` }}
                  >
                    {/* Outer Glow */}
                    <circle
                      cx={candle.x}
                      cy={candle.y - 39}
                      r="13"
                      fill="url(#flameOuter)"
                      filter="url(#flameGlowFilter)"
                      style={{ mixBlendMode: "screen" }}
                    />
                    {/* Inner Core */}
                    <path
                      d={`M ${candle.x} ${candle.y - 45} 
                          C ${candle.x - 3} ${candle.y - 39} ${candle.x - 3.5} ${candle.y - 36} ${candle.x} ${candle.y - 32} 
                          C ${candle.x + 3} ${candle.y - 36} ${candle.x + 3} ${candle.y - 39} ${candle.x} ${candle.y - 45} Z`}
                      fill="url(#flameInner)"
                    />
                  </motion.g>
                )}

                {/* Rising smoke trail when extinguished */}
                {smoke === idx && (
                  <motion.path
                    d={`M ${candle.x} ${candle.y - 34} 
                        Q ${candle.x - 6} ${candle.y - 50} ${candle.x + 3} ${candle.y - 68} 
                        T ${candle.x - 1} ${candle.y - 84}`}
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: [0, 1], opacity: [0, 0.7, 0] }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                  />
                )}
              </g>
            ))}

            {/* Sparkles Layer */}
            {sparkles.map((sp) => (
              <motion.path
                key={sp.id}
                d="M 0,-4 L 1,-1 L 4,0 L 1,1 L 0,4 L -1,1 L -4,0 L -1,-1 Z"
                fill="#d9a85e"
                initial={{ x: sp.x, y: sp.y, scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.2, 0],
                  opacity: [0, 1, 0],
                  y: sp.y - 15 - Math.random() * 20
                }}
                transition={{
                  duration: 0.8 + Math.random() * 0.4,
                  delay: Math.random() * 0.3,
                  ease: "easeOut"
                }}
                style={{ transformOrigin: "center" }}
              />
            ))}

            {/* Confetti Celebration Layer */}
            {celebrationConfetti.map((c) => (
              <rect
                key={c.id}
                x={c.x}
                y={c.y}
                width={c.size}
                height={c.size}
                fill={c.color}
                transform={`rotate(${c.rot}, ${c.x}, ${c.y})`}
                opacity={0.8}
              />
            ))}
          </svg>
        </motion.div>

        {/* Integrated Microphone status & Fallback text */}
        <div className="z-30 mt-6 min-h-[4rem]">
          {blowStage === "active" || blowStage === "shrinking" ? (
            <div className="flex flex-col items-center gap-3">
              {status === "listening" ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-gold"></span>
                    </span>
                    <span className="text-sm font-sans tracking-wide text-white/80">
                      Blow into the mic to blow the candles
                    </span>
                  </div>
                  {/* Subtle volume scale visualizer bar */}
                  <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-gold to-rose"
                      style={{ width: `${blowIntensity * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm font-sans text-white/60">
                  Tap the candles or cake to blow them out.
                </p>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center gap-4"
            >
              <div>
                <p className="font-script text-3.5xl text-gold glow-gold tracking-wide">
                  {blowStage === "smoke" && "💨 Extinguishing..."}
                  {blowStage === "sparkles" && "✨ Magic is happening..."}
                  {blowStage === "celebrate" && `🎉 Happy Birthday ${birthdayContent.herName}! ♥`}
                  {blowStage === "ready" && "🎂 All candles blown out!"}
                </p>
                <p className="text-xs uppercase tracking-widest text-white/50 mt-1">
                  {blowStage === "ready" ? "Your wishes are flying to the stars ♥" : "Wait for the magic to unfold..."}
                </p>
              </div>
              {blowStage === "ready" && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <PrimaryButton onClick={onBlown}>
                    Continue →
                  </PrimaryButton>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 7 — Real Circular Cake Cutting & Serving                     */
/* ------------------------------------------------------------------ */

function CakeCuttingScene({ stage, onStage }: { stage: number; onStage: (n: number) => void }) {
  const [activeKnife, setActiveKnife] = useState<number | null>(null);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; vx: number; vy: number; color: string; size: number; alpha: number }[]>([]);

  const spawnParticles = (x: number, y: number, count = 20) => {
    const colors = ["#d9a85e", "#d4869a", "#f3cbb4", "#ffffff", "#b06b7d"];
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x,
      y,
      vx: (Math.random() - 0.5) * 5,
      vy: -2 - Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 4 + 2,
      alpha: 1,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
  };

  const interact = () => {
    if (activeKnife !== null) return;
    if (stage < 3) {
      setActiveKnife(stage);
      // Wait 700ms (when knife passes center) to show cut line & advance stage
      setTimeout(() => {
        onStage(stage + 1);
        spawnParticles(200, 135, 25);
      }, 700);
      // Wait 1400ms to allow another cut
      setTimeout(() => {
        setActiveKnife(null);
      }, 1400);
    } else if (stage < 5) {
      onStage(stage + 1);
      spawnParticles(200, 135, 15);
    }
  };

  useEffect(() => {
    if (particles.length === 0) return;
    let active = true;
    let raf = 0;
    const update = () => {
      if (!active) return;
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.15,
            alpha: p.alpha - 0.02,
          }))
          .filter((p) => p.alpha > 0 && p.y < 280)
      );
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [particles.length]);

  // Dimensions of the 3D-isometric cake
  const rx = 100;
  const ry = 24;
  const h = 60; // cake height
  const cyTop = 135;
  const cyBottom = cyTop + h;
  const cx = 200;

  // Sorting indices from back-to-front to ensure perfect overlap rendering (painter's algorithm)
  const sortedSlices = [4, 3, 5, 0, 2, 1];

  return (
    <div className="scene-container relative">
      {/* Premium Dark Burgundy Background Progression */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f060b] via-[#2b081a] to-[#0c0309] z-0" />
      
      {/* Soft spotlight behind the cake (Warm champagne/gold bloom) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(217,168,94,0.12),_transparent_65%)] pointer-events-none z-0 mix-blend-screen" />
      
      {/* Cinematic vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_45%,_rgba(0,0,0,0.85)_100%)] pointer-events-none z-0" />

      {/* Edge-only Fireworks once cut is complete */}
      {stage >= 5 && (
        <FireworkCanvas edgesOnly={true} />
      )}

      <ParticleField density="low" petals={true} dots={false} />
      
      <div className="relative z-10 flex min-h-full flex-1 flex-col items-center justify-center p-4 py-8 text-center select-none overflow-y-auto">
        
        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 z-30"
        >
          <h2 className="font-script text-4xl sm:text-5xl text-gold glow-gold leading-tight">
            Tap to cut the cake
          </h2>
          <p className="text-white/60 text-xs mt-1">
            {stage === 0 && "Click anywhere to make the first cut."}
            {stage === 1 && "Click to make the second cut."}
            {stage === 2 && "Click to make the final cut."}
            {stage >= 3 && stage < 5 && "Watch the delicious pieces separate!"}
            {stage >= 5 && "Share the sweetness and happiness!"}
          </p>
        </motion.div>

        <div
          className="relative w-full max-w-3xl cursor-pointer flex flex-col items-center justify-center min-h-[55vh] sm:min-h-[62vh]"
          onClick={interact}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && interact()}
          aria-label="Cut the cake"
        >
          <svg viewBox="0 0 400 280" className="w-full h-full max-h-[55vh] sm:max-h-[62vh] max-w-[42rem] drop-shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
            <defs>
              <linearGradient id="rcakeTop" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffcbd7" />
                <stop offset="100%" stopColor="#fca1b5" />
              </linearGradient>
              <linearGradient id="rcakeFront" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fca1b5" />
                <stop offset="60%" stopColor="#e87a90" />
                <stop offset="100%" stopColor="#cf576e" />
              </linearGradient>
              <linearGradient id="cakeInside" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#cf576e" />
                <stop offset="10%" stopColor="#cf576e" />
                <stop offset="10%" stopColor="#4a1521" /> {/* dark chocolate sponge */}
                <stop offset="35%" stopColor="#4a1521" />
                <stop offset="35%" stopColor="#faf6ee" /> {/* cream layers */}
                <stop offset="45%" stopColor="#faf6ee" />
                <stop offset="45%" stopColor="#4a1521" />
                <stop offset="70%" stopColor="#4a1521" />
                <stop offset="70%" stopColor="#faf6ee" />
                <stop offset="80%" stopColor="#faf6ee" />
                <stop offset="80%" stopColor="#4a1521" />
                <stop offset="100%" stopColor="#4a1521" />
              </linearGradient>
              <linearGradient id="rblade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
              <linearGradient id="goldCalligraphy" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#a37d37" />
                <stop offset="50%" stopColor="#d9a85e" />
                <stop offset="100%" stopColor="#8c6623" />
              </linearGradient>
              <filter id="rcakeShadow">
                <feDropShadow dx="0" dy="15" stdDeviation="12" floodColor="#000" floodOpacity="0.45" />
              </filter>
            </defs>

            {/* Porcelain Plate */}
            <ellipse cx="200" cy="205" rx="150" ry="24" fill="#faf8f5" filter="url(#rcakeShadow)" />
            <ellipse cx="200" cy="205" rx="146" ry="21" fill="none" stroke="#ebdcb9" strokeWidth="1.5" opacity="0.6" />

            {/* Render 6 Slices Back-to-Front */}
            {sortedSlices.map((i) => {
              // Separation distance base calculation
              let d_sep = 0;
              if (stage === 3) {
                d_sep = (i === 1) ? 20 : 1; // Front-center starts to slip out
              } else if (stage === 4) {
                d_sep = (i === 1 || i === 4) ? 22 : 4; // Front-center and opposite back slip out
              } else if (stage >= 5) {
                d_sep = 18; // All slices separate slightly
              }

              // Radial angles
              const t1 = (i * 2 * Math.PI) / 6;
              const t2 = ((i + 1) * 2 * Math.PI) / 6;
              const a_mid = ((i + 0.5) * 2 * Math.PI) / 6;

              // Perspective translation
              const dx = d_sep * Math.cos(a_mid);
              const dy = d_sep * Math.sin(a_mid) * 0.24;

              // Top vertices
              const p1x = cx + rx * Math.cos(t1);
              const p1y = cyTop + ry * Math.sin(t1);
              const p2x = cx + rx * Math.cos(t2);
              const p2y = cyTop + ry * Math.sin(t2);

              // Bottom vertices
              const p1yBot = cyBottom + ry * Math.sin(t1);
              const p2yBot = cyBottom + ry * Math.sin(t2);

              // Top outer perimeter decorative frosting dollop
              const fx = cx + 96 * Math.cos(a_mid);
              const fy = cyTop + 23 * Math.sin(a_mid);

              return (
                <motion.g
                  key={i}
                  animate={{ x: dx, y: dy }}
                  transition={{ type: "spring", stiffness: 85, damping: 13 }}
                >
                  {/* Slice Inner Cut Wall 1 (along t1) */}
                  <path
                    d={`M ${cx} ${cyTop} L ${cx} ${cyBottom} L ${p1x} ${p1yBot} L ${p1x} ${p1y} Z`}
                    fill="url(#cakeInside)"
                  />

                  {/* Slice Inner Cut Wall 2 (along t2) */}
                  <path
                    d={`M ${cx} ${cyTop} L ${cx} ${cyBottom} L ${p2x} ${p2yBot} L ${p2x} ${p2y} Z`}
                    fill="url(#cakeInside)"
                  />

                  {/* Slice Curved Outer Wall */}
                  <path
                    d={`M ${p1x} ${p1y} A ${rx} ${ry} 0 0 1 ${p2x} ${p2y} L ${p2x} ${p2yBot} A ${rx} ${ry} 0 0 0 ${p1x} ${p1yBot} Z`}
                    fill="url(#rcakeFront)"
                  />

                  {/* Slice Top Wedge */}
                  <path
                    d={`M ${cx} ${cyTop} L ${p1x} ${p1y} A ${rx} ${ry} 0 0 1 ${p2x} ${p2y} Z`}
                    fill="url(#rcakeTop)"
                  />

                  {/* Decorative frosting flowers along outer edges */}
                  <circle cx={fx} cy={fy} r="4.5" fill="#fcf7eb" stroke="#ebdcb9" strokeWidth="0.5" />
                  <circle cx={fx} cy={fy} r="3" fill="#d4869a" />

                  {/* Central gold little stars on each wedge */}
                  <path
                    d={`M ${cx + 50 * Math.cos(a_mid)} ${cyTop + 12 * Math.sin(a_mid)} L ${cx + 52 * Math.cos(a_mid)} ${cyTop + 10 * Math.sin(a_mid)}`}
                    stroke="#d9a85e"
                    strokeWidth="1.2"
                    opacity="0.8"
                  />
                </motion.g>
              );
            })}

            {/* Glowing cut lines overlays (when whole) */}
            <g opacity={stage >= 4 ? 0 : 0.65}>
              {stage >= 1 && (
                <line x1={cx} y1={cyTop - ry} x2={cx} y2={cyTop + ry} stroke="#fff" strokeWidth="2.5" strokeDasharray="3 3" />
              )}
              {stage >= 2 && (
                <line x1={cx - rx * Math.cos(Math.PI/6)} y1={cyTop - ry * Math.sin(Math.PI/6)} x2={cx + rx * Math.cos(Math.PI/6)} y2={cyTop + ry * Math.sin(Math.PI/6)} stroke="#fff" strokeWidth="2.5" strokeDasharray="3 3" />
              )}
              {stage >= 3 && (
                <line x1={cx - rx * Math.cos(Math.PI/6)} y1={cyTop + ry * Math.sin(Math.PI/6)} x2={cx + rx * Math.cos(Math.PI/6)} y2={cyTop - ry * Math.sin(Math.PI/6)} stroke="#fff" strokeWidth="2.5" strokeDasharray="3 3" />
              )}
            </g>

             {/* Knife slash cutting animations */}
            <AnimatePresence>
              {activeKnife !== null && (
                <motion.g
                  key={`knife-${activeKnife}`}
                  initial={{ x: 120, y: -90, rotate: -40, opacity: 0 }}
                  animate={
                    activeKnife === 0
                      ? {
                          x: [120, 20, 20, 80],
                          y: [-90, -10, 30, -50],
                          rotate: [-40, -90, -90, -40],
                          opacity: [0, 1, 1, 0],
                        }
                      : activeKnife === 1
                      ? {
                          x: [120, -20, 50, 80],
                          y: [-90, -20, 20, -50],
                          rotate: [-45, -30, -30, -40],
                          opacity: [0, 1, 1, 0],
                        }
                      : {
                          x: [120, 50, -20, 80],
                          y: [-90, -20, 20, -50],
                          rotate: [-45, -150, -150, -40],
                          opacity: [0, 1, 1, 0],
                        }
                  }
                  transition={{ duration: 1.4, ease: "easeInOut" }}
                  style={{ transformOrigin: "200px 135px" }}
                >
                  <path d="M280 40 L310 130 L302 133 L272 44 Z" fill="url(#rblade)" stroke="#cbd5e1" />
                  <rect x="294" y="128" width="22" height="34" rx="3" fill="#4a3b52" />
                </motion.g>
              )}
            </AnimatePresence>

            {/* Cut Particles Layer */}
            {particles.map((p) => (
              <circle
                key={p.id}
                cx={p.x}
                cy={p.y}
                r={p.size}
                fill={p.color}
                opacity={p.alpha}
              />
            ))}
          </svg>
        </div>

        {stage >= 5 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-6 z-30 flex flex-col items-center gap-3"
          >
            <p className="font-script text-2xl text-gold glow-gold">
              Yay! Let's share the happiness ❤️
            </p>
            <PrimaryButton onClick={() => onStage(6)}>
              Continue →
            </PrimaryButton>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 8 — Share the Happiness                                      */
/* ------------------------------------------------------------------ */

function HappinessIcon({ icon, className }: { icon: HappinessItem["icon"]; className?: string }) {
  const props = { className: cn("h-6 w-6", className || "text-gold glow-gold") };
  switch (icon) {
    case "smile":
      return <Smile {...props} />;
    case "laugh":
      return <Laugh {...props} />;
    case "eyes":
      return <Eye {...props} />;
    case "memories":
      return <ImageIcon {...props} />;
    case "adventures":
      return <Compass {...props} />;
    case "future":
      return <Sparkles {...props} />;
  }
}

const CARD_THEMES = [
  {
    bg: "bg-gradient-to-br from-[#2a0813]/90 via-[#1b050c]/85 to-[#2a0813]/95 border-rose-900/50 text-[#fdbccb]",
    gold: "text-[#fdbccb] drop-shadow-[0_0_8px_rgba(253,188,203,0.35)]",
    icon: "text-[#fca1b5]",
    glow: "shadow-[0_0_12px_rgba(212,135,154,0.15)] hover:shadow-[0_0_20px_rgba(212,135,154,0.3)]",
  },
  {
    bg: "bg-gradient-to-br from-[#1d082c]/90 via-[#0e0316]/85 to-[#1d082c]/95 border-purple-900/50 text-[#ebd5ff]",
    gold: "text-[#ebd5ff] drop-shadow-[0_0_8px_rgba(235,213,255,0.35)]",
    icon: "text-[#e9d5ff]",
    glow: "shadow-[0_0_12px_rgba(233,213,255,0.15)] hover:shadow-[0_0_20px_rgba(233,213,255,0.3)]",
  },
  {
    bg: "bg-gradient-to-br from-[#3b1c25]/90 via-[#260f14]/85 to-[#3b1c25]/95 border-rose-800/50 text-[#fca8b6]",
    gold: "text-[#fca8b6] drop-shadow-[0_0_8px_rgba(252,168,182,0.35)]",
    icon: "text-[#fca5a5]",
    glow: "shadow-[0_0_12px_rgba(252,168,182,0.15)] hover:shadow-[0_0_20px_rgba(252,168,182,0.3)]",
  },
  {
    bg: "bg-gradient-to-br from-[#241e0f]/90 via-[#161208]/85 to-[#241e0f]/95 border-amber-900/40 text-[#ffeed1]",
    gold: "text-[#ffeed1] drop-shadow-[0_0_8px_rgba(255,238,209,0.35)]",
    icon: "text-[#fef08a]",
    glow: "shadow-[0_0_12px_rgba(217,168,94,0.15)] hover:shadow-[0_0_20px_rgba(217,168,94,0.3)]",
  },
  {
    bg: "bg-gradient-to-br from-[#08132c]/90 via-[#030816]/85 to-[#08132c]/95 border-blue-900/50 text-[#dbeafe]",
    gold: "text-[#dbeafe] drop-shadow-[0_0_8px_rgba(219,234,254,0.35)]",
    icon: "text-[#93c5fd]",
    glow: "shadow-[0_0_12px_rgba(147,197,253,0.15)] hover:shadow-[0_0_20px_rgba(147,197,253,0.3)]",
  },
  {
    bg: "bg-gradient-to-br from-[#261825]/90 via-[#160d16]/85 to-[#261825]/95 border-pink-900/50 text-[#fbcfe8]",
    gold: "text-[#fbcfe8] drop-shadow-[0_0_8px_rgba(251,207,232,0.35)]",
    icon: "text-[#fbcfe8]",
    glow: "shadow-[0_0_12px_rgba(251,207,232,0.15)] hover:shadow-[0_0_20px_rgba(251,207,232,0.3)]",
  },
];

function CardHearts({ active }: { active: boolean }) {
  const [hearts, setHearts] = useState<{ id: number; left: number; size: number; delay: number }[]>([]);

  useEffect(() => {
    if (active) {
      const generated = Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        left: 10 + Math.random() * 80,
        size: 8 + Math.random() * 8,
        delay: Math.random() * 0.4,
      }));
      setHearts(generated);
    } else {
      setHearts([]);
    }
  }, [active]);

  if (!active || hearts.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          initial={{ y: 80, x: 0, opacity: 0, scale: 0.5 }}
          animate={{
            y: [-20, -100],
            x: [0, Math.random() * 30 - 15, Math.random() * 40 - 20],
            opacity: [0, 0.9, 0],
            scale: [0.5, 1.2, 0.8],
          }}
          transition={{
            duration: 2.2,
            ease: "easeOut",
            delay: h.delay,
          }}
          style={{
            position: "absolute",
            left: `${h.left}%`,
            width: h.size,
            height: h.size,
          }}
          className="text-rose-400/90 fill-rose-400/90"
        >
          <Heart size={h.size} className="fill-current" />
        </motion.div>
      ))}
    </div>
  );
}

function ShareHappinessScene({
  opened,
  onOpen,
  onContinue,
}: {
  opened: string[];
  onOpen: (id: string) => void;
  onContinue: () => void;
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleOpen = (idx: number) => {
    setActiveIdx(idx);
    setIsFlipped(false);
    const item = happiness[idx];
    if (!opened.includes(item.id)) {
      onOpen(item.id);
    }
    
    // Play sequential 3D flip animation in the modal:
    // 1. Lift slightly (handled by modal initial y-offset)
    // 2. Glow activates (modal animations)
    // 3. Rotate 3D (after a small delay)
    setTimeout(() => {
      setIsFlipped(true);
    }, 450);
  };

  // Card configuration colors and gradients
  const cardThemes = [
    {
      accent: "warm rose/pink",
      colorCode: "#f43f5e",
      glowClass: "shadow-[0_0_30px_rgba(244,63,94,0.45)]",
      borderClass: "border-rose-500/40",
      bgGradient: "from-[#3b0b12] to-[#120306]",
      bgStyle: "linear-gradient(135deg, #3b0b12 0%, #120306 100%)",
      glowBorderClass: "shadow-[0_0_15px_rgba(244,63,94,0.5)]",
    },
    {
      accent: "lavender/purple",
      colorCode: "#c084fc",
      glowClass: "shadow-[0_0_30px_rgba(192,132,252,0.45)]",
      borderClass: "border-purple-400/40",
      bgGradient: "from-[#220c38] to-[#0a0314]",
      bgStyle: "linear-gradient(135deg, #220c38 0%, #0a0314 100%)",
      glowBorderClass: "shadow-[0_0_15px_rgba(192,132,252,0.5)]",
    },
    {
      accent: "champagne/gold",
      colorCode: "#f3e2c7",
      glowClass: "shadow-[0_0_30px_rgba(243,226,199,0.35)]",
      borderClass: "border-amber-200/40",
      bgGradient: "from-[#2d2416] to-[#0e0b07]",
      bgStyle: "linear-gradient(135deg, #2d2416 0%, #0e0b07 100%)",
      glowBorderClass: "shadow-[0_0_15px_rgba(243,226,199,0.5)]",
    },
    {
      accent: "peach/coral",
      colorCode: "#fb923c",
      glowClass: "shadow-[0_0_30px_rgba(251,146,60,0.45)]",
      borderClass: "border-orange-400/40",
      bgGradient: "from-[#381608] to-[#140602]",
      bgStyle: "linear-gradient(135deg, #381608 0%, #140602 100%)",
      glowBorderClass: "shadow-[0_0_15px_rgba(251,146,60,0.5)]",
    },
    {
      accent: "deep burgundy",
      colorCode: "#881337",
      glowClass: "shadow-[0_0_30px_rgba(136,19,55,0.45)]",
      borderClass: "border-rose-700/40",
      bgGradient: "from-[#4c0519] to-[#160005]",
      bgStyle: "linear-gradient(135deg, #4c0519 0%, #160005 100%)",
      glowBorderClass: "shadow-[0_0_15px_rgba(136,19,55,0.55)]",
    },
    {
      accent: "soft violet/gold",
      colorCode: "#ddd6fe",
      glowClass: "shadow-[0_0_30px_rgba(221,214,254,0.35)]",
      borderClass: "border-violet-300/40",
      bgGradient: "from-[#20163b] via-[#2d2416] to-[#07050e]",
      bgStyle: "linear-gradient(135deg, #20163b 0%, #2d2416 50%, #07050e 100%)",
      glowBorderClass: "shadow-[0_0_15px_rgba(221,214,254,0.45)]",
    },
  ];

  return (
    <div className="scene-container relative">
      <BackgroundLayer src={assets.countdownGarden} overlay />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(61,15,24,0.45),_transparent_75%)]" />
      <ParticleField density="low" petals={true} dots={false} />

      <div className="relative z-10 flex min-h-full flex-1 flex-col items-center justify-start overflow-y-auto p-4 py-8 select-none">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl text-center w-full mt-4"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-gold font-medium">Collectible Memories</span>
          <h2 className="font-serif text-3xl font-bold sm:text-5xl gradient-text glow-gold mt-2">
            Yay! Let's share the happiness
          </h2>
          <p className="mt-2.5 text-xs text-white/70 max-w-md mx-auto font-sans leading-relaxed">
            Click on each memory card to reveal the special reasons why you are so precious to me.
          </p>
        </motion.div>

        {/* 6 Cards Grid - Main Visual Focus */}
        <div className="mt-12 grid w-full max-w-4xl grid-cols-2 gap-5 sm:grid-cols-3 px-2 sm:px-6">
          {happiness.map((h, i) => {
            const isOpened = opened.includes(h.id);
            const theme = cardThemes[i];
            return (
              <motion.button
                key={h.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  y: -5, 
                  scale: 1.03, 
                  boxShadow: `0 12px 30px rgba(0, 0, 0, 0.4)`,
                  borderColor: theme.colorCode
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => handleOpen(i)}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-2xl p-6 text-center border cursor-pointer select-none transition-all duration-300 min-h-[9rem] sm:min-h-[11rem]",
                  "glass-premium border-white/5 shadow-md",
                  isOpened 
                    ? `bg-gradient-to-br ${theme.bgGradient} ${theme.borderClass} ${theme.glowClass}` 
                    : "hover:border-white/20 hover:bg-white/[0.03]"
                )}
              >
                {isOpened && (
                  <div className="absolute top-3.5 right-3.5">
                    <Heart className="h-4.5 w-4.5 fill-rose text-rose animate-pulse" />
                  </div>
                )}
                <div className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full bg-white/5 border mb-3 transition-colors duration-300",
                  isOpened ? "border-white/20 text-white" : "border-white/10 text-white/50"
                )}
                style={isOpened ? { color: theme.colorCode, borderColor: theme.colorCode } : {}}
                >
                  <HappinessIcon icon={h.icon} className="transition-transform duration-500 group-hover:scale-110" />
                </div>
                <h3 className={cn(
                  "font-serif text-sm sm:text-base font-semibold tracking-wide transition-colors duration-300",
                  isOpened ? "text-white glow-gold" : "text-champagne/70"
                )}>{h.title}</h3>
                <span className="text-[9px] uppercase tracking-widest text-white/40 mt-1.5 block">
                  {isOpened ? "Relive Memory" : "Tap to open"}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Continue button appears once all cards have been opened */}
        {opened.length === happiness.length && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-14 mb-8 text-center z-20"
          >
            <PrimaryButton onClick={onContinue}>
              Continue Journey ♥
            </PrimaryButton>
          </motion.div>
        )}
      </div>

      {/* 3D Collectible Card Modal popup */}
      <AnimatePresence>
        {activeIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveIdx(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-md"
          >
            {/* The 3D Perspective Card Wrapper */}
            <div 
              className="relative w-full max-w-sm h-[450px] perspective-1000"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Card Container holding both faces */}
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0, scale: isFlipped ? 1.02 : 1 }}
                transition={{ type: "spring", stiffness: 90, damping: 14 }}
                className="w-full h-full preserve-3d relative cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {/* 1. FRONT FACE (Card Cover) */}
                <div 
                  className={cn(
                    "absolute inset-0 rounded-2xl glass-premium border p-8 flex flex-col items-center justify-between text-center backface-hidden",
                    cardThemes[activeIdx].borderClass
                  )}
                  style={{
                    background: `linear-gradient(135deg, rgba(18,20,38,0.92) 0%, rgba(8,4,12,0.98) 100%)`,
                    boxShadow: `0 15px 40px rgba(0,0,0,0.6)`
                  }}
                >
                  <div className="w-full flex justify-between items-center opacity-60">
                    <span className="text-[9px] uppercase tracking-widest text-white/50">NO. 0{activeIdx + 1}</span>
                    <Heart className="h-4 w-4 text-white/40" />
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <motion.div 
                      animate={{ scale: [1, 1.06, 1] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white"
                      style={{ borderColor: cardThemes[activeIdx].colorCode, boxShadow: `inset 0 0 20px rgba(255,255,255,0.05), ${cardThemes[activeIdx].glowBorderClass}` }}
                    >
                      <HappinessIcon icon={happiness[activeIdx].icon} className="h-10 w-10" style={{ color: cardThemes[activeIdx].colorCode }} />
                    </motion.div>
                    <h3 className="font-serif text-2xl font-bold tracking-wide text-white">
                      {happiness[activeIdx].title}
                    </h3>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: cardThemes[activeIdx].colorCode }}>
                      Tap to Unveil ♥
                    </span>
                    <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: cardThemes[activeIdx].colorCode }} />
                  </div>
                </div>

                {/* 2. BACK FACE (Premium Collectible Inner Details) */}
                <div 
                  className={cn(
                    "absolute inset-0 rounded-2xl p-8 flex flex-col justify-between text-center backface-hidden rotate-y-180 border overflow-hidden",
                    cardThemes[activeIdx].borderClass,
                    cardThemes[activeIdx].glowClass
                  )}
                  style={{
                    background: cardThemes[activeIdx].bgStyle,
                  }}
                >
                  {/* Subtle inner animated gradient & soft glow bloom */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.01),_transparent_75%)] pointer-events-none" />
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/[0.01] to-transparent" />
                  
                  {/* Glowing inner border accent */}
                  <div 
                    className="absolute inset-4 rounded-xl border border-dashed opacity-25 pointer-events-none" 
                    style={{ borderColor: cardThemes[activeIdx].colorCode }}
                  />

                  {/* Header */}
                  <div className="relative z-10 flex justify-between items-center">
                    <span className="text-[8px] font-sans tracking-[0.35em] text-white/40 uppercase">Collectible Card</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveIdx(null);
                      }}
                      className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Content details with custom typographic styling */}
                  <div className="relative z-10 my-auto py-2 flex flex-col items-center select-text">
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      className="mb-4 text-white/90"
                      style={{ color: cardThemes[activeIdx].colorCode }}
                    >
                      <HappinessIcon icon={happiness[activeIdx].icon} className="h-9 w-9" />
                    </motion.div>

                    <h4 className="font-serif text-sm tracking-[0.2em] font-semibold text-white/50 uppercase mb-3">
                      {happiness[activeIdx].title}
                    </h4>

                    <p className="font-serif italic text-xl sm:text-2xl leading-relaxed text-white/95 pr-1 pl-1 font-medium">
                      "{happiness[activeIdx].message}"
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <span className="text-[8px] uppercase tracking-widest text-white/30">
                      Tap card to flip back
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveIdx(null);
                      }}
                      className="rounded-full px-5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white border bg-white/5 hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                      style={{ borderColor: `${cardThemes[activeIdx].colorCode}50` }}
                    >
                      Close Reason ♥
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


/* ------------------------------------------------------------------ */
/* Scene 9 — Three Gifts                                              */
/* ------------------------------------------------------------------ */

function GiftBox3D({
  giftId,
  label,
  opened,
  onClick,
}: {
  giftId: string;
  label: string;
  opened: boolean;
  onClick: () => void;
}) {
  // Map giftId to color palette
  // Pink wrapping with gold ribbon
  let wrappingGrads = {
    top: ["#ffcbd7", "#fca1b5"],
    front: ["#fca1b5", "#e87a90"],
    side: ["#e87a90", "#cf576e"],
    lidTop: ["#ffcbd7", "#fca1b5"],
    lidFront: ["#fca1b5", "#e87a90"],
    lidSide: ["#e87a90", "#cf576e"],
  };
  let ribbonGrad = ["#ffe082", "#d9a85e", "#b8862e"]; // Gold

  if (giftId === "memories") {
    // Champagne gold wrapping with crimson ribbon
    wrappingGrads = {
      top: ["#fef4e5", "#ebdcb9"],
      front: ["#ebdcb9", "#d6c193"],
      side: ["#c5b080", "#a69365"],
      lidTop: ["#fef4e5", "#ebdcb9"],
      lidFront: ["#ebdcb9", "#d6c193"],
      lidSide: ["#c5b080", "#a69365"],
    };
    ribbonGrad = ["#ef9a9a", "#c62828", "#8e0000"]; // Crimson
  } else if (giftId === "voice") {
    // Lavender blue wrapping with rose ribbon
    wrappingGrads = {
      top: ["#e3e7f9", "#b9c2ec"],
      front: ["#b9c2ec", "#97a3dd"],
      side: ["#8693cc", "#6a79b8"],
      lidTop: ["#e3e7f9", "#b9c2ec"],
      lidFront: ["#b9c2ec", "#97a3dd"],
      lidSide: ["#8693cc", "#6a79b8"],
    };
    ribbonGrad = ["#f8bbd0", "#e91e63", "#c2185b"]; // Rose pink
  }

  return (
    <motion.button
      whileHover={{ y: -6, scale: 1.04, rotate: [-1, 1, -1, 1, 0] }}
      whileTap={{ scale: 0.96 }}
      animate={opened ? {} : { rotate: [0, -1.5, 1.5, -1.5, 1.5, 0] }}
      transition={opened ? {} : { repeat: Infinity, duration: 4, repeatDelay: 2 }}
      onClick={onClick}
      className="group relative block mx-auto w-52 sm:w-56 cursor-pointer focus:outline-none"
      aria-label={opened ? `Enter ${label} experience` : `Open ${label} gift`}
    >
      {/* Glow highlight behind the box */}
      <div className={cn(
        "absolute inset-0 rounded-full blur-2xl transition-all duration-700 bg-gradient-to-r",
        opened
          ? "opacity-60 blur-3xl scale-110"
          : "opacity-0 group-hover:opacity-40",
        giftId === "letter" && "from-rose/30 to-rose-400/10",
        giftId === "memories" && "from-gold/30 to-gold/10",
        giftId === "voice" && "from-sky-400/30 to-indigo-400/10"
      )} />

      <svg viewBox="0 0 200 220" className="w-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
        <defs>
          <filter id="shadowFilter">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id="lightGlow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Gradients */}
          <linearGradient id={`topGrad-${giftId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={wrappingGrads.top[0]} />
            <stop offset="100%" stopColor={wrappingGrads.top[1]} />
          </linearGradient>
          <linearGradient id={`frontGrad-${giftId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={wrappingGrads.front[0]} />
            <stop offset="100%" stopColor={wrappingGrads.front[1]} />
          </linearGradient>
          <linearGradient id={`sideGrad-${giftId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={wrappingGrads.side[0]} />
            <stop offset="100%" stopColor={wrappingGrads.side[1]} />
          </linearGradient>
          
          <linearGradient id={`ribbonGrad-${giftId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={ribbonGrad[0]} />
            <stop offset="50%" stopColor={ribbonGrad[1]} />
            <stop offset="100%" stopColor={ribbonGrad[2]} />
          </linearGradient>

          <linearGradient id="beamGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff5e6" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#fca1b5" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#d9a85e" stopOpacity="0" />
          </linearGradient>

          <radialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffdfa" stopOpacity="1" />
            <stop offset="40%" stopColor="#ffeccc" stopOpacity="0.9" />
            <stop offset="75%" stopColor="#fca1b5" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#d9a85e" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Contact Shadow */}
        <motion.ellipse
          cx="100"
          cy="180"
          rx="72"
          ry="12"
          fill="#000"
          animate={opened ? { opacity: 0.25, rx: 64 } : { opacity: 0.45, rx: 72 }}
          transition={{ duration: 0.6 }}
          filter="url(#shadowFilter)"
        />

        {/* Column of Light Beam (Emerging on Open) */}
        {opened && (
          <motion.polygon
            points="100,105 160,80 170,-20 30,-20 40,80"
            fill="url(#beamGrad)"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: [0, 0.9, 0.7], scaleY: [0, 1] }}
            transition={{ duration: 0.6 }}
            className="origin-bottom pointer-events-none"
            style={{ transformOrigin: "100px 105px" }}
          />
        )}

        {/* Inner Glow (Emanating from inside the box) */}
        {opened && (
          <ellipse
            cx="100"
            cy="105"
            rx="55"
            ry="22"
            fill="url(#innerGlow)"
            className="animate-pulse"
            style={{ mixBlendMode: "screen" }}
          />
        )}

        {/* Contents reveal (rising from inside the box base) */}
        {opened && giftId === "letter" && (
          <motion.g
            initial={{ y: 50, opacity: 0, scale: 0.5, filter: "blur(4px)" }}
            animate={{ y: 5, opacity: 1, scale: 1.05, filter: "blur(0px)" }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            style={{ transformOrigin: "100px 105px" }}
          >
            {/* Envelope Body */}
            <path d="M 75,85 L 125,85 L 125,120 L 75,120 Z" fill="#faf6ee" stroke="#d9a85e" strokeWidth="1" />
            {/* Envelope Flap open */}
            <polygon points="75,85 100,65 125,85" fill="#f5eedc" stroke="#d9a85e" strokeWidth="1" />
            {/* Wax Seal */}
            <circle cx="100" cy="95" r="4.5" fill="#9f1239" />
            <path d="M 99,93 L 101,97 M 101,93 L 99,97" stroke="#fb7185" strokeWidth="0.5" />
          </motion.g>
        )}

        {opened && giftId === "memories" && (
          <motion.g
            initial={{ y: 50, opacity: 0, scale: 0.5, filter: "blur(4px)" }}
            animate={{ y: 5, opacity: 1, scale: 1.05, filter: "blur(0px)" }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            style={{ transformOrigin: "100px 105px" }}
          >
            {/* Polaroid 1 (Tilted Left) */}
            <g transform="translate(-12, -4) rotate(-12 85 95)">
              <rect x="75" y="70" width="22" height="28" fill="#faf8f5" rx="1" />
              <rect x="77" y="72" width="18" height="18" fill="#e0ab8b" />
              <circle cx="86" cy="81" r="2" fill="#faf8f5" opacity="0.6" />
            </g>
            {/* Polaroid 2 (Tilted Right) */}
            <g transform="translate(12, -4) rotate(12 115 95)">
              <rect x="103" y="70" width="22" height="28" fill="#faf8f5" rx="1" />
              <rect x="105" y="72" width="18" height="18" fill="#88b5d3" />
              <circle cx="114" cy="81" r="2" fill="#faf8f5" opacity="0.6" />
            </g>
          </motion.g>
        )}

        {opened && giftId === "voice" && (
          <motion.g
            initial={{ y: 50, opacity: 0, scale: 0.5, filter: "blur(4px)" }}
            animate={{ y: 5, opacity: 1, scale: 1.05, filter: "blur(0px)" }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            style={{ transformOrigin: "100px 105px" }}
          >
            {/* Vinyl Record */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              style={{ transformOrigin: "100px 92px" }}
            >
              <circle cx="100" cy="92" r="22" fill="#18181b" />
              <circle cx="100" cy="92" r="16" fill="none" stroke="#27272a" strokeWidth="1" />
              <circle cx="100" cy="92" r="10" fill="none" stroke="#27272a" strokeWidth="1" />
              <circle cx="100" cy="92" r="6" fill="#d9a85e" />
              <circle cx="100" cy="92" r="1.5" fill="#090d16" />
            </motion.g>
            {/* Floating Music Notes */}
            <motion.path
              d="M 120,70 A 2,2 0 1,1 118,72 L 118,63 L 123,65 L 123,69 L 118,67"
              fill="#d9a85e"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: [0, 1, 0], y: [-5, -20] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
            />
          </motion.g>
        )}

        {/* Box Base Front (Right) */}
        <polygon points="100,105 160,80 160,155 100,180" fill={`url(#frontGrad-${giftId})`} />
        {/* Box Base Side (Left) */}
        <polygon points="100,105 40,80 40,155 100,180" fill={`url(#sideGrad-${giftId})`} />

        {/* Ribbons around Base */}
        {/* Front Ribbon (Right) */}
        <polygon points="127,94 133,91.5 133,166 127,169" fill={`url(#ribbonGrad-${giftId})`} />
        {/* Side Ribbon (Left) */}
        <polygon points="73,94 67,91.5 67,166 73,169" fill={`url(#ribbonGrad-${giftId})`} />

        {/* Lid and Ribbon Bow (Hinge open) */}
        <motion.g
          animate={opened ? { y: -30, x: 24, rotate: 45, scale: 0.95 } : { y: 0, x: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 60, damping: 11 }}
          style={{ transformOrigin: "100px 42px" }}
        >
          {/* Lid Top */}
          <polygon points="100,95 165,68 100,42 35,68" fill={`url(#topGrad-${giftId})`} />
          {/* Lid Front (Right) */}
          <polygon points="100,95 165,68 165,82 100,108" fill={`url(#frontGrad-${giftId})`} />
          {/* Lid Side (Left) */}
          <polygon points="100,95 35,68 35,82 100,108" fill={`url(#sideGrad-${giftId})`} />

          {/* Ribbons on Lid */}
          {/* Lid Top Ribbon (Left-Back to Right-Front) */}
          <polygon points="67.5,55 132.5,82.5 132.5,95 67.5,67" fill={`url(#ribbonGrad-${giftId})`} opacity="0.9" />
          {/* Lid Top Ribbon (Right-Back to Left-Front) */}
          <polygon points="132.5,55 67.5,82.5 67.5,95 132.5,67" fill={`url(#ribbonGrad-${giftId})`} opacity="0.9" />
          {/* Lid Front overhang ribbon */}
          <polygon points="127,94 133,91.5 133,105 127,108" fill={`url(#ribbonGrad-${giftId})`} />
          {/* Lid Side overhang ribbon */}
          <polygon points="73,94 67,91.5 67,105 73,108" fill={`url(#ribbonGrad-${giftId})`} />

          {/* Premium Tied Bow */}
          {/* Ribbon tails */}
          <path d="M 98 70 C 85 90, 78 105, 81 115" stroke={`url(#ribbonGrad-${giftId})`} strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M 102 70 C 115 90, 122 105, 119 115" stroke={`url(#ribbonGrad-${giftId})`} strokeWidth="4.5" fill="none" strokeLinecap="round" />

          {/* Loops */}
          <path d="M 100 68 C 70 42, 60 56, 100 68 Z" fill={`url(#ribbonGrad-${giftId})`} stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
          <path d="M 100 68 C 130 42, 140 56, 100 68 Z" fill={`url(#ribbonGrad-${giftId})`} stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
          {/* Center Knot */}
          <circle cx="100" cy="68" r="5.5" fill={`url(#ribbonGrad-${giftId})`} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
        </motion.g>

        {/* Small floating sparkles around open box */}
        {opened && (
          <g>
            {/* Gold particle */}
            <motion.circle cx="85" cy="100" r="1.8" fill="#d9a85e"
              initial={{ y: 0, x: 0, opacity: 0 }}
              animate={{ y: -75, x: [-5, 5, -3], opacity: [0, 0.9, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} />
            {/* Warm white particle */}
            <motion.circle cx="115" cy="95" r="1.5" fill="#fff5e6"
              initial={{ y: 0, x: 0, opacity: 0 }}
              animate={{ y: -90, x: [5, -4, 2], opacity: [0, 0.9, 0] }}
              transition={{ duration: 2.3, repeat: Infinity, ease: "easeOut", delay: 0.4 }} />
            {/* Rose heart particle */}
            <motion.path d="M 97,95 C 95,93 92,93 91,95 C 90,97 92,99 97,103 C 102,99 104,97 103,95 C 102,93 99,93 97,95 Z" fill="#fca1b5"
              initial={{ y: 0, x: 0, scale: 0.6, opacity: 0 }}
              animate={{ y: -80, x: [-2, 3, -1], scale: [0.6, 0.9, 0.5], opacity: [0, 0.8, 0] }}
              transition={{ duration: 2.1, repeat: Infinity, ease: "easeOut", delay: 0.8 }} />
            {/* Second gold particle */}
            <motion.circle cx="95" cy="105" r="1.2" fill="#ffe082"
              initial={{ y: 0, x: 0, opacity: 0 }}
              animate={{ y: -85, x: [3, -3, 1], opacity: [0, 0.8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 1.2 }} />
          </g>
        )}
      </svg>
    </motion.button>
  );
}

function GiftsScene({
  opened,
  onOpen,
  onContinue,
  goToGift,
}: {
  opened: string[];
  onOpen: (id: string) => void;
  onContinue: () => void;
  goToGift: (n: number, id: string) => void;
}) {
  const [opening, setOpening] = useState<string | null>(null);
  const [mobileRevealed, setMobileRevealed] = useState(() => opened.length > 0);
  const [burstParticles, setBurstParticles] = useState<{ id: number; x: number; y: number; vx: number; vy: number; color: string; size: number }[]>([]);

  // Scene 10: LetterScene, Scene 11: MemoriesScene, Scene 12: VoiceScene
  const handleExplore = (id: string) => {
    if (id === "letter") goToGift(10, "letter");
    else if (id === "memories") goToGift(11, "memories");
    else if (id === "voice") goToGift(12, "voice");
  };

  const handleGiftClick = (id: string) => {
    if (opened.includes(id)) {
      handleExplore(id);
    } else {
      if (opening !== null) return;
      setOpening(id);
      setTimeout(() => {
        onOpen(id);
        handleExplore(id);
        setOpening(null);
      }, 1500);
    }
  };

  const handleMobileOpenHero = () => {
    const colors = ["#fbbf24", "#f59e0b", "#ffcbd7", "#ffffff", "#d9a85e"];
    const newP = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10 - 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 4 + 2,
    }));
    setBurstParticles(newP);
    setTimeout(() => {
      setMobileRevealed(true);
    }, 450);
  };

  useEffect(() => {
    if (burstParticles.length === 0) return;
    let active = true;
    let raf = 0;
    const update = () => {
      if (!active) return;
      setBurstParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.15,
          }))
          .filter((p) => p.y < window.innerHeight && p.x > 0 && p.x < window.innerWidth)
      );
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [burstParticles.length]);

  return (
    <div className="scene-container relative">
      <BackgroundLayer src={assets.wishTree} overlay />
      
      {/* Night Garden Tree atmospheric overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070518]/90 via-[#0d0920]/80 to-[#03020a]/95" />
      <ParticleField density="medium" petals={false} />

      {/* Burst Particles */}
      {burstParticles.map((p) => (
        <div
          key={p.id}
          className="fixed rounded-full pointer-events-none z-50 transition-opacity duration-700"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 10px ${p.color}`,
          }}
        />
      ))}

      {/* Hanging String Lights / Fairy Lights on Branches */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" overflow="visible">
        <path
          d="M -50 120 Q 120 70 280 150 T 640 90 T 1100 130"
          fill="none"
          stroke="rgba(245, 158, 11, 0.2)"
          strokeWidth="1.5"
        />
        <circle cx="80" cy="100" r="4.5" fill="#fbbf24" className="animate-pulse shadow-[0_0_8px_#fbbf24]" style={{ animationDuration: "2s" }} />
        <circle cx="210" cy="130" r="5" fill="#f59e0b" className="animate-pulse shadow-[0_0_10px_#f59e0b]" style={{ animationDuration: "2.8s" }} />
        <circle cx="380" cy="110" r="4.5" fill="#fbbf24" className="animate-pulse shadow-[0_0_8px_#fbbf24]" style={{ animationDuration: "1.8s" }} />
        <circle cx="560" cy="100" r="5" fill="#f59e0b" className="animate-pulse shadow-[0_0_12px_#f59e0b]" style={{ animationDuration: "3.2s" }} />
        <circle cx="720" cy="115" r="4.5" fill="#fbbf24" className="animate-pulse shadow-[0_0_8px_#fbbf24]" style={{ animationDuration: "2.3s" }} />
        <circle cx="910" cy="110" r="5" fill="#f59e0b" className="animate-pulse shadow-[0_0_10px_#f59e0b]" style={{ animationDuration: "2.5s" }} />
      </svg>

      <div className="relative z-20 flex min-h-full flex-1 flex-col items-center justify-center overflow-y-auto p-4 sm:p-6 py-10 text-center select-none">
        
        {/* Header Title */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl">
          <span className="text-xs uppercase tracking-[0.3em] text-gold font-medium">Gifts Await You</span>
          <h2 className="font-serif text-3xl font-bold mt-2 sm:text-5xl gradient-text glow-gold">
            You have 3 special gifts
          </h2>
          <p className="mt-2 text-white/70 text-xs sm:text-sm">
            Carefully crafted moments waiting for you to discover.
          </p>
        </motion.div>

        {/* ======================================================== */}
        {/* MOBILE VIEW (< 640px)                                    */}
        {/* ======================================================== */}
        <div className="w-full max-w-sm mt-8 sm:hidden flex flex-col items-center">
          {!mobileRevealed && opened.length === 0 ? (
            /* Hero Central Gift Presentation */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full flex flex-col items-center p-6 rounded-3xl bg-gradient-to-b from-white/10 to-white/[0.02] border border-white/15 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
            >
              {/* Pulsing Aura Box */}
              <div className="relative my-6 flex items-center justify-center">
                <div className="absolute w-28 h-28 rounded-full bg-gold/20 filter blur-xl animate-pulse" />
                <motion.div
                  animate={{ y: [-4, 4, -4], rotate: [-1, 1, -1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-200 via-rose-300 to-rose-500 border border-gold/40 shadow-[0_10px_30px_rgba(217,168,94,0.4)] flex items-center justify-center"
                >
                  <Sparkles className="w-10 h-10 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                </motion.div>
              </div>

              <h3 className="font-serif text-xl font-bold text-champagne glow-gold">
                There's something waiting for you...
              </h3>
              <p className="text-xs text-white/60 mt-1.5 mb-6 leading-relaxed">
                A personal collection of 3 gifts made with love for your special day.
              </p>

              <button
                onClick={handleMobileOpenHero}
                className="w-full min-h-[52px] px-6 rounded-full bg-gradient-to-r from-gold via-amber-300 to-gold text-midnight font-semibold text-sm tracking-wide shadow-[0_0_25px_rgba(217,168,94,0.45)] hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles size={16} /> Open Your Gifts
              </button>
            </motion.div>
          ) : (
            /* 3-Gift Tray with Progress & Badges */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full flex flex-col gap-3.5"
            >
              {/* Progress Indicator */}
              <div className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60 font-mono">Progress</span>
                  <span className="text-gold font-semibold">{opened.length} of 3 unlocked</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 h-1.5 w-full">
                  {[0, 1, 2].map((idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "rounded-full transition-all duration-500",
                        idx < opened.length
                          ? "bg-gradient-to-r from-gold to-amber-300 shadow-[0_0_8px_rgba(217,168,94,0.6)]"
                          : "bg-white/10"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Gift 1: Letter */}
              <div
                onClick={() => handleGiftClick("letter")}
                className={cn(
                  "p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 backdrop-blur-md transition-all cursor-pointer min-h-[64px] active:scale-[0.98]",
                  opened.includes("letter")
                    ? "bg-rose-950/25 border-rose-400/30 shadow-[0_4px_20px_rgba(190,24,93,0.15)]"
                    : "bg-white/[0.03] border-white/10 hover:border-gold/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-700/30 border border-rose-400/30 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-rose-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-sm font-bold text-white">A Letter For You</h4>
                      <span className={cn(
                        "text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold",
                        opened.includes("letter")
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-gold/20 text-gold border border-gold/30"
                      )}>
                        {opened.includes("letter") ? "Opened ✓" : "New Gift ✨"}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50 mt-0.5">Written straight from the heart</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-gold shrink-0">
                  {opened.includes("letter") ? "Read →" : "Open →"}
                </span>
              </div>

              {/* Gift 2: Memories */}
              <div
                onClick={() => handleGiftClick("memories")}
                className={cn(
                  "p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 backdrop-blur-md transition-all cursor-pointer min-h-[64px] active:scale-[0.98]",
                  opened.includes("memories")
                    ? "bg-amber-950/25 border-amber-400/30 shadow-[0_4px_20px_rgba(217,168,94,0.15)]"
                    : "bg-white/[0.03] border-white/10 hover:border-gold/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/30 border border-amber-400/30 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-sm font-bold text-white">Memories Gallery</h4>
                      <span className={cn(
                        "text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold",
                        opened.includes("memories")
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-gold/20 text-gold border border-gold/30"
                      )}>
                        {opened.includes("memories") ? "Opened ✓" : "New Gift ✨"}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50 mt-0.5">Our favorite moments together</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-gold shrink-0">
                  {opened.includes("memories") ? "View →" : "Open →"}
                </span>
              </div>

              {/* Gift 3: Voice */}
              <div
                onClick={() => handleGiftClick("voice")}
                className={cn(
                  "p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 backdrop-blur-md transition-all cursor-pointer min-h-[64px] active:scale-[0.98]",
                  opened.includes("voice")
                    ? "bg-indigo-950/25 border-indigo-400/30 shadow-[0_4px_20px_rgba(99,102,241,0.15)]"
                    : "bg-white/[0.03] border-white/10 hover:border-gold/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-700/30 border border-indigo-400/30 flex items-center justify-center shrink-0">
                    <Volume2 className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-sm font-bold text-white">Voice & Melody</h4>
                      <span className={cn(
                        "text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold",
                        opened.includes("voice")
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-gold/20 text-gold border border-gold/30"
                      )}>
                        {opened.includes("voice") ? "Opened ✓" : "New Gift ✨"}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50 mt-0.5">Acoustic songs & melodies</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-gold shrink-0">
                  {opened.includes("voice") ? "Play →" : "Open →"}
                </span>
              </div>

              {/* Continue button appears once at least 1 gift is opened */}
              {opened.length >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex flex-col items-center gap-1.5"
                >
                  <PrimaryButton onClick={onContinue} className="w-full min-h-[48px]">
                    {opened.length === 3 ? "Continue Journey ♥" : "Continue to Wish Tree →"}
                  </PrimaryButton>
                  {opened.length < 3 && (
                    <span className="text-[11px] text-white/40">
                      You can return to explore the remaining {3 - opened.length} gift{3 - opened.length > 1 ? "s" : ""}
                    </span>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </div>

        {/* ======================================================== */}
        {/* DESKTOP VIEW (>= 640px)                                  */}
        {/* ======================================================== */}
        <div className="hidden sm:flex relative mt-12 w-full max-w-3xl flex-col items-center justify-center gap-10 px-4 sm:flex-row sm:items-end sm:gap-6 sm:mt-16">
          {gifts.map((g, i) => {
            const isOpened = opened.includes(g.id);
            const isOpening = opening === g.id;
            return (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.8 }}
                className={cn(
                  "relative flex flex-col items-center",
                  i === 0 && "sm:rotate-[-5deg] sm:-translate-x-4 sm:-translate-y-2",
                  i === 1 && "sm:translate-y-6 sm:scale-110",
                  i === 2 && "sm:rotate-[5deg] sm:translate-x-4 sm:-translate-y-1"
                )}
              >
                <GiftBox3D
                  giftId={g.id}
                  label={g.label}
                  opened={isOpened || isOpening}
                  onClick={() => handleGiftClick(g.id)}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Desktop Continue Button shown when at least 1 gift is opened (highlighted when all 3) */}
        <div className="hidden sm:block">
          {opened.length >= 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-14 z-30 text-center flex flex-col items-center gap-2"
            >
              <PrimaryButton onClick={onContinue}>
                {opened.length === 3 ? "Continue Journey ♥" : "Continue to Wish Tree →"}
              </PrimaryButton>
              {opened.length < 3 && (
                <span className="text-xs text-white/50">
                  ({opened.length} of 3 opened — you can explore more or continue anytime)
                </span>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline preloader to ensure Polaroid styles don't conflict


/* ------------------------------------------------------------------ */
/* Scene 10 — Letter                                                  */
/* ------------------------------------------------------------------ */

function HandwritingText({
  paragraphs,
  greeting,
  signature,
  alreadyAnimated,
  onComplete,
}: {
  paragraphs: string[];
  greeting: string;
  signature: string;
  alreadyAnimated?: boolean;
  onComplete: () => void;
}) {
  const greetingText = greeting;
  const pTexts = paragraphs;

  const totalLength = greetingText.length + pTexts.reduce((sum, p) => sum + p.length, 0);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSignature, setShowSignature] = useState(alreadyAnimated);

  // Keep stable references to callbacks and texts to prevent restarts
  const onCompleteRef = useRef(onComplete);
  const greetingTextRef = useRef(greetingText);
  const pTextsRef = useRef(pTexts);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    greetingTextRef.current = greetingText;
    pTextsRef.current = pTexts;
  }, [onComplete, greetingText, pTexts]);

  useEffect(() => {
    if (alreadyAnimated) {
      setCurrentIndex(totalLength);
      setShowSignature(true);
      onCompleteRef.current();
      return;
    }

    let index = 0;
    let active = true;
    let timerId: any = null;

    const getCharAt = (idx: number) => {
      if (idx < greetingTextRef.current.length) {
        return greetingTextRef.current[idx];
      }
      let offset = greetingTextRef.current.length;
      for (let p = 0; p < pTextsRef.current.length; p++) {
        const pText = pTextsRef.current[p];
        if (idx < offset + pText.length) {
          return pText[idx - offset];
        }
        offset += pText.length;
      }
      return "";
    };

    const tick = () => {
      if (!active) return;
      if (index < totalLength) {
        index++;
        setCurrentIndex(index);

        let delay = 20 + Math.random() * 15; // 20-35ms per character

        const c = getCharAt(index - 1);
        if (c === "." || c === "!" || c === "?") {
          delay = 450; // Pause at end of sentence
        } else if (c === ",") {
          delay = 250; // Pause at comma
        }

        // Section boundary pauses
        if (index === greetingTextRef.current.length) {
          delay = 600;
        } else {
          let offset = greetingTextRef.current.length;
          for (let p = 0; p < pTextsRef.current.length; p++) {
            offset += pTextsRef.current[p].length;
            if (index === offset) {
              delay = 800;
              break;
            }
          }
        }

        timerId = setTimeout(tick, delay);
      } else {
        // Typing finished!
        timerId = setTimeout(() => {
          if (active) {
            setShowSignature(true);
            onCompleteRef.current();
          }
        }, 800); // 800ms delay before revealing signature
      }
    };

    timerId = setTimeout(tick, 500);

    return () => {
      active = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [alreadyAnimated, totalLength]);

  const dispGreeting = currentIndex <= greetingText.length 
    ? greetingText.substring(0, currentIndex) 
    : greetingText;

  const dispParagraphs = pTexts.map((pText, pIdx) => {
    let prevC = greetingText.length;
    for (let i = 0; i < pIdx; i++) {
      prevC += pTexts[i].length;
    }
    const currC = prevC + pText.length;
    if (currentIndex <= prevC) return "";
    if (currentIndex <= currC) return pText.substring(0, currentIndex - prevC);
    return pText;
  });

  return (
    <div className="text-left font-serif text-amber-950/90 leading-relaxed select-text flex flex-col gap-4 pt-4 pb-12">
      {/* Greeting */}
      <h3 className="font-script text-xl sm:text-2xl font-bold text-rose-800 min-h-[1.5rem]">
        {dispGreeting}
      </h3>

      {/* Paragraphs */}
      {pTexts.map((p, idx) => (
        <p 
          key={idx} 
          className="text-sm sm:text-base leading-relaxed text-amber-950/80 font-serif indent-4 text-justify min-h-[2.5rem]"
        >
          {dispParagraphs[idx] || ""}
        </p>
      ))}

      {/* Signature */}
      <AnimatePresence>
        {showSignature && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mt-6 flex flex-col items-end text-right pr-6"
          >
            <span className="text-sm text-amber-950/70 font-serif italic min-h-[1rem]">
              With all my love,
            </span>
            <span className="font-script text-2xl font-bold text-rose-800 mt-1 min-h-[2rem]">
              {signature || "Yours forever ♥"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LetterScene({
  onBack,
  onContinue,
  cameFromGifts,
  onNext,
  onPrev,
}: {
  onBack: () => void;
  onContinue: () => void;
  cameFromGifts: boolean;
  onNext?: () => void;
  onPrev?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<"closed" | "pulsing" | "releasing" | "flap" | "slide" | "reveal" | "writing">("closed");
  const [state, setState] = useState(() => loadState() as SceneState);
  const [letterFinished, setLetterFinished] = useState(state.letterAnimated);
  
  // Particles states
  const [sealParticles, setSealParticles] = useState<{ id: number; x: number; y: number; vx: number; vy: number; color: string; size: number }[]>([]);
  const [stampParticles, setStampParticles] = useState<{ id: number; x: number; y: number; vx: number; vy: number; color: string; size: number }[]>([]);

  // Trigger sequential open sequence
  const handleOpenEnvelope = () => {
    if (stage !== "closed") return;
    setStage("pulsing");
    
    // Pulse for 900ms
    setTimeout(() => {
      setStage("releasing");
      // Spawn particles on release
      const colors = ["#b91c1c", "#d9a85e", "#ffcbd7", "#ffffff"];
      const newParticles = Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 4 + 2
      }));
      setSealParticles(newParticles);
      
      // Delay envelope opening
      setTimeout(() => {
        setOpen(true);
      }, 700);
    }, 900);
  };

  useEffect(() => {
    if (open) {
      setStage("flap");
      const t1 = setTimeout(() => setStage("slide"), 700);
      const t2 = setTimeout(() => setStage("reveal"), 1500);
      const t3 = setTimeout(() => setStage("writing"), 2300);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      setStage("closed");
    }
  }, [open]);

  // Update loop for seal particles
  useEffect(() => {
    if (sealParticles.length === 0) return;
    let active = true;
    let raf = 0;
    const update = () => {
      if (!active) return;
      setSealParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.1, // floating gravity
          }))
          .filter((p) => p.y < window.innerHeight && p.x > 0 && p.x < window.innerWidth)
      );
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [sealParticles.length]);

  // Update loop for stamp particles
  useEffect(() => {
    if (stampParticles.length === 0) return;
    let active = true;
    let raf = 0;
    const update = () => {
      if (!active) return;
      setStampParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.2, // gravity falling
          }))
          .filter((p) => p.y < 500)
      );
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [stampParticles.length]);

  const spawnStampParticles = () => {
    const colors = ["#b91c1c", "#d9a85e", "#ffcbd7", "#881337"];
    const cardEl = document.querySelector(".letter-card-container");
    const width = cardEl ? cardEl.clientWidth : 580;
    const height = cardEl ? cardEl.clientHeight : 490;

    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: width - 50 - Math.random() * 30, // dynamically near bottom right
      y: height - 50 - Math.random() * 30,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4 - 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 3 + 1.5
    }));
    setStampParticles(newParticles);
  };

  return (
    <div className="scene-container relative">
      <BackgroundLayer src={assets.loveLetter} overlay />
      <ParticleField density="low" petals />
      
      {/* Candlelit atmospheric warm overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(253,230,138,0.22),_rgba(8,4,12,0.85)_80%)] pointer-events-none z-10" />

      {/* Floating Seal Particles */}
      {sealParticles.map((p) => (
        <div
          key={p.id}
          className="fixed rounded-full pointer-events-none z-50 transition-opacity duration-1000"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 8px ${p.color}`,
          }}
        />
      ))}

      {/* Header controls (Visible only if letter is open) */}
      {open && (
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-30">
          <button
            onClick={onBack}
            className="flex min-h-[44px] min-w-[44px] px-4 items-center justify-center rounded-full glass border border-white/10 hover:border-gold/30 hover:scale-105 active:scale-95 text-white/95 text-sm transition-all duration-300 cursor-pointer gap-2"
          >
            <ChevronLeft size={16} /> Garden
          </button>
          <div className="flex gap-2">
            {onPrev && (
              <button
                onClick={onPrev}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full glass border border-white/10 hover:border-gold/30 hover:scale-105 active:scale-95 text-white/95 transition-all duration-300 cursor-pointer"
                aria-label="Previous present"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            {onNext && (
              <button
                onClick={onNext}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full glass border border-white/10 hover:border-gold/30 hover:scale-105 active:scale-95 text-white/95 transition-all duration-300 cursor-pointer"
                aria-label="Next present"
              >
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="relative z-10 flex min-h-full flex-1 flex-col items-center justify-center p-4 sm:p-6 py-10 sm:py-12 text-center w-full max-w-3xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="font-serif text-2xl sm:text-4xl lg:text-5xl gradient-text glow-gold mb-3 sm:mb-4 shrink-0"
        >
          {letterContent.heading}
        </motion.h2>

        {!open ? (
          /* Unopened Envelope */
          <div className="relative w-[310px] h-[210px] sm:w-[360px] sm:h-[240px] my-auto">
            {/* 1. Envelope Back Plate */}
            <div 
              className="absolute inset-0 rounded-lg shadow-xl"
              style={{
                background: "linear-gradient(135deg, #eaddc6 0%, #dbcbab 100%)",
                border: "1px solid rgba(139, 115, 85, 0.2)",
              }}
            >
              <div className="absolute inset-0 bg-black/10 rounded-lg" />
            </div>

            {/* Letter peek inside */}
            <div className="absolute inset-x-4 top-2 h-16 bg-[#fdfbf7] rounded-t border border-amber-900/10 shadow-inner" />

            {/* 2. Envelope Front Flaps */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(135deg, transparent 40%, rgba(0,0,0,0.05) 50%, transparent 60%)",
              }}
            >
              <div 
                className="absolute inset-x-0 bottom-0 h-[60%]"
                style={{
                  background: "linear-gradient(to top, #ebdcb9, #e8dcc6)",
                  clipPath: "polygon(0 100%, 100% 100%, 50% 0)",
                  borderTop: "1px solid rgba(139, 115, 85, 0.15)",
                }}
              />
              <div 
                className="absolute inset-y-0 left-0 w-[55%]"
                style={{
                  background: "linear-gradient(to right, #ebdcb9, #ebdcc6)",
                  clipPath: "polygon(0 0, 100% 50%, 0 100%)",
                  borderRight: "1px solid rgba(139, 115, 85, 0.12)",
                }}
              />
              <div 
                className="absolute inset-y-0 right-0 w-[55%]"
                style={{
                  background: "linear-gradient(to left, #e8dcb9, #ebdcc6)",
                  clipPath: "polygon(100% 0, 0 50%, 100% 100%)",
                  borderLeft: "1px solid rgba(139, 115, 85, 0.12)",
                }}
              />
            </div>

            {/* 3. Top Flap with Wax Seal */}
            <div className="absolute inset-x-0 top-0 h-[55%] pointer-events-none">
              <div 
                className="w-full h-full"
                style={{
                  background: "linear-gradient(to bottom, #fcfbf8, #ebdcb9)",
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
                }}
              />
              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 pointer-events-auto">
                <motion.button
                  onClick={handleOpenEnvelope}
                  animate={{ 
                    scale: [1, 1.08, 1], 
                    boxShadow: [
                      "0 4px 10px rgba(0,0,0,0.3), 0 0 10px rgba(185,28,28,0.25)",
                      "0 4px 14px rgba(0,0,0,0.35), 0 0 25px rgba(185,28,28,0.6), 0 0 12px rgba(217,168,94,0.3)",
                      "0 4px 10px rgba(0,0,0,0.3), 0 0 10px rgba(185,28,28,0.25)"
                    ] 
                  }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                  className="w-13 h-13 rounded-full flex items-center justify-center shadow-lg border border-rose-800/40 relative cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                  style={{
                    background: "radial-gradient(circle at 35% 35%, #b91c1c 0%, #881337 70%, #4c0519 100%)",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.25)"
                  }}
                  aria-label="Open envelope"
                >
                  <Heart className="w-5 h-5 fill-rose-100/90 text-rose-100/90 filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />
                </motion.button>
              </div>
            </div>
            
            <p className="absolute -bottom-10 inset-x-0 text-center text-xs sm:text-sm text-champagne/70 font-serif italic">
              Tap the seal to open ♥
            </p>
          </div>
        ) : (
          /* Opened Letter Card: Flex Column Architecture */
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col min-h-0 w-full max-w-2xl h-[74vh] sm:h-[78vh] max-h-[660px] rounded-2xl p-4 sm:p-7 md:p-8 bg-[#fdfbf7] border border-amber-900/15 shadow-[0_25px_60px_rgba(0,0,0,0.5),_0_0_40px_rgba(217,168,94,0.12)] relative paper-texture letter-card-container overflow-hidden"
          >
            {/* Double-gold foil border frame */}
            <div className="absolute inset-2.5 sm:inset-3 border border-[#d9a85e]/35 rounded-lg pointer-events-none" />
            <div className="absolute inset-[11px] sm:inset-[15px] border-[0.5px] border-[#d9a85e]/20 rounded-lg pointer-events-none shadow-[0_0_8px_rgba(217,168,94,0.1)]" />

            {/* Corner flourishes */}
            <div className="absolute top-2.5 left-2.5 pointer-events-none text-gold/40">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M 6,18 L 6,6 L 18,6" />
              </svg>
            </div>
            <div className="absolute top-2.5 right-2.5 rotate-90 pointer-events-none text-gold/40">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M 6,18 L 6,6 L 18,6" />
              </svg>
            </div>
            <div className="absolute bottom-2.5 left-2.5 -rotate-90 pointer-events-none text-gold/40">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M 6,18 L 6,6 L 18,6" />
              </svg>
            </div>
            <div className="absolute bottom-2.5 right-2.5 rotate-180 pointer-events-none text-gold/40">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M 6,18 L 6,6 L 18,6" />
              </svg>
            </div>

            {/* Scrollable Letter Content */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-2 sm:pr-4 custom-scrollbar select-text">
              <HandwritingText
                paragraphs={letterContent.paragraphs}
                greeting={letterContent.greeting}
                signature={letterContent.signature}
                alreadyAnimated={state.letterAnimated}
                onComplete={() => {
                  setLetterFinished(true);
                  if (!state.letterAnimated) {
                    setState((s) => {
                      const next = { ...s, letterAnimated: true };
                      saveState(next);
                      return next;
                    });
                  }
                }}
              />
            </div>

            {/* Navigation Actions: Flex-Shrink-0, never overlaps text */}
            <div className="flex-shrink-0 pt-3 sm:pt-4 mt-2 border-t border-amber-900/15 flex items-center justify-between gap-3 relative z-30">
              <div className="flex items-center gap-2">
                {cameFromGifts && (
                  <button
                    onClick={onBack}
                    className="px-4 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-serif text-amber-900/80 bg-amber-100/70 hover:bg-amber-100 border border-amber-800/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <ChevronLeft size={16} /> Back to Gifts
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {letterFinished && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -25 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      rotate: -8,
                      boxShadow: [
                        "0 4px 8px rgba(0,0,0,0.3)",
                        "0 0 25px rgba(185, 28, 28, 0.75), 0 0 15px rgba(217, 168, 94, 0.6)",
                        "0 4px 8px rgba(0,0,0,0.3)"
                      ]
                    }}
                    transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                    onAnimationComplete={spawnStampParticles}
                    className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center shadow-md border border-rose-800/40 relative shadow-[0_0_15px_rgba(185,28,28,0.4)]"
                    style={{
                      background: "radial-gradient(circle at 35% 35%, #b91c1c 0%, #881337 70%, #4c0519 100%)",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.3), inset 0 2px 3px rgba(255,255,255,0.25)"
                    }}
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-100/90 text-rose-100/90 filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />
                  </motion.div>
                )}

                {letterFinished && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={onContinue}
                    className="px-6 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold tracking-wide bg-gradient-to-r from-[#d9a85e] to-[#b8862e] text-[#1a0f05] shadow-[0_4px_16px_rgba(217,168,94,0.35)] hover:shadow-[0_6px_22px_rgba(217,168,94,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    Continue <ArrowRight size={16} />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 11 — Memories Gallery                                        */
/* ------------------------------------------------------------------ */

function MemoriesScene({
  onBack,
  onContinue,
  onNext,
  onPrev,
}: {
  onBack: () => void;
  onContinue: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  const next = () => setSelected((s) => (s === null ? null : (s + 1) % memories.length));
  const prev = () => setSelected((s) => (s === null ? null : (s - 1 + memories.length) % memories.length));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (selected === null) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected]);

  const rotations = [-2, 1, -1.5, 2, -1, 1.5];
  const partnerName = birthdayContent.herName;

  return (
    <div className="scene-container relative bg-gradient-to-br from-[#0b0d1c]/85 via-[#1a0f1a]/75 to-[#0b0d1c]/95 z-50">
      <BackgroundLayer src={assets.couplePhoto} overlay />
      <ParticleField density="medium" petals={false} />

      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-30">
        <button
          onClick={onBack}
          className="flex min-h-[44px] min-w-[44px] px-4 items-center justify-center rounded-full glass border border-white/10 hover:border-gold/30 hover:scale-105 active:scale-95 text-white/95 text-sm transition-all duration-300 cursor-pointer gap-2"
        >
          <ChevronLeft size={16} /> Garden
        </button>
        <div className="flex gap-2">
          {onPrev && (
            <button
              onClick={onPrev}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full glass border border-white/10 hover:border-gold/30 hover:scale-105 active:scale-95 text-white/95 transition-all duration-300 cursor-pointer"
              aria-label="Previous present"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          {onNext && (
            <button
              onClick={onNext}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full glass border border-white/10 hover:border-gold/30 hover:scale-105 active:scale-95 text-white/95 transition-all duration-300 cursor-pointer"
              aria-label="Next present"
            >
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="relative z-10 flex min-h-full flex-1 flex-col items-center overflow-y-auto p-6 py-16">
        <h2 className="font-serif text-3xl font-semibold sm:text-5xl gradient-text glow-gold mt-6">
          {partnerName} & Me
        </h2>
        <p className="mt-2 text-white/70 text-sm">Tap a Polaroid to relive the moment</p>

        <div className="mt-8 grid w-full max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3">
          {memories.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
            >
              <Polaroid
                image={m.image}
                caption={m.caption}
                date={m.date}
                rotate={rotations[i % rotations.length]}
                onClick={() => setSelected(i)}
              />
            </motion.div>
          ))}
        </div>

        <div className="my-8">
          <PrimaryButton onClick={onContinue}>Continue ♥</PrimaryButton>
        </div>
      </div>

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, rotateY: 15, y: 15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm sm:max-w-md border border-[#d9a85e]/30 shadow-[0_25px_60px_rgba(0,0,0,0.65),_0_0_35px_rgba(217,168,94,0.18)] rounded-2xl p-0.5 overflow-hidden bg-gradient-to-br from-[#d9a85e]/30 via-[#fb7185]/10 to-[#d9a85e]/20"
            >
              <div className="paper-texture relative rounded-[14px] p-5 pb-6 bg-[#fdfbf7] flex flex-col justify-between h-full min-h-[460px]">
                {/* Close Button */}
                <button
                  onClick={() => setSelected(null)}
                  className="absolute right-3 top-3 z-30 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white text-slate-800 shadow-md hover:bg-slate-100 transition-colors border border-amber-900/10 cursor-pointer"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>

                {/* Inner double border */}
                <div className="absolute inset-3 border border-gold/15 rounded-lg pointer-events-none" />

                {/* Polaroid content inside modal */}
                <div className="relative z-10 p-1 flex flex-col">
                  {/* Polaroid Photo Frame */}
                  <div className="p-2 pb-4 bg-white border border-amber-950/10 shadow-md rounded-sm">
                    <SafeImage
                      src={memories[selected].image}
                      alt={memories[selected].caption}
                      className="aspect-[4/3] w-full rounded-sm object-cover filter brightness-[98%]"
                    />
                  </div>

                  {/* Caption & Info */}
                  <div className="mt-4 px-2 select-text">
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-amber-900/40 uppercase">
                      {memories[selected].date}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-amber-950 mt-1 leading-tight">
                      {memories[selected].caption}
                    </h3>
                    {memories[selected].subtitle && (
                      <p className="font-serif text-xs italic text-gold font-medium mt-0.5">
                        {memories[selected].subtitle}
                      </p>
                    )}
                    <p className="mt-3 font-serif text-sm leading-relaxed text-slate-700 min-h-[4.5rem]">
                      {memories[selected].description}
                    </p>
                  </div>
                </div>

                {/* Navigation inside modal */}
                <div className="mt-6 flex justify-between gap-4 z-10 px-2">
                  <button
                    onClick={prev}
                    className="flex-1 py-2.5 min-h-[44px] rounded-full text-xs font-medium border border-amber-900/20 text-slate-800 bg-amber-900/5 hover:bg-amber-900/10 hover:border-gold/30 active:scale-97 transition-all cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    onClick={next}
                    className="flex-1 py-2.5 min-h-[44px] rounded-full text-xs font-medium border border-gold/40 text-gold bg-gold/5 hover:bg-gold/15 active:scale-97 transition-all cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 12 — Voice Message                                           */
/* ------------------------------------------------------------------ */

function WaveformProgress({
  progress,
  isPlaying,
  onSeek,
}: {
  progress: number;
  isPlaying: boolean;
  onSeek: (p: number) => void;
}) {
  const barsCount = 38;
  const barHeights = useMemo(() => {
    const heights = [];
    const pattern = [25, 40, 30, 55, 70, 45, 60, 80, 95, 75, 85, 60, 40, 50, 75, 90, 80, 55, 30, 45, 65, 85, 95, 80, 60, 75, 50, 35, 45, 60, 50, 30, 40, 25, 35, 20, 15, 10];
    for (let i = 0; i < barsCount; i++) {
      heights.push(pattern[i % pattern.length]);
    }
    return heights;
  }, []);

  return (
    <div 
      className="flex items-end justify-between h-14 w-full cursor-pointer group px-1"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        onSeek(Math.max(0, Math.min(1, clickX / rect.width)));
      }}
    >
      {barHeights.map((h, i) => {
        const barProgress = i / barsCount;
        const active = progress >= barProgress;
        return (
          <motion.div
            key={i}
            className={cn(
              "w-[3px] rounded-full transition-all duration-200",
              active 
                ? "bg-gradient-to-t from-pink-500 via-rose-500 to-red-500" 
                : "bg-white/10 group-hover:bg-white/20"
            )}
            style={{ height: `${h}%` }}
            animate={isPlaying && active ? {
              scaleY: [1, 1.18, 1],
            } : { scaleY: 1 }}
            transition={{
              repeat: Infinity,
              duration: 1.1 + (i % 3) * 0.1,
              delay: i * 0.02,
              ease: "easeInOut"
            }}
          />
        );
      })}
    </div>
  );
}

function VoiceScene({
  audio,
  onBack,
  onContinue,
  onNext,
  onPrev,
}: {
  audio: ReturnType<typeof useAudioEngine>;
  onBack: () => void;
  onContinue: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}) {
  useEffect(() => () => audio.pauseVoiceMelody(), [audio]);

  // Scrub progress handler for click & drag
  const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clickPos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    audio.seek(clickPos);
  };

  return (
    <div className="scene-container relative bg-[#130d22] overflow-hidden select-none">
      {/* Deep atmospheric purple/lavender gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#190e2d] via-[#24133b] to-[#120a21] opacity-95" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(192,132,252,0.15)_0%,_transparent_65%)] pointer-events-none" />
      <ParticleField density="low" petals={true} dots={false} />

      {/* Header controls */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-30">
        <button
          onClick={onBack}
          className="flex min-h-[44px] min-w-[44px] px-4 items-center justify-center rounded-full glass border border-white/10 hover:border-purple-300/40 hover:scale-105 active:scale-95 text-white/95 text-sm transition-all duration-300 cursor-pointer gap-2"
        >
          <ChevronLeft size={16} /> Garden
        </button>
        <div className="flex gap-2">
          {onPrev && (
            <button
              onClick={onPrev}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full glass border border-white/10 hover:border-purple-300/40 hover:scale-105 active:scale-95 text-white/95 transition-all duration-300 cursor-pointer"
              aria-label="Previous present"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          {onNext && (
            <button
              onClick={onNext}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full glass border border-white/10 hover:border-purple-300/40 hover:scale-105 active:scale-95 text-white/95 transition-all duration-300 cursor-pointer"
              aria-label="Next present"
            >
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="relative z-10 flex min-h-full flex-1 flex-col items-center justify-center overflow-y-auto p-4 sm:p-6 py-12 text-center w-full max-w-5xl mx-auto">
        {/* Title */}
        <div className="mt-6 mb-3 sm:mb-5 z-20">
          <span className="text-xs uppercase tracking-[0.3em] text-purple-200/80 font-medium">Private Melody</span>
          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl gradient-text glow-gold mt-1">
            Our Love Soundtrack ♥
          </h2>
        </div>

        {/* HERO PURPLE ROMANTIC ARTWORK CONTAINER */}
        <div className="relative w-full max-w-4xl aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.65),_0_0_40px_rgba(192,132,252,0.2)] border border-purple-300/25 my-auto">
          {/* Main Visual Artwork Image */}
          <img
            src="/assets/images/purple-audio-artwork.jpg"
            alt="Romantic Couple Purple Artwork"
            className="w-full h-full object-cover pointer-events-none"
            loading="eager"
          />

          {/* ========================================================= */}
          {/* TRANSPARENT HTML INTERACTIVE OVERLAY CONTROLS            */}
          {/* Aligned via responsive % coordinates over visual artwork  */}
          {/* ========================================================= */}

          {/* Real Interactive Progress Bar Overlay */}
          <div
            onClick={handleSeek}
            onTouchStart={handleSeek}
            className="absolute z-20 cursor-pointer group/progress py-2"
            style={{
              left: "63.3%",
              top: "74.0%",
              width: "28.5%",
              transform: "translateY(-50%)",
            }}
            title="Click or drag to seek"
          >
            {/* Real Progress Fill line that tracks audio playback */}
            <div className="w-full h-[4px] rounded-full bg-white/10 relative overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 rounded-full transition-[width] duration-150"
                style={{ width: `${Math.min(100, Math.max(0, audio.voiceProgress * 100))}%` }}
              />
            </div>
            {/* Active glowing scrubber handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9),_0_0_5px_rgba(217,168,94,0.8)] pointer-events-none transition-transform group-hover/progress:scale-125"
              style={{ left: `${Math.min(100, Math.max(0, audio.voiceProgress * 100))}%` }}
            />
          </div>

          {/* Dynamic Left Timestamp Overlay (Current Time) */}
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              left: "63.3%",
              top: "77.2%",
              transform: "translateY(0%)",
            }}
          >
            <span className="text-[10px] sm:text-xs font-mono font-medium text-white/90 bg-[#836fa9]/80 backdrop-blur-xs px-1.5 py-0.5 rounded shadow-sm">
              {formatTime(audio.currentTime)}
            </span>
          </div>

          {/* Dynamic Right Timestamp Overlay (Total Duration) */}
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              right: "8.2%",
              top: "77.2%",
              transform: "translateY(0%)",
            }}
          >
            <span className="text-[10px] sm:text-xs font-mono font-medium text-white/90 bg-[#836fa9]/80 backdrop-blur-xs px-1.5 py-0.5 rounded shadow-sm">
              {formatTime(audio.voiceDuration || 180)}
            </span>
          </div>

          {/* Previous Song Hotspot */}
          <button
            type="button"
            onClick={audio.prev}
            className="absolute z-20 rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-white/20 active:scale-90 hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]"
            style={{
              left: "70.6%",
              top: "84.8%",
              transform: "translate(-50%, -50%)",
              width: "7.5%",
              height: "14%",
              minWidth: "44px",
              minHeight: "44px",
              maxWidth: "56px",
              maxHeight: "56px",
            }}
            aria-label="Previous song"
            title="Previous song"
          >
            <span className="sr-only">Previous Song</span>
          </button>

          {/* Play/Pause Button Hotspot */}
          <button
            type="button"
            onClick={audio.togglePlay}
            className="absolute z-20 rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-white/20 active:scale-95 hover:shadow-[0_0_25px_rgba(217,168,94,0.6)]"
            style={{
              left: "77.5%",
              top: "84.8%",
              transform: "translate(-50%, -50%)",
              width: "9.5%",
              height: "16%",
              minWidth: "52px",
              minHeight: "52px",
              maxWidth: "68px",
              maxHeight: "68px",
            }}
            aria-label={audio.isPlayingVoice ? "Pause song" : "Play song"}
            title={audio.isPlayingVoice ? "Pause" : "Play"}
          >
            {audio.isPlayingVoice && (
              <>
                {/* Subtle soft pulse aura */}
                <span className="absolute inset-0 rounded-full bg-white/25 animate-ping opacity-60 pointer-events-none" />
                {/* Semi-transparent elegant pause icon overlay over the artwork's play icon */}
                <span className="relative flex items-center justify-center bg-purple-950/70 rounded-full p-2 border border-white/30 shadow-md">
                  <Pause size={18} className="text-white fill-current" />
                </span>
              </>
            )}
            <span className="sr-only">{audio.isPlayingVoice ? "Pause" : "Play"}</span>
          </button>

          {/* Next Song Hotspot */}
          <button
            type="button"
            onClick={audio.next}
            className="absolute z-20 rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-white/20 active:scale-90 hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]"
            style={{
              left: "84.4%",
              top: "84.8%",
              transform: "translate(-50%, -50%)",
              width: "7.5%",
              height: "14%",
              minWidth: "44px",
              minHeight: "44px",
              maxWidth: "56px",
              maxHeight: "56px",
            }}
            aria-label="Next song"
            title="Next song"
          >
            <span className="sr-only">Next Song</span>
          </button>
        </div>

        {/* Tactile Track Info & Playlist Switcher Strip */}
        <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-between gap-3 w-full max-w-4xl px-2 py-2 rounded-2xl bg-purple-950/50 border border-purple-300/15 backdrop-blur-md">
          {/* Track title & status */}
          <div className="flex items-center gap-2 text-left pl-2">
            <Sparkles className="w-4 h-4 text-gold shrink-0 animate-pulse" />
            <div>
              <p className="text-xs sm:text-sm font-serif font-semibold text-champagne leading-tight">
                {audio.currentTrack.title}
              </p>
              <p className="text-[10px] text-purple-200/60 font-serif italic">
                {audio.currentTrack.artist}
              </p>
            </div>
          </div>

          {/* Playlist track buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {audio.playlist.map((track, idx) => {
              const isActive = audio.currentTrackIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => audio.loadTrack(idx, true)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-serif transition-all min-h-[36px] flex items-center gap-1.5 cursor-pointer",
                    isActive
                      ? "bg-purple-500/30 text-white border border-purple-300/40 shadow-[0_0_10px_rgba(192,132,252,0.3)] font-medium"
                      : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                  )}
                >
                  <span className="text-[10px] font-mono text-purple-300/70">{idx + 1}</span>
                  <span className="truncate max-w-[80px] sm:max-w-[120px]">{track.title}</span>
                </button>
              );
            })}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5 pr-2">
            <button
              onClick={() => audio.setVolume(audio.volume === 0 ? 0.5 : 0)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              aria-label={audio.volume === 0 ? "Unmute" : "Mute"}
            >
              {audio.volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audio.volume}
              onChange={(e) => audio.setVolume(parseFloat(e.target.value))}
              className="w-14 sm:w-16 h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-purple-300 outline-none"
            />
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-6 sm:mt-8 flex flex-col gap-3 sm:flex-row z-20">
          <GlassButton onClick={onBack}>
            <ChevronLeft size={16} className="mr-1 inline" /> Back to Gifts
          </GlassButton>
          <PrimaryButton onClick={onContinue}>Continue →</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 13 — Memory Journey                                          */
/* ------------------------------------------------------------------ */



/* ------------------------------------------------------------------ */
/* Scene 14 — Wish Tree                                               */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Scene 14 — Wish Tree                                               */
/* ------------------------------------------------------------------ */

function WishTreePopupCard({ 
  text, 
  onClose 
}: { 
  text: string; 
  onClose: () => void; 
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    const tFlip = setTimeout(() => {
      setIsFlipped(true);
    }, 600);

    const tSparkles = setTimeout(() => {
      setShowSparkles(true);
    }, 1100);

    return () => {
      clearTimeout(tFlip);
      clearTimeout(tSparkles);
    };
  }, []);

  return (
    <div 
      className="relative w-full max-w-sm h-[400px] perspective-1000"
      onClick={(e) => e.stopPropagation()}
    >
      <motion.div
        animate={{
          rotateY: isFlipped ? 180 : 0,
          y: isFlipped ? -5 : 0,
          boxShadow: isFlipped 
            ? "0 25px 55px rgba(217,168,94,0.35), 0 0 35px rgba(244,63,94,0.25)" 
            : "0 15px 35px rgba(0,0,0,0.4)"
        }}
        transition={{ duration: 0.85, ease: [0.34, 1.56, 0.64, 1] }}
        className="w-full h-full preserve-3d relative cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* FRONT FACE (Closed Card Cover) */}
        <div 
          className="absolute inset-0 rounded-2xl p-6 flex flex-col items-center justify-between text-center backface-hidden border border-gold/25 shadow-[0_15px_35px_rgba(0,0,0,0.5)] bg-[#fdfbf7]"
          style={{
            boxShadow: "0 15px 35px rgba(0,0,0,0.5), inset 0 0 25px rgba(217,168,94,0.06)"
          }}
        >
          <div className="absolute inset-3 border border-[#d9a85e]/30 rounded-lg pointer-events-none" />
          
          <div className="w-full flex justify-between items-center opacity-40">
            <Sparkles className="h-4 w-4 text-gold" />
            <span className="text-[9px] uppercase tracking-widest text-amber-950 font-serif">A Wish For You</span>
            <Sparkles className="h-4 w-4 text-gold" />
          </div>

          <div className="flex flex-col items-center gap-3">
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              className="w-16 h-16 rounded-full flex items-center justify-center border border-rose-800/40 relative shadow-[0_4px_10px_rgba(185,28,28,0.2)]"
              style={{
                background: "radial-gradient(circle at 35% 35%, #b91c1c 0%, #881337 70%, #4c0519 100%)",
              }}
            >
              <Heart className="w-6 h-6 fill-rose-100/90 text-rose-100/90" />
            </motion.div>
            <h3 className="font-serif text-xl font-bold text-amber-950 mt-2">
              Open My Wish
            </h3>
          </div>

          <span className="text-[10px] uppercase tracking-widest text-amber-900/60 font-serif mb-1">
            Tap to Flip Open ♥
          </span>
        </div>

        {/* BACK FACE (Opened Card Content) */}
        <div 
          className="absolute inset-0 rounded-2xl p-7 flex flex-col justify-between text-center backface-hidden rotate-y-180 border border-gold/40 bg-[#fdfbf7] overflow-hidden"
          style={{
            boxShadow: "0 20px 45px rgba(217,168,94,0.18), inset 0 0 35px rgba(217,168,94,0.08)"
          }}
        >
          <div className="absolute inset-3 border border-[#d9a85e]/30 rounded-lg pointer-events-none" />
          <div className="absolute inset-[16px] border-[0.5px] border-dashed border-[#d9a85e]/15 rounded-lg pointer-events-none" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(253,230,138,0.18),_transparent_70%)] pointer-events-none" />

          {showSparkles && Array.from({ length: 8 }).map((_, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30, scale: 0.5 }}
              animate={{ opacity: [0, 0.8, 0], y: -80, scale: [0.5, 1.2, 0.5] }}
              transition={{ repeat: Infinity, duration: 2.0 + idx * 0.3, ease: "easeOut" }}
              className={cn("absolute h-1.5 w-1.5 rounded-full", idx % 2 === 0 ? "bg-[#d9a85e]" : "bg-[#fb7185]")}
              style={{
                left: `${15 + ((idx * 93) % 70)}%`,
                bottom: "20%",
                boxShadow: idx % 2 === 0 ? "0 0 8px #d9a85e" : "0 0 8px #fb7185"
              }}
            />
          ))}

          <div className="relative z-10 flex justify-between items-center opacity-40">
            <span className="text-[8px] tracking-[0.2em] font-serif text-amber-950 uppercase">Hanging Wish</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1 rounded-full hover:bg-amber-900/5 text-amber-950 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="relative z-10 my-auto py-2 flex flex-col items-center">
            <div className="absolute w-44 h-44 rounded-full bg-gold/5 blur-2xl -z-10" />
            <p className="font-serif italic text-lg sm:text-xl text-amber-950 leading-relaxed font-bold px-2 select-text">
              &quot;{text}&quot;
            </p>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-2">
            <span className="text-[8px] uppercase tracking-widest text-amber-900/40 font-serif">
              Tap to close
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="rounded-full px-5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-amber-950 border border-gold/40 bg-gold/5 hover:bg-gold/15 active:scale-95 transition-all"
            >
              Close Wish ♥
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function WishTreeScene({ onContinue }: { onContinue: () => void }) {
  const [active, setActive] = useState<{ text: string; id: number } | null>(null);
  const [discovered, setDiscovered] = useState<number[]>([]);

  const positions = useMemo(
    () => [
      { top: "26%", left: "18%", delay: 0 },
      { top: "24%", left: "82%", delay: 0.2 },
      { top: "42%", left: "25%", delay: 0.4 },
      { top: "38%", left: "75%", delay: 0.6 },
      { top: "58%", left: "20%", delay: 0.8 },
      { top: "56%", left: "80%", delay: 1 },
    ],
    []
  );

  const reveal = (w: (typeof wishTreeWishes)[0]) => {
    setActive({ text: w.text, id: w.id });
    if (!discovered.includes(w.id)) setDiscovered((d) => [...d, w.id]);
  };

  const close = () => setActive(null);

  return (
    <div className="scene-container relative overflow-hidden">
      <BackgroundLayer src={assets.wishTree} overlay className={cn("transition-all duration-[2000ms]", discovered.length === wishTreeWishes.length && "brightness-125 saturate-[110%]")} />
      <ParticleField density={discovered.length === wishTreeWishes.length ? "medium" : "low"} petals={true} />

      {/* Cinematic Golden Light flare blend overlay when all wishes are revealed */}
      {discovered.length === wishTreeWishes.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_#ffe8a3_0%,_transparent_70%)] pointer-events-none z-10 mix-blend-color-dodge"
        />
      )}

      <div className="relative z-20 flex min-h-full flex-1 flex-col items-center justify-center p-6 py-12 text-center select-none">
        <div className="z-30 mt-4">
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-serif text-3xl font-semibold sm:text-5xl gradient-text glow-gold">
            My Wishes For You ♥
          </motion.h2>
          <p className="mt-2 text-white/70 text-sm">Tap a hanging wish card to read my wish for you</p>
        </div>

        {/* Full-Screen Absolute distribution container */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-hidden">
          {wishTreeWishes.map((w, i) => (
            <motion.button
              key={w.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: [0, 3.5, -3.5, 0],
              }}
              transition={{
                opacity: { delay: positions[i].delay, duration: 0.6 },
                scale: { delay: positions[i].delay, duration: 0.6 },
                rotate: { repeat: Infinity, duration: 4.5 + i * 0.7, ease: "easeInOut" }
              }}
              whileHover={{ scale: 1.15, rotate: 0 }}
              onClick={() => reveal(w)}
              className={cn(
                "wish-cardboard absolute h-16 w-11 -translate-x-1/2 -translate-y-1/2 shadow-md border border-amber-900/25 cursor-pointer rounded bg-[#fdfaf2] flex flex-col items-center justify-between p-2 pb-1.5 pointer-events-auto",
                discovered.includes(w.id) && "shadow-[0_0_15px_rgba(217,168,94,0.65)] border-gold bg-[#fffefc]"
              )}
              style={{
                top: positions[i].top,
                left: positions[i].left,
                transformOrigin: "center top",
              }}
              aria-label={`Wish ${i + 1}`}
            >
              {/* Twine hanging string loop coordinate */}
              <svg className="absolute -top-[80px] left-1/2 -translate-x-1/2 h-[80px] w-4 pointer-events-none" overflow="visible">
                <line x1="8" y1="0" x2="8" y2="80" stroke="#8c6d53" strokeWidth="1.5" />
                <circle cx="8" cy="4" r="2.5" fill="none" stroke="#8c6d53" strokeWidth="1.2" />
              </svg>

              {/* Heart/Wax Seal */}
              <div className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-[#9c1a24] text-[9px] text-[#fee2e2] font-sans font-bold shadow-sm relative filter drop-shadow-[0_1px_3px_rgba(156,26,36,0.3)]">
                ♥
              </div>

              {/* Card index */}
              <span className="text-[10px] font-serif text-amber-950/65 font-bold tracking-wider">
                {i + 1}
              </span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6 backdrop-blur-md"
            >
              <WishTreePopupCard text={active.text} onClose={close} />
            </motion.div>
          )}
        </AnimatePresence>

        {discovered.length === wishTreeWishes.length && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 font-script text-2xl text-gold glow-gold font-semibold z-30"
          >
            All my wishes are for you ♥
          </motion.p>
        )}

        <div className="mt-8 relative z-30">
          <PrimaryButton onClick={onContinue}>Continue →</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 14 — Memory Journey                                          */
/* ------------------------------------------------------------------ */

function MemoryJourneyScene({ onContinue }: { onContinue: () => void }) {
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
        root: container,
        rootMargin: "0px 0px -15% 0px",
        threshold: 0.08,
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
    <div className="scene-container relative bg-[#05060d]">
      {/* Smooth Crossfading Atmospheric Backgrounds */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {atmospheres.map((style, idx) => (
          <motion.div
            key={idx}
            className={cn("absolute inset-0 transition-all duration-[1200ms]", style)}
            initial={{ opacity: 0 }}
            animate={{ opacity: (activeIndex === idx || mobileChapter === idx) ? 1 : 0 }}
            transition={{ duration: 1.2 }}
          />
        ))}
        {/* Top/bottom vignette overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05060d]/60 via-transparent to-[#05060d]/80 pointer-events-none" />
      </div>

      <ParticleField density="low" petals={true} dots={true} />

      <div 
        ref={containerRef} 
        className="relative z-10 flex min-h-full flex-1 flex-col items-center overflow-y-auto p-4 sm:p-6 py-10 sm:py-12"
      >
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12 mt-4 sm:mt-6"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-gold font-medium">Reliving Our Path</span>
          <h2 className="font-serif text-3xl font-bold mt-2 sm:text-5xl gradient-text glow-gold">Our Story</h2>
          <p className="mt-2 text-white/70 text-xs sm:text-sm italic">"The moments that became us"</p>
        </motion.div>

        {/* ======================================================== */}
        {/* MOBILE STORYBOOK CHAPTER SCENES (< 640px)               */}
        {/* ======================================================== */}
        <div className="w-full max-w-sm sm:hidden flex flex-col items-center my-auto pb-8">
          {/* Chapter indicator & progress segmented bar */}
          <div className="w-full mb-5 flex flex-col items-center gap-2">
            <div className="flex justify-between items-center w-full px-1 text-xs">
              <span className="text-white/50 font-mono text-[11px]">Chapter {mobileChapter + 1} of {milestones.length}</span>
              <span className="text-gold font-serif text-[11px] tracking-wide font-medium">
                {milestones[mobileChapter].date}
              </span>
            </div>
            <div className="grid grid-cols-8 gap-1.5 h-1.5 w-full">
              {milestones.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setMobileChapter(idx);
                    setActiveIndex(idx);
                  }}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                    idx === mobileChapter
                      ? "bg-gold shadow-[0_0_8px_rgba(217,168,94,0.8)] scale-y-125"
                      : idx < mobileChapter
                      ? "bg-gold/40"
                      : "bg-white/15"
                  )}
                  aria-label={`Jump to Chapter ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Active Chapter Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mobileChapter}
              initial={{ opacity: 0, x: 25, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -25, filter: "blur(4px)" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full flex flex-col items-center"
            >
              {milestones[mobileChapter].index === "08" ? (
                /* Final Chapter Conclusion on Mobile */
                <div className="w-full flex flex-col items-center text-center py-2">
                  <span className="text-[11px] uppercase tracking-[0.25em] text-gold font-medium">Final Chapter</span>
                  <h3 className="font-serif text-2xl font-bold text-champagne mt-1 glow-gold">
                    {milestones[mobileChapter].label}
                  </h3>
                  <span className="font-script text-xl text-rose mt-1 block italic">
                    "This isn't the end of our story."
                  </span>

                  <div className="relative w-full h-[240px] my-5 flex items-center justify-center">
                    <div className="absolute w-[105px] -left-1 top-2">
                      <Polaroid image="/story/story 1.png" caption="First Chat" rotate={-8} />
                    </div>
                    <div className="absolute w-[105px] -right-1 top-2">
                      <Polaroid image="/story/story 2.png" caption="First Call" rotate={8} />
                    </div>
                    <div className="absolute w-[120px] z-10 shadow-2xl">
                      <Polaroid image="/story/story 7.png" caption="Our Future" rotate={0} />
                    </div>
                  </div>

                  <p className="font-serif italic text-base text-white/90 leading-relaxed px-4">
                    "There are still so many moments waiting for us."
                  </p>
                  <p className="text-[10px] text-white/40 tracking-[0.2em] uppercase mt-1 mb-6">
                    Our story is just beginning
                  </p>

                  <PrimaryButton onClick={onContinue} className="w-full min-h-[50px]">
                    Continue Journey ♥
                  </PrimaryButton>
                </div>
              ) : (
                /* Standard Story Chapter on Mobile */
                <div className="w-full flex flex-col items-center">
                  <div className="text-center mb-3">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-gold/80 font-medium">
                      Chapter {milestones[mobileChapter].index}
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-white mt-0.5">
                      {milestones[mobileChapter].label}
                    </h3>
                  </div>

                  {/* Polaroid Frame */}
                  <div className="w-[210px] my-1">
                    <Polaroid
                      image={milestones[mobileChapter].image}
                      caption={milestones[mobileChapter].label}
                      rotate={milestones[mobileChapter].rotate || 0}
                      className="shadow-2xl"
                    />
                  </div>

                  {/* Narrative Text */}
                  <div className="mt-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md text-left w-full shadow-lg">
                    <p className="text-[13.5px] leading-relaxed text-white/90 font-serif">
                      {milestones[mobileChapter].description}
                    </p>
                  </div>

                  {/* Chapter Navigation Controls */}
                  <div className="flex items-center justify-between w-full mt-5 gap-3">
                    <button
                      onClick={handleMobilePrev}
                      disabled={mobileChapter === 0}
                      className={cn(
                        "flex-1 min-h-[48px] px-4 rounded-full border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                        mobileChapter === 0
                          ? "opacity-30 border-white/10 text-white/40 cursor-not-allowed"
                          : "border-white/15 text-white/90 hover:border-gold/30 hover:bg-white/5 active:scale-95"
                      )}
                    >
                      <ChevronLeft size={16} /> Prev
                    </button>
                    <button
                      onClick={handleMobileNext}
                      className="flex-1 min-h-[48px] px-4 rounded-full bg-gradient-to-r from-gold/90 to-amber-400 text-midnight text-xs font-semibold flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(217,168,94,0.3)] hover:scale-102 active:scale-95 transition-all cursor-pointer"
                    >
                      Next Chapter <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
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
                <div className={cn("w-full sm:w-1/2 flex flex-col px-4 text-center sm:text-left", isEven ? "sm:items-end sm:text-right" : "sm:items-start")}>
                  {/* Subtle chapter tag */}
                  <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.6 }}
                    className="text-xs uppercase tracking-[0.2em] text-gold font-medium"
                  >
                    Chapter {item.index}
                  </motion.span>
                  
                  {/* Title */}
                  <motion.h3 
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1"
                  >
                    {item.label}
                  </motion.h3>
                  
                  {/* Script Date */}
                  <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="font-script text-xl text-rose mt-1 block"
                  >
                    {item.date}
                  </motion.span>

                  {/* Description Card */}
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
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="hidden sm:block mt-4 pb-12 relative z-30"
        >
          <PrimaryButton onClick={onContinue}>Continue →</PrimaryButton>
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 15 — Hidden Surprise                                         */
/* ------------------------------------------------------------------ */

function HiddenSurpriseScene({ onContinue }: { onContinue: () => void }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="scene-container">
      <BackgroundLayer overlay />
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0f2e]/90 via-[#2d1b4e]/85 to-[#0b0d1c]/95" />
      <ParticleField density="low" petals={false} />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif text-3xl font-semibold sm:text-5xl gradient-text glow-gold">
          Shhh... something hidden is here ♥
        </h2>

        <div className="relative mt-10 flex h-64 w-64 items-center justify-center">
          {!revealed ? (
            <div className="relative flex h-48 w-48 items-center justify-center">
              {/* Expanding glowing halos (waves of light) */}
              <motion.div
                animate={{ scale: [1, 1.6, 2.3], opacity: [0.6, 0.2, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
                className="absolute inset-4 rounded-full bg-rose/25 filter blur-md"
              />
              <motion.div
                animate={{ scale: [1, 1.6, 2.3], opacity: [0.6, 0.2, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut", delay: 0.5 }}
                className="absolute inset-4 rounded-full bg-rose/15 filter blur-lg"
              />

              {/* Floating Embers */}
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-1.5 w-1.5 rounded-full bg-rose-300/80 filter drop-shadow-[0_0_4px_rgba(244,63,94,0.6)]"
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{
                    x: [0, (Math.random() - 0.5) * 70, (Math.random() - 0.5) * 100],
                    y: [0, -70, -180],
                    opacity: [0, 0.9, 0],
                    scale: [0.6, 1.2, 0.4],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.2 + Math.random() * 1.5,
                    delay: i * 0.22,
                    ease: "easeOut",
                  }}
                  style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
                />
              ))}

              {/* Double-pulse beating heart button */}
              <motion.button
                animate={{ scale: [1, 1.08, 1, 1.05, 1, 1, 1] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                onClick={() => setRevealed(true)}
                className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[#1b0a1d]/80 border border-rose/30 shadow-[0_0_30px_rgba(244,63,94,0.35)] cursor-pointer z-10 hover:border-rose/50"
                aria-label="Open surprise"
              >
                <Heart className="h-12 w-12 fill-rose text-rose filter drop-shadow-[0_0_12px_rgba(244,63,94,0.85)] animate-pulse" />
              </motion.button>
            </div>
          ) : (
            <>
              {/* Expanding Gold-Pink Halo transition layer */}
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 12, opacity: 0 }}
                transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute h-16 w-16 rounded-full bg-gradient-to-r from-[#d9a85e] via-[#d4869a] to-[#a855f7] z-30 pointer-events-none filter blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.2, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.25 }}
                className="relative"
              >
                {/* Premium Flapping Butterfly */}
                <svg width="150" height="150" viewBox="0 0 120 120" fill="none" className="drop-shadow-[0_0_20px_rgba(168,85,247,0.7)]">
                  <defs>
                    <linearGradient id="leftWingGrad" x1="60" y1="40" x2="20" y2="80">
                      <stop offset="0%" stopColor="#d8b4fe" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                    <linearGradient id="rightWingGrad" x1="60" y1="40" x2="100" y2="80">
                      <stop offset="0%" stopColor="#f472b6" />
                      <stop offset="100%" stopColor="#db2777" />
                    </linearGradient>
                  </defs>

                  {/* Left Wing Group */}
                  <motion.g
                    animate={{ rotateY: [0, 45, 0] }}
                    transition={{ repeat: Infinity, duration: 0.75, ease: "easeInOut" }}
                    style={{ transformOrigin: "60px 70px" }}
                  >
                    <path d="M 60 45 C 30 15, 10 30, 25 60 C 35 75, 55 75, 60 70 Z" fill="url(#leftWingGrad)" />
                    <path d="M 60 70 C 45 75, 30 85, 38 100 C 48 110, 58 95, 60 85 Z" fill="url(#leftWingGrad)" opacity="0.9" />
                  </motion.g>

                  {/* Right Wing Group */}
                  <motion.g
                    animate={{ rotateY: [0, -45, 0] }}
                    transition={{ repeat: Infinity, duration: 0.75, ease: "easeInOut" }}
                    style={{ transformOrigin: "60px 70px" }}
                  >
                    <path d="M 60 45 C 90 15, 110 30, 95 60 C 85 75, 65 75, 60 70 Z" fill="url(#rightWingGrad)" />
                    <path d="M 60 70 C 75 75, 90 85, 82 100 C 72 110, 62 95, 60 85 Z" fill="url(#rightWingGrad)" opacity="0.9" />
                  </motion.g>

                  {/* Antennae */}
                  <path d="M 58 40 Q 52 28 48 30" stroke="#4a3b52" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  <path d="M 62 40 Q 68 28 72 30" stroke="#4a3b52" strokeWidth="1.5" strokeLinecap="round" fill="none" />

                  {/* Butterfly Body */}
                  <line x1="60" y1="35" x2="60" y2="88" stroke="#31193f" strokeWidth="4" strokeLinecap="round" />

                  {/* Glowing Sparkle Trail */}
                  {Array.from({ length: 6 }).map((_, pIdx) => (
                    <motion.circle
                      key={pIdx}
                      cx={60 + Math.sin(pIdx) * 12}
                      cy={92 + pIdx * 8}
                      r={1.5 + Math.random() * 2}
                      fill="#f472b6"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: [0, 0.9, 0], scale: [0.5, 1.2, 0.5], y: [0, 18] }}
                      transition={{ repeat: Infinity, duration: 1.4, delay: pIdx * 0.2 }}
                    />
                  ))}
                </svg>
              </motion.div>
            </>
          )}
        </div>

        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-6 max-w-md"
          >
            <p className="font-serif text-xl text-purple-200">You are the most beautiful surprise life ever gave me.</p>
            <PrimaryButton onClick={onContinue} className="mt-6">Continue →</PrimaryButton>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 16 — Special Video                                           */
/* ------------------------------------------------------------------ */

function SpecialVideoScene({
  onContinue,
  audio,
}: {
  onContinue: () => void;
  audio: any;
}) {
  const [phase, setPhase] = useState<
    "intro-text-1" | "intro-text-2" | "video-reveal" | "video-playing" | "video-ended" | "outro-text-1" | "outro-text-2"
  >("intro-text-1");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [videoAspect, setVideoAspect] = useState("19 / 6");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Timers for the intro text sequences
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPhase("intro-text-2");
    }, 3600);
    return () => clearTimeout(timer1);
  }, []);

  useEffect(() => {
    if (phase === "intro-text-2") {
      const timer2 = setTimeout(() => {
        setPhase("video-reveal");
      }, 3800);
      return () => clearTimeout(timer2);
    }
  }, [phase]);

  // Timers for the outro text sequences
  useEffect(() => {
    if (phase === "outro-text-1") {
      const timer3 = setTimeout(() => {
        setPhase("outro-text-2");
      }, 3200);
      return () => clearTimeout(timer3);
    }
  }, [phase]);

  // Audio integration
  useEffect(() => {
    const wasAmbientPlaying = audio.enabled;
    const wasMusicPlaying = audio.isPlayingVoice;
    
    if (wasAmbientPlaying) audio.stopAmbient();
    if (wasMusicPlaying) audio.pause();
    
    return () => {
      if (wasAmbientPlaying) audio.startAmbient();
      if (wasMusicPlaying) audio.play();
    };
  }, [audio]);

  // Autoplay handler when video is revealed
  useEffect(() => {
    if (phase === "video-reveal") {
      const video = videoRef.current;
      if (video) {
        video.play()
          .then(() => {
            setIsPlaying(true);
            setPhase("video-playing");
          })
          .catch(() => {
            // If autoplay with sound is blocked, fallback to muted autoplay
            video.muted = true;
            setIsMuted(true);
            video.play()
              .then(() => {
                setIsPlaying(true);
                setPhase("video-playing");
              })
              .catch(() => {
                // User click needed
                setIsPlaying(false);
              });
          });
      }
    }
  }, [phase]);

  const handlePlay = () => {
    setIsPlaying(true);
    if (phase === "video-reveal") setPhase("video-playing");
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setPhase("video-ended");
    setTimeout(() => {
      setPhase("outro-text-1");
    }, 1200);
  };

  const handleUnmute = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.videoWidth && videoRef.current.videoHeight) {
      setVideoAspect(`${videoRef.current.videoWidth} / ${videoRef.current.videoHeight}`);
    }
    setHasError(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const isVideoVisible = phase === "video-reveal" || phase === "video-playing" || phase === "video-ended";

  return (
    <div ref={containerRef} className="scene-container bg-[#070811] relative overflow-hidden flex flex-col items-center justify-center">
      {/* Deep cinematic background with subtle warm burgundy and golden radial lighting */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#05060e] via-[#160814] to-[#070811] opacity-95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(217,168,94,0.12)_0%,_transparent_75%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,134,154,0.06)_0%,_transparent_60%)] pointer-events-none" />
      
      {/* Soft floating golden particles */}
      <ParticleField density="low" petals={false} dots={true} />

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center w-full h-full p-2 sm:p-6 md:p-8">
        
        {/* Responsive Full-Viewport Cinematic Video Theater Wrapper */}
        <div className={cn(
          "relative flex flex-col items-center justify-center w-full h-[100dvh] max-h-[100dvh] mx-auto transition-all duration-[1200ms] ease-out",
          isVideoVisible ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none absolute"
        )}>
          {/* Outer glow & shadow frame */}
          <div className="relative w-full h-full flex items-center justify-center bg-black/95">
            <video
              ref={videoRef}
              src="/assets/special_video.mp4"
              className="w-full h-full max-h-[100dvh] object-contain shadow-[0_0_80px_rgba(0,0,0,0.9)]"
              playsInline
              preload="metadata"
              controls={isVideoVisible && isPlaying}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleEnded}
              onError={() => {
                console.error("Failed to load video at /assets/special_video.mp4");
                setHasError(true);
              }}
            />

            {/* Cinematic Center Play Overlay when paused or beginning */}
            {!isPlaying && isVideoVisible && !hasError && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.play().then(() => {
                      setIsPlaying(true);
                      setPhase("video-playing");
                    }).catch(() => {
                      // Muted play fallback
                      if (videoRef.current) {
                        videoRef.current.muted = true;
                        setIsMuted(true);
                        videoRef.current.play().then(() => {
                          setIsPlaying(true);
                          setPhase("video-playing");
                        }).catch(() => {});
                      }
                    });
                  }
                }}
                className="absolute flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-[#1b0a1d]/85 border border-gold/40 shadow-[0_0_40px_rgba(217,168,94,0.45)] hover:border-gold/70 hover:scale-105 cursor-pointer transition-all duration-300 active:scale-95 z-20"
                aria-label="Play video"
              >
                <Play className="h-8 w-8 sm:h-10 sm:w-10 fill-gold text-gold ml-1 filter drop-shadow-[0_0_10px_rgba(217,168,94,0.7)]" />
              </motion.button>
            )}

            {/* Floating Unmute indicator on mobile / autoplay */}
            {isMuted && isPlaying && isVideoVisible && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={handleUnmute}
                className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 flex items-center gap-2 rounded-full bg-[#1b0a1d]/90 border border-gold/40 px-4 py-2.5 text-xs font-medium text-gold shadow-lg hover:bg-[#28102b] active:scale-95 transition-all cursor-pointer"
              >
                <VolumeX size={15} /> Tap to Unmute
              </motion.button>
            )}

            {/* Clean Romantic Error State if video file is missing or unplayable */}
            {hasError && isVideoVisible && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-black/90 backdrop-blur-md">
                <Sparkles className="w-10 h-10 text-gold mb-3 animate-pulse" />
                <h4 className="font-serif text-xl sm:text-2xl text-champagne mb-2">Our Special Moments Video</h4>
                <p className="text-white/70 text-sm max-w-md mb-6">A collection of our cherished memories together ♥</p>
                <PrimaryButton onClick={onContinue}>Continue to Final Surprise →</PrimaryButton>
              </div>
            )}
          </div>
        </div>

        {/* Text phases overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 text-center pointer-events-none">
          <AnimatePresence mode="wait">
            {phase === "intro-text-1" && (
              <motion.div
                key="intro1"
                initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-xl px-4"
              >
                <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-champagne/90 tracking-wide glow-gold font-light">
                  Before the final surprise...
                </h3>
              </motion.div>
            )}

            {phase === "intro-text-2" && (
              <motion.div
                key="intro2"
                initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-xl px-4"
              >
                <h3 className="font-script text-4xl sm:text-5xl lg:text-6xl text-gold glow-gold leading-relaxed">
                  I made something special for you. ♥
                </h3>
              </motion.div>
            )}

            {phase === "outro-text-1" && (
              <motion.div
                key="outro1"
                initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-xl px-4"
              >
                <h3 className="font-script text-4xl sm:text-5xl lg:text-6xl text-gold glow-gold leading-relaxed">
                  That was just for you. ♥
                </h3>
              </motion.div>
            )}

            {phase === "outro-text-2" && (
              <motion.div
                key="outro2"
                initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-xl flex flex-col items-center gap-8 pointer-events-auto px-4"
              >
                <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-champagne/90 tracking-wide glow-gold font-light">
                  Ready for the final surprise?
                </h3>
                <PrimaryButton 
                  onClick={onContinue}
                  className="px-10 py-3.5 text-base tracking-widest bg-gradient-to-r from-gold via-amber-500 to-gold text-midnight border border-gold/40 shadow-[0_0_25px_rgba(217,168,94,0.45)] hover:shadow-[0_0_35px_rgba(217,168,94,0.65)] hover:scale-105 transition-all duration-300"
                >
                  Continue ♥
                </PrimaryButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 17 — Final                                                   */
/* ------------------------------------------------------------------ */

function FinalScene({ onReplay }: { onReplay: () => void }) {
  const [index, setIndex] = useState(0);
  const [showReplay, setShowReplay] = useState(false);

  useEffect(() => {
    const delays = [3000, 5800, 8600, 12400, 16200];
    const timers = delays.slice(0, -1).map((d, i) => setTimeout(() => setIndex(i + 1), d));
    const replayTimer = setTimeout(() => setShowReplay(true), 21000);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(replayTimer);
    };
  }, []);

  const renderText = (idx: number) => {
    switch (idx) {
      case 0:
        return (
          <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl leading-tight text-champagne/90 glow-gold">
            Thank you for being<br />a part of my story.
          </h2>
        );
      case 1:
        return (
          <h2 className="leading-tight">
            <span className="font-script text-5xl sm:text-7xl lg:text-8xl text-gold glow-gold block mb-2">Our Journey,</span>
            <span className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white/90">this isn't the end...</span>
          </h2>
        );
      case 2:
        return (
          <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl leading-tight text-champagne/90 glow-gold">
            It's just another chapter<br />of us.
          </h2>
        );
      case 3:
        return (
          <h2 className="leading-tight">
            <span className="font-serif text-4xl sm:text-6xl lg:text-7xl text-champagne/90 block">Happy Birthday</span>
            <span className="font-script text-5xl sm:text-7xl lg:text-8xl text-rose glow-rose block mt-3">Bindu ♥</span>
          </h2>
        );
      case 4:
        return (
          <h2 className="leading-tight">
            <span className="font-serif text-4xl sm:text-6xl lg:text-7xl text-champagne/90 block">I Love You</span>
            <span className="font-script text-5xl sm:text-7xl lg:text-8xl text-gold glow-gold block mt-3">Forever & Always</span>
          </h2>
        );
      default:
        return null;
    }
  };

  return (
    <div className="scene-container">
      <BackgroundLayer src={assets.finalSunset} overlay={false} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d1c]/80 via-[#3d0f18]/25 to-[#0b0d1c]/50" />
      <ParticleField density="medium" petals />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center overflow-y-auto p-6 py-8 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 60, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -60, filter: "blur(10px)" }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            {renderText(index)}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {showReplay && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="mt-12 flex flex-col items-center gap-4">
              <PrimaryButton onClick={onReplay}>
                <RotateCcw size={16} className="mr-2 inline" /> Replay Our Story
              </PrimaryButton>
              <p className="text-sm text-white/60">Made with ♥</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
