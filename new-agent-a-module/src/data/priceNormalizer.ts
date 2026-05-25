export function normalizeMockPrice(type: string, rawPrice: string | number, id = ""): number {
  if (typeof rawPrice === "number" && Number.isFinite(rawPrice)) return rawPrice;

  const text = String(rawPrice).replace(/\s/g, "");
  const bucket = parsePriceBucket(text);
  const [min, max] = getRangeByType(type, bucket);
  return stableNumberInRange(id || `${type}-${text}`, min, max);
}

type PriceBucket = "le50" | "le150" | "gt150" | "unknown";

function parsePriceBucket(text: string): PriceBucket {
  if (/<=?50|≤50|50以内|price<=50/.test(text)) return "le50";
  if (/<=?150|≤150|150以内|price<=150/.test(text)) return "le150";
  if (/>150|150以上|price>150/.test(text)) return "gt150";
  return "unknown";
}

function getRangeByType(type: string, bucket: PriceBucket): [number, number] {
  const ranges: Record<string, Record<PriceBucket, [number, number]>> = {
    餐饮正餐: {
      le50: [35, 50],
      le150: [70, 140],
      gt150: [160, 260],
      unknown: [60, 120]
    },
    轻食甜饮: {
      le50: [18, 45],
      le150: [50, 90],
      gt150: [150, 220],
      unknown: [25, 70]
    },
    文化体验: {
      le50: [0, 50],
      le150: [60, 120],
      gt150: [160, 260],
      unknown: [30, 100]
    },
    户外散步: {
      le50: [0, 30],
      le150: [40, 100],
      gt150: [150, 220],
      unknown: [0, 50]
    },
    休闲娱乐: {
      le50: [30, 50],
      le150: [70, 140],
      gt150: [180, 300],
      unknown: [80, 180]
    },
    拍照地标: {
      le50: [0, 50],
      le150: [50, 120],
      gt150: [160, 260],
      unknown: [0, 80]
    }
  };

  return ranges[type]?.[bucket] ?? [30, 120];
}

function stableNumberInRange(seed: string, min: number, max: number): number {
  if (min === max) return min;
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return min + (hash % (max - min + 1));
}
