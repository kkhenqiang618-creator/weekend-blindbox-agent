import test from 'node:test';
import assert from 'node:assert/strict';

import {
  confirmRouteReview,
  createRouteReviewSession,
  recordPoiView,
  recordRouteInteraction,
  shouldTrackRouteAbandoned,
} from '../src/routeReviewTracking.ts';
import {
  buildFavoriteAddedPayload,
  buildRouteConfirmedPayload,
  buildStepReplacedPayload,
  sanitizeQuickSelections,
} from '../src/utils/tracker.ts';

test('POI view is tracked only when the user actually opens it and only once', () => {
  const initial = createRouteReviewSession(['a', 'b'], 1000);
  assert.equal(initial.routeId, 'a|b');
  assert.equal(initial.viewedPoiIds.size, 0);

  const first = recordPoiView(initial, 'a');
  assert.equal(first.shouldTrack, true);
  assert.equal(first.session.interacted, true);
  const second = recordPoiView(first.session, 'a');
  assert.equal(second.shouldTrack, false);
});

test('route abandonment only represents leaving an untouched, unconfirmed result', () => {
  const untouched = createRouteReviewSession(['a', 'b'], 1000);
  assert.equal(shouldTrackRouteAbandoned(untouched), true);
  assert.equal(shouldTrackRouteAbandoned(recordRouteInteraction(untouched)), false);
  assert.equal(shouldTrackRouteAbandoned(confirmRouteReview(untouched)), false);
});

test('tracking payload removes exact coordinates without mutating other selections', () => {
  const source = {
    city: '上海市',
    district: '徐汇区',
    currentLocation: { lng: 121.44, lat: 31.18 },
    preferences: ['看展'],
  };
  assert.deepEqual(sanitizeQuickSelections(source), {
    city: '上海市',
    district: '徐汇区',
    preferences: ['看展'],
  });
  assert.deepEqual(source.currentLocation, { lng: 121.44, lat: 31.18 });
});

test('confirmed route tracking carries preference learning signals', () => {
  const payload = buildRouteConfirmedPayload({
    requirements: { district: '南山区', budgetMax: 200 },
    blindBox: { theme: '城市散步疗愈盒' },
    route: {
      totalMinutes: 300,
      steps: [
        { poi: { name: '创意园', type: '文化体验', tags: ['看展', '小众'] } },
        { poi: { name: '海边公园', type: '户外散步', tags: ['夜景'] } },
      ],
    },
  });

  assert.deepEqual(payload.routeTypes, ['文化体验', '户外散步']);
  assert.deepEqual(payload.routeTags, ['看展', '小众', '夜景']);
  assert.equal(payload.district, '南山区');
  assert.equal(payload.routeTheme, '城市散步疗愈盒');
  assert.equal(payload.budgetMax, 200);
});

test('favorite and replacement payloads keep POI metadata', () => {
  assert.deepEqual(buildFavoriteAddedPayload('poi', '创意园', {
    poiType: '文化体验', poiTags: ['看展'], district: '南山区', routeTheme: '城市散步疗愈盒',
  }), {
    favoriteType: 'poi', poiName: '创意园', poiType: '文化体验', poiTags: ['看展'], district: '南山区', routeTheme: '城市散步疗愈盒',
  });
  assert.deepEqual(buildStepReplacedPayload('旧餐厅', '新公园', '', {
    fromPoiType: '餐饮正餐', fromPoiTags: ['排队'], district: '福田区', toPoiType: '户外散步',
  }), {
    fromPoi: '旧餐厅', toPoi: '新公园', customPrompt: '', fromPoiType: '餐饮正餐', fromPoiTags: ['排队'], district: '福田区', toPoiType: '户外散步',
  });
});
