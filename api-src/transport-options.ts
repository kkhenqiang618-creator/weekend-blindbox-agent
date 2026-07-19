type Coordinate = { lng: number; lat: number };
type TransportMode = "walk" | "ride" | "drive" | "transit";

function setCors(res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function parseCoordinate(value: unknown): Coordinate | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  const lng = Number(candidate.lng);
  const lat = Number(candidate.lat);
  return Number.isFinite(lng) && Number.isFinite(lat) ? { lng, lat } : null;
}

export function buildAmapRouteUrl(mode: TransportMode, origin: Coordinate, destination: Coordinate, key: string, city: string): URL | null {
  if (mode === "transit" && !city.trim()) return null;
  const pathname = mode === "walk"
    ? "v3/direction/walking"
    : mode === "drive"
      ? "v3/direction/driving"
      : mode === "ride"
        ? "v4/direction/bicycling"
        : "v3/direction/transit/integrated";
  const url = new URL(`https://restapi.amap.com/${pathname}`);
  url.searchParams.set("key", key);
  url.searchParams.set("origin", `${origin.lng},${origin.lat}`);
  url.searchParams.set("destination", `${destination.lng},${destination.lat}`);
  if (mode === "transit") url.searchParams.set("city", city.trim());
  if (mode !== "ride") url.searchParams.set("extensions", "base");
  return url;
}

function parsePolyline(polyline: unknown): number[][] {
  if (typeof polyline !== "string") return [];
  return polyline.split(";")
    .map((point) => point.split(",").map(Number))
    .filter((point) => point.length >= 2 && point.every(Number.isFinite));
}

async function fetchAmapRoute(mode: TransportMode, origin: Coordinate, destination: Coordinate, key: string, city: string) {
  const url = buildAmapRouteUrl(mode, origin, destination, key, city);
  if (!url) return null;
  const response = await fetch(url);
  const data = await response.json() as any;
  if (!response.ok) return null;

  if (mode === "transit") {
    const transit = data?.route?.transits?.[0];
    if (data?.status !== "1" || !transit) return null;
    return {
      distanceMeters: Number(transit.distance) || Number(data?.route?.distance) || undefined,
      durationSeconds: Number(transit.duration) || undefined,
      path: (transit.segments || []).flatMap((segment: any) => [
        ...((segment.walking?.steps || []).flatMap((step: any) => parsePolyline(step.polyline))),
        ...((segment.bus?.buslines || []).flatMap((line: any) => parsePolyline(line.polyline))),
      ]),
    };
  }

  const path = mode === "ride" ? data?.data?.paths?.[0] || data?.route?.paths?.[0] : data?.route?.paths?.[0];
  const rideFailed = mode === "ride" && data?.errcode !== undefined && String(data.errcode) !== "0";
  if (rideFailed || (mode !== "ride" && data?.status !== "1") || !path) return null;
  return {
    distanceMeters: Number(path.distance) || undefined,
    durationSeconds: Number(path.duration) || undefined,
    path: (path.steps || []).flatMap((step: any) => parsePolyline(step.polyline)),
  };
}

function chooseRecommendedMode(options: Record<string, any>): TransportMode {
  if (options.walk?.distanceMeters && options.walk.distanceMeters <= 500) return "walk";
  if (options.transit?.durationSeconds && options.drive?.durationSeconds) {
    return options.transit.durationSeconds <= options.drive.durationSeconds * 1.45 ? "transit" : "drive";
  }
  if (options.transit) return "transit";
  if (options.drive) return "drive";
  if (options.ride) return "ride";
  return "walk";
}

export default async function handler(req: any, res: any) {
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
    const modes: TransportMode[] = ["walk", "ride", "drive", "transit"];
    const entries = await Promise.all(modes.map(async (mode) => [
      mode,
      await fetchAmapRoute(mode, origin, destination, key, city).catch(() => null),
    ]));
    const options = Object.fromEntries(entries.filter(([, route]) => route));
    res.status(200).json({ options, recommendedMode: chooseRecommendedMode(options) });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown server error" });
  }
}
