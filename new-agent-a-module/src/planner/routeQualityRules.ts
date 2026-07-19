import type { Poi, Requirements, RouteStep } from "../agent/types.ts";

const FREE_PLACE_PATTERN = /公园|广场|绿道|栈道|海滨|沙滩|街区|古城|游客中心|图书馆|文化馆|博物馆|美术馆|艺术馆|市民中心|湿地|自然|步道|山|湖|海边|citywalk/i;
const TICKETED_PATTERN = /乐园|影院|电影|密室|桌游|电玩城|KTV|剧本|DIY|diy|手作|陶艺|烘焙|展览|营地|农场|运动|攀岩|蹦床/i;
const DINING_PATTERN = /餐|饭|菜馆|酒楼|火锅|烤肉|烧烤|海鲜|bistro|简餐|小吃|夜市|美食街/i;
const DRINK_PATTERN = /咖啡|茶|甜品|奶茶|饮品|面包|下午茶/i;
const DISTRICT_NEARBY_KM = 12;
const VENUE_SUBPLACE_PATTERN = /^(.*?)(?:文化艺术中心|艺术中心|商业街|步行街|美术馆|艺术馆|博物馆|购物中心|游客中心|摩天轮|水世界|南区|北区|东区|西区|一期|二期|三期)(?:.*)?$/;

const DISTRICT_CENTERS: Record<string, { lng: number; lat: number }> = {
  "福田区": { lng: 114.055, lat: 22.545 },
  "南山区": { lng: 113.930, lat: 22.533 },
  "罗湖区": { lng: 114.130, lat: 22.548 },
  "宝安区": { lng: 113.884, lat: 22.555 },
  "龙岗区": { lng: 114.247, lat: 22.720 },
  "龙华区": { lng: 114.045, lat: 22.696 },
  "盐田区": { lng: 114.237, lat: 22.557 },
  "坪山区": { lng: 114.350, lat: 22.690 },
  "光明区": { lng: 113.936, lat: 22.748 },
  "大鹏区": { lng: 114.474, lat: 22.596 },
};

export function getVenueComplexKey(name: string): string {
  const cleaned = name
    .replace(/[（(].*?[）)]/g, "")
    .replace(/[\s·•]/g, "")
    .trim();
  const prefix = cleaned.match(VENUE_SUBPLACE_PATTERN)?.[1]?.trim();
  return prefix && prefix.length >= 3 ? prefix : cleaned;
}

export function getTargetDurationMinutes(requirements: Requirements): number {
  const raw = Number(requirements.durationHours || 4) * 60;
  return Math.max(120, Math.min(480, Math.round(raw)));
}

export function getDurationWindow(requirements: Requirements): { target: number; min: number; max: number } {
  const target = getTargetDurationMinutes(requirements);
  const tolerance = target <= 150 ? 20 : Math.max(25, Math.round(target * 0.12));
  return {
    target,
    min: Math.max(90, target - tolerance),
    max: target + tolerance,
  };
}

export function normalizePoiForPlanning(poi: Poi, requirements: Requirements): Poi {
  const priceInfo = estimatePoiPrice(poi, requirements);
  return {
    ...poi,
    price: priceInfo.price,
    priceLevel: priceInfo.label,
    stayMinutes: estimateStayMinutes(poi),
    tags: [...new Set([...poi.tags, ...priceInfo.tags])].slice(0, 8),
    limits: [...new Set([...poi.limits, ...priceInfo.limits])],
  };
}

