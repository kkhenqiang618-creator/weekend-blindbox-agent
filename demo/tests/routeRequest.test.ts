import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildGenerationRequest,
  requestGeneratedPlan,
  selectPlanRouteSteps,
  validateGenerationInput,
} from '../src/routeRequest.ts';

test('natural-language mode requires a meaningful description', () => {
  assert.equal(validateGenerationInput({ mode: 'natural', text: '周末' }), '再多说一点你的周末计划吧');
});

test('natural-language mode preserves the raw user description', () => {
  const body = buildGenerationRequest({ mode: 'natural', text: '周六下午两个人看海，预算每人200元' });
  assert.equal(body.rawText, '周六下午两个人看海，预算每人200元');
  assert.deepEqual(body.quickSelections, { inputMode: 'natural' });
});

test('generation request identifies selection and natural modes', () => {
  const natural = buildGenerationRequest({ mode: 'natural', text: '周六下午两个人看海，预算每人200元' });
  const selection = buildGenerationRequest({
    mode: 'selection',
    form: { people: '2人', hours: '4', budget: '200', district: '南山区', cross: true, note: '' },
  });
  assert.equal(natural.quickSelections.inputMode, 'natural');
  assert.equal(selection.quickSelections.inputMode, 'selection');
});

test('generation request carries actual city, district, and coordinates', () => {
  const body = buildGenerationRequest({
    mode: 'natural',
    text: '周六下午想找安静的展览和咖啡',
    location: { province: '浙江省', city: '杭州市', district: '西湖区', label: '浙江省杭州市西湖区', lng: 120.1551, lat: 30.2741, status: 'resolved' },
  });
  assert.equal(body.quickSelections.province, '浙江省');
  assert.equal(body.quickSelections.city, '杭州市');
  assert.equal(body.quickSelections.district, '西湖区');
  assert.deepEqual(body.quickSelections.currentLocation, { lng: 120.1551, lat: 30.2741 });
});

test('selection mode builds raw text and structured selections', () => {
  const body = buildGenerationRequest({
    mode: 'selection',
    form: { people: '2人', hours: '4.5', budget: '0', district: '南山区', cross: true, note: '' },
  });
  assert.match(body.rawText, /2人/);
  assert.match(body.rawText, /4.5小时/);
  assert.match(body.rawText, /预算0元/);
  assert.equal(body.quickSelections.district, '南山区');
  assert.equal(body.quickSelections.durationHours, 4.5);
  assert.equal(body.quickSelections.budget, 0);
  assert.equal('preferences' in body.quickSelections, false);
  assert.equal('duration' in body.quickSelections, false);
});

test('selection mode validates the numeric duration range', () => {
  const base = { people: '2人', budget: '200', district: '南山区', cross: true, note: '' };
  assert.equal(
    validateGenerationInput({ mode: 'selection', form: { ...base, hours: '' } }),
    '请输入 0.5–12 小时之间的时长',
  );
  assert.equal(
    validateGenerationInput({ mode: 'selection', form: { ...base, hours: '12.5' } }),
    '请输入 0.5–12 小时之间的时长',
  );
});

test('selection mode accepts zero budget and rejects values above the limit', () => {
  const base = { people: '2人', hours: '4', district: '南山区', cross: true, note: '' };
  assert.equal(validateGenerationInput({ mode: 'selection', form: { ...base, budget: '0' } }), null);
  assert.equal(
    validateGenerationInput({ mode: 'selection', form: { ...base, budget: '5001' } }),
    '请输入 0–5000 元之间的人均预算',
  );
});

test('a partial real route is not padded with fallback stops', () => {
  const steps = [{ poi: { id: 'sh-1' } }, { poi: { id: 'sh-2' } }];
  assert.deepEqual(selectPlanRouteSteps({ route: { steps } }), steps);
});

test('generation request exposes the API error instead of fabricating a fallback route', async () => {
  const fetcher = (async () => new Response(JSON.stringify({
    error: '暂时无法在上海生成真实路线，请稍后重试或更换区域。',
  }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  })) as typeof fetch;

  await assert.rejects(
    requestGeneratedPlan(fetcher, { mode: 'natural', text: '周末去上海徐汇区喝咖啡' }),
    /暂时无法在上海生成真实路线/,
  );
});

test('generation request sends the anonymous session id', async () => {
  let requestBody: Record<string, unknown> = {};
  const fetcher = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    requestBody = JSON.parse(String(init?.body || '{}')) as Record<string, unknown>;
    return new Response(JSON.stringify({ route: { steps: [] } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;

  await requestGeneratedPlan(fetcher, { mode: 'natural', text: '周六下午两个人去看展览' }, 'session-123');

  assert.equal(requestBody.sessionId, 'session-123');
});
