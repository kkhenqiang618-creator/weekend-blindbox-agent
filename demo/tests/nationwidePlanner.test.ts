import test from 'node:test';
import assert from 'node:assert/strict';

import type { Plan, Poi, Requirements } from '../../new-agent-a-module/src/agent/types.ts';
import { generatePlan, handleReplan } from '../../new-agent-a-module/src/agent/orchestrator.ts';
import { pois } from '../../new-agent-a-module/src/data/pois.ts';
import { buildLiveRoute } from '../../new-agent-a-module/src/planner/liveRoutePlanner.ts';
import { buildAmapTextSearchUrl } from '../../new-agent-a-module/src/planner/llmReplanPlanner.ts';
import { getVenueComplexKey, isPoiNearRequestedDistrict } from '../../new-agent-a-module/src/planner/routeQualityRules.ts';

const baseRequirements: Requirements = {
  city: '',
  durationHours: 4,
  budgetMax: 300,
  peopleType: '朋友',
  preferences: ['咖啡'],
  constraints: [],
  timeText: '周末下午',
  rawText: '周末喝咖啡',
  inputMode: 'natural',
  allowCrossDistrict: false,
};

const basePoi: Poi = {
  id: 'poi-1',
  name: '湖边咖啡馆',
  type: '轻食甜饮',
  subType: '咖啡馆',
  area: '西湖区',
  businessDistrict: '湖滨',
  price: 40,
  tags: ['咖啡'],
  limits: [],
  fitPeople: ['朋友'],
  stayMinutes: 45,
  queueLevel: 'low',
  reason: '适合休息',
  lat: 30.25,
  lng: 120.16,
};

test('unknown nationwide districts require a text match instead of accepting every POI', () => {
  assert.equal(isPoiNearRequestedDistrict(basePoi, '西湖区'), true);
  assert.equal(isPoiNearRequestedDistrict({ ...basePoi, area: '余杭区', businessDistrict: '未来科技城' }, '西湖区'), false);
});

test('venue-complex deduplication works outside Shenzhen without merging unrelated places', () => {
  assert.equal(getVenueComplexKey('欢乐港湾摩天轮'), getVenueComplexKey('欢乐港湾商业街'));
  assert.equal(getVenueComplexKey('成都太古里南区'), getVenueComplexKey('成都太古里美术馆'));
  assert.notEqual(getVenueComplexKey('西湖公园'), getVenueComplexKey('西溪湿地公园'));
});

test('live search uses coordinates without an empty city restriction', async () => {
  const previousFetch = globalThis.fetch;
  const previousKey = process.env.AMAP_API_KEY;
  const calls: string[] = [];
  process.env.AMAP_API_KEY = 'test-amap-key';
  globalThis.fetch = (async (input: string | URL | Request) => {
    calls.push(String(input));
    return new Response(JSON.stringify({ status: '1', pois: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;

  try {
    await buildLiveRoute({
      ...baseRequirements,
      currentLocation: { lng: 120.16, lat: 30.25 },
    }, '周末轻松探索盒');

    assert.ok(calls.length > 0);
    for (const call of calls) {
      const url = new URL(call);
      assert.equal(url.searchParams.has('city'), false);
      assert.equal(url.searchParams.has('citylimit'), false);
      assert.equal(url.searchParams.get('location'), '120.16,30.25');
      assert.equal(url.searchParams.get('sortrule'), 'distance');
    }
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.AMAP_API_KEY;
    else process.env.AMAP_API_KEY = previousKey;
  }
});

test('live search strictly scopes a supplied city', async () => {
  const previousFetch = globalThis.fetch;
  const previousKey = process.env.AMAP_API_KEY;
  const calls: string[] = [];
  process.env.AMAP_API_KEY = 'test-amap-key';
  globalThis.fetch = (async (input: string | URL | Request) => {
    calls.push(String(input));
    return new Response(JSON.stringify({ status: '1', pois: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;

  try {
    await buildLiveRoute({ ...baseRequirements, city: '上海' }, '周末轻松探索盒');

    assert.ok(calls.length > 0);
    for (const call of calls) {
      const url = new URL(call);
      assert.equal(url.searchParams.get('city'), '上海');
      assert.equal(url.searchParams.get('citylimit'), 'true');
    }
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.AMAP_API_KEY;
    else process.env.AMAP_API_KEY = previousKey;
  }
});

test('replan text search only enables citylimit when a city is supplied', () => {
  const nationalUrl = buildAmapTextSearchUrl('test-key', '美术馆', baseRequirements);
  assert.equal(nationalUrl.searchParams.has('city'), false);
  assert.equal(nationalUrl.searchParams.has('citylimit'), false);

  const shanghaiUrl = buildAmapTextSearchUrl('test-key', '美术馆', { ...baseRequirements, city: '上海' });
  assert.equal(shanghaiUrl.searchParams.get('city'), '上海');
  assert.equal(shanghaiUrl.searchParams.get('citylimit'), 'true');
});

test('only Shenzhen may use the Shenzhen local POI fallback for generation or reroll', async () => {
  const previousFetch = globalThis.fetch;
  const previousAmapKey = process.env.AMAP_API_KEY;
  const previousDeepSeekKey = process.env.DEEPSEEK_API_KEY;
  const previousOpenAiKey = process.env.OPENAI_API_KEY;
  process.env.AMAP_API_KEY = 'test-amap-key';
  delete process.env.DEEPSEEK_API_KEY;
  delete process.env.OPENAI_API_KEY;
  globalThis.fetch = (async () => new Response(JSON.stringify({ status: '1', pois: [] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })) as typeof fetch;

  try {
    await assert.rejects(
      generatePlan({
        rawText: '上海周末喝咖啡',
        quickSelections: { inputMode: 'selection', city: '上海', district: '徐汇区' },
      }, { pois }),
      /暂时无法在上海生成真实路线/,
    );

    const shanghaiPlan = {
      requirements: { ...baseRequirements, city: '上海', district: '徐汇区' },
      blindBox: { theme: '周末轻松探索盒', title: '上海路线', tags: [], story: '', unlockText: '' },
      route: { totalMinutes: 60, totalBudget: 40, steps: [{ order: 1, role: 'break', poi: basePoi, note: '' }] },
      toolStatus: [],
      executionTasks: [],
      planB: null,
    } as Plan;
    await assert.rejects(
      handleReplan({ type: 'reroll', message: '换一条' }, shanghaiPlan, { pois }),
      /暂时无法在上海生成真实路线/,
    );

    const shenzhenPlan = await generatePlan({
      rawText: '深圳周末喝咖啡',
      quickSelections: { inputMode: 'selection', city: '深圳', district: '南山区' },
    }, { pois });
    assert.ok(shenzhenPlan.route.steps.length >= 2);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousAmapKey === undefined) delete process.env.AMAP_API_KEY;
    else process.env.AMAP_API_KEY = previousAmapKey;
    if (previousDeepSeekKey === undefined) delete process.env.DEEPSEEK_API_KEY;
    else process.env.DEEPSEEK_API_KEY = previousDeepSeekKey;
    if (previousOpenAiKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousOpenAiKey;
  }
});
