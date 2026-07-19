import type { EditableStop } from './routeEditing';

export type NearbyStop = {
  stop: EditableStop;
  distanceKm?: number;
};

export function getTrustedRating(stop: EditableStop): number | null {
  if (!stop.ratingSource || !Number.isFinite(stop.rating) || (stop.rating ?? 0) <= 0 || (stop.rating ?? 0) > 5) return null;
  return stop.rating as number;
}

export function getPlacePhotos(stop: EditableStop): string[] {
  return [...new Set([stop.image, ...(stop.images ?? [])]
    .map((url) => url?.trim())
    .filter((url): url is string => Boolean(url)))];
}

export function buildPlaceHighlights(stop: EditableStop): string[] {
  const tags = [...new Set((stop.tags ?? []).map((tag) => tag.trim()).filter(Boolean))].slice(0, 3);
  return [
    stop.note.trim(),
    tags.length ? tags.join(' · ') : '',
    stop.district && stop.type ? `位于${stop.district}，适合安排为${stop.type}。` : '',
  ].filter(Boolean).slice(0, 3);
}

export function buildReplacementPreview(stop: EditableStop) {
  return {
    introduction: stop.note.trim() || `适合作为路线中的${stop.type}体验。`,
    photos: getPlacePhotos(stop),
    tags: [...new Set((stop.tags ?? []).map((tag) => tag.trim()).filter(Boolean))].slice(0, 4),
    facts: {
      type: stop.type,
      district: stop.district,
      price: stop.price,
      rating: getTrustedRating(stop),
      address: stop.address,
      openTime: stop.openTime,
    },
  };
}

export function listNearbyStops(stops: EditableStop[], activeId: string, limit = 3): NearbyStop[] {
  const activeIndex = stops.findIndex((stop) => stop.id === activeId);
  const active = stops[activeIndex];
  if (!active) return [];
  const activeHasCoordinates = hasCoordinates(active);

  return stops
    .map((stop, index) => ({
      stop,
      routeDistance: Math.abs(index - activeIndex),
      distanceKm: activeHasCoordinates && hasCoordinates(stop) ? distanceKm(active, stop) : undefined,
    }))
    .filter((item) => item.stop.id !== activeId)
    .sort((a, b) => {
      if (a.distanceKm !== undefined && b.distanceKm !== undefined) return a.distanceKm - b.distanceKm;
      if (a.distanceKm !== undefined) return -1;
      if (b.distanceKm !== undefined) return 1;
      return a.routeDistance - b.routeDistance;
    })
    .slice(0, limit)
    .map(({ stop, distanceKm: km }) => ({ stop, distanceKm: km }));
}

function hasCoordinates(stop: EditableStop): stop is EditableStop & { lat: number; lng: number } {
  return Number.isFinite(stop.lat) && Number.isFinite(stop.lng);
}

function distanceKm(a: EditableStop & { lat: number; lng: number }, b: EditableStop & { lat: number; lng: number }): number {
  const toRadians = (value: number) => value * Math.PI / 180;
  const latDelta = toRadians(b.lat - a.lat);
  const lngDelta = toRadians(b.lng - a.lng);
  const sinLat = Math.sin(latDelta / 2);
  const sinLng = Math.sin(lngDelta / 2);
  const value = sinLat * sinLat + Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * sinLng * sinLng;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}
