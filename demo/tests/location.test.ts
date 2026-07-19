import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EMPTY_MANUAL_LOCATION,
  formatAdministrativeLabel,
  locationLabel,
  manualLocation,
  resolveManualLocation,
  shouldAutoLocate,
} from '../src/location.ts';

test('unresolved coordinates never display a fabricated Shenzhen address', () => {
  const label = locationLabel({ city: '', district: '', label: '', lng: 120.1551, lat: 30.2741, status: 'coordinates-only' });
  assert.equal(label, '已获取位置，地址解析失败');
  assert.doesNotMatch(label, /深圳|120\.1551|30\.2741/);
});

test('resolved location displays city and district', () => {
  assert.equal(locationLabel({ city: '杭州市', district: '西湖区', label: '杭州市西湖区', status: 'resolved' }), '已定位 杭州市西湖区');
});

test('manual location creates a usable city and district fallback', () => {
  const location = manualLocation('浙江省', '杭州市', '西湖区');
  assert.equal(location.status, 'manual');
  assert.equal(locationLabel(location), '已选择 浙江省杭州市西湖区');
  assert.equal(location.lng, undefined);
});

test('manual location accepts a city without an optional district', () => {
  const location = resolveManualLocation('  浙江省 ', '  杭州市  ', '   ');
  assert.deepEqual(location, {
    province: '浙江省',
    city: '杭州市',
    district: '',
    label: '浙江省杭州市',
    status: 'manual',
  });
});

test('manual location rejects a blank city', () => {
  assert.equal(resolveManualLocation('浙江省', '   ', '西湖区'), null);
});

test('manual location starts empty instead of defaulting to Shenzhen', () => {
  assert.deepEqual(EMPTY_MANUAL_LOCATION, { province: '', city: '', district: '' });
});

test('municipality labels do not repeat the same province and city', () => {
  assert.equal(formatAdministrativeLabel('北京市', '北京市', '朝阳区'), '北京市朝阳区');
});

test('automatic positioning only runs before the user has a settled location state', () => {
  assert.equal(shouldAutoLocate({ city: '', district: '', label: '', status: 'locating' }), true);
  assert.equal(shouldAutoLocate({ province: '浙江省', city: '杭州市', district: '', label: '浙江省杭州市', status: 'manual' }), false);
  assert.equal(shouldAutoLocate({ city: '', district: '', label: '', status: 'denied' }), false);
});
