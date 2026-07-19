import type { Poi, Route } from '../types';

type PriceRange = {
  min: number;
  max: number;
  uncertain?: boolean;
};

function parsePriceRange(poi: Poi): PriceRange {
  const label = poi.priceLevel || '';
  const numbers = label.match(/\d+/g)?.map(Number).filter((value) => Number.isFinite(value)) ?? [];

  if (/免费/.test(label) && numbers.length === 0) return { min: 0, max: 0, uncertain: true };
  if (/免费/.test(label) && numbers.length >= 1) return { min: 0, max: numbers[numbers.length - 1], uncertain: true };
  if (numbers.length >= 2) return { min: numbers[0], max: numbers[1] };
  if (/price_le_/.test(label) || /以内|以下/.test(label)) {
    const max = numbers[0] ?? poi.price ?? 0;
    return { min: 0, max };
  }
  if (/plus|以上/.test(label)) {
    const min = numbers[0] ?? poi.price ?? 0;
    return { min, max: Math.max(min, poi.price || min) };
  }
  if (poi.price === 0) return { min: 0, max: 0, uncertain: true };
  return { min: poi.price, max: poi.price };
}

export function getRouteBudgetRange(route: Route): PriceRange {
  return route.steps.reduce<PriceRange>((sum, step) => {
    const range = parsePriceRange(step.poi);
    return {
      min: sum.min + range.min,
      max: sum.max + range.max,
      uncertain: sum.uncertain || range.uncertain,
    };
  }, { min: 0, max: 0, uncertain: false });
}

export function formatRouteBudget(route: Route): string {
  const range = getRouteBudgetRange(route);
  if (range.max === 0) return '免费/现场为准';
  if (range.min === range.max) return `约¥${range.max}/人`;
  return `约¥${range.min}-${range.max}/人`;
}

export function getBudgetExplainText(route: Route): string {
  const range = getRouteBudgetRange(route);
  if (range.max === 0) return '公共空间或免费场所较多，实际以现场为准';
  return '按每站人均预估区间相加';
}
