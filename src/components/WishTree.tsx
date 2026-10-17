import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Heart, Wind } from "lucide-react";
import { wishTreeWishes, birthdayContent } from "../data/content";
import { NameRibbon } from "./NameRibbon";
import { AmbientParticles } from "./AmbientParticles";
import { PremiumButton } from "./PremiumButton";

export const collectibleCardDetails: Record<
  number,
  {
    title: string;
    themeSubtitle: string;
    sealColor: string;
    stickerSrc: string;
    stickerAlt: string;
  }
> = {
  1: {
    title: "Eternal Joy",
    themeSubtitle: "See her happy in every situation",
    sealColor: "#be123c",
    stickerSrc: "/assets/stickers/teddy-love-heart.png",
    stickerAlt: "Teddy hugging glowing heart",
  },
  2: {
    title: "Wanderlust",
    themeSubtitle: "Travel the world & make memories",
    sealColor: "#b45309",
    stickerSrc: "/assets/stickers/teddy-roses-gift.png",
    stickerAlt: "Teddy with roses",
  },
  3: {
    title: "Peaceful Rest",
    themeSubtitle: "Holding hands in gentle sleep",
    sealColor: "#7c2d12",
    stickerSrc: "/assets/stickers/teddy-warm-hug.png",
    stickerAlt: "Teddies hugging warmly",
  },
  4: {
    title: "Journey Beside Her",
    themeSubtitle: "Watching the world pass by",
    sealColor: "#9f1239",
    stickerSrc: "/assets/stickers/teddy-love-heart.png",
    stickerAlt: "Teddy with heart",
  },
  5: {
    title: "Shared Sweetness",
    themeSubtitle: "A quiet meal in our private place",
    sealColor: "#d97706",
    stickerSrc: "/assets/stickers/teddy-roses-gift.png",
    stickerAlt: "Teddy with golden gifts",
  },
  6: {
    title: "Her Bright Future",
    themeSubtitle: "Witnessing her dreams & success",
    sealColor: "#881337",
    stickerSrc: "/assets/stickers/teddy-warm-hug.png",
    stickerAlt: "Teddy hugs",
  },
};

interface WishTreeProps {
  onContinue: () => void;
  partnerName?: string;
}

