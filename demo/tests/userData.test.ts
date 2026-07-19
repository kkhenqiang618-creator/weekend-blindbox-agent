import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addUserRoute,
  createEmptyUserData,
  loadUserData,
  saveUserData,
  toggleFavoritePlace,
  type StorageLike,
  type UserRouteRecord,
} from '../src/userData.ts';

function memoryStorage(): StorageLike {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
  };
}

const routeRecord: UserRouteRecord = {
  route: {
    id: 'generated-1',
    title: '我的第一条路线',
    duration: '3小时',
    tags: ['松弛'],
    image: '/route.webp',
    stopIds: ['poi-1'],
  },
  stops: [{ id: 'poi-1', name: '真实地点', type: '文化体验', time: '10:00–11:00', stay: 60, price: '¥0', district: '崇川区', note: '用户生成' }],
};

test('a first-time user starts with no personal history, favorites, or custom routes', () => {
  assert.deepEqual(loadUserData(memoryStorage()), createEmptyUserData());
});

test('real user data survives reload without importing showcase routes', () => {
  const storage = memoryStorage();
  const data = addUserRoute(createEmptyUserData(), 'historyRoutes', routeRecord);
  saveUserData(storage, data);

  assert.deepEqual(loadUserData(storage), data);
  assert.equal(loadUserData(storage).historyRoutes[0].route.title, '我的第一条路线');
});

test('favorite places accumulate only after the user explicitly favorites them', () => {
  const place = routeRecord.stops[0];
  const added = toggleFavoritePlace(createEmptyUserData(), place);
  assert.deepEqual(added.favoritePlaces.map((item) => item.id), ['poi-1']);
  assert.deepEqual(toggleFavoritePlace(added, place).favoritePlaces, []);
});

test('adding the same route updates it instead of duplicating history cards', () => {
  const once = addUserRoute(createEmptyUserData(), 'historyRoutes', routeRecord);
  const updated = { ...routeRecord, route: { ...routeRecord.route, title: '更新后的路线' } };
  const twice = addUserRoute(once, 'historyRoutes', updated);
  assert.equal(twice.historyRoutes.length, 1);
  assert.equal(twice.historyRoutes[0].route.title, '更新后的路线');
});
