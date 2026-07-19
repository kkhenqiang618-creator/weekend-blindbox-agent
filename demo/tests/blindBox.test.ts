import test from 'node:test';
import assert from 'node:assert/strict';
import { composeBlindBox } from '../../new-agent-a-module/src/agent/blindBox.ts';
import type { Requirements, Route } from '../../new-agent-a-module/src/agent/types.ts';

test('selection blind-box story uses system opening copy without conversational acknowledgement', () => {
  const requirements = {
    city: '杭州', durationHours: 4, budgetMax: 200, peopleType: '朋友',
    preferences: ['拍照', '咖啡'], constraints: [], timeText: '周六下午',
    rawText: '2人，半天，预算200元，从西湖区出发。',
    inputMode: 'selection',
  } as Requirements;
  const route = {
    totalMinutes: 240, totalBudget: 180,
    steps: [{ order: 1, role: 'activity', note: '', poi: { name: '西湖美术馆' } }],
  } as Route;
  const blindBox = composeBlindBox('小众拍照吃货盒', route, requirements, []);
  assert.doesNotMatch(blindBox.story, /听懂了/);
  assert.match(blindBox.story, /开出|随机|本次/);
});
