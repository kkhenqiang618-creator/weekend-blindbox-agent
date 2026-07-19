import test from 'node:test';
import assert from 'node:assert/strict';
import { buildResultPresentation, resolvePoiDistrict } from '../src/resultPresentation.ts';
import type { Plan } from '../src/types.ts';

const plan = {
  requirements: { city: '杭州市', district: '西湖区', durationHours: 4, budgetMax: 200, peopleType: '朋友', preferences: ['文化', '咖啡'], constraints: [], timeText: '周六下午', parseMethod: 'rules' },
  blindBox: { theme: '城市艺文盒', title: '西湖艺文慢游盒', tags: ['文化', '咖啡'], story: '听懂了，你想安静看展再喝杯咖啡。', unlockText: '已匹配路线。' },
  route: { totalMinutes: 240, totalBudget: 180, steps: [] },
  toolStatus: [],
} as Plan;

test('natural-language result uses Plan copy and preserves the original words', () => {
  const result = buildResultPresentation(plan, {
    mode: 'natural',
    text: '周六下午想找安静的展览和咖啡',
  }, 3);
  assert.equal(result.title, '西湖艺文慢游盒');
  assert.equal(result.story, '听懂了，你想安静看展再喝杯咖啡。');
  assert.equal(result.quote, '周六下午想找安静的展览和咖啡');
  assert.deepEqual(result.tags, ['文化', '咖啡']);
});

test('fallback result copy is contextual rather than fixed to Nanshan', () => {
  const result = buildResultPresentation(null, {
    mode: 'natural',
    text: '成都一个人逛书店吃小吃',
  }, 3);
  assert.doesNotMatch(`${result.title}${result.story}`, /南山|适合两个人慢慢逛/);
  assert.match(result.story, /成都一个人逛书店吃小吃/);
});

test('a POI with no area stays unknown instead of being mislabeled as Shenzhen', () => {
  assert.equal(resolvePoiDistrict({ area: '', businessDistrict: '' }), '');
  assert.equal(resolvePoiDistrict({ area: '徐汇区', businessDistrict: '衡山路' }), '徐汇区');
});
