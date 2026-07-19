export type EditableStop = {
  id: string;
  name: string;
  type: string;
  time: string;
  stay: number;
  price: string;
  image?: string;
  images?: string[];
  district: string;
  note: string;
  address?: string;
  tags?: string[];
  rating?: number;
  ratingSource?: 'amap' | 'weekendbuddy';
  reviewCount?: number;
  openTime?: string;
  lat?: number;
  lng?: number;
};

export function resolvePoiImage(photoUrl: string | undefined, _fallbackImage: string): string | undefined {
  const image = photoUrl?.trim();
  return image || undefined;
}

export function buildPlaceFinderPayload<TLocation, TRoute>(
  type: string,
  customPrompt: string,
  location: TLocation,
  route: TRoute,
) {
  return {
    type,
    customPrompt: customPrompt.trim(),
    location,
    route,
  };
}

export function buildReplacementFinderPayload<TLocation, TRoute>(
  type: string,
  customPrompt: string,
  location: TLocation,
  route: TRoute,
) {
  return {
    ...buildPlaceFinderPayload(type, customPrompt, location, route),
    limit: 3,
  };
}

export async function requestPlaceFinder<TPoi>(
  fetcher: typeof fetch,
  payload: unknown,
): Promise<TPoi> {
  const response = await fetcher('/api/add-poi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json() as { poi?: TPoi; error?: string };
  if (!response.ok || !data.poi) throw new Error(data.error || '没有找到合适地点');
  return data.poi;
}

export async function requestPlaceCandidates<TPoi>(
  fetcher: typeof fetch,
  payload: unknown,
): Promise<TPoi[]> {
  const response = await fetcher('/api/add-poi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json() as { pois?: TPoi[]; poi?: TPoi; error?: string };
  const candidates = Array.isArray(data.pois) ? data.pois : data.poi ? [data.poi] : [];
  if (!response.ok || !candidates.length) throw new Error(data.error || '没有找到合适地点');
  return candidates.slice(0, 3);
}

export function toggleCandidatePreview(currentId: string | null, candidateId: string): string | null {
  return currentId === candidateId ? null : candidateId;
}

export function resolveCandidateForReplacement<TCandidate extends { id: string }>(
  candidates: TCandidate[],
  confirmedId: string | null,
): TCandidate | null {
  if (!confirmedId) return null;
  return candidates.find((candidate) => candidate.id === confirmedId) || null;
}

export type ReplacementFlowStep = 'search' | 'results' | 'preview';
export type ReplacementFlowEvent = 'search_succeeded' | 'open_candidate' | 'back';

export function nextReplacementFlowStep(
  step: ReplacementFlowStep,
  event: ReplacementFlowEvent,
): ReplacementFlowStep {
  if (event === 'search_succeeded' && step === 'search') return 'results';
  if (event === 'open_candidate' && step === 'results') return 'preview';
  if (event === 'back' && step === 'preview') return 'results';
  if (event === 'back' && step === 'results') return 'search';
  return step;
}

export function integrateAddedStop(stops: EditableStop[], added: EditableStop): EditableStop[] {
  if (!stops.length) return resequenceStops([added]);
  const insertionIndex = findBestInsertionIndex(stops, added);
  const next = [...stops];
  next.splice(insertionIndex, 0, added);
  return resequenceStops(next);
}

export function replaceStopAtIndex(stops: EditableStop[], index: number, replacement: EditableStop): EditableStop[] {
  if (index < 0 || index >= stops.length) return stops;
  return resequenceStops(stops.map((stop, stopIndex) => stopIndex === index ? { ...replacement, time: stop.time } : stop));
}

export function resequenceStops(stops: EditableStop[], travelMinutes = 20): EditableStop[] {
  let cursor = parseStartMinutes(stops[0]?.time) ?? 10 * 60;
  return stops.map((stop, index) => {
    if (index > 0) cursor += travelMinutes;
    const start = cursor;
    cursor += Math.max(15, stop.stay || 60);
    return { ...stop, time: `${formatMinutes(start)}–${formatMinutes(cursor)}` };
  });
}

function findBestInsertionIndex(stops: EditableStop[], added: EditableStop): number {
  if (!hasCoordinates(added) || !stops.every(hasCoordinates)) return stops.length;
  let bestIndex = stops.length;
  let bestExtraDistance = Number.POSITIVE_INFINITY;
  for (let index = 0; index <= stops.length; index += 1) {
    const before = stops[index - 1];
    const after = stops[index];
    const extraDistance = before && after
      ? distanceKm(before, added) + distanceKm(added, after) - distanceKm(before, after)
      : before
        ? distanceKm(before, added)
        : after
          ? distanceKm(added, after)
          : 0;
    if (extraDistance < bestExtraDistance) {
      bestExtraDistance = extraDistance;
      bestIndex = index;
    }
  }
  return bestIndex;
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

function parseStartMinutes(value?: string): number | null {
  const match = value?.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : null;
}

function formatMinutes(value: number): string {
  const normalized = Math.max(0, value);
  const hours = Math.floor(normalized / 60) % 24;
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
