export interface VideoMemoryItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  src: string;
  fallbackSrc?: string;
  poster: string;
  badge: string;
  duration?: string;
  aspectRatio?: "portrait" | "landscape";
}

export const videosConfig: VideoMemoryItem[] = [
  {
    id: "memory-1",
    title: "Our Special Journey",
    subtitle: "Every moment with you",
    description: "A cinematic glimpse of our sweetest memories, unforgettable laughter, and cherished milestones.",
    src: "/assets/special_video 1.mp4",
    fallbackSrc: "/assets/special_video%201.mp4",
    poster: "/assets/video_thumb_1.jpg",
    badge: "Part I",
    duration: "Our Story",
    aspectRatio: "portrait",
  },
  {
    id: "memory-2",
    title: "Moments of Pure Joy",
    subtitle: "Laughter & sweet glances",
    description: "The spontaneous smiles, quiet adventures, and little moments that mean everything to us.",
    src: "/assets/special_video 2.mp4",
    fallbackSrc: "/assets/special_video%202.mp4",
    poster: "/assets/video_thumb_2.jpg",
    badge: "Part II",
    duration: "Cherished Days",
    aspectRatio: "landscape",
  },
  {
    id: "memory-3",
    title: "Forever & Always",
    subtitle: "To our lifetime together",
    description: "Our promises, our dreams, and every beautiful tomorrow we are going to share side by side.",
    src: "/assets/special_video 3.mp4",
    fallbackSrc: "/assets/special_video%203.mp4",
    poster: "/assets/video_thumb_3.jpg",
    badge: "Part III",
    duration: "Our Forever",
    aspectRatio: "landscape",
  },
];

export default videosConfig;
