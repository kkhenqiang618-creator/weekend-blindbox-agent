import test from 'node:test';
import assert from 'node:assert/strict';
import { HOME_SHORTCUT_DESTINATIONS, MINE_DESTINATIONS, collectionBackLabel, routeEntryTarget, routeSaveTarget, savedRouteTarget, screenForMainTab } from '../src/navigation.ts';

test('route tab opens the route decision screen', () => {
  assert.equal(screenForMainTab('route'), 'route-entry');
});

test('route decision sends random and custom choices to distinct flows', () => {
  assert.equal(routeEntryTarget('random'), 'conditions');
  assert.equal(routeEntryTarget('custom'), 'favorite-places');
});

test('home actions have four distinct destinations', () => {
  assert.deepEqual(HOME_SHORTCUT_DESTINATIONS, {
    blindBox: 'conditions',
    popularRoutes: 'recent',
    favoriteCustom: 'favorite-places',
    recentRoutes: 'history-routes',
  });
  assert.equal(new Set(Object.values(HOME_SHORTCUT_DESTINATIONS)).size, 4);
});

test('every Mine action has a semantic destination', () => {
  assert.deepEqual(MINE_DESTINATIONS, {
    '历史路线': 'history-routes',
    '收藏地点': 'favorite-places',
    '收藏路线': 'favorite-routes',
    '我的发布': 'mine-posts',
    '我的点赞': 'mine-likes',
    '我的收藏': 'mine-saves',
    '偏好设置': 'preferences',
    '帮助与反馈': 'help-feedback',
  });
});

test('a route card keeps both its route id and return screen when opening details', () => {
  assert.deepEqual(savedRouteTarget('popular-sunset', 'recent'), {
    screen: 'custom-route-detail',
    routeId: 'popular-sunset',
    backTo: 'recent',
  });
});

test('personal route collections return to the surface that opened them', () => {
  assert.equal(collectionBackLabel('home'), '返回首页');
  assert.equal(collectionBackLabel('mine'), '返回我的');
  assert.equal(collectionBackLabel('route-entry'), '返回路线');
  assert.equal(collectionBackLabel('custom-route-detail'), '返回路线详情');
  assert.equal(collectionBackLabel('result'), '返回路线结果');
});

test('saving an edited route keeps the original itinerary return target', () => {
  assert.deepEqual(routeSaveTarget('custom-route-detail'), {
    screen: 'itinerary',
    itineraryBack: 'custom-route-detail',
  });
});