export function estimatePoiPrice(poi: Poi, requirements: Requirements): { price: number; label: string; tags: string[]; limits: string[] } {
  const text = `${poi.name} ${poi.type} ${poi.subType} ${poi.tags.join(" ")} ${poi.reason}`;
  const budget = requirements.budgetMax;

  if (FREE_PLACE_PATTERN.test(text) && !TICKETED_PATTERN.test(text) && !DINING_PATTERN.test(text) && !DRINK_PATTERN.test(text)) {
    return { price: 0, label: "免费/现场为准", tags: ["免费"], limits: ["预算友好"] };
  }

  if (poi.type === "户外散步" || poi.type === "拍照地标") {
    const price = TICKETED_PATTERN.test(text) ? clampPrice(40, budget, 0.7) : 0;
    return { price, label: price === 0 ? "免费/现场为准" : "约0-80/人", tags: price === 0 ? ["免费"] : ["低预算"], limits: ["预算友好"] };
  }

  if (poi.type === "轻食甜饮" || DRINK_PATTERN.test(text)) {
    const price = budget <= 150 ? 28 : budget >= 350 ? 58 : 42;
    return { price, label: "约30-80/人", tags: ["轻预算"], limits: ["预算友好"] };
  }

  if (poi.type === "餐饮正餐" || DINING_PATTERN.test(text)) {
    const price = budget <= 150 ? 58 : budget >= 350 ? 128 : 88;
    return { price, label: budget <= 150 ? "约50-90/人" : budget >= 350 ? "约100-180/人" : "约70-120/人", tags: ["餐饮预算"], limits: [] };
  }

  if (poi.type === "文化体验") {
    const price = TICKETED_PATTERN.test(text) ? clampPrice(80, budget, 0.8) : 0;
    return { price, label: price === 0 ? "免费-80/人" : "约60-120/人", tags: price === 0 ? ["低预算"] : ["体验预算"], limits: ["预算友好"] };
  }

  if (poi.type === "休闲娱乐") {
    const price = budget <= 150 ? 60 : budget >= 350 ? 128 : 88;
    return { price, label: budget <= 150 ? "约50-90/人" : "约80-160/人", tags: ["体验预算"], limits: [] };
  }

  return { price: Math.min(Math.max(poi.price || 0, 0), budget), label: poi.priceLevel || "预估/现场为准", tags: [], limits: [] };
}

export function estimateStayMinutes(poi: Poi): number {
  const text = `${poi.name} ${poi.type} ${poi.subType} ${poi.tags.join(" ")} ${poi.reason}`;
  if (poi.type === "餐饮正餐") return clampStay(poi.stayMinutes || 80, 70, 105);
  if (poi.type === "轻食甜饮") return clampStay(poi.stayMinutes || 45, 35, 65);
  if (poi.type === "休闲娱乐") return clampStay(poi.stayMinutes || 95, 75, 130);
  if (poi.type === "文化体验") return clampStay(poi.stayMinutes || 85, 60, /DIY|diy|手作|陶艺|烘焙/.test(text) ? 130 : 110);
  if (poi.type === "户外散步") return clampStay(poi.stayMinutes || 65, 45, 95);
  if (poi.type === "拍照地标") return clampStay(poi.stayMinutes || 50, 35, 75);
  return clampStay(poi.stayMinutes || 70, 45, 100);
}

export function estimateTravelMinutesBetweenSteps(steps: RouteStep[]): number {
  if (steps.length <= 1) return 0;
  return steps.slice(1).reduce((sum, step, index) => {
    return sum + estimateTravelMinutes(steps[index].poi, step.poi);
  }, 0);
}

export function estimateRouteMinutes(steps: RouteStep[]): number {
  return steps.reduce((sum, step) => sum + step.poi.stayMinutes, 0) + estimateTravelMinutesBetweenSteps(steps);
}

export function estimateTravelMinutesBetweenPois(a: Poi, b: Poi): number {
  return estimateTravelMinutes(a, b);
}

export function estimateTravelMinutesFromCurrentLocation(poi: Poi, currentLocation?: { lng: number; lat: number }): number {
  if (!currentLocation || typeof poi.lat !== "number" || typeof poi.lng !== "number") return 0;
  return estimateTravelMinutes({
    ...poi,
    id: "__current__",
    name: "当前位置",
    lat: currentLocation.lat,
    lng: currentLocation.lng,
  }, poi);
}

