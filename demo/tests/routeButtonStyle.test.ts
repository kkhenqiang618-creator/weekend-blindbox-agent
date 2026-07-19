import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/prototype.css', import.meta.url), 'utf8');

test('route actions use soft pill-shaped controls instead of rectangular buttons', () => {
  assert.match(css, /\.wb-primary, \.wb-secondary, \.wb-soft-cta\s*\{[^}]*border-radius:\s*999px/s);
  assert.match(css, /\.wb-route-entry-option\s*\{[^}]*border-radius:\s*24px/s);
  assert.match(css, /\.wb-mode-tabs\s*\{[^}]*border-radius:\s*24px/s);
  assert.match(css, /\.wb-natural-examples button\s*\{[^}]*border-radius:\s*18px/s);
});

test('empty personal collections keep the route-card visual language', () => {
  assert.match(css, /\.wb-empty-route-card\s*\{[^}]*border-radius:\s*2[0-9]px/s);
});
