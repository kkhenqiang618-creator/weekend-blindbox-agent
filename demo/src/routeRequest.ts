export type RouteForm = {
  people: string;
  hours: string | number;
  budget: string | number;
  district: string;
  cross: boolean;
  note: string;
};

export type GenerationInput =
  | { mode: 'selection'; form: RouteForm; location?: UserLocation }
  | { mode: 'natural'; text: string; location?: UserLocation };

export type GenerationRequest = {
  rawText: string;
  quickSelections: Record<string, unknown>;
};

export function validateGenerationInput(input: GenerationInput): string | null {
  if (input.mode === 'natural' && input.text.trim().length < 6) {
    return '再多说一点你的周末计划吧';
  }
  if (input.mode === 'selection') {
    const durationHours = parseFiniteNumber(input.form.hours);
    if (durationHours === null || durationHours < 0.5 || durationHours > 12) {
      return '请输入 0.5–12 小时之间的时长';
    }
    const budget = parseFiniteNumber(input.form.budget);
    if (budget === null || budget < 0 || budget > 5000) {
      return '请输入 0–5000 元之间的人均预算';
    }
  }
  return null;
}

export function buildGenerationRequest(input: GenerationInput): GenerationRequest {
  const locationSelections = buildLocationSelections(input.location);
  if (input.mode === 'natural') {
    return { rawText: input.text.trim(), quickSelections: { ...locationSelections, inputMode: 'natural' } };
  }
  const { people, hours, budget, district, cross, note } = input.form;
  const durationHours = parseFiniteNumber(hours) ?? 4;
  const budgetMax = parseFiniteNumber(budget) ?? 200;
  return {
    rawText: `${people}，${durationHours}小时，预算${budgetMax}元，从${district}出发。${note}`,
    quickSelections: {
      ...locationSelections,
      inputMode: 'selection',
      people,
      durationHours,
      budget: budgetMax,
      district,
      allowCrossDistrict: cross,
    },
  };
}

export function selectPlanRouteSteps<T>(plan: { route: { steps: T[] } }, maxStops = 4): T[] {
  return plan.route.steps.slice(0, maxStops);
}

export async function requestGeneratedPlan<T>(fetcher: typeof fetch, input: GenerationInput, sessionId?: string): Promise<T> {
  const response = await fetcher('/api/generate-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...buildGenerationRequest(input),
      ...(sessionId ? { sessionId } : {}),
    }),
  });
  const payload = await response.json().catch(() => ({})) as T & { error?: unknown };
  if (!response.ok) {
    const message = typeof payload.error === 'string' && payload.error.trim()
      ? payload.error.trim()
      : '路线生成失败，请稍后重试。';
    throw new Error(message);
  }
  return payload;
}

function buildLocationSelections(location?: UserLocation): Record<string, unknown> {
  if (!location) return {};
  const selections: Record<string, unknown> = {};
  if (location.province) selections.province = location.province;
  if (location.city) selections.city = location.city;
  if (location.district) selections.district = location.district;
  if (Number.isFinite(location.lng) && Number.isFinite(location.lat)) {
    selections.currentLocation = { lng: location.lng, lat: location.lat };
  }
  return selections;
}

function parseFiniteNumber(value: string | number): number | null {
  if (typeof value === 'string' && !value.trim()) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
import type { UserLocation } from './location.ts';
