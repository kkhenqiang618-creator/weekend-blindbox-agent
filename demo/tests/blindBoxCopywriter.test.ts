import test from 'node:test';
import assert from 'node:assert/strict';
import { personalizeBlindBoxCopy } from '../../new-agent-a-module/src/agent/blindBoxCopywriter.ts';
import type { BlindBox, Requirements, Route } from '../../new-agent-a-module/src/agent/types.ts';

test('natural-language copywriter sends original words and final POI names to the model', async () => {
  let requestBody = '';
  const fetchMock: typeof fetch = async (_url, init) => {
    requestBody = String(init?.body || '');
    return new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({ title: '西湖安静艺文盒', story: '先去西湖美术馆安静看展，再到湖畔咖啡收尾。', tags: ['安静看展', '湖畔咖啡'] }) } }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  const requirements = {
    city: '杭州市', district: '西湖区', durationHours: 4, budgetMax: 200,
    peopleType: '朋友', preferences: ['文化', '咖啡'], constraints: ['安静'],
    timeText: '周六下午', rawText: '想安静看展，再喝一杯咖啡', inputMode: 'natural',
  } as Requirements;
  const route = {
    totalMinutes: 240, totalBudget: 180,
    steps: [
      { order: 1, role: 'activity', note: '', poi: { name: '西湖美术馆', type: '文化体验' } },
      { order: 2, role: 'break', note: '', poi: { name: '湖畔咖啡', type: '轻食甜饮' } },
    ],
  } as Route;
  const base = { theme: '城市艺文盒', title: '城市艺文盒', tags: ['文化'], story: '', unlockText: '' } as BlindBox;
  const result = await personalizeBlindBoxCopy(base, requirements, route, { apiKey: 'test-key' }, fetchMock);
  assert.match(requestBody, /想安静看展，再喝一杯咖啡/);
  assert.match(requestBody, /西湖美术馆/);
  assert.match(requestBody, /湖畔咖啡/);
  assert.equal(result.copySource, 'llm');
  assert.equal(result.story, '先去西湖美术馆安静看展，再到湖畔咖啡收尾。');
});
