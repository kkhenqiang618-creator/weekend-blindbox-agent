import type { PeopleType, Poi, QueueLevel } from "../agent/types.ts";

type RawPoi = Record<string, unknown>;

const VALID_PEOPLE = new Set<PeopleType>(["单人", "情侣", "朋友", "亲子"]);
const VALID_QUEUE = new Set<QueueLevel>(["low", "medium", "high"]);

export function normalizePois(rawPois: RawPoi[]): Poi[] {
  return rawPois.map(normalizePoi);
}

function normalizePoi(raw: RawPoi): Poi {
  const id = asString(raw.id, "unknown_poi");
  const type = asString(raw.type, "休闲娱乐");
  const limits = asStringArray(raw.limits);

  return {
    id,
    name: asString(raw.name, id),
    lat: optionalNumber(raw.lat),
    lng: optionalNumber(raw.lng),
    type,
    subType: asString(raw.subType, type),
    address: optionalString(raw.address),
    area: optionalString(raw.area),
    businessDistrict: asString(raw.businessDistrict, "未知商圈"),
    routeCluster: optionalString(raw.routeCluster),
    price: asNumber(raw.price, 0),
    priceLevel: optionalString(raw.priceLevel),
    meituanRating: optionalNumber(raw.meituanRating),
    reviewCount: optionalNumber(raw.reviewCount),
    tags: asStringArray(raw.tags),
    limits,
    fitPeople: normalizeFitPeople(raw.fitPeople),
    stayMinutes: asNumber(raw.stayMinutes, 60),
    openTime: optionalString(raw.openTime),
    queueLevel: normalizeQueueLevel(raw.queueLevel),
    distanceLevel: optionalString(raw.distanceLevel),
    mockMeituanUrl: optionalString(raw.mockMeituanUrl),
    reason: asString(raw.reason, "适合加入本次周末路线"),
    blindBoxThemes: asStringArray(raw.blindBoxThemes),
    availableTools: asStringArray(raw.availableTools),
    bookingRequired: asBoolean(raw.bookingRequired, false),
    weatherSensitive: typeof raw.weatherSensitive === "boolean"
      ? raw.weatherSensitive
      : limits.includes("室外") && !limits.includes("雨天可去"),
    replaceableBy: asStringArray(raw.replaceableBy),
    priorityScore: optionalNumber(raw.priorityScore),
    amapCategoryName: optionalString(raw.amapCategoryName),
    amapCategoryCode: optionalString(raw.amapCategoryCode),
    amapCategoryPath: optionalString(raw.amapCategoryPath)
  };
}

function normalizeFitPeople(value: unknown): PeopleType[] {
  const rawValues = asStringArray(value);
  const result = new Set<PeopleType>();

  for (const item of rawValues) {
    if (VALID_PEOPLE.has(item as PeopleType)) {
      result.add(item as PeopleType);
      continue;
    }

    if (/同事|商务|多人|多人聚餐|团建|打卡用餐/.test(item)) {
      result.add("朋友");
      continue;
    }

    if (/家庭|带娃|儿童|孩子/.test(item)) {
      result.add("亲子");
    }
  }

  return [...(result.size > 0 ? result : new Set<PeopleType>(["朋友"]))];
}

function normalizeQueueLevel(value: unknown): QueueLevel {
  if (typeof value === "string" && VALID_QUEUE.has(value as QueueLevel)) return value as QueueLevel;
  return "medium";
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function optionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim()))];
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}
