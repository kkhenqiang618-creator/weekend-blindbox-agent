/**
 * Weekend Buddy - Anonymous Event Tracking Backend
 *
 * Receives tracking events from the frontend and writes them to Supabase.
 * Uses SUPABASE_SERVICE_ROLE_KEY (server-side only) to bypass RLS.
 *
 * Two tables:
 *   - wb_events:   clickstream / behavioral events
 *   - wb_generated_plans: per-generation route snapshots
 */

import { createClient } from '@supabase/supabase-js';

/** Lazy-init singleton so the server can start even without Supabase configured */
let _supabase = null;

function getSupabase() {
  if (_supabase) return _supabase;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.warn('[tracker] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — tracking disabled');
    return null;
  }

  _supabase = createClient(url, key, {
    auth: { persistSession: false },
  });
  return _supabase;
}

/**
 * Write a generic event to wb_events.
 *
 * @param {object} params
 * @param {string} params.sessionId
 * @param {string} params.eventName
 * @param {string}  [params.page]
 * @param {object}  [params.payload={}]
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function trackEvent({ sessionId, eventName, page, payload = {} }) {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'Supabase not configured' };

  const { error } = await supabase
    .from('wb_events')
    .insert({
      session_id: sessionId,
      event_name: eventName,
      page: page || null,
      payload,
    });

  if (error) {
    console.error('[tracker] trackEvent error:', error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

/**
 * Write a generated-plan snapshot to wb_generated_plans.
 *
 * @param {object} params
 * @param {string} params.sessionId
 * @param {string} params.intentSource
 * @param {string} params.liveSearchStatus
 * @param {string} params.city
 * @param {string} [params.district]
 * @param {string} params.peopleType
 * @param {number} params.budgetMax
 * @param {string} params.blindBoxTheme
 * @param {string[]} params.routeNames
 * @param {string[]} params.routeTypes
 * @param {number} params.totalMinutes
 * @param {number} params.budgetMin
 * @param {number} params.budgetMaxEst
 * @param {object} params.rawPlan
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function saveGeneratedPlan({
  sessionId,
  intentSource,
  liveSearchStatus,
  city,
  district,
  peopleType,
  budgetMax,
  blindBoxTheme,
  routeNames,
  routeTypes,
  totalMinutes,
  budgetMin,
  budgetMaxEst,
  rawPlan,
}) {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'Supabase not configured' };

  const { error } = await supabase
    .from('wb_generated_plans')
    .insert({
      session_id: sessionId,
      intent_source: intentSource || null,
      live_search_status: liveSearchStatus || null,
      city,
      district: district || null,
      people_type: peopleType,
      budget_max: budgetMax,
      blind_box_theme: blindBoxTheme || null,
      route_names: routeNames || [],
      route_types: routeTypes || [],
      total_minutes: totalMinutes || null,
      budget_min: budgetMin || null,
      budget_max_est: budgetMaxEst || null,
      raw_plan: rawPlan || {},
    });

  if (error) {
    console.error('[tracker] saveGeneratedPlan error:', error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

/**
 * Accept a batch of events (the /api/track route receives this shape).
 */
export async function handleTrackRequest(body) {
  const { sessionId, eventName, eventData, planData } = body;

  // Validate required fields
  if (!sessionId || typeof sessionId !== 'string') {
    return { ok: false, error: 'Missing or invalid sessionId' };
  }

  // If planData is provided, save to wb_generated_plans
  if (planData) {
    const planResult = await saveGeneratedPlan({
      sessionId,
      ...planData,
    });
    if (!planResult.ok) {
      return { ok: false, error: planResult.error };
    }
  }

  // Write event to wb_events
  if (eventName && typeof eventName === 'string') {
    const eventResult = await trackEvent({
      sessionId,
      eventName,
      page: eventData?.page || null,
      payload: eventData?.payload || {},
    });
    if (!eventResult.ok) {
      return { ok: false, error: eventResult.error };
    }
  }

  return { ok: true };
}
