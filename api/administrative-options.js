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

// ../api-src/administrative-options.ts
var administrative_options_exports = {};
__export(administrative_options_exports, {
  default: () => handler
});
module.exports = __toCommonJS(administrative_options_exports);

// src/administrativeDivisions.ts
var MUNICIPALITIES = /* @__PURE__ */ new Set(["\u5317\u4EAC\u5E02", "\u5929\u6D25\u5E02", "\u4E0A\u6D77\u5E02", "\u91CD\u5E86\u5E02"]);
function extractAdministrativeOptions(payload, parent, kind) {
  const normalizedParent = parent.trim();
  const roots = Array.isArray(payload.districts) ? payload.districts : [];
  const root = roots.find((item) => item.name?.trim() === normalizedParent) || roots[0];
  const children = root && Array.isArray(root.districts) ? root.districts : [];
  if (kind === "cities" && MUNICIPALITIES.has(normalizedParent)) return [normalizedParent];
  const names = children.filter((item) => item.level !== "street").map((item) => item.name?.trim() || "").filter(Boolean);
  return [...new Set(names)];
}

// ../api-src/administrative-options.ts
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
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
  const parent = typeof req.body?.parent === "string" ? req.body.parent.trim() : "";
  const kind = req.body?.kind;
  if (!parent || kind !== "cities" && kind !== "districts") {
    res.status(400).json({ error: "\u7F3A\u5C11\u6709\u6548\u7684\u4E0A\u7EA7\u884C\u653F\u533A" });
    return;
  }
  const key = process.env.AMAP_API_KEY || process.env.AMAP_WEB_SERVICE_KEY;
  if (!key) {
    res.status(503).json({ error: "\u672A\u914D\u7F6E\u9AD8\u5FB7\u884C\u653F\u533A\u670D\u52A1" });
    return;
  }
  try {
    const url = new URL("https://restapi.amap.com/v3/config/district");
    url.searchParams.set("key", key);
    url.searchParams.set("keywords", parent);
    url.searchParams.set("subdistrict", "1");
    url.searchParams.set("extensions", "base");
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok || data.status !== "1") {
      res.status(502).json({ error: data.info || "\u884C\u653F\u533A\u6570\u636E\u52A0\u8F7D\u5931\u8D25" });
      return;
    }
    res.status(200).json({ options: extractAdministrativeOptions(data, parent, kind) });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "\u884C\u653F\u533A\u6570\u636E\u52A0\u8F7D\u5931\u8D25" });
  }
}
