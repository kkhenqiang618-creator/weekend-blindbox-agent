export const HOME_CAROUSEL_INTERVAL_MS = 6000;
export const HOME_CAROUSEL_FADE_MS = 600;

export type HomeCarouselScene = {
  id: string;
  src: string;
  alt: string;
};

export const HOME_CAROUSEL_SCENES: readonly HomeCarouselScene[] = [
  {
    id: 'weekend-picnic',
    src: '/assets/home-carousel/weekend-picnic-neutral.webp',
    alt: '城市公园草地、野餐篮和柠檬汽水的手绘周末场景',
  },
  {
    id: 'coastal-sunset',
    src: '/assets/home-carousel/coastal-sunset-neutral.webp',
    alt: '海边步道、落日和慢慢散步的人们的手绘周末场景',
  },
  {
    id: 'old-street-cafe',
    src: '/assets/home-carousel/old-street-cafe-neutral.webp',
    alt: '老街咖啡店、周末市集和骑行单车的手绘城市场景',
  },
] as const;

export const HOME_SHORTCUTS = [
  { id: 'popularRoutes', label: '热门路线', icon: 'star' },
  { id: 'favoriteCustom', label: '收藏定制', icon: 'route-nodes' },
  { id: 'recentRoutes', label: '最近路线', icon: 'history' },
] as const;

export const nextHomeSceneIndex = (current: number, count: number): number =>
  count > 0 ? (current + 1) % count : 0;

export const shouldAutoplayHomeCarousel = (
  reducedMotion: boolean,
  visibilityState: DocumentVisibilityState,
): boolean => !reducedMotion && visibilityState === 'visible';
