/**
 * Configuration for cinematic text introduction sequences.
 * All texts and timings are fully editable and decoupled from animation logic.
 */

export interface IntroSceneItem {
  id: string;
  badge?: string;
  eyebrow?: string;
  mainText: string;
  highlightText?: string;
  subtext?: string;
  heartMotif?: boolean;
  sparkleMotif?: boolean;
  ctaText?: string;
  durationMs?: number; // Auto-advance time in milliseconds
}

/**
 * PHASE 2: Main Birthday Wish Intro (Max 4 scenes before WishesScene)
 */
export const mainWishesIntroScenes: IntroSceneItem[] = [
  {
    id: "wishes-intro-1",
    badge: "CHAPTER I",
    eyebrow: "✦ A QUIET MOMENT ✦",
    mainText: "Some moments are beautiful…",
    subtext: "A quiet breath before the celebration begins.",
    durationMs: 4400,
  },
  {
    id: "wishes-intro-2",
    badge: "CHAPTER II",
    eyebrow: "✦ UNFORGETTABLE ✦",
    mainText: "But some people make those moments unforgettable.",
    subtext: "And every day with you has become my favorite memory.",
    durationMs: 4600,
  },
  {
    id: "wishes-intro-3",
    badge: "CHAPTER III",
    eyebrow: "✦ FROM THE HEART ✦",
    mainText: "And today… every little detail is for you. ♡",
    subtext: "Crafted with love, patience, and endless affection.",
    heartMotif: true,
    durationMs: 4600,
  },
  {
    id: "wishes-intro-4",
    badge: "CHAPTER IV",
    eyebrow: "✦ YOUR SPECIAL DAY ✦",
    mainText: "Ready to see your little world of happiness? ✨",
    subtext: "Take my hand and step inside...",
    sparkleMotif: true,
    durationMs: 5000,
  },
];

/**
 * PHASE 3: Video Intro (Max 2 scenes before Special Video)
 */
export const videoIntroScenes: IntroSceneItem[] = [
  {
    id: "video-intro-1",
    badge: "A SPECIAL MESSAGE",
    eyebrow: "✦ FROM MY HEART ✦",
    mainText: "Some feelings are difficult to put into words…",
    subtext: "Because no words could ever be enough.",
    durationMs: 4500,
  },
  {
    id: "video-intro-2",
    badge: "OUR STORY IN MOTION",
    eyebrow: "✦ A PERSONAL GIFT ✦",
    mainText: "So I made something… just for you. ❤️",
    subtext: "Every frame, every melody, every beat is yours.",
    heartMotif: true,
    durationMs: 5000,
  },
];
