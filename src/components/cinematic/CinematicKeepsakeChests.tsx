import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Key as KeyIcon, CheckCircle2 } from "lucide-react";

interface CinematicKeepsakeChestsProps {
  opened: string[];
  onOpen: (id: string) => void;
  onContinue: () => void;
  goToGift: (sceneIndex: number, giftId: string) => void;
}

export function CinematicKeepsakeChests({
  opened,
  onOpen,
  onContinue,
  goToGift,
}: CinematicKeepsakeChestsProps) {
  const [opening, setOpening] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [wrongKeyChest, setWrongKeyChest] = useState<string | null>(null);
  const [wrongFeedback, setWrongFeedback] = useState<string | null>(null);
  const [burstParticles, setBurstParticles] = useState<{ id: number; x: number; y: number; vx: number; vy: number; color: string; size: number }[]>([]);

  const chestRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 8 Ornamental Keys matching Reference 4 (including the 3 required keys)
  const keysList = [
    { id: "key-letter", name: "Ruby Heart Key", icon: "❤️", target: "letter", color: "#f43f5e" },
    { id: "key-voice", name: "Moonlight Key", icon: "🌙", target: "voice", color: "#60a5fa" },
    { id: "key-memories", name: "Golden Star Key", icon: "⭐", target: "memories", color: "#f59e0b" },
    { id: "key-crystal", name: "Crystal Key", icon: "💠", target: "none", color: "#a855f7" },
    { id: "key-rose", name: "Rose Key", icon: "🌹", target: "none", color: "#fb7185" },
    { id: "key-sapphire", name: "Sapphire Key", icon: "💎", target: "none", color: "#38bdf8" },
    { id: "key-butterfly", name: "Butterfly Key", icon: "🦋", target: "none", color: "#ec4899" },
    { id: "key-antique", name: "Antique Key", icon: "🗝️", target: "none", color: "#eab308" },
  ];

  const requiredChests = [
    {
      id: "letter",
      name: "Love Letter Chest",
      color: "ruby",
      themeGlow: "rgba(244, 63, 94, 0.6)",
      matchingKey: "key-letter",
      sceneIndex: 10,
    },
    {
      id: "memories",
      name: "Memories Chest",
      color: "bronze",
      themeGlow: "rgba(245, 158, 11, 0.6)",
      matchingKey: "key-memories",
      sceneIndex: 11,
    },
    {
      id: "voice",
      name: "Voice & Melody Chest",
      color: "sapphire",
      themeGlow: "rgba(59, 130, 246, 0.6)",
      matchingKey: "key-voice",
      sceneIndex: 12,
    },
  ];

  const allGiftsOpened = requiredChests.every((c) => opened.includes(c.id));

  const handleUnlockChest = (chestId: string) => {
    if (opened.includes(chestId) || opening !== null) return;
    setOpening(chestId);

    // Spawn celebration particle burst
    const colors = ["#fbbf24", "#f43f5e", "#60a5fa", "#ffffff", "#fed7aa"];
    const newP = Array.from({ length: 36 }).map((_, i) => ({
      id: i,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12 - 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 6 + 3,
    }));
    setBurstParticles(newP);

    setTimeout(() => {
      onOpen(chestId);
      setOpening(null);
    }, 1100);
  };

  const triggerWrongKeyFeedback = (chestId: string) => {
    setWrongKeyChest(chestId);
    setWrongFeedback("Not this key... match the lock shape & engraving ♥");
    setTimeout(() => {
      setWrongKeyChest(null);
      setWrongFeedback(null);
    }, 1400);
  };

  const handleKeyDragEnd = (keyId: string, info: { point: { x: number; y: number } }) => {
    const dropPoint = info.point;
    let hitChest: string | null = null;

    for (const c of requiredChests) {
      const el = chestRefs.current[c.id];
      if (el) {
        const rect = el.getBoundingClientRect();
        if (
          dropPoint.x >= rect.left - 40 &&
          dropPoint.x <= rect.right + 40 &&
          dropPoint.y >= rect.top - 40 &&
          dropPoint.y <= rect.bottom + 40
        ) {
          hitChest = c.id;
          break;
        }
      }
    }

    if (hitChest) {
      const chestDef = requiredChests.find((c) => c.id === hitChest);
      if (chestDef && chestDef.matchingKey === keyId) {
        handleUnlockChest(hitChest);
      } else {
        triggerWrongKeyFeedback(hitChest);
      }
    }
  };

  const handleChestClick = (chestId: string) => {
    if (opened.includes(chestId)) {
      const chest = requiredChests.find((c) => c.id === chestId);
      if (chest) goToGift(chest.sceneIndex, chestId);
      return;
    }

    const chestDef = requiredChests.find((c) => c.id === chestId);
    if (!chestDef) return;

    if (selectedKey === chestDef.matchingKey) {
      handleUnlockChest(chestId);
      setSelectedKey(null);
    } else if (selectedKey !== null) {
      triggerWrongKeyFeedback(chestId);
    } else {
      setSelectedKey(chestDef.matchingKey);
    }
  };

  // Particle physics
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
            vy: p.vy + 0.16,
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
    <div className="relative w-full h-full min-h-screen overflow-y-auto overflow-x-hidden flex flex-col justify-between select-none bg-[#09030b]">
      {/* Background Environment Plate matching Reference 4 */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/cinematic/keepsake-chests-clean.jpg"
          alt="Enchanted Keepsake Chest Garden"
          className="w-full h-full object-cover object-center filter contrast-[103%] brightness-[97%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/75 pointer-events-none" />
      </div>

      {/* Floating subtle ambient particles */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-rose-200/50"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: "0 0 8px rgba(244, 63, 94, 0.6)",
            }}
            animate={{
              y: [0, -35, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Particle Burst Overlay */}
      {burstParticles.map((p) => (
        <div
          key={p.id}
          className="fixed rounded-full pointer-events-none z-50"
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

      {/* Wrong Key Feedback Toast */}
      <AnimatePresence>
        {wrongFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#3b0b14]/90 border border-rose-500/50 text-rose-200 text-xs sm:text-sm font-serif tracking-wide shadow-2xl backdrop-blur-md pointer-events-none"
          >
            ✦ {wrongFeedback} ✦
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER: Matches Target Reference 4 */}
      <header className="relative z-30 pt-8 sm:pt-10 px-4 text-center max-w-2xl mx-auto flex flex-col items-center">
        {/* Heart icon with divider lines */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-3 text-rose-300/80 mb-2"
        >
          <span className="w-10 sm:w-16 h-[1px] bg-gradient-to-r from-transparent to-rose-300/60" />
          <Heart size={14} className="text-rose-400 fill-rose-400/80 filter drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
          <span className="w-10 sm:w-16 h-[1px] bg-gradient-to-l from-transparent to-rose-300/60" />
        </motion.div>

        {/* Title: Three Keepsake Chests ♥ */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.1 }}
          className="flex items-baseline justify-center flex-wrap gap-x-3 text-center"
        >
          <span className="font-serif text-3xl sm:text-5xl md:text-6xl text-white font-semibold tracking-wide drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            Three Keepsake
          </span>
          <span className="font-calligraphy text-4xl sm:text-6xl md:text-7xl text-rose-300 drop-shadow-[0_0_20px_rgba(244,63,94,0.6)] flex items-center gap-2">
            Chests <Heart size={22} className="inline text-rose-400 fill-rose-400/80 -mt-2" />
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
          Three different keys, three special surprises...
          <br className="hidden sm:inline" /> Find the right key for each chest.
        </motion.p>
      </header>

      {/* CENTER INTERACTIVE AREA: 3 Interactive Treasure Chests */}
      <div className="relative z-20 flex-1 w-full max-w-5xl mx-auto flex items-center justify-center px-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 w-full items-center justify-center max-w-4xl">
          {requiredChests.map((chest) => {
            const isOpened = opened.includes(chest.id);
            const isUnlocking = opening === chest.id;
            const isWrong = wrongKeyChest === chest.id;
            const isTargetSelected = selectedKey === chest.matchingKey;

            return (
              <div
                key={chest.id}
                ref={(el) => {
                  chestRefs.current[chest.id] = el;
                }}
                className="flex flex-col items-center justify-center p-2 relative"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.96 }}
                  animate={
                    isWrong
                      ? { x: [-8, 8, -6, 6, -2, 2, 0] }
                      : isTargetSelected && !isOpened
                      ? { scale: [1, 1.06, 1] }
                      : {}
                  }
                  transition={{ duration: 0.4 }}
                  onClick={() => handleChestClick(chest.id)}
                  className="cursor-pointer relative flex flex-col items-center group"
                >
                  {/* Atmospheric Glow Under Chest */}
                  <div
                    className="absolute inset-0 rounded-full blur-2xl transition-all duration-700 pointer-events-none"
                    style={{
                      background: chest.themeGlow,
                      opacity: isOpened || isUnlocking ? 0.85 : 0.25,
                      transform: isOpened ? "scale(1.3)" : "scale(0.9)",
                    }}
                  />

                  {/* Rendered Dimensional Chest Graphic */}
                  <div className="relative w-48 sm:w-56 h-40 sm:h-48 flex items-center justify-center">
                    {/* SVG Realistic Chest Matching Reference 4 */}
                    <svg viewBox="0 0 200 160" className="w-full h-full filter drop-shadow-[0_16px_35px_rgba(0,0,0,0.85)]">
                      <defs>
                        {/* Ruby Red Chest Gradient */}
                        <linearGradient id="rubyGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#be123c" />
                          <stop offset="50%" stopColor="#881337" />
                          <stop offset="100%" stopColor="#4c0519" />
                        </linearGradient>
                        {/* Bronze Star Chest Gradient */}
                        <linearGradient id="bronzeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#52391b" />
                          <stop offset="50%" stopColor="#301f0c" />
                          <stop offset="100%" stopColor="#1c1105" />
                        </linearGradient>
                        {/* Sapphire Blue Chest Gradient */}
                        <linearGradient id="sapphireGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1d4ed8" />
                          <stop offset="50%" stopColor="#1e3a8a" />
                          <stop offset="100%" stopColor="#0f172a" />
                        </linearGradient>
                        {/* Gold Trim Gradient */}
                        <linearGradient id="goldTrim" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#fef08a" />
                          <stop offset="40%" stopColor="#d9a85e" />
                          <stop offset="80%" stopColor="#b45309" />
                          <stop offset="100%" stopColor="#78350f" />
                        </linearGradient>
                      </defs>

                      {/* Pedestal Base */}
                      <ellipse cx="100" cy="148" rx="85" ry="12" fill="#1e1822" opacity="0.85" />
                      <ellipse cx="100" cy="146" rx="80" ry="10" fill="#322a38" />

                      {/* Chest Body */}
                      <rect
                        x="30"
                        y="70"
                        width="140"
                        height="70"
                        rx="8"
                        fill={
                          chest.color === "ruby"
                            ? "url(#rubyGrad)"
                            : chest.color === "bronze"
                            ? "url(#bronzeGrad)"
                            : "url(#sapphireGrad)"
                        }
                      />

                      {/* Gold Straps & Corners */}
                      <rect x="30" y="70" width="12" height="70" fill="url(#goldTrim)" />
                      <rect x="158" y="70" width="12" height="70" fill="url(#goldTrim)" />
                      <rect x="30" y="130" width="140" height="10" fill="url(#goldTrim)" />

                      {/* Chest Lid (Animated open/closed) */}
                      <g
                        style={{
                          transformOrigin: "100px 70px",
                          transition: "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                          transform: isOpened ? "translateY(-20px) rotateX(-50deg)" : "none",
                        }}
                      >
                        {/* Lid Dome */}
                        <path
                          d="M 30 70 Q 100 25 170 70 Z"
                          fill={
                            chest.color === "ruby"
                              ? "url(#rubyGrad)"
                              : chest.color === "bronze"
                              ? "url(#bronzeGrad)"
                              : "url(#sapphireGrad)"
                          }
                        />
                        {/* Lid Gold Trim */}
                        <path d="M 30 70 Q 100 25 170 70" stroke="url(#goldTrim)" strokeWidth="6" fill="none" />
                        <rect x="30" y="66" width="140" height="6" fill="url(#goldTrim)" />

                        {/* Crest on Top */}
                        {chest.color === "ruby" && (
                          /* Heart Crown Tiara */
                          <g transform="translate(100, 32)">
                            <path d="M 0 5 Q -8 -6 0 -12 Q 8 -6 0 5 Z" fill="#f43f5e" />
                            <circle cx="0" cy="-4" r="3" fill="#ffffff" opacity="0.8" />
                          </g>
                        )}
                        {chest.color === "bronze" && (
                          /* Glowing 5-point Star */
                          <polygon
                            points="100,20 103,28 111,28 105,33 107,41 100,36 93,41 95,33 89,28 97,28"
                            fill="#fbbf24"
                            filter="drop-shadow(0 0 4px #f59e0b)"
                          />
                        )}
                        {chest.color === "sapphire" && (
                          /* Glowing Crescent Moon */
                          <path
                            d="M 102 20 A 10 10 0 1 0 106 38 A 8 8 0 1 1 102 20 Z"
                            fill="#93c5fd"
                            filter="drop-shadow(0 0 6px #60a5fa)"
                          />
                        )}
                      </g>

                      {/* Lock Plate */}
                      <g transform="translate(100, 80)">
                        {chest.color === "ruby" && (
                          /* Heart Shaped Lock */
                          <g transform="translate(-14, -6)">
                            <path
                              d="M 14 6 C 14 6, 2 0, 2 12 C 2 20, 14 26, 14 26 C 14 26, 26 20, 26 12 C 26 0, 14 6, 14 6 Z"
                              fill="url(#goldTrim)"
                            />
                            <circle cx="14" cy="14" r="2.5" fill="#301f0c" />
                            <rect x="13" y="14" width="2" height="4" fill="#301f0c" />
                          </g>
                        )}
                        {chest.color === "bronze" && (
                          /* Star Shaped Lock Plate */
                          <g transform="translate(-14, -6)">
                            <polygon points="14,2 17,9 25,9 19,14 21,22 14,17 7,22 9,14 3,9 11,9" fill="url(#goldTrim)" />
                            <circle cx="14" cy="13" r="2.5" fill="#1c1105" />
                          </g>
                        )}
                        {chest.color === "sapphire" && (
                          /* Circular Padlock */
                          <g transform="translate(-12, -8)">
                            <circle cx="12" cy="14" r="10" fill="url(#goldTrim)" />
                            <circle cx="12" cy="14" r="2.5" fill="#0f172a" />
                            <rect x="11" y="14" width="2" height="4" fill="#0f172a" />
                          </g>
                        )}
                      </g>

                      {/* Unlocked Interior Glow */}
                      {isOpened && (
                        <ellipse cx="100" cy="72" rx="55" ry="14" fill="#fffbeb" filter="blur(6px)" opacity="0.9" />
                      )}
                    </svg>
                  </div>

                  {/* Chest Label & Status */}
                  <div className="mt-2 text-center">
                    <span className="font-serif text-xs sm:text-sm text-[#fed7aa] tracking-wider uppercase font-semibold">
                      {chest.id === "letter"
                        ? "A Love Letter"
                        : chest.id === "memories"
                        ? "Memories"
                        : "Voice & Melody"}
                    </span>
                    <div className="mt-0.5">
                      {isOpened ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-sans">
                          <CheckCircle2 size={11} /> Unlocked • Tap to View
                        </span>
                      ) : (
                        <span className="text-[11px] text-white/50 font-serif italic">
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM KEYS DOCK & HELPER PILL: Matches Target Reference 4 */}
      <footer className="relative z-30 pb-8 sm:pb-10 px-4 text-center flex flex-col items-center gap-3">
        {/* Keys Tray / Shelf */}
        <div className="p-3 sm:p-4 rounded-2xl bg-black/55 backdrop-blur-xl border border-white/10 shadow-2xl max-w-2xl w-full">
          <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
            {keysList.map((k) => {
              const isSelected = selectedKey === k.id;
              const isUsed =
                (k.target === "letter" && opened.includes("letter")) ||
                (k.target === "memories" && opened.includes("memories")) ||
                (k.target === "voice" && opened.includes("voice"));

              return (
                <motion.div
                  key={k.id}
                  drag={!isUsed}
                  dragSnapToOrigin={true}
                  onDragEnd={(_e, info) => handleKeyDragEnd(k.id, info)}
                  whileHover={{ scale: isUsed ? 1 : 1.15, y: isUsed ? 0 : -4 }}
                  whileTap={{ scale: isUsed ? 1 : 0.95 }}
                  onClick={() => !isUsed && setSelectedKey(selectedKey === k.id ? null : k.id)}
                  className={`relative p-2.5 rounded-xl cursor-grab active:cursor-grabbing transition-all flex flex-col items-center justify-center ${
                    isSelected
                      ? "bg-gold/25 ring-2 ring-gold shadow-[0_0_15px_rgba(217,168,94,0.6)]"
                      : "bg-white/[0.04] hover:bg-white/[0.08]"
                  } ${isUsed ? "opacity-35 cursor-not-allowed" : ""}`}
                >
                  <span className="text-2xl sm:text-3xl filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                    {k.icon}
                  </span>
                  <span className="text-[9px] font-sans text-white/70 mt-1 max-w-[50px] truncate">
                    {k.name}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Prompt Pill Guide */}
        <div className="flex items-center gap-2">
          {!allGiftsOpened ? (
            <div className="btn-pill-rose py-2 px-5 shadow-[0_0_20px_rgba(244,63,94,0.35)]">
              <KeyIcon size={14} className="text-rose-200" />
              <span className="font-serif text-xs sm:text-sm text-white">
                Drag a key and try to unlock a chest ✦
              </span>
            </div>
          ) : (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={onContinue}
              className="btn-pill-rose shadow-[0_0_35px_rgba(244,63,94,0.65)]"
            >
              <span className="text-lg">✨</span>
              <span className="font-serif text-sm tracking-wide text-white font-medium">
                Continue to Our Melody →
              </span>
              <Sparkles size={16} className="text-amber-200" />
            </motion.button>
          )}
        </div>
      </footer>
    </div>
  );
}
