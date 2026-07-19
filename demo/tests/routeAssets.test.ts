import test from 'node:test';
import assert from 'node:assert/strict';
import { CUSTOM_ROUTES, POPULAR_ROUTES, findSavedRoute, routeCollectionCardClass, routeCollectionLayout, selectAssetsByIds } from '../src/routeAssets.ts';

test('each custom route has a stable id and resolves independently', () => {
  assert.equal(new Set(CUSTOM_ROUTES.map((route) => route.id)).size, CUSTOM_ROUTES.length);
  assert.equal(findSavedRoute(CUSTOM_ROUTES[1].id)?.title, CUSTOM_ROUTES[1].title);
});

test('saved routes carry route-specific stop collections', () => {
  assert.ok(CUSTOM_ROUTES.every((route) => route.stopIds.length >= 2));
  assert.ok(POPULAR_ROUTES.every((route) => route.id && route.stopIds.length >= 2));
  assert.notDeepEqual(CUSTOM_ROUTES[0].stopIds, CUSTOM_ROUTES[1].stopIds);
});

test('popular and recent route cards resolve to their own route details', () => {
  assert.equal(findSavedRoute(POPULAR_ROUTES[0].id)?.title, POPULAR_ROUTES[0].title);
  assert.notDeepEqual(findSavedRoute(POPULAR_ROUTES[0].id)?.stopIds, findSavedRoute(POPULAR_ROUTES[1].id)?.stopIds);
});

test('route collections and favorite selection share one card style contract', () => {
  assert.equal(routeCollectionCardClass(), 'wb-route-gallery-card');
  assert.equal(routeCollectionCardClass(true), 'wb-route-gallery-card selected');
});

test('favorite-place selection returns only chosen places in chosen order', () => {
  const places = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  assert.deepEqual(selectAssetsByIds(places, ['c', 'a']).map((place) => place.id), ['c', 'a']);
});

test('Mine uses horizontal cards while More stays vertical', () => {
  assert.equal(routeCollectionLayout('mine'), 'horizontal');
  assert.equal(routeCollectionLayout('more'), 'vertical');
});
