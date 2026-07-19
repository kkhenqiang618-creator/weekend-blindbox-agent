import type { GenerationInput } from './routeRequest.ts';
import type { Plan } from './types.ts';

export function resolvePoiDistrict(poi: { area?: string; businessDistrict?: string }): string {
  return [poi.area, poi.businessDistrict]
    .find((value) => typeof value === 'string' && value.trim())
    ?.trim() || '';
}

export type ResultPresentation = {
  title: string;
  story: string;
  tags: string[];
  quote?: string;
};

export function buildResultPresentation(plan: Plan | null, input: GenerationInput | null, stopCount: number): ResultPresentation {
  const quote = input?.mode === 'natural' ? input.text.trim() : undefined;
  const fallbackFocus = input?.mode === 'natural'
    ? `我根据“${input.text.trim()}”安排了 ${stopCount} 个地点，并兼顾路线顺序和停留节奏。`
    : `已根据你选择的条件安排 ${stopCount} 个地点，并兼顾时间、预算和移动距离。`;
  return {
    title: plan?.blindBox?.title || '为你准备的周末路线',
    story: plan?.blindBox?.story || fallbackFocus,
    tags: plan?.blindBox?.tags?.filter(Boolean).slice(0, 4) || [],
    quote,
  };
}
