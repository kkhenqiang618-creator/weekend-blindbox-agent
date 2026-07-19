import test from 'node:test';
import assert from 'node:assert/strict';

import { buildAmapRouteUrl } from '../../api-src/transport-options.ts';

const origin = { lng: 121.44, lat: 31.18 };
const destination = { lng: 121.47, lat: 31.22 };

test('serverless transit planning uses the requested city and never defaults to Shenzhen', () => {
  const url = buildAmapRouteUrl('transit', origin, destination, 'test-key', '上海市');
  assert.equal(url?.searchParams.get('city'), '上海市');
  assert.doesNotMatch(url?.toString() || '', /深圳/);
  assert.equal(buildAmapRouteUrl('transit', origin, destination, 'test-key', ''), null);
});

test('walking routes do not need a city', () => {
  const url = buildAmapRouteUrl('walk', origin, destination, 'test-key', '');
  assert.ok(url);
  assert.equal(url?.searchParams.has('city'), false);
});