export function stretchStepsToDuration(steps: RouteStep[], requirements: Requirements): RouteStep[] {
  const { min, max } = getDurationWindow(requirements);
  let total = estimateRouteMinutes(steps);
  if (total >= min || steps.length === 0) return steps;

  return steps.map((step) => {
    if (total >= min) return step;
    const room = Math.min(getStretchRoom(step.poi), min - total, max - total);
    if (room <= 0) return step;
    total += room;
    return {
      ...step,
      poi: {
        ...step.poi,
        stayMinutes: step.poi.stayMinutes + room,
        reason: step.poi.reason,
      },
    };
  });
}

function estimateTravelMinutes(a: Poi, b: Poi): number {
  if (typeof a.lat !== "number" || typeof a.lng !== "number" || typeof b.lat !== "number" || typeof b.lng !== "number") {
    return 12;
  }
  const km = distanceKm(a, b);
  return Math.max(8, Math.min(120, Math.round(km * 7 + 8)));
}

export function isPoiNearRequestedDistrict(poi: Poi, district?: string, maxKm = DISTRICT_NEARBY_KM): boolean {
  const normalized = normalizeDistrictName(district);
  if (!normalized) return true;
  if (matchesDistrictText(poi, normalized)) return true;
  const center = DISTRICT_CENTERS[normalized];
  if (!center || typeof poi.lat !== "number" || typeof poi.lng !== "number") return false;
  return distanceKm({ ...poi, lat: center.lat, lng: center.lng }, poi) <= maxKm;
}

export function distanceFromRequestedDistrictKm(poi: Poi, district?: string): number {
  const normalized = normalizeDistrictName(district);
  const center = normalized ? DISTRICT_CENTERS[normalized] : undefined;
  if (!center || typeof poi.lat !== "number" || typeof poi.lng !== "number") return 0;
  return distanceKm({ ...poi, lat: center.lat, lng: center.lng }, poi);
}

export function estimateTravelMinutesFromRequestedDistrict(poi: Poi, district?: string): number {
  const km = distanceFromRequestedDistrictKm(poi, district);
  if (km <= 0) return 0;
  return Math.max(8, Math.min(120, Math.round(km * 7 + 8)));
}

function normalizeDistrictName(district?: string): string | undefined {
  if (!district) return undefined;
  const raw = district.trim();
  const withoutCity = raw.includes("市") ? raw.slice(raw.lastIndexOf("市") + 1) : raw;
  const explicit = withoutCity.match(/[\u4e00-\u9fff]{2,6}(?:区|县|旗)$/)?.[0];
  return explicit || withoutCity || undefined;
}

function matchesDistrictText(poi: Poi, district: string): boolean {
  const short = district.replace(/区$/, "");
  return [poi.area, poi.businessDistrict, poi.routeCluster, poi.address]
    .filter(Boolean)
    .some((value) => String(value).includes(short));
}

function getStretchRoom(poi: Poi): number {
  if (poi.type === "餐饮正餐") return 25;
  if (poi.type === "休闲娱乐") return 25;
  if (poi.type === "文化体验") return 20;
  if (poi.type === "户外散步") return 20;
  if (poi.type === "轻食甜饮") return 15;
  return 10;
}

function clampStay(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value / 5) * 5));
}

function clampPrice(base: number, budget: number, factor: number): number {
  return Math.max(0, Math.min(Math.round(base * (budget <= 150 ? 0.75 : budget >= 350 ? 1.15 : 1)), Math.round(budget * factor)));
}

function distanceKm(a: Poi, b: Poi): number {
  if (typeof a.lat !== "number" || typeof a.lng !== "number" || typeof b.lat !== "number" || typeof b.lng !== "number") return 0;
  const earthRadiusKm = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.min(1, Math.sqrt(h)));
}

function toRadians(value: number): number {
  return value * Math.PI / 180;
}
