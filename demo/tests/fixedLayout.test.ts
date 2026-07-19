import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/prototype.css', import.meta.url), 'utf8');

test('the app shell stays within the viewport and pages scroll inside it', () => {
  assert.match(css, /\.wb-phone\s*\{[^}]*height:\s*calc\(100dvh - 12px\)/s);
  assert.match(css, /\.wb-page\s*\{[^}]*height:\s*100%[^}]*overflow-y:\s*auto/s);
});

test('fixed step pages provide their own independently scrolling content area', () => {
  assert.match(css, /\.wb-fixed-page-scroll\s*\{[^}]*overflow-y:\s*auto/s);
});
