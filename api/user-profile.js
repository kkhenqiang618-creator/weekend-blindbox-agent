"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../api-src/user-profile.ts
var user_profile_exports = {};
__export(user_profile_exports, {
  createUserProfileHandler: () => createUserProfileHandler,
  default: () => user_profile_default
});
module.exports = __toCommonJS(user_profile_exports);

// ../new-agent-a-module/src/agent/profileLearner.ts
var DAY_MS = 24 * 60 * 60 * 1e3;
var PROFILE_WINDOW_DAYS = 30;
function aggregateUserProfile(inputPlans, inputEvents, now = /* @__PURE__ */ new Date()) {
  const plans = inputPlans.filter((plan) => isRecent(plan.created_at, now));
  const events = inputEvents.filter((event) => isRecent(event.created_at, now) && asRecord(event.payload).env !== "test");
  const poiIndex = buildPoiIndex(plans);
  const typeScores = /* @__PURE__ */ new Map();
  const tagScores = /* @__PURE__ */ new Map();
  const districtScores = /* @__PURE__ */ new Map();
  const themeScores = /* @__PURE__ */ new Map();
  const dislikedTypeScores = /* @__PURE__ */ new Map();
  const favoritePoiNames = [];
  const budgetSamples = [];
  const durationSamples = [];
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
    const knownPoi = poiName ? poiIndex.get(poiName) : void 0;
    if (event.event_name === "favorite_added") {
      if (payload.favoriteType === "poi") {
        favoritePoiCount += 1;
        if (poiName && !favoritePoiNames.includes(poiName)) favoritePoiNames.push(poiName);
        addScore(typeScores, knownPoi?.type || asString(payload.poiType), 5 * decay);
        addMany(tagScores, asStringArray(payload.poiTags).length ? asStringArray(payload.poiTags) : knownPoi?.tags, 3 * decay);
        addScore(districtScores, asString(payload.district) || knownPoi?.district, 3 * decay);
      }
      if (payload.favoriteType === "route") {
        favoriteRouteCount += 1;
        addScore(themeScores, asString(payload.routeTheme) || asString(payload.routeTitle), 5 * decay);
      }
      continue;
    }
    if (event.event_name === "route_confirmed") {
      confirmedRouteCount += 1;
      addMany(typeScores, asStringArray(payload.routeTypes), 4 * decay);
      addMany(tagScores, asStringArray(payload.routeTags), 3 * decay);
      addScore(districtScores, asString(payload.district), 3 * decay);
      addScore(themeScores, asString(payload.routeTheme), 4 * decay);
      pushFinite(budgetSamples, payload.budgetMax ?? parseBudget(payload.budgetRange));
      pushFinite(durationSamples, payload.totalMinutes);
      continue;
    }
    if (event.event_name === "poi_viewed") {
      addScore(typeScores, knownPoi?.type || asString(payload.poiType), 1 * decay);
      addMany(tagScores, asStringArray(payload.poiTags).length ? asStringArray(payload.poiTags) : knownPoi?.tags, 0.75 * decay);
      addScore(districtScores, asString(payload.district) || knownPoi?.district, 0.75 * decay);
      continue;
    }
    if (event.event_name === "step_replaced") {
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
    budgetRange: medianBudget === null ? void 0 : [Math.max(0, Math.round(medianBudget * 0.7)), Math.round(medianBudget * 1.3)],
    preferredRoutePace: averageDuration === null ? void 0 : averageDuration > 300 ? "relaxed" : averageDuration < 180 ? "packed" : "balanced",
    confirmedRouteCount,
    favoritePoiCount,
    favoriteRouteCount
  };
}
async function learnUserProfile(sessionId, options = {}) {
  const normalizedSessionId = sessionId.trim();
  const supabaseUrl = options.supabaseUrl ?? process.env.SUPABASE_URL ?? "";
  const serviceKey = options.serviceKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!normalizedSessionId || normalizedSessionId.length > 128 || !supabaseUrl || !serviceKey) {
    return emptyUserProfile();
  }
  const fetcher = options.fetcher ?? fetch;
  const now = options.now ?? /* @__PURE__ */ new Date();
  const since = new Date(now.getTime() - PROFILE_WINDOW_DAYS * DAY_MS).toISOString();
  try {
    const [plans, events] = await Promise.all([
      fetchRows(fetcher, supabaseUrl, serviceKey, "wb_generated_plans", normalizedSessionId, since),
      fetchRows(fetcher, supabaseUrl, serviceKey, "wb_events", normalizedSessionId, since)
    ]);
    const profile = aggregateUserProfile(plans, events, now);
    await upsertProfile(fetcher, supabaseUrl, serviceKey, normalizedSessionId, profile).catch(() => void 0);
    return profile;
  } catch {
    return emptyUserProfile();
  }
}
function emptyUserProfile() {
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
    favoriteRouteCount: 0
  };
}
async function fetchRows(fetcher, supabaseUrl, serviceKey, table, sessionId, since) {
  const url = supabaseTableUrl(supabaseUrl, table);
  url.searchParams.set("select", "*");
  url.searchParams.set("session_id", `eq.${sessionId}`);
  url.searchParams.set("created_at", `gte.${since}`);
  url.searchParams.set("order", "created_at.asc");
  const response = await fetcher(url, { headers: supabaseHeaders(serviceKey) });
  if (!response.ok) throw new Error(`Supabase ${table} read failed`);
  const payload = await response.json();
  if (!Array.isArray(payload)) throw new Error(`Supabase ${table} returned invalid data`);
  return payload;
}
async function upsertProfile(fetcher, supabaseUrl, serviceKey, sessionId, profile) {
  const url = supabaseTableUrl(supabaseUrl, "wb_user_profiles");
  url.searchParams.set("on_conflict", "session_id");
  const response = await fetcher(url, {
    method: "POST",
    headers: {
      ...supabaseHeaders(serviceKey),
      "Content-Type": "application/json",
      "Prefer": "resolution=merge-duplicates,return=minimal"
    },
    body: JSON.stringify({ session_id: sessionId, profile, updated_at: (/* @__PURE__ */ new Date()).toISOString() })
  });
  if (!response.ok) throw new Error("Supabase profile upsert failed");
}
function supabaseTableUrl(baseUrl, table) {
  return new URL(`/rest/v1/${table}`, `${baseUrl.replace(/\/+$/, "")}/`);
}
function supabaseHeaders(serviceKey) {
  return { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };
}
function isRecent(value, now) {
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return false;
  const age = now.getTime() - timestamp;
  return age >= 0 && age <= PROFILE_WINDOW_DAYS * DAY_MS;
}
function timeDecay(value, now) {
  if (!value) return 0.5;
  const ageDays = Math.max(0, (now.getTime() - new Date(value).getTime()) / DAY_MS);
  if (ageDays <= 7) return 1;
  if (ageDays <= 14) return 0.75;
  return 0.5;
}
function buildPoiIndex(plans) {
  const index = /* @__PURE__ */ new Map();
  for (const plan of plans) {
    for (const poi of extractPlanPois(plan)) {
      if (poi.name) index.set(poi.name, { type: poi.type, tags: poi.tags, district: poi.district || plan.district || void 0 });
    }
  }
  return index;
}
function extractPlanPois(plan) {
  const rawPlan = asRecord(plan.raw_plan);
  const route = asRecord(rawPlan.route);
  const steps = Array.isArray(route.steps) ? route.steps : [];
  return steps.map((step) => {
    const poi = asRecord(asRecord(step).poi);
    return {
      name: asString(poi.name),
      type: asString(poi.type),
      tags: asStringArray(poi.tags),
      district: asString(poi.area) || asString(poi.businessDistrict)
    };
  });
}
function addMany(scores, values, weight) {
  for (const value of asStringArray(values)) addScore(scores, value, weight);
}
function addScore(scores, value, weight) {
  if (!value || weight <= 0) return;
  scores.set(value, (scores.get(value) ?? 0) + weight);
}
function topScores(scores, limit) {
  return [...scores.entries()].filter(([, score]) => score >= 1).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN")).slice(0, limit).map(([value]) => value);
}
function pushFinite(target, value) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (Number.isFinite(parsed) && parsed >= 0) target.push(parsed);
}
function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
function mean(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}
function parseBudget(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const matches = value.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  return matches.length ? Math.max(...matches) : null;
}
function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function asString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : void 0;
}
function asStringArray(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(asString).filter((item) => Boolean(item)))];
}

// ../api-src/user-profile.ts
function createUserProfileHandler(learner = learnUserProfile) {
  return async function handler(req, res) {
    setCors(res);
    if (req.method === "OPTIONS") {
      res.status(204).json({});
      return;
    }
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
    const sessionId = typeof req.query?.sessionId === "string" ? req.query.sessionId.trim() : "";
    if (!isValidSessionId(sessionId)) {
      res.status(400).json({ error: "Missing or invalid sessionId" });
      return;
    }
    const profile = await learner(sessionId);
    res.status(200).json({ profile });
  };
}
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
function isValidSessionId(value) {
  return value.length > 0 && value.length <= 128 && /^[A-Za-z0-9._:-]+$/.test(value);
}
var user_profile_default = createUserProfileHandler();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createUserProfileHandler
});
