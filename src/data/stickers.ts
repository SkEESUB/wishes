/**
 * ==============================================================================
 * CENTRALIZED STICKER CONFIGURATION
 * ==============================================================================
 *
 * HOW TO CHANGE A STICKER:
 * "To change a sticker, replace this asset path."
 *
 * Supported formats:
 * - PNG (.png)
 * - WebP (.webp)
 * - GIF (.gif)
 * - SVG (.svg)
 *
 * Simply point `src` to your new asset in `public/assets/stickers/` or `public/images/`.
 * ==============================================================================
 */

export interface StickerConfig {
  id: string;
  name: string;
  /**
   * "To change a sticker, replace this asset path."
   * Example: "/assets/stickers/teddy-love-heart.png" or "/assets/stickers/custom-cute.webp"
   */
  src: string;
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
    name: "Teddy Holding My Heart",
    // To change a sticker, replace this asset path:
    src: "/assets/stickers/teddy-love-heart.png",
    alt: "Adorable fluffy plush teddy bear hugging a glowing pink heart",
    fallbackIcon: "♥",
    animation: {
      delay: 0.2,
      rotate: -3,
      floatY: 8,
      duration: 3.2,
      pulseHeart: true,
    },
    scale: 1,
    className: "w-24 h-28 sm:w-32 sm:h-36 md:w-40 md:h-44 max-w-[28vw] sm:max-w-none shrink-0 drop-shadow-[0_12px_24px_rgba(244,63,94,0.35)]",
  },
  {
    id: "teddies-hug",
    name: "Warmest Cuddle Hugs",
    // To change a sticker, replace this asset path:
    src: "/assets/stickers/teddy-warm-hug.png",
    alt: "Two cute fluffy teddy bears snuggling and hugging warmly",
    fallbackIcon: "🧸",
    animation: {
      delay: 0.4,
      rotate: 2,
      floatY: 10,
      duration: 3.8,
      sway: true,
    },
    scale: 1.08,
    className: "w-28 h-28 sm:w-36 sm:h-36 md:w-46 md:h-46 -mt-2 sm:-mt-3 max-w-[32vw] sm:max-w-none shrink-0 drop-shadow-[0_14px_28px_rgba(217,168,94,0.35)]",
  },
  {
    id: "teddy-flowers",
    name: "Flowers & Birthday Surprise",
    // To change a sticker, replace this asset path:
    src: "/assets/stickers/teddy-roses-gift.png",
    alt: "Adorable teddy bear holding a bouquet of roses and a golden gift box",
    fallbackIcon: "✨",
    animation: {
      delay: 0.6,
      rotate: 4,
      floatY: 9,
      duration: 3.5,
      sparkles: true,
    },
    scale: 1,
    className: "w-24 h-28 sm:w-32 sm:h-36 md:w-40 md:h-44 max-w-[28vw] sm:max-w-none shrink-0 drop-shadow-[0_12px_24px_rgba(251,191,36,0.35)]",
  },
];

export default stickersConfig;
