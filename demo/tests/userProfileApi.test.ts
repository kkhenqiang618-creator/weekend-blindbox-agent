import test from 'node:test';
import assert from 'node:assert/strict';

import { createUserProfileHandler } from '../../api-src/user-profile.ts';

function responseRecorder() {
  const record = { statusCode: 0, payload: undefined as unknown };
  return {
    record,
    response: {
      setHeader() {},
      status(code: number) {
        record.statusCode = code;
        return { json(payload: unknown) { record.payload = payload; } };
      },
    },
  };
}

test('profile API learns and returns a valid anonymous session', async () => {
  const { record, response } = responseRecorder();
  let learnedSession = '';
  const handler = createUserProfileHandler(async (sessionId) => {
    learnedSession = sessionId;
    return { likedPoiTypes: ['文化体验'] };
  });

  await handler({ method: 'GET', query: { sessionId: 'session-123' } }, response);

  assert.equal(learnedSession, 'session-123');
  assert.equal(record.statusCode, 200);
  assert.deepEqual(record.payload, { profile: { likedPoiTypes: ['文化体验'] } });
});

test('profile API rejects a missing session id', async () => {
  const { record, response } = responseRecorder();
  const handler = createUserProfileHandler(async () => ({ likedPoiTypes: [] }));

  await handler({ method: 'GET', query: {} }, response);

  assert.equal(record.statusCode, 400);
  assert.deepEqual(record.payload, { error: 'Missing or invalid sessionId' });
});
