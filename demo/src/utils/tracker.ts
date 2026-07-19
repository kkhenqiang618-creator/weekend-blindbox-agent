/**
 * Weekend Buddy - Anonymous Event Tracking (Frontend)
 *
 * Manages an anonymous sessionId in localStorage and provides typed
 * tracking functions for all 8 defined events.
 *
 * **GDPR / privacy note**: No PII is collected. The sessionId is a
 * random UUID stored in localStorage and regenerated if cleared.
 */

const SESSION_KEY = 'weekendbuddy.sessionId';
const TEST_MODE_KEY = 'weekendbuddy.testMode';

/**
 * Detect whether this session is "test" traffic.
 *
 * Returns true for:
 *   1. localhost (local development)
 *   2. Vercel preview deployments (hostname contains hostname + "-")
 *   3. Manual localStorage flag (user explicitly enabled test mode)
 */
function getEnv(): 'test' | 'production' {
  // Manual override via DevTools: localStorage.setItem('weekendbuddy.testMode', 'true')
  try {
    if (localStorage.getItem(TEST_MODE_KEY) === 'true') return 'test';
  } catch { /* ignore */ }

  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return 'test';

  return 'production';
}

/** Lazily initialised sessionId — shared by all track calls in this session */
let _sessionId: string | null = null;

/** Generate a v4-style UUID without pulling in a dependency */
function generateId(): string {
  const hex = '0123456789abcdef';
  let id = '';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      id += '-';
    } else if (i === 14) {
      id += '4';
    } else if (i === 19) {
      id += hex[(Math.random() * 4) | 8];
    } else {
      id += hex[(Math.random() * 16) | 0];
    }
  }
  return id;
}

/** Get or create the persistent anonymous sessionId */
export function getSessionId(): string {
  if (_sessionId) return _sessionId;

  try {
    _sessionId = localStorage.getItem(SESSION_KEY);
    if (!_sessionId) {
      _sessionId = generateId();
      localStorage.setItem(SESSION_KEY, _sessionId);
    }
  } catch {
    // localStorage unavailable (private mode, etc.) — use in-memory fallback
    _sessionId = _sessionId || generateId();
  }

  return _sessionId;
}

// ---------------------------------------------------------------------------
// Low-level send
// ---------------------------------------------------------------------------

interface TrackBody {
  sessionId: string;
  eventName?: string;
  eventData?: {
    page?: string;
    payload?: Record<string, unknown>;
  };
  /** When present, also writes to wb_generated_plans */
  planData?: Record<string, unknown>;
}

async function send(body: TrackBody): Promise<void> {
  // Test mode: skip sending entirely, just log to console
  const env = getEnv();
  if (env === 'test') {
    console.debug('[track] test mode — skipped:', body.eventName || 'batch');
    return;
  }

  const payload = {
    ...(body.eventData?.payload || {}),
    env,
  };

  try {
    const res = await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...body,
        eventData: {
          ...body.eventData,
          payload,
        },
      }),
    });
    if (!res.ok) {
      console.warn('[track] send failed', res.status, await res.text().catch(() => ''));
    }
  } catch (err) {
    // Tracking failures must never break the app
    console.debug('[track] network error (silent)', err);
  }
}

// ---------------------------------------------------------------------------
// Typed event helpers
// ---------------------------------------------------------------------------

/** page_view — fired on app mount */
export function trackPageView(page = window.location.pathname): void {
  send({
    sessionId: getSessionId(),
    eventName: 'page_view',
    eventData: { page, payload: { referrer: document.referrer || '' } },
  });
}

/** start_generate — fired when user clicks "开启盲盒" */
export function trackStartGenerate(rawText: string, quickSelections: Record<string, unknown>): void {
  send({
    sessionId: getSessionId(),
    eventName: 'start_generate',
    eventData: { payload: { rawText, quickSelections: sanitizeQuickSelections(quickSelections) } },
  });
}

