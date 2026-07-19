import test from 'node:test';
import assert from 'node:assert/strict';

import { buildTransportRequestBody } from '../src/transportRequest.ts';

test('transport request carries the actual route city for transit planning', () => {
  assert.deepEqual(
    buildTransportRequestBody(
      { lng: 121.44, lat: 31.18 },
      { lng: 121.47, lat: 31.22 },
      '上海市',
    ),
    {
      origin: { lng: 121.44, lat: 31.18 },
      destination: { lng: 121.47, lat: 31.22 },
      city: '上海市',
    },
  );
});
