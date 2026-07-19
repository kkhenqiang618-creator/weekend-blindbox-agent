import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildReplacementPreview,
  buildPlaceHighlights,
  getPlacePhotos,
  getTrustedRating,
  listNearbyStops,
} from '../src/placeDetails.ts';
import type { EditableStop } from '../src/routeEditing.ts';

const baseStop: EditableStop = {
  id: 'museum',
  name: '城市美术馆',
  type: '文化体验',
  time: '10:00–11:00',
  stay: 60,
  price: '¥0',
  district: '南山区',
  note: '展览空间安静，适合慢慢看。',
  tags: ['当代艺术', '室内'],
  lat: 22.50,
  lng: 113.90,
};

test('rating is visible only when it has a trusted real-data source', () => {
  assert.equal(getTrustedRating({ ...baseStop, rating: 4.8 }), null);
  assert.equal(getTrustedRating({ ...baseStop, rating: 4.7, ratingSource: 'amap' }), 4.7);
  assert.equal(getTrustedRating({ ...baseStop, rating: 8, ratingSource: 'amap' }), null);
});

test('place photos keep only unique non-empty real URLs', () => {
  assert.deepEqual(getPlacePhotos({
    ...baseStop,
    image: 'https://img.test/one.jpg',
    images: ['https://img.test/one.jpg', '', ' https://img.test/two.jpg '],
  }), ['https://img.test/one.jpg', 'https://img.test/two.jpg']);
});

test('highlights are grounded in the stop reason, tags, and location', () => {
  const highlights = buildPlaceHighlights(baseStop);
  assert.deepEqual(highlights, [
    '展览空间安静，适合慢慢看。',
    '当代艺术 · 室内',
    '位于南山区，适合安排为文化体验。',
  ]);
});

test('nearby stops exclude the active stop and sort by real distance', () => {
  const nearby = listNearbyStops([
    baseStop,
    { ...baseStop, id: 'far', name: '较远公园', lat: 22.60, lng: 114.10 },
    { ...baseStop, id: 'near', name: '附近书店', lat: 22.501, lng: 113.901 },
  ], 'museum');

  assert.deepEqual(nearby.map((item) => item.stop.id), ['near', 'far']);
  assert.ok((nearby[0].distanceKm ?? Infinity) < (nearby[1].distanceKm ?? 0));
  assert.ok(!nearby.some((item) => item.stop.id === 'museum'));
});

test('replacement preview carries introduction, multiple photos, and visit facts', () => {
  const preview = buildReplacementPreview({
    ...baseStop,
    image: 'https://img.test/cover.jpg',
    images: ['https://img.test/cover.jpg', 'https://img.test/inside.jpg', 'https://img.test/exhibit.jpg'],
    address: '湖东路66号',
    openTime: '09:00–17:00',
    rating: 4.8,
    ratingSource: 'amap',
  });

  assert.equal(preview.introduction, '展览空间安静，适合慢慢看。');
  assert.deepEqual(preview.photos, [
    'https://img.test/cover.jpg',
    'https://img.test/inside.jpg',
    'https://img.test/exhibit.jpg',
  ]);
  assert.deepEqual(preview.facts, {
    type: '文化体验',
    district: '南山区',
    price: '¥0',
    rating: 4.8,
    address: '湖东路66号',
    openTime: '09:00–17:00',
  });
});
