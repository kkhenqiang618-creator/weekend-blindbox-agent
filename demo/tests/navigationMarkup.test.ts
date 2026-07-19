import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/WeekendBuddyPrototype.tsx', import.meta.url), 'utf8');

test('page headers do not render focusable empty action buttons', () => {
  assert.match(source, /action && onAction/);
});

test('community icon navigation has explicit destinations', () => {
  assert.match(source, /aria-label="搜索社区"/);
  assert.match(source, /aria-label="查看消息"/);
});
