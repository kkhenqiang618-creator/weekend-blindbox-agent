import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPlaceFinderPayload, buildReplacementFinderPayload, integrateAddedStop, nextReplacementFlowStep, replaceStopAtIndex, requestPlaceCandidates, requestPlaceFinder, resolveCandidateForReplacement, resolvePoiImage, toggleCandidatePreview } from '../src/routeEditing.ts';

test('a POI without a real photo does not borrow an unrelated route image', () => {
  assert.equal(resolvePoiImage(undefined, '/assets/generated/route-dim-sum.webp'), undefined);
});

test('a newly added stop is inserted by route proximity and all times are resequenced', () => {
  const stops = [
    { id: 'a', name: 'A', type: '景点', time: '10:00–11:00', stay: 60, price: '¥0', district: '深圳', note: '', lat: 22.5, lng: 114.0 },
    { id: 'b', name: 'B', type: '咖啡', time: '11:20–12:20', stay: 60, price: '¥40', district: '深圳', note: '', lat: 22.5, lng: 114.2 },
  ];
  const added = { id: 'new', name: '新公园', type: '户外散步', time: '', stay: 45, price: '¥0', district: '深圳', note: '', lat: 22.5, lng: 114.1 };

  const result = integrateAddedStop(stops, added);
  assert.deepEqual(result.map((stop: { id: string }) => stop.id), ['a', 'new', 'b']);
  assert.deepEqual(result.map((stop: { time: string }) => stop.time), ['10:00–11:00', '11:20–12:05', '12:25–13:25']);
});

test('replacement updates the selected station instead of a hardcoded third station', () => {
  const stops = [
    { id: 'a', name: '第一站', type: '文化体验', time: '10:00–11:00', stay: 60, price: '¥0', district: '南山', note: '' },
    { id: 'b', name: '第二站', type: '户外散步', time: '11:20–12:20', stay: 60, price: '¥0', district: '南山', note: '' },
    { id: 'c', name: '第三站', type: '轻食甜饮', time: '12:40–13:40', stay: 60, price: '¥30', district: '南山', note: '' },
  ];
  const replacement = { ...stops[0], id: 'new', name: '新第二站', stay: 45 };

  const result = replaceStopAtIndex(stops, 1, replacement);
  assert.deepEqual(result.map((stop) => stop.id), ['a', 'new', 'c']);
  assert.deepEqual(result.map((stop) => stop.time), ['10:00–11:00', '11:20–12:05', '12:25–13:25']);
});

test('add and replace use the same live place finder request contract', () => {
  const location = { city: '深圳市', district: '南山区', lng: 113.9, lat: 22.5 };
  const route = { totalMinutes: 60, totalBudget: 0, steps: [] };

  assert.deepEqual(buildPlaceFinderPayload('文化体验', '  安静的小型美术馆  ', location, route), {
    type: '文化体验',
    customPrompt: '安静的小型美术馆',
    location,
    route,
  });
});

test('shared place finder posts to the live POI endpoint and returns the POI', async () => {
  let request: { url?: string; method?: string; body?: string } = {};
  const fetcher = (async (url: string | URL | Request, init?: RequestInit) => {
    request = { url: String(url), method: init?.method, body: String(init?.body) };
    return new Response(JSON.stringify({ poi: { id: 'live-1', name: '实时地点' } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;
  const payload = { type: '文化体验', customPrompt: '小型美术馆', location: {}, route: {} };

  const poi = await requestPlaceFinder<{ id: string; name: string }>(fetcher, payload);

  assert.equal(request.url, '/api/add-poi');
  assert.equal(request.method, 'POST');
  assert.deepEqual(JSON.parse(request.body || '{}'), payload);
  assert.deepEqual(poi, { id: 'live-1', name: '实时地点' });
});

test('replacement search explicitly requests three candidates', () => {
  const location = { city: '南通市', district: '崇川区' };
  const route = { steps: [] };

  assert.deepEqual(buildReplacementFinderPayload('文化体验', '安静一点', location, route), {
    type: '文化体验',
    customPrompt: '安静一点',
    location,
    route,
    limit: 3,
  });
});

test('replacement search returns all three live candidates for the user to choose', async () => {
  const candidates = [
    { id: 'live-1', name: '候选一' },
    { id: 'live-2', name: '候选二' },
    { id: 'live-3', name: '候选三' },
  ];
  const fetcher = (async () => new Response(JSON.stringify({ pois: candidates }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })) as typeof fetch;

  assert.deepEqual(await requestPlaceCandidates(fetcher, { limit: 3 }), candidates);
});

test('replacement search keeps one or two candidates instead of padding fake choices', async () => {
  const candidates = [
    { id: 'live-1', name: '候选一' },
    { id: 'live-2', name: '候选二' },
  ];
  const fetcher = (async () => new Response(JSON.stringify({ pois: candidates }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })) as typeof fetch;

  assert.deepEqual(await requestPlaceCandidates(fetcher, { limit: 3 }), candidates);
});

test('replacement search preserves the existing no-result error', async () => {
  const fetcher = (async () => new Response(JSON.stringify({ error: '没有找到合适地点' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  })) as typeof fetch;

  await assert.rejects(() => requestPlaceCandidates(fetcher, { limit: 3 }), /没有找到合适地点/);
});

test('clicking a candidate only toggles its preview', () => {
  assert.equal(toggleCandidatePreview(null, 'poi-1'), 'poi-1');
  assert.equal(toggleCandidatePreview('poi-1', 'poi-1'), null);
  assert.equal(toggleCandidatePreview('poi-1', 'poi-2'), 'poi-2');
});

test('replacement is resolved only from an explicitly confirmed candidate', () => {
  const candidates = [{ id: 'poi-1', name: '候选一' }, { id: 'poi-2', name: '候选二' }];
  assert.equal(resolveCandidateForReplacement(candidates, null), null);
  assert.deepEqual(resolveCandidateForReplacement(candidates, 'poi-2'), candidates[1]);
});

test('replacement flow uses separate search, results and preview pages', () => {
  assert.equal(nextReplacementFlowStep('search', 'search_succeeded'), 'results');
  assert.equal(nextReplacementFlowStep('results', 'open_candidate'), 'preview');
  assert.equal(nextReplacementFlowStep('preview', 'back'), 'results');
  assert.equal(nextReplacementFlowStep('results', 'back'), 'search');
  assert.equal(nextReplacementFlowStep('search', 'back'), 'search');
});
