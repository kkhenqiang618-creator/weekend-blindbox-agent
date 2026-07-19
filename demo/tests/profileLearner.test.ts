import test from 'node:test';
import assert from 'node:assert/strict';

import { aggregateUserProfile, learnUserProfile } from '../../new-agent-a-module/src/agent/profileLearner.ts';

const NOW = new Date('2026-07-19T12:00:00.000Z');

const recentPlan = {
  created_at: '2026-07-18T12:00:00.000Z',
  district: '南山区',
  budget_max: 200,
  blind_box_theme: '城市散步疗愈盒',
  route_names: ['华侨城创意园'],
  route_types: ['文化体验'],
  total_minutes: 360,
  raw_plan: {
    route: {
      steps: [{ poi: { name: '华侨城创意园', type: '文化体验', tags: ['看展', '小众'], area: '南山区' } }],
    },
  },
};

test('strong favorite and confirmation signals outrank weak views', () => {
  const events = [
    {
      created_at: '2026-07-18T13:00:00.000Z',
      event_name: 'favorite_added',
      payload: { favoriteType: 'poi', poiName: '华侨城创意园', poiType: '文化体验', poiTags: ['看展', '小众'], district: '南山区' },
    },
    {
      created_at: '2026-07-18T14:00:00.000Z',
      event_name: 'poi_viewed',
      payload: { poiName: '咖啡店 A', poiType: '轻食甜饮' },
    },
    {
      created_at: '2026-07-18T15:00:00.000Z',
      event_name: 'route_confirmed',
      payload: { routeTypes: ['户外散步'], routeTags: ['夜景'], district: '福田区', routeTheme: '海边夜景盒', totalMinutes: 360, budgetMax: 200 },
    },
  ];

  const profile = aggregateUserProfile([recentPlan], events, NOW);

  assert.equal(profile.likedPoiTypes?.[0], '文化体验');
  assert.ok(profile.likedPoiTypes?.includes('户外散步'));
  assert.ok(profile.likedTags?.includes('看展'));
  assert.deepEqual(profile.favoritePoiNames, ['华侨城创意园']);
  assert.equal(profile.confirmedRouteCount, 1);
  assert.equal(profile.favoritePoiCount, 1);
  assert.deepEqual(profile.budgetRange, [140, 260]);
  assert.equal(profile.preferredRoutePace, 'relaxed');
});

test('signals older than thirty days are excluded', () => {
  const profile = aggregateUserProfile([], [{
    created_at: '2026-06-01T12:00:00.000Z',
    event_name: 'favorite_added',
    payload: { favoriteType: 'poi', poiName: '旧地点', poiType: '餐饮正餐' },
  }], NOW);

  assert.deepEqual(profile.favoritePoiNames, []);
  assert.deepEqual(profile.likedPoiTypes, []);
  assert.equal(profile.favoritePoiCount, 0);
});

test('replaced POI types become negative signals', () => {
  const profile = aggregateUserProfile([recentPlan], [{
    created_at: '2026-07-19T10:00:00.000Z',
    event_name: 'step_replaced',
    payload: { fromPoi: '旧餐厅', fromPoiType: '餐饮正餐' },
  }], NOW);

  assert.deepEqual(profile.dislikedPoiTypes, ['餐饮正餐']);
});

test('one generated plan alone is not treated as a learned preference', () => {
  const profile = aggregateUserProfile([recentPlan], [], NOW);
  assert.deepEqual(profile.likedPoiTypes, []);
  assert.deepEqual(profile.likedTags, []);
});

test('missing Supabase configuration and failed reads return an empty profile', async () => {
  const withoutConfig = await learnUserProfile('session-a', { supabaseUrl: '', serviceKey: '' });
  assert.deepEqual(withoutConfig.likedPoiTypes, []);

  const failedRead = await learnUserProfile('session-a', {
    supabaseUrl: 'https://example.supabase.co',
    serviceKey: 'service-key',
    fetcher: (async () => new Response('unavailable', { status: 503 })) as typeof fetch,
  });
  assert.deepEqual(failedRead.likedPoiTypes, []);
  assert.equal(failedRead.confirmedRouteCount, 0);
});
