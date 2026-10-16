/**
 * ==============================================================================
 * CENTRALIZED TEDDY STICKERS CONFIGURATION
 * ==============================================================================
 *
 * Preserves the original kawaii teddy illustrations with full color fidelity:
 * 1. Teddy Heart: Fluffy clean white/cream teddy holding a glowing pink heart
 * 2. Teddies Hug: Yellow/beige teddy hugging a white/cream teddy in star blanket
 * 3. Teddy Flowers: Golden-brown teddy bear with red bow holding roses & gift
 *
 * Assets stored in: `public/assets/stickers/`
 * ==============================================================================
 */

export interface StickerConfig {
  id: string;
  name: string;
  src: string;
  fallbackSrc?: string;
  alt: string;
  fallbackIcon?: string;
  animation?: {
    delay: number;
    rotate: number;
    floatY: number;
    duration?: number;
    pulseHeart?: boolean;
    sway?: boolean;
    sparkles?: boolean;
  };
  scale?: number;
  className?: string;
}

export const stickersConfig: StickerConfig[] = [
  {
    id: "teddy-heart",
    name: "Teddy Holding A Glowing Heart",
    // Original fluffy clean white / light-cream teddy bear holding glowing heart:
    src: "/assets/stickers/teddy-love-heart.png",
    alt: "Adorable white fluffy teddy bear hugging a glowing pink heart",
    fallbackIcon: "♥",
    animation: {
      delay: 0.2,
      rotate: -2.5,
      floatY: 8,
      duration: 3.2,
      pulseHeart: true,
    },
    scale: 1,
    className: "w-24 h-28 sm:w-32 sm:h-36 md:w-40 md:h-44 max-w-[28vw] sm:max-w-none shrink-0 drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]",
  },
  {
    id: "teddies-hug",
    name: "Warmest Cuddle Hugs",
    // Original yellow/beige teddy bear hugging white/cream teddy bear:
    src: "/assets/stickers/teddy-warm-hug.png",
    alt: "Cute yellow and white teddy bears snuggling and hugging warmly in a star blanket",
    fallbackIcon: "🧸",
    animation: {
      delay: 0.4,
      rotate: 2,
      floatY: 10,
      duration: 3.8,
      sway: true,
    },
    scale: 1.08,
    className: "w-28 h-28 sm:w-36 sm:h-36 md:w-46 md:h-46 -mt-2 sm:-mt-3 max-w-[32vw] sm:max-w-none shrink-0 drop-shadow-[0_14px_28px_rgba(0,0,0,0.45)]",
  },
  {
    id: "teddy-flowers",
    name: "Flowers & Birthday Surprise",
    // Original golden-brown teddy with red bow holding roses & golden gift:
    src: "/assets/stickers/teddy-roses-gift.png",
    alt: "Sweet teddy bear with red bow holding a bouquet of roses and a golden gift box",
    fallbackIcon: "✨",
    animation: {
      delay: 0.6,
      rotate: 3.5,
      floatY: 9,
      duration: 3.5,
      sparkles: true,
    },
    scale: 1,
    className: "w-24 h-28 sm:w-32 sm:h-36 md:w-40 md:h-44 max-w-[28vw] sm:max-w-none shrink-0 drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]",
  },
];

export default stickersConfig;
