import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HOME_CAROUSEL_FADE_MS,
  HOME_CAROUSEL_INTERVAL_MS,
  HOME_CAROUSEL_SCENES,
  HOME_SHORTCUTS,
  nextHomeSceneIndex,
  shouldAutoplayHomeCarousel,
} from '../src/homeCarousel.ts';

test('home carousel timing and scene order are stable', () => {
  assert.equal(HOME_CAROUSEL_INTERVAL_MS, 6000);
  assert.equal(HOME_CAROUSEL_FADE_MS, 600);
  assert.equal(HOME_CAROUSEL_SCENES.length, 3);
  assert.equal(nextHomeSceneIndex(2, 3), 0);
});

test('home carousel stops for reduced motion or hidden pages', () => {
  assert.equal(shouldAutoplayHomeCarousel(true, 'visible'), false);
  assert.equal(shouldAutoplayHomeCarousel(false, 'hidden'), false);
  assert.equal(shouldAutoplayHomeCarousel(false, 'visible'), true);
});

test('home carousel metadata is complete and optimized', () => {
  assert.equal(new Set(HOME_CAROUSEL_SCENES.map((scene) => scene.id)).size, HOME_CAROUSEL_SCENES.length);
  assert.ok(HOME_CAROUSEL_SCENES.every((scene) => scene.alt.trim().length > 0));
  assert.ok(HOME_CAROUSEL_SCENES.every((scene) => scene.src.endsWith('.webp')));
  assert.equal(HOME_CAROUSEL_SCENES[0].src, '/assets/home-carousel/weekend-picnic-neutral.webp');
  assert.ok(HOME_CAROUSEL_SCENES.every((scene) => scene.src.includes('-neutral.webp')));
});

test('home shortcut labels are distinct and ordered', () => {
  assert.deepEqual(HOME_SHORTCUTS, [
    { id: 'popularRoutes', label: '热门路线', icon: 'star' },
    { id: 'favoriteCustom', label: '收藏定制', icon: 'route-nodes' },
    { id: 'recentRoutes', label: '最近路线', icon: 'history' },
  ]);
  assert.equal(new Set(HOME_SHORTCUTS.map((shortcut) => shortcut.id)).size, 3);
});