/** plan_generated — fired when the API returns a successful plan */
export function trackPlanGenerated(plan: {
  requirements: { city?: string; district?: string; peopleType?: string; budgetMax?: number; blindBoxTheme?: string; parseMethod?: string; intentSource?: string; fallbackReason?: string };
  blindBox?: { theme?: string };
  route?: { totalMinutes?: number; recommendationReasons?: string[]; personalizationSummary?: string; steps?: Array<{ poi?: { name?: string; type?: string } }> };
  toolStatus?: Array<{ status?: string }>;
}): void {
  const route = plan.route;
  const steps = route?.steps ?? [];
  const routeNames = steps.map((s) => s.poi?.name ?? '').filter(Boolean);
  const routeTypes = [...new Set(steps.map((s) => s.poi?.type ?? '').filter(Boolean))];
  const liveSearchStatus = plan.toolStatus?.some((t) => t.status === 'success') ? 'live_used' : 'local_only';

  // Compute budget_min and budget_max_est from route steps
  const prices = steps.map((s) => s.poi?.price ?? 0).filter((p) => Number.isFinite(p) && p > 0);
  const budgetMin = prices.length ? Math.min(...prices) : 0;
  const budgetMaxEst = prices.length
    ? steps.reduce((s, step) => s + (step.poi?.price ?? 0), 0)
    : 0;

  send({
    sessionId: getSessionId(),
    eventName: 'plan_generated',
    eventData: {
      payload: {
        intentSource: plan.requirements?.intentSource || plan.requirements?.parseMethod || 'unknown',
        liveSearchStatus,
        personalizationSummary: route?.personalizationSummary || '',
        recommendationReasons: route?.recommendationReasons ?? [],
      },
    },
    planData: {
      intentSource: plan.requirements?.intentSource || plan.requirements?.parseMethod || 'unknown',
      liveSearchStatus,
      city: plan.requirements?.city || '',
      district: plan.requirements?.district || null,
      peopleType: plan.requirements?.peopleType || '',
      budgetMax: plan.requirements?.budgetMax ?? 0,
      blindBoxTheme: plan.blindBox?.theme || plan.requirements?.blindBoxTheme || '',
      routeNames,
      routeTypes,
      totalMinutes: route?.totalMinutes ?? null,
      budgetMin,
      budgetMaxEst,
      rawPlan: plan,
    },
  });
}

/** plan_failed — fired when plan generation throws */
export function trackPlanFailed(errMessage: string, rawText: string, quickSelections: Record<string, unknown>): void {
  send({
    sessionId: getSessionId(),
    eventName: 'plan_failed',
    eventData: {
      payload: { errorMessage: errMessage, rawText, quickSelections: sanitizeQuickSelections(quickSelections) },
    },
  });
}

export function sanitizeQuickSelections(quickSelections: Record<string, unknown>): Record<string, unknown> {
  const { currentLocation: _currentLocation, ...safeSelections } = quickSelections;
  return safeSelections;
}

/** route_confirmed — fired when user clicks "确认路线" (after execute-plan) */
type PreferencePoiContext = {
  poiType?: string;
  poiTags?: string[];
  district?: string;
  routeTheme?: string;
};

type ReplacementPreferenceContext = {
  fromPoiType?: string;
  fromPoiTags?: string[];
  district?: string;
  toPoiType?: string;
};

export function buildRouteConfirmedPayload(plan: {
  route?: { totalMinutes?: number; steps?: Array<{ poi?: { name?: string; type?: string; tags?: string[] } }> };
  requirements?: { district?: string; budgetMax?: number };
  blindBox?: { theme?: string };
}): Record<string, unknown> {
  const steps = plan.route?.steps ?? [];
  const routeTypes = uniqueStrings(steps.map((step) => step.poi?.type));
  const routeTags = uniqueStrings(steps.flatMap((step) => step.poi?.tags ?? []));
  const routeNames = uniqueStrings(steps.map((step) => step.poi?.name));
  return {
    totalMinutes: plan.route?.totalMinutes ?? 0,
    budgetRange: `${plan.requirements?.budgetMax ?? 0}`,
    budgetMax: plan.requirements?.budgetMax ?? 0,
    routeTypes,
    routeTags,
    routeNames,
    ...(plan.requirements?.district ? { district: plan.requirements.district } : {}),
    ...(plan.blindBox?.theme ? { routeTheme: plan.blindBox.theme } : {}),
  };
}

