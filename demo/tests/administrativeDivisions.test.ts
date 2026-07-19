import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractAdministrativeOptions,
  requestAdministrativeOptions,
} from '../src/administrativeDivisions.ts';

test('a province exposes only its own prefecture-level cities', () => {
  const payload = {
    districts: [{
      name: '江苏省',
      level: 'province',
      districts: [
        { name: '南京市', level: 'city' },
        { name: '南通市', level: 'city' },
        { name: '苏州市', level: 'city' },
      ],
    }],
  };

  assert.deepEqual(extractAdministrativeOptions(payload, '江苏省', 'cities'), ['南京市', '南通市', '苏州市']);
});

test('a city exposes only its own districts and counties', () => {
  const payload = {
    districts: [{
      name: '南通市',
      level: 'city',
      districts: [
        { name: '崇川区', level: 'district' },
        { name: '通州区', level: 'district' },
        { name: '如东县', level: 'district' },
        { name: '启东市', level: 'district' },
      ],
    }],
  };

  assert.deepEqual(extractAdministrativeOptions(payload, '南通市', 'districts'), ['崇川区', '通州区', '如东县', '启东市']);
});

test('municipalities keep the municipality as the city choice', () => {
  const payload = {
    districts: [{
      name: '北京市',
      level: 'province',
      districts: [{ name: '东城区', level: 'district' }],
    }],
  };

  assert.deepEqual(extractAdministrativeOptions(payload, '北京市', 'cities'), ['北京市']);
  assert.deepEqual(extractAdministrativeOptions(payload, '北京市', 'districts'), ['东城区']);
});

test('administrative options request carries only the selected parent and level', async () => {
  let body = '';
  const fetcher = (async (_url: string | URL | Request, init?: RequestInit) => {
    body = String(init?.body || '');
    return new Response(JSON.stringify({ options: ['南通市'] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;

  const options = await requestAdministrativeOptions(fetcher, '江苏省', 'cities');

  assert.deepEqual(JSON.parse(body), { parent: '江苏省', kind: 'cities' });
  assert.deepEqual(options, ['南通市']);
});
