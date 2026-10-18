export interface VideoTransitionConfig {
  chapter: string;
  line: string;
  subtext?: string;
  type: "blur-fade" | "staggered-words" | "gold-shimmer" | "cinematic-fade";
}

export interface VideoMemoryItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  src: string;
  webSrc?: string;
  mobileSrc?: string;
  fallbackSrc?: string;
  poster: string;
  badge: string;
  duration?: string;
  aspectRatio?: "portrait" | "landscape";
  transition: VideoTransitionConfig;
}

export const videosConfig: VideoMemoryItem[] = [
  {
    id: "memory-1",
    title: "Our Special Journey",
    subtitle: "Every moment with you",
    description: "A cinematic glimpse of our sweetest memories, unforgettable laughter, and cherished milestones.",
    src: "/assets/special_video_1_web.mp4",
    webSrc: "/assets/special_video_1_web.mp4",
    fallbackSrc: "/assets/special_video%201.mp4",
    poster: "/assets/video_thumb_1.jpg",
    badge: "Part I",
    duration: "Our Story",
    aspectRatio: "portrait",
    transition: {
      chapter: "Part I • Opening",
      line: "Some beautiful moments begin with a little mystery.",
      subtext: "The night is quiet. The stars are whispering your name.",
      type: "blur-fade",
    },
  },
  {
    id: "memory-2",
    title: "Moments of Pure Joy",
    subtitle: "Laughter & sweet glances",
    description: "The spontaneous smiles, quiet adventures, and little moments that mean everything to us.",
    src: "/assets/special_video_1080p.mp4",
    webSrc: "/assets/special_video_1080p.mp4",
    mobileSrc: "/assets/special_video_mobile.mp4",
    fallbackSrc: "/assets/special_video%202.mp4",
    poster: "/assets/video_thumb_2.jpg",
    badge: "Part II",
    duration: "Cherished Days",
    aspectRatio: "landscape",
    transition: {
      chapter: "Part II • Memories",
      line: "Every little memory has a place in my heart.",
      subtext: "And somehow, the little moments became everything.",
      type: "staggered-words",
    },
  },
  {
    id: "memory-3",
    title: "Forever & Always",
    subtitle: "To our lifetime together",
    description: "Our promises, our dreams, and every beautiful tomorrow we are going to share side by side.",
    src: "/assets/special_video 3.mp4",
    webSrc: "/assets/special_video 3.mp4",
    fallbackSrc: "/assets/special_video%203.mp4",
    poster: "/assets/video_thumb_3.jpg",
    badge: "Part III",
    duration: "Our Forever",
    aspectRatio: "landscape",
    transition: {
      chapter: "Part III • Something Special",
      line: "Today, I have something special I want to share with you.",
      subtext: "A glimpse of forever, held in every tomorrow.",
      type: "gold-shimmer",
    },
  },
];

export const mainWishVideoConfig = {
  id: "main-wish",
  title: "A Personal Birthday Wish",
  subtitle: "Directly from my heart",
  src: "/assets/specail_wish_video.mp4",
  desktopSrc: "/assets/specail_wish_video.mp4",
  mobileSrc: "/assets/specail_wish_video.mp4",
  fallbackSrc: "/assets/specail_wish_video.mp4",
  poster: "/assets/personal_video_thumb.jpg",
  transition: {
    chapter: "The Birthday Wish",
    line: "These words are only a small part of what you mean to me.",
    subtext: "...from my heart directly to yours.",
    type: "cinematic-fade" as const,
  },
};

export default videosConfig;

