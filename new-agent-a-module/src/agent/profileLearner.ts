import type { UserPreferenceProfile } from './types.ts';

type JsonRecord = Record<string, unknown>;

export interface GeneratedPlanSignal {
  created_at?: string;
  district?: string | null;
  budget_max?: number | null;
  blind_box_theme?: string | null;
  route_names?: string[] | null;
  route_types?: string[] | null;
  total_minutes?: number | null;
  raw_plan?: unknown;
}

export interface BehaviorEventSignal {
  created_at?: string;
  event_name?: string;
  payload?: unknown;
}

export interface ProfileLearnerOptions {
  supabaseUrl?: string;
  serviceKey?: string;
  fetcher?: typeof fetch;
  now?: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const PROFILE_WINDOW_DAYS = 30;

export function aggregateUserProfile(
  inputPlans: GeneratedPlanSignal[],
  inputEvents: BehaviorEventSignal[],
  now = new Date(),
): UserPreferenceProfile {
  const plans = inputPlans.filter((plan) => isRecent(plan.created_at, now));
  const events = inputEvents.filter((event) => isRecent(event.created_at, now) && asRecord(event.payload).env !== 'test');
  const poiIndex = buildPoiIndex(plans);
  const typeScores = new Map<string, number>();
  const tagScores = new Map<string, number>();
  const districtScores = new Map<string, number>();
  const themeScores = new Map<string, number>();
  const dislikedTypeScores = new Map<string, number>();
  const favoritePoiNames: string[] = [];
  const budgetSamples: number[] = [];
  const durationSamples: number[] = [];
  let confirmedRouteCount = 0;
  let favoritePoiCount = 0;
  let favoriteRouteCount = 0;

  for (const plan of plans) {
    const decay = timeDecay(plan.created_at, now);
    const exposureWeight = 0.35 * decay;
    addMany(typeScores, plan.route_types, exposureWeight);
    addScore(districtScores, plan.district, exposureWeight);
    addScore(themeScores, plan.blind_box_theme, exposureWeight);
    for (const poi of extractPlanPois(plan)) addMany(tagScores, poi.tags, 0.15 * decay);
    pushFinite(budgetSamples, plan.budget_max);
    pushFinite(durationSamples, plan.total_minutes);
  }

  for (const event of events) {
    const payload = asRecord(event.payload);
    const decay = timeDecay(event.created_at, now);
    const poiName = asString(payload.poiName) || asString(payload.fromPoi);
    const knownPoi = poiName ? poiIndex.get(poiName) : undefined;

    if (event.event_name === 'favorite_added') {
      if (payload.favoriteType === 'poi') {
        favoritePoiCount += 1;
        if (poiName && !favoritePoiNames.includes(poiName)) favoritePoiNames.push(poiName);
        addScore(typeScores, knownPoi?.type || asString(payload.poiType), 5 * decay);
        addMany(tagScores, asStringArray(payload.poiTags).length ? asStringArray(payload.poiTags) : knownPoi?.tags, 3 * decay);
        addScore(districtScores, asString(payload.district) || knownPoi?.district, 3 * decay);
      }
      if (payload.favoriteType === 'route') {
        favoriteRouteCount += 1;
        addScore(themeScores, asString(payload.routeTheme) || asString(payload.routeTitle), 5 * decay);
      }
      continue;
    }

    if (event.event_name === 'route_confirmed') {
      confirmedRouteCount += 1;
      addMany(typeScores, asStringArray(payload.routeTypes), 4 * decay);
      addMany(tagScores, asStringArray(payload.routeTags), 3 * decay);
      addScore(districtScores, asString(payload.district), 3 * decay);
      addScore(themeScores, asString(payload.routeTheme), 4 * decay);
      pushFinite(budgetSamples, payload.budgetMax ?? parseBudget(payload.budgetRange));
      pushFinite(durationSamples, payload.totalMinutes);
      continue;
    }

    if (event.event_name === 'poi_viewed') {
      addScore(typeScores, knownPoi?.type || asString(payload.poiType), 1 * decay);
      addMany(tagScores, asStringArray(payload.poiTags).length ? asStringArray(payload.poiTags) : knownPoi?.tags, 0.75 * decay);
      addScore(districtScores, asString(payload.district) || knownPoi?.district, 0.75 * decay);
      continue;
    }

    if (event.event_name === 'step_replaced') {
      addScore(dislikedTypeScores, knownPoi?.type || asString(payload.fromPoiType), 4 * decay);
    }
  }

  const medianBudget = median(budgetSamples);
  const averageDuration = mean(durationSamples);

  return {
    likedPoiTypes: topScores(typeScores, 5),
    likedTags: topScores(tagScores, 8),
    likedDistricts: topScores(districtScores, 3),
    favoritePoiNames,
    favoriteRouteThemes: topScores(themeScores, 5),
    dislikedPoiTypes: topScores(dislikedTypeScores, 3),
    rejectedKeywords: [],
    budgetRange: medianBudget === null
      ? undefined
      : [Math.max(0, Math.round(medianBudget * 0.7)), Math.round(medianBudget * 1.3)],
    preferredRoutePace: averageDuration === null
      ? undefined
      : averageDuration > 300 ? 'relaxed' : averageDuration < 180 ? 'packed' : 'balanced',
    confirmedRouteCount,
    favoritePoiCount,
    favoriteRouteCount,
  };
}

export async function learnUserProfile(
  sessionId: string,
  options: ProfileLearnerOptions = {},
): Promise<UserPreferenceProfile> {
  const normalizedSessionId = sessionId.trim();
  const supabaseUrl = options.supabaseUrl ?? process.env.SUPABASE_URL ?? '';
  const serviceKey = options.serviceKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!normalizedSessionId || normalizedSessionId.length > 128 || !supabaseUrl || !serviceKey) {
    return emptyUserProfile();
  }

