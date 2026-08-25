export interface MemoryItem {
  id: number;
  caption: string;
  date: string;
  image: string;
  fallbackColor: string;
  description?: string;
  subtitle?: string;
}

export interface TimelineItem {
  label: string;
  date: string;
  description: string;
}

export interface WishItem {
  id: number;
  text: string;
}

export interface GiftItem {
  id: string;
  label: string;
  color: string;
  scene: number;
}

export interface HappinessItem {
  id: string;
  title: string;
  icon: "smile" | "laugh" | "eyes" | "memories" | "adventures" | "future";
  message: string;
  gradient: string;
}

export interface PlaylistItem {
  title: string;
  artist: string;
  src: string;
}

// ==========================================
// CENTRAL CONTENT CONFIGURATION
// ==========================================
export const birthdayContent = {
  herName: "Nazma",
  birthdayDate: "2026-10-19T00:00:00",
  password: "delulu",

  birthdayWish: {
    heading: "Happy Birthday",
    subheading: "My Love ♥",
    message: "On this special day, I want you to know that you are the most beautiful chapter in my life. Every moment with you feels like a dream I never want to wake up from. Thank you for being my light, my laughter, and my safe place. Today is all about you.",
    closing: "Forever yours, ♥",
  },

  letter: {
    heading: "A Letter For You ♥",
    greeting: "My dearest Nazma,",
    paragraphs: [
      "It is beautiful how a single day can divide life into 'before' and 'after'. That day was when you came into my life.",
      "What began as a simple conversation became my favorite place. Your voice instantly felt like home, and every moment with you became magic.",
      "Thank you for being my safe harbor and my constant light. Happy Birthday, my love. Here is to writing the rest of our story together."
    ],
    signature: "Yours forever, ♥",
  },

  memories: [
    {
      id: 1,
      title: "First Chat",
      subtitle: "Where it all began",
      date: "The beginning",
      image: "/images/love-letter.jpg",
      description: "A simple message that turned into the most beautiful conversation of my life. We talked for hours about everything and nothing, finding a connection that felt instant and real.",
      fallbackColor: "from-rose-300 to-rose-400",
    },
    {
      id: 2,
      title: "First Call",
      subtitle: "The night flew by",
      date: "Voice of home",
      image: "/images/record-player.jpg",
      description: "Hearing your voice made everything feel right in the world. The hours vanished as we laughed, shared secrets, and realized just how much we had in common.",
      fallbackColor: "from-amber-200 to-orange-300",
    },
    {
      id: 3,
      title: "First Meet",
      subtitle: "A moment frozen",
      date: "Time stood still",
      image: "/images/couple-photo.jpg",
      description: "The world blurred and all I saw was you. Seeing your smile in person for the first time is a memory I keep locked safely in my heart, forever warm and bright.",
      fallbackColor: "from-violet-300 to-fuchsia-300",
    },
    {
      id: 4,
      title: "First Trip",
      subtitle: "Wandering together",
      date: "Adventures with you",
      image: "/images/lantern-sky.jpg",
      description: "Every road led to more laughter, more stories, and more love. Travelling side by side showed me that no matter the destination, the journey is perfect with you.",
      fallbackColor: "from-sky-300 to-indigo-300",
    },
    {
      id: 5,
      title: "Many More",
      subtitle: "Our journey continues",
      date: "Our forever",
      image: "/images/wish-tree.jpg",
      description: "Every milestone, every quiet Sunday, and every shared laugh builds this beautiful life together. I cannot wait to write a thousand more chapters with you.",
      fallbackColor: "from-emerald-300 to-teal-300",
    },
    {
      id: 6,
      title: "Us Always",
      subtitle: "A love that grows",
      date: "Every moment",
      image: "/images/final-sunset.jpg",
      description: "Through every season, your love remains my anchor and my guide. Here is to us, to our little universe, and to a lifetime of celebrating you.",
      fallbackColor: "from-pink-300 to-rose-300",
    },
  ] as (MemoryItem & { title: string })[],

  playlist: [
    {
      title: "Our Synth Melody",
      artist: "Synthesized with Love ♥",
      src: "", // Empty src triggers synthetic playback
    },
    {
      title: "Dreamy Memories",
      artist: "Instrumental ♥",
      src: "/audio/song1.mp3",
    },
    {
      title: "A Golden Sunset",
      artist: "Acoustic ♥",
      src: "/audio/song2.mp3",
    },
  ] as PlaylistItem[],

  assets: {
    welcomeFlowers: "/images/welcome-flowers.jpg",
    countdownGarden: "/images/countdown-garden.jpg",
    birthdayReveal: "/images/birthday-reveal.jpg",
    couplePhoto: "/images/couple-photo.jpg",
    birthdayCake: "/images/birthday-cake.jpg",
    loveLetter: "/images/love-letter.jpg",
    recordPlayer: "/images/record-player.jpg",
    wishTree: "/images/wish-tree.jpg",
    lanternSky: "/images/lantern-sky.jpg",
    finalSunset: "/images/final-sunset.jpg",
  },
};

