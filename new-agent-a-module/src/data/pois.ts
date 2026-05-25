import rawPois from "./pois.json" with { type: "json" };
import { normalizePois } from "./poiAdapter.ts";

export const pois = normalizePois(rawPois);