  const fetcher = options.fetcher ?? fetch;
  const now = options.now ?? new Date();
  const since = new Date(now.getTime() - PROFILE_WINDOW_DAYS * DAY_MS).toISOString();

  try {
    const [plans, events] = await Promise.all([
      fetchRows<GeneratedPlanSignal>(fetcher, supabaseUrl, serviceKey, 'wb_generated_plans', normalizedSessionId, since),
      fetchRows<BehaviorEventSignal>(fetcher, supabaseUrl, serviceKey, 'wb_events', normalizedSessionId, since),
    ]);
    const profile = aggregateUserProfile(plans, events, now);
    await upsertProfile(fetcher, supabaseUrl, serviceKey, normalizedSessionId, profile).catch(() => undefined);
    return profile;
  } catch {
    return emptyUserProfile();
  }
}

export function emptyUserProfile(): UserPreferenceProfile {
  return {
    likedPoiTypes: [],
    likedTags: [],
    likedDistricts: [],
    favoritePoiNames: [],
    favoriteRouteThemes: [],
    dislikedPoiTypes: [],
    rejectedKeywords: [],
    confirmedRouteCount: 0,
    favoritePoiCount: 0,
    favoriteRouteCount: 0,
  };
}

async function fetchRows<T>(
  fetcher: typeof fetch,
  supabaseUrl: string,
  serviceKey: string,
  table: string,
  sessionId: string,
  since: string,
): Promise<T[]> {
  const url = supabaseTableUrl(supabaseUrl, table);
  url.searchParams.set('select', '*');
  url.searchParams.set('session_id', `eq.${sessionId}`);
  url.searchParams.set('created_at', `gte.${since}`);
  url.searchParams.set('order', 'created_at.asc');
  const response = await fetcher(url, { headers: supabaseHeaders(serviceKey) });
  if (!response.ok) throw new Error(`Supabase ${table} read failed`);
  const payload = await response.json();
  if (!Array.isArray(payload)) throw new Error(`Supabase ${table} returned invalid data`);
  return payload as T[];
}

async function upsertProfile(
  fetcher: typeof fetch,
  supabaseUrl: string,
  serviceKey: string,
  sessionId: string,
  profile: UserPreferenceProfile,
): Promise<void> {
  const url = supabaseTableUrl(supabaseUrl, 'wb_user_profiles');
  url.searchParams.set('on_conflict', 'session_id');
  const response = await fetcher(url, {
    method: 'POST',
    headers: {
      ...supabaseHeaders(serviceKey),
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({ session_id: sessionId, profile, updated_at: new Date().toISOString() }),
  });
  if (!response.ok) throw new Error('Supabase profile upsert failed');
}

function supabaseTableUrl(baseUrl: string, table: string): URL {
  return new URL(`/rest/v1/${table}`, `${baseUrl.replace(/\/+$/, '')}/`);
}

function supabaseHeaders(serviceKey: string): Record<string, string> {
  return { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };
}

function isRecent(value: string | undefined, now: Date): boolean {
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return false;
  const age = now.getTime() - timestamp;
  return age >= 0 && age <= PROFILE_WINDOW_DAYS * DAY_MS;
}

function timeDecay(value: string | undefined, now: Date): number {
  if (!value) return 0.5;
  const ageDays = Math.max(0, (now.getTime() - new Date(value).getTime()) / DAY_MS);
  if (ageDays <= 7) return 1;
  if (ageDays <= 14) return 0.75;
  return 0.5;
}

function buildPoiIndex(plans: GeneratedPlanSignal[]): Map<string, { type?: string; tags: string[]; district?: string }> {
  const index = new Map<string, { type?: string; tags: string[]; district?: string }>();
  for (const plan of plans) {
    for (const poi of extractPlanPois(plan)) {
      if (poi.name) index.set(poi.name, { type: poi.type, tags: poi.tags, district: poi.district || plan.district || undefined });
    }
  }
  return index;
}

function extractPlanPois(plan: GeneratedPlanSignal): Array<{ name?: string; type?: string; tags: string[]; district?: string }> {
  const rawPlan = asRecord(plan.raw_plan);
  const route = asRecord(rawPlan.route);
  const steps = Array.isArray(route.steps) ? route.steps : [];
  return steps.map((step) => {
    const poi = asRecord(asRecord(step).poi);
    return {
      name: asString(poi.name),
      type: asString(poi.type),
      tags: asStringArray(poi.tags),
      district: asString(poi.area) || asString(poi.businessDistrict),
    };
  });
}

function addMany(scores: Map<string, number>, values: unknown, weight: number): void {
  for (const value of asStringArray(values)) addScore(scores, value, weight);
}

function addScore(scores: Map<string, number>, value: string | null | undefined, weight: number): void {
  if (!value || weight <= 0) return;
  scores.set(value, (scores.get(value) ?? 0) + weight);
}

function topScores(scores: Map<string, number>, limit: number): string[] {
  return [...scores.entries()]
    .filter(([, score]) => score >= 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'))
    .slice(0, limit)
    .map(([value]) => value);
}

function pushFinite(target: number[], value: unknown): void {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (Number.isFinite(parsed) && parsed >= 0) target.push(parsed);
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function mean(values: number[]): number | null {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function parseBudget(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const matches = value.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  return matches.length ? Math.max(...matches) : null;
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(asString).filter((item): item is string => Boolean(item)))];
}