// ==========================================
// BACKWARD COMPATIBILITY EXPORTS
// ==========================================
export const BIRTHDAY_PASSWORD = birthdayContent.password;
export const BIRTHDAY_DATE = birthdayContent.birthdayDate;

export const config = {
  birthdayDate: birthdayContent.birthdayDate,
  password: birthdayContent.password,
  partnerName: birthdayContent.herName,
};

export const birthdayWish = birthdayContent.birthdayWish;

export const letterContent = {
  heading: birthdayContent.letter.heading,
  greeting: birthdayContent.letter.greeting,
  paragraphs: birthdayContent.letter.paragraphs,
  signature: birthdayContent.letter.signature,
};

export const memories: MemoryItem[] = birthdayContent.memories.map((m) => ({
  id: m.id,
  caption: m.title,
  date: m.date,
  image: m.image,
  fallbackColor: m.fallbackColor,
  subtitle: m.subtitle,
  description: m.description,
}));

export const memoryJourney: TimelineItem[] = birthdayContent.memories.slice(0, 5).map((m) => ({
  label: m.title,
  date: m.subtitle || m.date,
  description: m.description || "",
}));

export const wishTreeWishes: WishItem[] = [
  { id: 1, text: "May your smile shine brighter than all the stars in the sky." },
  { id: 2, text: "May every dream you hold close find its way to you." },
  { id: 3, text: "May your days be filled with laughter, peace, and endless love." },
  { id: 4, text: "May we grow old together, hand in hand, heart in heart." },
  { id: 5, text: "May this year bring you every blessing you deserve and more." },
  { id: 6, text: "May you always know how deeply and completely you are loved." },
];

export const gifts: GiftItem[] = [
  { id: "letter", label: "A Letter", color: "bg-rose-400", scene: 10 },
  { id: "memories", label: "Memories", color: "bg-amber-300", scene: 11 },
  { id: "voice", label: "Voice", color: "bg-sky-400", scene: 12 },
];

export const happiness: HappinessItem[] = [
  {
    id: "smile",
    title: "Your Smile",
    icon: "smile",
    message: "The kind of smile that makes the whole room feel like home.",
    gradient: "from-rose-400 to-rose-600",
  },
  {
    id: "laugh",
    title: "Your Laugh",
    icon: "laugh",
    message: "My favorite sound — the one I want to hear for the rest of my life.",
    gradient: "from-amber-300 to-orange-500",
  },
  {
    id: "eyes",
    title: "Your Eyes",
    icon: "eyes",
    message: "I could get lost in them a thousand times and never want to be found.",
    gradient: "from-violet-400 to-fuchsia-500",
  },
  {
    id: "memories",
    title: "Our Memories",
    icon: "memories",
    message: "Every moment with you is a page in my favorite story.",
    gradient: "from-sky-400 to-indigo-500",
  },
  {
    id: "adventures",
    title: "Our Adventures",
    icon: "adventures",
    message: "Every road is better when you're holding my hand.",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    id: "future",
    title: "Our Future",
    icon: "future",
    message: "The best chapters are the ones we haven't written yet.",
    gradient: "from-pink-400 to-rose-500",
  },
];
