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
  herName: "Bindu",
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
    greeting: "My dearest Bindu,",
    paragraphs: [
      "It still amazes me how one person can quietly become such an important part of another person's world.",
      "What began as simple moments slowly became memories I never want to lose. Somewhere between the conversations, laughter, little moments, and everything we shared, you became a place my heart feels at home.",
      "Thank you for every smile, every beautiful memory, every moment that made ordinary days feel special.",
      "On your birthday, I don't just wish you happiness for today. I wish you countless reasons to smile, dreams that find their way to you, and a life filled with moments worth remembering.",
      "And if I could ask for one thing, it would be this — let there be many more chapters of our story waiting for us.",
      "Happy Birthday, my love.",
      "Here is to every memory behind us, every moment beside us, and every beautiful moment still ahead."
    ],
    signature: "Yours forever ♥",
  },

  memories: [
    {
      id: 1,
      title: "First Chat",
      subtitle: "Where it all began",
      date: "The beginning",
      image: "/memories/memories 1.png",
      description: "A simple message that turned into the most beautiful conversation of my life. We talked for hours about everything and nothing, finding a connection that felt instant and real.",
      fallbackColor: "from-rose-300 to-rose-400",
    },
    {
      id: 2,
      title: "First Call",
      subtitle: "The night flew by",
      date: "Voice of home",
      image: "/memories/memories 2.png",
      description: "Hearing your voice made everything feel right in the world. The hours vanished as we laughed, shared secrets, and realized just how much we had in common.",
      fallbackColor: "from-amber-200 to-orange-300",
    },
    {
      id: 3,
      title: "First Meet",
      subtitle: "A moment frozen",
      date: "Time stood still",
      image: "/memories/memories 3.png",
      description: "The world blurred and all I saw was you. Seeing your smile in person for the first time is a memory I keep locked safely in my heart, forever warm and bright.",
      fallbackColor: "from-violet-300 to-fuchsia-300",
    },
    {
      id: 4,
      title: "First Trip",
      subtitle: "Wandering together",
      date: "Adventures with you",
      image: "/memories/memories 4.png",
      description: "Every road led to more laughter, more stories, and more love. Travelling side by side showed me that no matter the destination, the journey is perfect with you.",
      fallbackColor: "from-sky-300 to-indigo-300",
    },
    {
      id: 5,
      title: "Many More",
      subtitle: "Our journey continues",
      date: "Our forever",
      image: "/memories/memories 5.png",
      description: "Every milestone, every quiet Sunday, and every shared laugh builds this beautiful life together. I cannot wait to write a thousand more chapters with you.",
      fallbackColor: "from-emerald-300 to-teal-300",
    },
    {
      id: 6,
      title: "Us Always",
      subtitle: "A love that grows",
      date: "Every moment",
      image: "/memories/memories 6.png",
      description: "Through every season, your love remains my anchor and my guide. Here is to us, to our little universe, and to a lifetime of celebrating you.",
      fallbackColor: "from-pink-300 to-rose-300",
    },
    {
      id: 7,
      title: "Dreamy Sunsets",
      subtitle: "Golden hour with you",
      date: "August 2025",
      image: "/images/final-sunset.jpg",
      description: "Watching the sun dip below the horizon, painting the sky in gold and peach, holding your hand tight.",
      fallbackColor: "from-orange-300 to-amber-400",
    },
    {
      id: 8,
      title: "Sky Lanterns",
      subtitle: "Floating wishes",
      date: "September 2025",
      image: "/images/lantern-sky.jpg",
      description: "Releasing our hopes and dreams into the night sky, watching them drift away like warm, glowing stars.",
      fallbackColor: "from-indigo-400 to-purple-500",
    },
    {
      id: 9,
      title: "Garden Walks",
      subtitle: "Walking in blossoms",
      date: "October 2025",
      image: "/images/countdown-garden.jpg",
      description: "Strolling through the botanical paths, talking about our future, surrounded by beautiful midnight blooms.",
      fallbackColor: "from-emerald-300 to-green-400",
    },
    {
      id: 10,
      title: "Record Player",
      subtitle: "Dancing to our song",
      date: "November 2025",
      image: "/images/record-player.jpg",
      description: "Slow dancing in the warm living room, listening to the vinyl turn, lost in our own little melody.",
      fallbackColor: "from-teal-300 to-cyan-400",
    },
    {
      id: 11,
      title: "Birthday Cake",
      subtitle: "Sweet celebrations",
      date: "December 2025",
      image: "/images/birthday-cake.jpg",
      description: "Sharing cake, blowing candles, and wishing for a lifetime of sweet moments together.",
      fallbackColor: "from-pink-300 to-rose-400",
    },
    {
      id: 12,
      title: "Welcome Flowers",
      subtitle: "Fresh spring mornings",
      date: "March 2026",
      image: "/images/welcome-flowers.jpg",
      description: "Waking up to beautiful fresh roses, brewing warm coffee, and starting another beautiful season of us.",
      fallbackColor: "from-rose-200 to-rose-300",
    },
  ] as (MemoryItem & { title: string })[],

  stories: [
    {
      index: "01",
      label: "First Chat",
      date: "Where it all began",
      description: "A simple message turned into the most beautiful conversation of my life.",
      image: "/story/story 1.png",
      rotate: -3,
    },
    {
      index: "02",
      label: "First Call",
      date: "The night flew by",
      description: "Hearing your voice made everything feel right in the world.",
      image: "/story/story 2.png",
      rotate: 3,
    },
    {
      index: "03",
      label: "First Meet",
      date: "A moment frozen in time",
      description: "The world blurred and all I saw was you.",
      image: "/story/stoty 3.png",
      rotate: -4,
    },
    {
      index: "04",
      label: "First Trip",
      date: "Wandering together",
      description: "Every road led to more laughter, more stories, and more love.",
      image: "/story/story 4.png",
      rotate: 4,
    },
    {
      index: "05",
      label: "Little Moments",
      date: "Cozy days",
      description: "Finding happiness in the simplest things — coffee mornings, lazy Sundays, and shared silence.",
      image: "/story/story 5.png",
      rotate: -2,
    },
    {
      index: "06",
      label: "Deep Connections",
      date: "Conversations at midnight",
      description: "Speaking about our deepest fears, grandest dreams, and realizing our souls speak the same language.",
      image: "/story/story 6.png",
      rotate: 3,
    },
    {
      index: "07",
      label: "Hand in Hand",
      date: "Facing tomorrow",
      description: "Whatever path lies ahead, knowing I'll walk it with you makes the future look incredibly bright.",
      image: "/story/story 7.png",
      rotate: -3,
    },
    {
      index: "08",
      label: "Many More",
      date: "Our journey continues",
      description: "I cannot wait to write a thousand more chapters with you.",
      image: "/story/story 5.png",
      rotate: -2,
    }
  ],

  playlist: [
    {
      title: "Dreamy Memories",
      artist: "Instrumental Melody ♥",
      src: "/assets/music/song-1.mp3",
    },
    {
      title: "A Golden Sunset",
      artist: "Acoustic Warmth ♥",
      src: "/assets/music/song-2.mp3",
    },
    {
      title: "Our Synth Melody",
      artist: "Synthesized with Love ♥",
      src: "", // Empty src triggers synthetic playback
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
    purpleAudioArtwork: "/assets/images/purple-audio-artwork.jpg",
    wishTree: "/images/wish-tree.jpg",
    lanternSky: "/images/lantern-sky.jpg",
    finalSunset: "/images/final-sunset.jpg",
    specialVideo: "/assets/special_video.mp4",
    stickers: {
      teddy1: "/assets/stickers/teddy-1.gif",
      teddy2: "/assets/stickers/teddy-2.gif",
      teddy3: "/assets/stickers/teddy-3.gif",
    },
  },
};

export const songs = birthdayContent.playlist;

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

export const stories = birthdayContent.stories;

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
