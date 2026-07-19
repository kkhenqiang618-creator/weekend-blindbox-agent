export type LocationStatus = 'locating' | 'resolved' | 'manual' | 'coordinates-only' | 'denied' | 'unavailable' | 'error';

export type UserLocation = {
  province?: string;
  city: string;
  district: string;
  label: string;
  lat?: number;
  lng?: number;
  status: LocationStatus;
};

export const EMPTY_MANUAL_LOCATION = { province: '', city: '', district: '' } as const;

export const MANUAL_PROVINCE_SUGGESTIONS = [
  '北京市', '天津市', '上海市', '重庆市',
  '河北省', '山西省', '辽宁省', '吉林省', '黑龙江省',
  '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省',
  '河南省', '湖北省', '湖南省', '广东省', '海南省', '四川省',
  '贵州省', '云南省', '陕西省', '甘肃省', '青海省', '台湾省',
  '内蒙古自治区', '广西壮族自治区', '西藏自治区', '宁夏回族自治区', '新疆维吾尔自治区',
  '香港特别行政区', '澳门特别行政区',
];

export function locationLabel(location: UserLocation): string {
  if (location.status === 'locating') return '正在定位...';
  if (location.status === 'resolved' && location.label) return `已定位 ${location.label}`;
  if (location.status === 'manual' && location.label) return `已选择 ${location.label}`;
  if (location.status === 'coordinates-only') return '已获取位置，地址解析失败';
  if (location.status === 'denied') return '定位未开启，点击重试';
  if (location.status === 'unavailable') return '定位不可用';
  return '定位失败，点击重试';
}

export function formatAdministrativeLabel(province: string, city: string, district: string): string {
  const values = [province, city, district].map((value) => value.trim()).filter(Boolean);
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = value.replace(/(?:特别行政区|壮族自治区|回族自治区|维吾尔自治区|自治区|省|市)$/, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).join('');
}

export function shouldAutoLocate(location: UserLocation): boolean {
  return location.status === 'locating'
    && !location.province
    && !location.city
    && !location.district
    && !Number.isFinite(location.lng)
    && !Number.isFinite(location.lat);
}

export const MANUAL_CITY_SUGGESTIONS = [
  "北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "南京",
  "重庆", "天津", "苏州", "西安", "长沙", "青岛", "郑州", "大连",
  "厦门", "福州", "合肥", "济南", "沈阳", "昆明", "贵阳", "南宁",
  "海口", "三亚", "哈尔滨", "长春", "太原", "石家庄", "兰州", "乌鲁木齐",
  "拉萨", "呼和浩特", "银川", "西宁", "南昌", "宁波", "无锡", "东莞",
  "佛山", "珠海", "惠州", "温州", "绍兴", "嘉兴", "常州", "南通",
];

export function manualLocation(province: string, city: string, district: string): UserLocation {
  return {
    province,
    city,
    district,
    label: formatAdministrativeLabel(province, city, district),
    status: 'manual',
  };
}

export function resolveManualLocation(province: string, city: string, district: string): UserLocation | null {
  const normalizedProvince = province.trim();
  const normalizedCity = city.trim();
  if (!normalizedCity) return null;
  return manualLocation(normalizedProvince, normalizedCity, district.trim());
}

export const EMPTY_LOCATION: UserLocation = {
  province: '',
  city: '',
  district: '',
  label: '',
  status: 'locating',
};
