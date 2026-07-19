import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/WeekendBuddyPrototype.tsx', import.meta.url), 'utf8');

test('a new account does not receive fake personal notifications', () => {
  assert.match(source, /暂时没有消息/);
  assert.doesNotMatch(source, /湾区漫游点赞了你的路线收藏/);
});

test('the publish composer opens as a blank draft instead of someone else’s post', () => {
  assert.match(source, /useState\(''\)/);
  assert.doesNotMatch(source, /defaultValue="南山小村数乡吃喝玩/);
});
