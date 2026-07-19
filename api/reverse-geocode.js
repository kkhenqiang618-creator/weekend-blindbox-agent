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

// ../api-src/reverse-geocode.ts
var reverse_geocode_exports = {};
__export(reverse_geocode_exports, {
  default: () => handler
});
module.exports = __toCommonJS(reverse_geocode_exports);
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
  const lng = Number(req.body?.lng);
  const lat = Number(req.body?.lat);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    res.status(400).json({ error: "lng/lat are required" });
    return;
  }
  const key = process.env.AMAP_API_KEY || process.env.AMAP_WEB_SERVICE_KEY;
  if (!key) {
    res.status(200).json({ province: "", city: "", district: "", label: "", resolved: false });
    return;
  }
  try {
    const url = new URL("https://restapi.amap.com/v3/geocode/regeo");
    url.searchParams.set("key", key);
    url.searchParams.set("location", `${lng},${lat}`);
    url.searchParams.set("extensions", "base");
    url.searchParams.set("radius", "1000");
    const response = await fetch(url);
    const data = await response.json();
    const address = data?.regeocode?.addressComponent;
    if (!response.ok || data?.status !== "1" || !address) {
      res.status(200).json({ province: "", city: "", district: "", label: "", resolved: false });
      return;
    }
    const province = address.province || "";
    const city = Array.isArray(address.city) ? province : address.city || province;
    const district = address.district || "";
    const label = [province, city, district].filter((value, index, values) => value && values.indexOf(value) === index).join("");
    res.status(200).json({ province, city, district, label, resolved: Boolean(province || city || district) });
  } catch {
    res.status(200).json({ province: "", city: "", district: "", label: "", resolved: false });
  }
}
