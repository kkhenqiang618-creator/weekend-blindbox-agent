export type Screen =
  | 'home' | 'route-entry' | 'conditions' | 'generating' | 'result'
  | 'edit' | 'itinerary' | 'map' | 'mine'
  | 'community' | 'post' | 'publish'
  | 'replace' | 'custom' | 'preferences' | 'reservation' | 'recent' | 'messages'
  | 'custom-routes' | 'custom-route-detail' | 'profile-edit'
  | 'history-routes' | 'favorite-places' | 'favorite-routes'
  | 'mine-posts' | 'mine-likes' | 'mine-saves' | 'help-feedback';

export type MainTab = 'home' | 'route' | 'community' | 'mine';

export const SCREEN_TAB: Record<Screen, MainTab | null> = {
  home: 'home',
  'route-entry': 'route',
  conditions: 'route',
  generating: 'route',
  result: 'route',
  edit: null,
  itinerary: 'route',
  map: 'route',
  mine: 'mine',
  community: 'community',
  post: null,
  publish: 'community',
  messages: 'community',
  replace: null,
  custom: null,
  preferences: null,
  reservation: null,
  recent: 'home',
  'custom-routes': 'mine',
  'custom-route-detail': null,
  'profile-edit': 'mine',
  'history-routes': 'mine',
  'favorite-places': null,
  'favorite-routes': 'mine',
  'mine-posts': 'mine',
  'mine-likes': 'mine',
  'mine-saves': 'mine',
  'help-feedback': 'mine',
};

export const screenForMainTab = (tab: MainTab): Screen => ({
  home: 'home',
  route: 'route-entry',
  community: 'community',
  mine: 'mine',
})[tab];

export const routeEntryTarget = (choice: 'random' | 'custom'): Screen =>
  choice === 'random' ? 'conditions' : 'favorite-places';

export const savedRouteTarget = (routeId: string, backTo: Screen) => ({
  screen: 'custom-route-detail' as const,
  routeId,
  backTo,
});

export const collectionBackLabel = (backTo: Screen): string => {
  if (backTo === 'home') return '返回首页';
  if (backTo === 'mine') return '返回我的';
  if (backTo === 'custom-route-detail') return '返回路线详情';
  if (backTo === 'result') return '返回路线结果';
  if (backTo === 'itinerary') return '返回行程';
  if (backTo === 'recent') return '返回热门路线';
  if (backTo === 'post') return '返回帖子';
  return '返回路线';
};

export const routeSaveTarget = (backTo: Screen) => ({
  screen: 'itinerary' as const,
  itineraryBack: backTo,
});

export const HOME_SHORTCUT_DESTINATIONS = {
  blindBox: 'conditions',
  popularRoutes: 'recent',
  favoriteCustom: 'favorite-places',
  recentRoutes: 'history-routes',
} as const satisfies Record<string, Screen>;

export const MINE_DESTINATIONS = {
  '历史路线': 'history-routes',
  '收藏地点': 'favorite-places',
  '收藏路线': 'favorite-routes',
  '我的发布': 'mine-posts',
  '我的点赞': 'mine-likes',
  '我的收藏': 'mine-saves',
  '偏好设置': 'preferences',
  '帮助与反馈': 'help-feedback',
} as const satisfies Record<string, Screen>;