export function WishTreePopupCard({
  text,
  id = 1,
  onClose,
}: {
  text: string;
  id?: number;
  onClose: () => void;
}) {
  const cardMeta = collectibleCardDetails[id] || collectibleCardDetails[1];

  return (
    <div
      className="relative w-full max-w-[320px] sm:max-w-[370px] select-none flex flex-col items-center"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Hanging Golden Twine suspended from Branch */}
      <div className="w-[1.5px] h-6 sm:h-9 bg-gradient-to-b from-[#e7b876] via-[#b45309] to-[#78350f] mx-auto opacity-85" />

      {/* Tactile Narrow Paper Strip Unfolding from Branch */}
      <motion.div
        initial={{ scaleY: 0.15, opacity: 0, y: -20 }}
        animate={{ scaleY: 1, opacity: 1, y: 0 }}
        exit={{ scaleY: 0.15, opacity: 0, y: -20 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        style={{ transformOrigin: "top center" }}
        className="w-full relative rounded-b-2xl rounded-t-sm p-5 sm:p-6 flex flex-col items-center text-center overflow-hidden border border-[#b38a53]/80 shadow-[0_22px_55px_rgba(0,0,0,0.88),0_0_35px_rgba(254,240,138,0.25)] bg-[#faf5e8]"
      >
        {/* Warm Ivory Textured Parchment Background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(175deg, #fffdf8 0%, #faf4e6 45%, #f4e8cf 100%)",
          }}
        />

        {/* Deckle Edge Accent & Fine Borders */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#b38a53] via-[#fef08a] to-[#b38a53]" />
        <div className="absolute bottom-0 inset-x-0 h-2 bg-[radial-gradient(ellipse_at_bottom,_#b38a53_30%,_transparent_70%)] opacity-40" />
        <div className="absolute inset-2 border border-dashed border-[#b38a53]/35 rounded-xl pointer-events-none" />

        {/* Top Hanging Brass Eyelet */}
        <div className="relative z-10 -mt-2 mb-2 flex items-center justify-center">
          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-[#b38a53] bg-[#3a1d0f] flex items-center justify-center shadow-inner">
            <div className="w-1.5 h-1.5 rounded-full bg-[#fef08a]" />
          </div>
        </div>

        {/* Header: Strip Counter & Title */}
        <div className="relative z-10 w-full flex items-center justify-between pb-2 border-b border-[#b38a53]/25 px-1">
          <span className="text-[10px] sm:text-[11px] font-sans tracking-[0.25em] text-[#78350f] font-bold uppercase">
            ✦ Wish Scroll
          </span>
          <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-[#78350f] px-2.5 py-0.5 rounded-full border border-[#b38a53]/40 bg-[#b38a53]/10">
            0{id} / 06
          </span>
        </div>

        {/* Wax Seal Stamp Emblem with Smooth Staggered Animation */}
        <div className="relative z-10 my-2.5 sm:my-3 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 p-1 flex items-center justify-center shadow-md bg-white/95"
            style={{ borderColor: cardMeta.sealColor }}
          >
            <img
              src={cardMeta.stickerSrc}
              alt={cardMeta.stickerAlt}
              className="w-full h-full object-contain filter drop-shadow-sm"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </motion.div>

          {/* Expressive Editorial Display Title */}
          <motion.h3
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.45 }}
            className="font-serif text-xl sm:text-2xl font-bold text-[#3b1206] mt-2 tracking-[0.02em] leading-tight drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]"
          >
            {cardMeta.title}
          </motion.h3>

          {/* Romantic Italic Subtitle */}
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.45 }}
            className="font-serif italic text-xs sm:text-[13.5px] text-[#78350f] tracking-wide mt-0.5 leading-snug px-2"
          >
            {cardMeta.themeSubtitle}
          </motion.span>
        </div>

        {/* Delicate Heart / Diamond Divider */}
        <div className="relative z-10 flex items-center justify-center gap-2 my-1 text-[#b38a53]/60 w-full px-4">
          <span className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#b38a53]/40" />
          <span className="text-[9px] text-[#b45309]">✦</span>
          <span className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#b38a53]/40" />
        </div>

        {/* Handwritten Wish Message in Fine Parchment Container */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.5 }}
          className="relative z-10 w-full my-1.5 py-3 sm:py-3.5 px-3.5 sm:px-4 rounded-xl bg-gradient-to-b from-white/85 via-[#fcf8f0]/90 to-white/80 border border-[#b38a53]/30 shadow-[0_4px_16px_rgba(120,53,15,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] flex flex-col items-center select-text"
        >
          <span className="font-serif text-3xl sm:text-4xl text-[#b45309]/50 leading-none select-none -mb-1 block self-start font-semibold">
            “
          </span>
          <p className="font-serif italic text-[15px] sm:text-[17px] text-[#2c1205] leading-relaxed font-semibold text-center px-1 tracking-[0.015em]">
            {text}
          </p>
          <span className="font-serif text-3xl sm:text-4xl text-[#b45309]/50 leading-none select-none -mt-1 block self-end font-semibold">
            ”
          </span>
        </motion.div>

        {/* Close Action Button */}
        <div className="relative z-10 mt-3 pt-1 w-full flex flex-col items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="rounded-full px-6 py-2 text-xs font-serif font-bold uppercase tracking-[0.2em] text-white bg-gradient-to-r from-[#78350f] via-[#854d0e] to-[#78350f] border border-[#b38a53]/80 shadow-[0_4px_14px_rgba(120,53,15,0.4)] hover:shadow-[0_6px_20px_rgba(120,53,15,0.6)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            Fold Back to Tree ♥
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function WishTree({ onContinue, partnerName = birthdayContent.herName }: WishTreeProps) {
  const [active, setActive] = useState<{ text: string; id: number } | null>(null);
  const [discovered, setDiscovered] = useState<number[]>([]);
  const [isWishingModalOpen, setIsWishingModalOpen] = useState(false);
  const [customWishText, setCustomWishText] = useState("");
  const [treeIlluminated, setTreeIlluminated] = useState(false);
  const [lightsTraveling, setLightsTraveling] = useState(false);
  const [wishCelebrated, setWishCelebrated] = useState(false);

  // Body scroll lock and Escape key listener
  useEffect(() => {
    if (active !== null || isWishingModalOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setActive(null);
          setIsWishingModalOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [active, isWishingModalOpen]);

  // Responsive viewport detection
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Organic, distributed coordinates across tree branches
  // On Mobile: Every tag has a distinct vertical level (20%, 27%, 34%, 41%, 48%, 55%)
  // and varied horizontal coordinates (22%, 78%, 42%, 18%, 82%, 50%) so there are
  // ZERO rows or columns, naturally following the tree's organic branches.
  const positions = useMemo(
    () =>
      isMobile
        ? [
            { top: "20%", left: "22%", cordHeight: 36, swayDuration: 5.4, swayAngle: 2.4, delay: 0.1 },
            { top: "27%", left: "78%", cordHeight: 54, swayDuration: 6.2, swayAngle: -2.2, delay: 0.3 },
            { top: "34%", left: "42%", cordHeight: 42, swayDuration: 4.8, swayAngle: 1.8, delay: 0.5 },
            { top: "41%", left: "18%", cordHeight: 62, swayDuration: 5.9, swayAngle: -2.4, delay: 0.7 },
            { top: "48%", left: "82%", cordHeight: 46, swayDuration: 6.5, swayAngle: 2.0, delay: 0.9 },
            { top: "55%", left: "50%", cordHeight: 58, swayDuration: 5.2, swayAngle: -2.5, delay: 1.1 },
          ]
        : [
            { top: "25%", left: "18%", cordHeight: 74, swayDuration: 5.6, swayAngle: 2.2, delay: 0.1 },
            { top: "23%", left: "82%", cordHeight: 68, swayDuration: 6.4, swayAngle: -2.0, delay: 0.3 },
            { top: "41%", left: "28%", cordHeight: 90, swayDuration: 5.0, swayAngle: 2.5, delay: 0.5 },
            { top: "38%", left: "72%", cordHeight: 82, swayDuration: 5.9, swayAngle: -2.2, delay: 0.7 },
            { top: "57%", left: "20%", cordHeight: 72, swayDuration: 6.3, swayAngle: 2.0, delay: 0.9 },
            { top: "54%", left: "80%", cordHeight: 88, swayDuration: 5.3, swayAngle: -2.4, delay: 1.1 },
          ],
    [isMobile]
  );

  const reveal = (w: (typeof wishTreeWishes)[0]) => {
    setActive({ text: w.text, id: w.id });
    if (!discovered.includes(w.id)) {
      setDiscovered((d) => [...d, w.id]);
    }
  };

  const close = () => setActive(null);

  // Trigger Ceremonial Tree Response
  const handleMakeWishSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsWishingModalOpen(false);

    // 1. Lights travel through branches
    setLightsTraveling(true);

    setTimeout(() => {
      // 2. Tree fully illuminates
      setTreeIlluminated(true);
      setWishCelebrated(true);
      setLightsTraveling(false);
    }, 1400);
  };

  return (
    <div className="relative w-full h-full min-h-screen min-h-[100dvh] overflow-hidden select-none flex flex-col justify-between bg-[#08020a]">
      {/* 1. ATMOSPHERIC NOCTURNAL BOTANICAL GARDEN BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/images/wish-tree.jpg"
          alt="Magical Wish Tree"
          className={`w-full h-full object-cover object-center filter contrast-[108%] transition-all duration-[2500ms] ${
            treeIlluminated ? "brightness-125 saturate-[125%]" : "brightness-[82%]"
          }`}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        {/* Soft twilight vignette & deep midnight purple aura */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0310]/85 via-[#190618]/50 to-[#070209]/92" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(244,114,182,0.12)_0%,rgba(217,168,94,0.15)_40%,transparent_80%)]" />
      </div>

      {/* 2. GENTLE GLOWING FIREFLIES & HANGING LANTERNS */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <svg viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice" className="w-full h-full opacity-85">
          <defs>
            <radialGradient id="lanternGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#d9a85e" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Hanging Glowing Lanterns Naturally Suspended */}
          {[
            { cx: 190, cy: 210 },
            { cx: 810, cy: 200 },
            { cx: 310, cy: 340 },
            { cx: 690, cy: 330 },
            { cx: 500, cy: 250 },
          ].map((l, idx) => (
            <g key={idx}>
              <line
                x1={l.cx}
                y1={l.cy - 28}
                x2={l.cx}
                y2={l.cy}
                stroke="#b38a53"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.6"
              />
              <circle
                cx={l.cx}
                cy={l.cy}
                r={treeIlluminated || lightsTraveling ? "15" : "11"}
                fill="url(#lanternGlow)"
                className="animate-pulse"
                style={{ animationDelay: `${idx * 0.5}s`, animationDuration: "3.2s" }}
              />
              <circle cx={l.cx} cy={l.cy} r="3" fill="#ffffff" />
            </g>
          ))}
        </svg>
      </div>

      {/* 3. RADIAL LIGHT FLARE OVERLAY WHEN TREE IS ILLUMINATED */}
      {treeIlluminated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          transition={{ duration: 2.2, ease: "easeOut" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,_#ffe8a3_0%,_#f43f5e_30%,_transparent_75%)] pointer-events-none z-15 mix-blend-color-dodge"
        />
      )}

      {/* 4. FLOATING PARTICLES & PETALS */}
      <AmbientParticles
        density={treeIlluminated ? "high" : "medium"}
        petals={true}
        dots={true}
        hearts={treeIlluminated}
      />

      {/* 5. TOP SECTION: REFINED EDITORIAL HEADER */}
      <div className="relative z-20 pt-4 sm:pt-6 px-4">
        <NameRibbon
          badgeText="Whispered Under The Stars"
          title="The Whispering Wish Tree"
          subtitle="Touch any hanging scroll to unveil what the stars have written for you..."
          compact={true}
        />
      </div>

      {/* 6. HANGING LUXURY CREAM PARCHMENT WISH TAGS */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-hidden">
        {wishTreeWishes.map((w, i) => {
          const pos = positions[i] || positions[0];
          const isDiscovered = discovered.includes(w.id);

          return (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: [0, pos.swayAngle, -pos.swayAngle * 0.7, 0],
              }}
              transition={{
                opacity: { delay: pos.delay, duration: 0.6 },
                scale: { delay: pos.delay, duration: 0.6 },
                rotate: {
                  repeat: Infinity,
                  duration: pos.swayDuration,
                  ease: "easeInOut",
                  delay: i * 0.35,
                },
              }}
              style={{
                top: pos.top,
                left: pos.left,
                transformOrigin: "center top",
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
            >
              {/* Delicate Golden Twine Cord connecting to canopy branch */}
              <div
                className="absolute left-1/2 -translate-x-1/2 w-[1.5px] pointer-events-none bg-gradient-to-b from-[#854d0e] via-[#d9a85e] to-[#78350f]"
                style={{
                  height: `${pos.cordHeight}px`,
                  top: `-${pos.cordHeight}px`,
                }}
              >
                {/* Branch attachment brass bead */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#3a1d0f] border border-[#d9a85e]" />
              </div>

              {/* The Tactile Wish Tag Cardboard Scroll */}
              <motion.button
                whileHover={{ scale: 1.15, rotate: 0 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => reveal(w)}
                className={`relative w-8 sm:w-11 h-20 sm:h-32 rounded-b-lg rounded-t-xs border cursor-pointer flex flex-col items-center justify-between p-1 sm:p-1.5 pb-1 sm:pb-2.5 transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.65)] ${
                  isDiscovered
                    ? "bg-gradient-to-b from-[#fffefc] via-[#fdf6e6] to-[#f4e7ce] border-[#d9a85e] shadow-[0_0_24px_rgba(254,240,138,0.7),0_8px_22px_rgba(0,0,0,0.6)]"
                    : "bg-gradient-to-b from-[#fffdfa] via-[#faf4e6] to-[#f2e6ce] border-[#b38a53]/80 hover:border-[#d9a85e] hover:shadow-[0_0_20px_rgba(254,240,138,0.55)]"
                }`}
                aria-label={`Wish Scroll 0${i + 1}`}
              >
                {/* Top Brass Eyelet Grommet */}
                <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full border border-[#b38a53] bg-[#3a1d0f] flex items-center justify-center shadow-inner">
                  <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-[#fef08a]" />
                </div>

                {/* Wax Seal Heart Stamp Emblem */}
                <div
                  className="w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] text-white font-serif font-bold shadow-sm border border-white/60 my-auto group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: collectibleCardDetails[w.id]?.sealColor || "#b45309" }}
                >
                  ♥
                </div>

                {/* Deckle Scroll Counter */}
                <div className="flex flex-col items-center w-full">
                  <span className="text-[8px] sm:text-[11px] font-mono text-[#58260a] font-bold tracking-widest leading-none">
                    0{i + 1}
                  </span>
                  <div className="w-full h-0.5 mt-0.5 border-t border-dotted border-[#b38a53]/50" />
                </div>
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* 7. POPUP MODAL FOR SELECTED WISH */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 p-4 backdrop-blur-md"
          >
            <WishTreePopupCard text={active.text} id={active.id} onClose={close} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. INTERACTIVE "MAKE A WISH" CEREMONY MODAL */}
      <AnimatePresence>
        {isWishingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
            onClick={() => setIsWishingModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl border border-[#e7b876]/60 bg-[#160614]/95 p-6 sm:p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(231,184,118,0.3)] backdrop-blur-xl"
            >
              <button
                onClick={() => setIsWishingModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <div className="flex items-center justify-center gap-2 mb-2 text-gold">
                <Sparkles size={16} className="text-amber-300" />
                <span className="text-xs uppercase font-serif tracking-[0.25em] text-[#fed7aa]">
                  Whisper to the Stars
                </span>
                <Sparkles size={16} className="text-amber-300" />
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl text-[#fef08a] leading-tight mb-2 font-bold drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                Make Your Heartfelt Wish
              </h3>

              <p className="text-xs sm:text-sm text-rose-100/80 font-serif italic mb-5 leading-relaxed">
                Close your eyes for a moment{partnerName ? `, ${partnerName}` : ""}, think of your deepest dream, and tie it to the branches...
              </p>

              <form onSubmit={handleMakeWishSubmit} className="flex flex-col gap-4">
                <textarea
                  value={customWishText}
                  onChange={(e) => setCustomWishText(e.target.value)}
                  placeholder="Whisper your heartfelt wish here... (or leave empty to let your heart speak)"
                  rows={3}
                  className="w-full rounded-2xl border border-[#b38a53]/40 bg-black/40 p-3.5 text-sm font-serif text-white placeholder-white/40 focus:border-[#d9a85e] focus:outline-none focus:ring-1 focus:ring-[#d9a85e] shadow-inner resize-none"
                />

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <PremiumButton variant="gold" type="submit" size="md">
                    <Sparkles size={16} /> Release Wish to Tree ✧
                  </PremiumButton>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 9. BOTTOM ACTION BAR & CELEBRATION MESSAGE */}
      <div className="relative z-30 pb-8 sm:pb-12 pt-4 px-4 flex flex-col items-center gap-3 text-center">
        {wishCelebrated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl mx-auto p-4 rounded-2xl bg-black/60 border border-[#fef08a]/40 backdrop-blur-md shadow-[0_0_30px_rgba(254,240,138,0.35)] mb-2"
          >
            <p className="font-serif italic text-lg sm:text-2xl text-[#fef08a] leading-relaxed">
              “May all your wishes, whispered and unspoken, find their way into the universe and bloom beautifully ♥”
            </p>
          </motion.div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {!wishCelebrated && (
            <PremiumButton
              variant="rose"
              size="md"
              onClick={() => setIsWishingModalOpen(true)}
              className="min-h-[44px]"
            >
              <Sparkles size={16} /> Make a Wish ✧
            </PremiumButton>
          )}

          <PremiumButton
            variant="gold"
            size="md"
            onClick={onContinue}
            className="min-h-[44px]"
          >
            Walk Down Memory Lane 📸 →
          </PremiumButton>
        </div>

        {discovered.length > 0 && !wishCelebrated && (
          <span className="text-[11px] text-amber-200/80 font-mono tracking-wider font-semibold">
            ✦ {discovered.length} of {wishTreeWishes.length} wishes unveiled ✦
          </span>
        )}
      </div>
    </div>
  );
}

export default WishTree;
