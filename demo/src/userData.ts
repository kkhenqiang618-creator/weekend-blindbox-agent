import type { SavedRoute } from './routeAssets';
import type { EditableStop } from './routeEditing';

export const USER_DATA_STORAGE_KEY = 'weekendbuddy:user-data:v1';

export type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export type UserRouteRecord = {
  route: SavedRoute;
  stops: EditableStop[];
};

export type UserData = {
  historyRoutes: UserRouteRecord[];
  customRoutes: UserRouteRecord[];
  favoriteRoutes: UserRouteRecord[];
  favoritePlaces: EditableStop[];
};

export type UserRouteCollection = 'historyRoutes' | 'customRoutes' | 'favoriteRoutes';

export function createEmptyUserData(): UserData {
  return {
    historyRoutes: [],
    customRoutes: [],
    favoriteRoutes: [],
    favoritePlaces: [],
  };
}

export function loadUserData(storage?: StorageLike | null): UserData {
  if (!storage) return createEmptyUserData();
  try {
    const raw = storage.getItem(USER_DATA_STORAGE_KEY);
    if (!raw) return createEmptyUserData();
    const parsed = JSON.parse(raw) as Partial<UserData>;
    return {
      historyRoutes: sanitizeRouteRecords(parsed.historyRoutes),
      customRoutes: sanitizeRouteRecords(parsed.customRoutes),
      favoriteRoutes: sanitizeRouteRecords(parsed.favoriteRoutes),
      favoritePlaces: sanitizePlaces(parsed.favoritePlaces),
    };
  } catch {
    return createEmptyUserData();
  }
}

export function saveUserData(storage: StorageLike | null | undefined, data: UserData): void {
  if (!storage) return;
  try {
    storage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage can be unavailable in private browsing; in-memory state still works.
  }
}

export function addUserRoute(
  data: UserData,
  collection: UserRouteCollection,
  record: UserRouteRecord,
): UserData {
  const existing = data[collection].filter((item) => item.route.id !== record.route.id);
  return { ...data, [collection]: [record, ...existing].slice(0, 20) };
}

export function toggleFavoritePlace(data: UserData, place: EditableStop): UserData {
  const exists = data.favoritePlaces.some((item) => item.id === place.id);
  return {
    ...data,
    favoritePlaces: exists
      ? data.favoritePlaces.filter((item) => item.id !== place.id)
      : [place, ...data.favoritePlaces],
  };
}

export function findUserRoute(data: UserData, routeId: string): UserRouteRecord | undefined {
  return [...data.historyRoutes, ...data.customRoutes, ...data.favoriteRoutes]
    .find((record) => record.route.id === routeId);
}

function sanitizeRouteRecords(value: unknown): UserRouteRecord[] {
  if (!Array.isArray(value)) return [];
  return value.filter((record): record is UserRouteRecord => {
    if (!record || typeof record !== 'object') return false;
    const candidate = record as Partial<UserRouteRecord>;
    return Boolean(candidate.route?.id && candidate.route.title && Array.isArray(candidate.route.stopIds) && Array.isArray(candidate.stops));
  });
}

function sanitizePlaces(value: unknown): EditableStop[] {
  if (!Array.isArray(value)) return [];
  return value.filter((place): place is EditableStop => Boolean(place && typeof place === 'object' && (place as EditableStop).id && (place as EditableStop).name));
}
