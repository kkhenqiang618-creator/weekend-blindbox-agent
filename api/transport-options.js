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

// ../api-src/transport-options.ts
var transport_options_exports = {};
__export(transport_options_exports, {
  buildAmapRouteUrl: () => buildAmapRouteUrl,
  default: () => handler
});
module.exports = __toCommonJS(transport_options_exports);
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
function parseCoordinate(value) {
  if (!value || typeof value !== "object") return null;
  const candidate = value;
  const lng = Number(candidate.lng);
  const lat = Number(candidate.lat);
  return Number.isFinite(lng) && Number.isFinite(lat) ? { lng, lat } : null;
}
function buildAmapRouteUrl(mode, origin, destination, key, city) {
  if (mode === "transit" && !city.trim()) return null;
  const pathname = mode === "walk" ? "v3/direction/walking" : mode === "drive" ? "v3/direction/driving" : mode === "ride" ? "v4/direction/bicycling" : "v3/direction/transit/integrated";
  const url = new URL(`https://restapi.amap.com/${pathname}`);
  url.searchParams.set("key", key);
  url.searchParams.set("origin", `${origin.lng},${origin.lat}`);
  url.searchParams.set("destination", `${destination.lng},${destination.lat}`);
  if (mode === "transit") url.searchParams.set("city", city.trim());
  if (mode !== "ride") url.searchParams.set("extensions", "base");
  return url;
}
function parsePolyline(polyline) {
  if (typeof polyline !== "string") return [];
  return polyline.split(";").map((point) => point.split(",").map(Number)).filter((point) => point.length >= 2 && point.every(Number.isFinite));
}
async function fetchAmapRoute(mode, origin, destination, key, city) {
  const url = buildAmapRouteUrl(mode, origin, destination, key, city);
  if (!url) return null;
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) return null;
  if (mode === "transit") {
    const transit = data?.route?.transits?.[0];
    if (data?.status !== "1" || !transit) return null;
    return {
      distanceMeters: Number(transit.distance) || Number(data?.route?.distance) || void 0,
      durationSeconds: Number(transit.duration) || void 0,
      path: (transit.segments || []).flatMap((segment) => [
        ...(segment.walking?.steps || []).flatMap((step) => parsePolyline(step.polyline)),
        ...(segment.bus?.buslines || []).flatMap((line) => parsePolyline(line.polyline))
      ])
    };
  }
  const path = mode === "ride" ? data?.data?.paths?.[0] || data?.route?.paths?.[0] : data?.route?.paths?.[0];
  const rideFailed = mode === "ride" && data?.errcode !== void 0 && String(data.errcode) !== "0";
  if (rideFailed || mode !== "ride" && data?.status !== "1" || !path) return null;
  return {
    distanceMeters: Number(path.distance) || void 0,
    durationSeconds: Number(path.duration) || void 0,
    path: (path.steps || []).flatMap((step) => parsePolyline(step.polyline))
  };
}
function chooseRecommendedMode(options) {
  if (options.walk?.distanceMeters && options.walk.distanceMeters <= 500) return "walk";
  if (options.transit?.durationSeconds && options.drive?.durationSeconds) {
    return options.transit.durationSeconds <= options.drive.durationSeconds * 1.45 ? "transit" : "drive";
  }
  if (options.transit) return "transit";
  if (options.drive) return "drive";
  if (options.ride) return "ride";
  return "walk";
}
async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") {
    res.status(204).json({});
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const origin = parseCoordinate(req.body?.origin);
  const destination = parseCoordinate(req.body?.destination);
  const city = typeof req.body?.city === "string" ? req.body.city.trim() : "";
  const key = process.env.AMAP_API_KEY || process.env.AMAP_WEB_SERVICE_KEY;
  if (!origin || !destination) {
    res.status(400).json({ error: "origin and destination lng/lat are required" });
    return;
  }
  if (!key) {
    res.status(500).json({ error: "AMAP_API_KEY is not configured" });
    return;
  }
  try {
    const modes = ["walk", "ride", "drive", "transit"];
    const entries = await Promise.all(modes.map(async (mode) => [
      mode,
      await fetchAmapRoute(mode, origin, destination, key, city).catch(() => null)
    ]));
    const options = Object.fromEntries(entries.filter(([, route]) => route));
    res.status(200).json({ options, recommendedMode: chooseRecommendedMode(options) });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown server error" });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  buildAmapRouteUrl
});
