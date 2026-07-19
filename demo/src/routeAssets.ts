export type SavedRoute = {
  id: string;
  title: string;
  duration: string;
  rating?: number;
  tags: string[];
  image: string;
  stopIds: string[];
};

export const CUSTOM_ROUTES: SavedRoute[] = [
  { id: 'nanshan-easy-half-day', title: '南山轻松半日路线', duration: '4小时', rating: 4.8, tags: ['少走路', '本地小吃'], image: '/assets/generated/route-shekou-coast.webp', stopIds: ['art', 'town', 'food', 'coast'] },
  { id: 'seaworld-art-afternoon', title: '海上世界艺文午后', duration: '3小时', rating: 4.6, tags: ['艺术', '拍照'], image: '/assets/generated/route-seaworld-art.webp', stopIds: ['art', 'coast', 'food'] },
  { id: 'longgang-coffee-walk', title: '龙岗咖啡散步线', duration: '半天', rating: 4.7, tags: ['咖啡', '松弛'], image: '/assets/generated/route-shenzhen-bay.webp', stopIds: ['park', 'town', 'food'] },
  { id: 'old-town-snack-list', title: '古城小吃收藏线', duration: '半天', rating: 4.9, tags: ['古城', '逛吃'], image: '/assets/generated/route-nantou-town.webp', stopIds: ['town', 'food', 'art'] },
  { id: 'shekou-sunset-slow-tour', title: '蛇口落日慢游', duration: '3小时', rating: 4.8, tags: ['看海', '日落'], image: '/assets/generated/route-shekou-coast.webp', stopIds: ['art', 'coast', 'park'] },
];

export const POPULAR_ROUTES: SavedRoute[] = [
  { id: 'popular-relaxed-shenzhen', title: '轻松深圳游', duration: '4小时', rating: 4.8, tags: ['打卡', '情侣'], image: '/assets/generated/route-shekou-coast.webp', stopIds: ['coast', 'town', 'food', 'park'] },
  { id: 'popular-seaworld-art', title: '海上世界艺文', duration: '3小时', rating: 4.6, tags: ['艺术', '网红'], image: '/assets/generated/route-seaworld-art.webp', stopIds: ['art', 'coast', 'food'] },
  { id: 'popular-city-sightseeing', title: '深圳观光游', duration: '2小时', rating: 4.7, tags: ['亲子', '步行'], image: '/assets/generated/route-shenzhen-bay.webp', stopIds: ['park', 'art', 'town'] },
  { id: 'popular-nantou-food', title: '南头古城小逛吃', duration: '4小时', rating: 4.9, tags: ['古城', '美食'], image: '/assets/generated/route-nantou-town.webp', stopIds: ['town', 'food', 'art'] },
  { id: 'popular-shekou-sunset', title: '蛇口海边散步', duration: '3小时', rating: 4.8, tags: ['海边', '放松'], image: '/assets/generated/route-shekou-coast.webp', stopIds: ['art', 'coast', 'park'] },
  { id: 'popular-local-snacks', title: '周末小吃寻味线', duration: '4.5小时', rating: 4.5, tags: ['小吃', '省钱'], image: '/assets/generated/route-dim-sum.webp', stopIds: ['town', 'food', 'coast'] },
];

export const ALL_SAVED_ROUTES = [...CUSTOM_ROUTES, ...POPULAR_ROUTES];

export const findSavedRoute = (id: string): SavedRoute | undefined =>
  ALL_SAVED_ROUTES.find((route) => route.id === id);

export function selectAssetsByIds<T extends { id: string }>(assets: T[], selectedIds: string[]): T[] {
  return selectedIds
    .map((id) => assets.find((asset) => asset.id === id))
    .filter((asset): asset is T => Boolean(asset));
}

export const routeCollectionLayout = (surface: 'mine' | 'more') =>
  surface === 'mine' ? 'horizontal' : 'vertical';

export const routeCollectionCardClass = (selected = false) =>
  `wb-route-gallery-card${selected ? ' selected' : ''}`;
