import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../src/prototype.css', import.meta.url), 'utf8');
const assetUrl = new URL('../public/assets/route-entry/weekend-departure-stop.webp', import.meta.url);

function rule(selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))?.[1] ?? '';
}

test('route entry uses the approved project-local illustration', () => {
  assert.ok(fs.existsSync(assetUrl));
  const asset = fs.readFileSync(assetUrl);
  assert.equal(asset.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(asset.subarray(8, 12).toString('ascii'), 'WEBP');
  assert.ok(asset.byteLength < 400_000);
});

test('route illustration stays behind interactive content and anchors lower-right', () => {
  const page = rule('.wb-route-entry-page');
  const artwork = rule('.wb-route-entry-page::before');
  const foreground = rule('.wb-route-entry-page > *');

  assert.match(page, /position:\s*relative/);
  assert.match(page, /isolation:\s*isolate/);
  assert.match(page, /overflow:\s*hidden/);
  assert.match(artwork, /url\(['"]?\/assets\/route-entry\/weekend-departure-stop\.webp['"]?\)/);
  assert.match(artwork, /position:\s*absolute/);
  assert.match(artwork, /inset:\s*0/);
  assert.match(artwork, /background-position:\s*right bottom/);
  assert.match(artwork, /background-size:\s*cover/);
  assert.match(artwork, /pointer-events:\s*none/);
  assert.match(artwork, /transform:\s*translateY\(clamp\(72px,\s*8\.5vh,\s*84px\)\)/);
  assert.match(foreground, /position:\s*relative/);
  assert.match(foreground, /z-index:\s*1/);
});

test('route choice cards reuse the illustration palette without saturated panels', () => {
  const random = rule('.wb-route-entry-option.random');
  const custom = rule('.wb-route-entry-option.custom');
  const randomIcon = rule('.wb-route-entry-option.random .wb-route-entry-icon');
  const customIcon = rule('.wb-route-entry-option.custom .wb-route-entry-icon');

  assert.match(random, /border-color:\s*#e2c66f/);
  assert.match(random, /background:\s*rgba\(255,\s*252,\s*241,\s*\.96\)/);
  assert.match(custom, /border-color:\s*#9ebcd0/);
  assert.match(custom, /background:\s*rgba\(240,\s*247,\s*250,\s*\.96\)/);
  assert.match(randomIcon, /background:\s*#fff3bd/);
  assert.match(customIcon, /background:\s*#e4f1f7/);
});
