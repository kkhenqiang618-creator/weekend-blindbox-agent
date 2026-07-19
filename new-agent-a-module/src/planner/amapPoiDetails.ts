export interface AmapPoiDetailSource {
  photos?: Array<{ url?: string }>;
  biz_ext?: {
    rating?: string | number;
    cost?: string | number;
    open_time?: string;
    opentime?: string;
  };
}

export type AmapPoiDetails = {
  photoUrl?: string;
  photoUrls?: string[];
  meituanRating?: number;
  ratingSource?: 'amap';
  cost?: number;
  openTime?: string;
};

export function extractAmapPoiDetails(item: AmapPoiDetailSource): AmapPoiDetails {
  const photoUrls = [...new Set((item.photos ?? [])
    .map((photo) => photo.url?.trim())
    .filter((url): url is string => Boolean(url)))];
  const rating = parseRangeNumber(item.biz_ext?.rating, 0, 5);
  const cost = parseRangeNumber(item.biz_ext?.cost, 0, Number.MAX_SAFE_INTEGER);
  const openTime = [item.biz_ext?.open_time, item.biz_ext?.opentime]
    .find((value) => typeof value === 'string' && value.trim())?.trim();

  return {
    photoUrl: photoUrls[0],
    photoUrls: photoUrls.length ? photoUrls : undefined,
    meituanRating: rating,
    ratingSource: rating === undefined ? undefined : 'amap',
    cost,
    openTime,
  };
}

function parseRangeNumber(value: string | number | undefined, min: number, max: number): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : undefined;
}
