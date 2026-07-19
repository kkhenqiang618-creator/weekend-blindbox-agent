import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const sourcePath = new URL('../src/WeekendBuddyPrototype.tsx', import.meta.url);
const cssPath = new URL('../src/prototype.css', import.meta.url);

test('preference screen is read-only and loads the learned profile', async () => {
  const source = await readFile(sourcePath, 'utf8');
  assert.match(source, /\/api\/user-profile\?sessionId=/);
  assert.match(source, /正在加载偏好/);
  assert.match(source, /你喜欢的类型/);
  assert.match(source, /系统帮你避开的/);
  assert.doesNotMatch(source, /group\('更想要的类型'/);
  assert.doesNotMatch(source, />恢复自动学习</);
  assert.doesNotMatch(source, />保存偏好</);
});

test('learned preference pills have positive and negative styles', async () => {
  const css = await readFile(cssPath, 'utf8');
  assert.match(css, /\.wb-pill-positive/);
  assert.match(css, /\.wb-pill-negative/);
  assert.match(css, /\.wb-pref-summary/);
});
