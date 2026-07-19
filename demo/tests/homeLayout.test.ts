import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../src/prototype.css', import.meta.url), 'utf8');
const source = fs.readFileSync(new URL('../src/WeekendBuddyPrototype.tsx', import.meta.url), 'utf8');

function rule(selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))?.[1] ?? '';
}

test('home hero stays edge-to-edge on tall phones', () => {
  const baseHero = rule('.wb-home-hero');
  const shortScreen = css.match(/@media\s*\(max-height:\s*700px\)\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
  const tallScreen = css.match(/@media\s*\(min-height:\s*900px\)\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';

  assert.match(baseHero, /width:\s*calc\(100% \+ \(var\(--page-gutter\) \* 2\)\)/);
  assert.match(baseHero, /margin:\s*0 calc\(var\(--page-gutter\) \* -1\)/);
  assert.doesNotMatch(shortScreen, /\.wb-home-hero\s*\{[^}]*width:\s*100%/);
  assert.doesNotMatch(tallScreen, /\.wb-home-hero\s*\{[^}]*width:\s*100%/);
});

test('home reuses the shared warm-paper canvas', () => {
  const home = rule('.wb-phone.is-home .wb-home');
  const homeNav = rule('.wb-phone.is-home .wb-bottom-nav');
  const shortcut = rule('.wb-home-shortcut');

  assert.match(home, /background:\s*linear-gradient\(90deg,\s*#fffdf8 0,\s*#fffefa 52%,\s*#fffaf0 100%\)/);
  assert.match(homeNav, /background:\s*#fffdf7f2/);
  assert.match(shortcut, /background:\s*#fffefa/);
});

test('home actions use light paper surfaces with localized color accents', () => {
  const manualLocation = rule('.wb-manual-location-trigger');
  const primaryAction = rule('.wb-home-cta');
  const primaryIcon = rule('.wb-home-cta > .wb-icon');
  const primaryArrow = rule('.wb-home-cta b');
  const shortcut = rule('.wb-home-shortcut');
  const shortcutIcon = rule('.wb-home-shortcut i');

  assert.match(manualLocation, /display:\s*inline-flex/);
  assert.match(manualLocation, /border-radius:\s*999px/);
  assert.doesNotMatch(manualLocation, /text-decoration:\s*underline/);
  assert.match(primaryAction, /background:\s*rgba\(255,\s*250,\s*238,\s*\.9\)/);
  assert.match(primaryAction, /border:\s*1px solid #e5c66e/);
  assert.doesNotMatch(primaryAction, /0 4px 0/);
  assert.match(primaryIcon, /border-radius:\s*50%/);
  assert.match(primaryArrow, /border-radius:\s*14px/);
  assert.match(shortcut, /min-height:\s*clamp\(112px,\s*14vh,\s*142px\)/);
  assert.match(shortcutIcon, /width:\s*50px/);
});

test('home images do not send unsupported React DOM properties', () => {
  assert.doesNotMatch(source, /fetchPriority=/);
});