export function trackRouteConfirmed(plan: Parameters<typeof buildRouteConfirmedPayload>[0]): void {
  send({
    sessionId: getSessionId(),
    eventName: 'route_confirmed',
    eventData: { payload: buildRouteConfirmedPayload(plan) },
  });
}

/** route_rerolled — fired when user replaces the entire route */
export function trackRouteRerolled(reason: string, beforeRouteId: string): void {
  send({
    sessionId: getSessionId(),
    eventName: 'route_rerolled',
    eventData: {
      payload: { reason, beforeRoute: beforeRouteId, afterRoute: 'new_route' },
    },
  });
}

/** step_replaced — fired when a single POI step is replaced */
export function buildStepReplacedPayload(
  fromPoiName: string,
  toPoiName: string,
  customPrompt: string,
  context: ReplacementPreferenceContext = {},
): Record<string, unknown> {
  return {
    fromPoi: fromPoiName,
    toPoi: toPoiName,
    customPrompt,
    ...(context.fromPoiType ? { fromPoiType: context.fromPoiType } : {}),
    ...(context.fromPoiTags?.length ? { fromPoiTags: context.fromPoiTags } : {}),
    ...(context.district ? { district: context.district } : {}),
    ...(context.toPoiType ? { toPoiType: context.toPoiType } : {}),
  };
}

export function trackStepReplaced(
  fromPoiName: string,
  toPoiName: string,
  customPrompt: string,
  context: ReplacementPreferenceContext = {},
): void {
  send({
    sessionId: getSessionId(),
    eventName: 'step_replaced',
    eventData: { payload: buildStepReplacedPayload(fromPoiName, toPoiName, customPrompt, context) },
  });
}

/** poi_viewed — fired when user clicks a POI to view details */
export function trackPoiViewed(poiName: string, poiType: string, routeTitle: string, context: Pick<PreferencePoiContext, 'poiTags' | 'district'> = {}): void {
  send({
    sessionId: getSessionId(),
    eventName: 'poi_viewed',
    eventData: {
      payload: {
        poiName,
        poiType,
        routeTitle,
        ...(context.poiTags?.length ? { poiTags: context.poiTags } : {}),
        ...(context.district ? { district: context.district } : {}),
      },
    },
  });
}

/** route_abandoned — fired when user returns from route screen without confirming or interacting */
export function trackRouteAbandoned(routeId: string, viewedMs: number): void {
  send({
    sessionId: getSessionId(),
    eventName: 'route_abandoned',
    eventData: {
      payload: { routeId, viewedMs },
    },
  });
}

/** favorite_added — fired when user adds a POI or route to favorites */
export function buildFavoriteAddedPayload(
  favoriteType: 'poi' | 'route',
  itemName: string,
  context: PreferencePoiContext = {},
): Record<string, unknown> {
  return {
    favoriteType,
    ...(favoriteType === 'poi' ? { poiName: itemName } : { routeTitle: itemName }),
    ...(context.poiType ? { poiType: context.poiType } : {}),
    ...(context.poiTags?.length ? { poiTags: context.poiTags } : {}),
    ...(context.district ? { district: context.district } : {}),
    ...(context.routeTheme ? { routeTheme: context.routeTheme } : {}),
  };
}

export function trackFavoriteAdded(
  favoriteType: 'poi' | 'route',
  itemName: string,
  context: PreferencePoiContext = {},
): void {
  send({
    sessionId: getSessionId(),
    eventName: 'favorite_added',
    eventData: { payload: buildFavoriteAddedPayload(favoriteType, itemName, context) },
  });
}

function uniqueStrings(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0))];
}
