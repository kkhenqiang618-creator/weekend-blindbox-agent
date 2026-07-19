import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPoiSearchQueries } from '../../api-src/add-poi.ts';
import addPoiHandler from '../../api-src/add-poi.ts';

test('custom POI prompt is searched first in the actual city', () => {
  const queries = buildPoiSearchQueries('文化体验', '安静的小型美术馆，不要热门大展', '杭州市', '西湖区');
  assert.equal(queries[0].keyword, '安静的小型美术馆，不要热门大展');
  assert.equal(queries[0].city, '杭州市');
  assert.equal(queries[0].district, '西湖区');
  assert.ok(queries.slice(1).some((query) => query.keyword === '美术馆'));
  assert.ok(queries.every((query) => query.city !== '深圳'));
});

test('empty custom prompt falls back to type keywords', () => {
  const queries = buildPoiSearchQueries('轻食甜饮', '   ', '成都市', '锦江区');
  assert.equal(queries[0].keyword, '咖啡');
  assert.equal(queries[0].city, '成都市');
});

test('short meal label maps to meal search keywords', () => {
  const queries = buildPoiSearchQueries('正餐', '', '广州市', '天河区');
  assert.equal(queries[0].keyword, '本地小吃');
});

test('add-place search never falls back to Shenzhen for another city', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.AMAP_API_KEY;
  const requestedUrls: string[] = [];
  process.env.AMAP_API_KEY = 'test-key';
  globalThis.fetch = (async (input: string | URL | Request) => {
    requestedUrls.push(String(input));
    return new Response(JSON.stringify({ status: '1', pois: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;

  const res = {
    setHeader() {},
    status() { return this; },
    json() {},
  };

  try {
    await addPoiHandler({
      method: 'POST',
      body: { type: '文化体验', location: { city: '上海市' }, route: { steps: [] } },
    }, res);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.AMAP_API_KEY;
    else process.env.AMAP_API_KEY = originalKey;
  }

  assert.ok(requestedUrls.length > 0);
  assert.ok(requestedUrls.every((url) => !decodeURIComponent(url).includes('深圳')));
  assert.ok(requestedUrls.every((url) => url.includes('city=' + encodeURIComponent('上海市'))));
});

test('added POI description talks about the place instead of exposing system mechanics', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.AMAP_API_KEY;
  process.env.AMAP_API_KEY = 'test-key';
  globalThis.fetch = (async () => new Response(JSON.stringify({
    status: '1',
    pois: [{
      id: 'poi-1', name: '叶屋西社区公园', type: '风景名胜;公园广场;公园',
      adname: '福田区', business_area: '华强北', location: '114.08,22.55', photos: [],
    }],
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch;

  let statusCode = 0;
  let payload: { poi?: { reason?: string } } = {};
  const res = {
    setHeader() {},
    status(code: number) { statusCode = code; return this; },
    json(value: typeof payload) { payload = value; },
  };

  try {
    await addPoiHandler({
      method: 'POST',
      body: {
        type: '户外散步',
        customPrompt: '想去安静一点的公园散步',
        location: { city: '深圳市', district: '福田区' },
        route: { steps: [] },
      },
    }, res);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.AMAP_API_KEY;
    else process.env.AMAP_API_KEY = originalKey;
  }

  assert.equal(statusCode, 200);
  assert.match(payload.poi?.reason || '', /叶屋西社区公园/);
  assert.match(payload.poi?.reason || '', /福田区|华强北/);
  assert.doesNotMatch(payload.poi?.reason || '', /高德实时补入|根据你选择/);
});

test('added POI keeps only a real AMap rating and all real photos', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.AMAP_API_KEY;
  process.env.AMAP_API_KEY = 'test-key';
  globalThis.fetch = (async () => new Response(JSON.stringify({
    status: '1',
    pois: [{
      id: 'poi-rated', name: '真实地点', type: '科教文化服务;美术馆',
      adname: '南山区', location: '113.9,22.5', biz_ext: { rating: '4.7', cost: '38.0' },
      photos: [{ url: 'https://img.test/a.jpg' }, { url: 'https://img.test/b.jpg' }],
    }],
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch;

  let payload: { poi?: { meituanRating?: number; ratingSource?: string; reviewCount?: number; photoUrl?: string; photoUrls?: string[]; price?: number } } = {};
  const res = {
    setHeader() {},
    status() { return this; },
    json(value: typeof payload) { payload = value; },
  };

  try {
    await addPoiHandler({
      method: 'POST',
      body: { type: '文化体验', location: { city: '深圳市', district: '南山区' }, route: { steps: [] } },
    }, res);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.AMAP_API_KEY;
    else process.env.AMAP_API_KEY = originalKey;
  }

  assert.equal(payload.poi?.meituanRating, 4.7);
  assert.equal(payload.poi?.ratingSource, 'amap');
  assert.equal(payload.poi?.reviewCount, undefined);
  assert.equal(payload.poi?.price, 38);
  assert.equal(payload.poi?.photoUrl, 'https://img.test/a.jpg');
  assert.deepEqual(payload.poi?.photoUrls, ['https://img.test/a.jpg', 'https://img.test/b.jpg']);
});

test('added POI does not invent a rating when AMap omits it', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.AMAP_API_KEY;
  process.env.AMAP_API_KEY = 'test-key';
  globalThis.fetch = (async () => new Response(JSON.stringify({
    status: '1',
    pois: [{ id: 'poi-unrated', name: '无评分地点', type: '风景名胜;公园', adname: '福田区', location: '114.1,22.5' }],
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch;

  let payload: { poi?: { meituanRating?: number; ratingSource?: string; reviewCount?: number } } = {};
  const res = {
    setHeader() {},
    status() { return this; },
    json(value: typeof payload) { payload = value; },
  };

  try {
    await addPoiHandler({
      method: 'POST',
      body: { type: '户外散步', location: { city: '深圳市', district: '福田区' }, route: { steps: [] } },
    }, res);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.AMAP_API_KEY;
    else process.env.AMAP_API_KEY = originalKey;
  }

  assert.equal(payload.poi?.meituanRating, undefined);
  assert.equal(payload.poi?.ratingSource, undefined);
  assert.equal(payload.poi?.reviewCount, undefined);
});

test('replacement search returns three distinct candidates instead of auto-selecting one', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.AMAP_API_KEY;
  process.env.AMAP_API_KEY = 'test-key';
  globalThis.fetch = (async () => new Response(JSON.stringify({
    status: '1',
    pois: [
      { id: 'candidate-1', name: '候选地点一', type: '科教文化服务;美术馆', adname: '崇川区', location: '120.86,32.01' },
      { id: 'candidate-2', name: '候选地点二', type: '科教文化服务;博物馆', adname: '崇川区', location: '120.87,32.02' },
      { id: 'candidate-3', name: '候选地点三', type: '科教文化服务;书店', adname: '崇川区', location: '120.88,32.03' },
    ],
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch;

  let statusCode = 0;
  let payload: { pois?: Array<{ id?: string; name?: string }>; poi?: { id?: string } } = {};
  const res = {
    setHeader() {},
    status(code: number) { statusCode = code; return this; },
    json(value: typeof payload) { payload = value; },
  };

  try {
    await addPoiHandler({
      method: 'POST',
      body: {
        type: '文化体验',
        limit: 3,
        location: { city: '南通市', district: '崇川区' },
        route: { steps: [] },
      },
    }, res);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.AMAP_API_KEY;
    else process.env.AMAP_API_KEY = originalKey;
  }

  assert.equal(statusCode, 200);
  assert.equal(payload.poi, undefined);
  assert.deepEqual(payload.pois?.map((poi) => poi.name), ['候选地点一', '候选地点二', '候选地点三']);
});
