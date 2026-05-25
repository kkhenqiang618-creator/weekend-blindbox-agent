import rawPois from "./pois.json.ts" with { type: "json" };
import { normalizePois } from "./poiAdapter.ts";

export const pois = normalizePois(rawPois);
