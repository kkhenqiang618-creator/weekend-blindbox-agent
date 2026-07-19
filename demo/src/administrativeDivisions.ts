export type AdministrativeOptionKind = 'cities' | 'districts';

type AmapDistrict = {
  name?: string;
  level?: string;
  districts?: AmapDistrict[] | '';
};

type AmapDistrictPayload = {
  districts?: AmapDistrict[];
};

const MUNICIPALITIES = new Set(['北京市', '天津市', '上海市', '重庆市']);

export function extractAdministrativeOptions(
  payload: AmapDistrictPayload,
  parent: string,
  kind: AdministrativeOptionKind,
): string[] {
  const normalizedParent = parent.trim();
  const roots = Array.isArray(payload.districts) ? payload.districts : [];
  const root = roots.find((item) => item.name?.trim() === normalizedParent) || roots[0];
  const children = root && Array.isArray(root.districts) ? root.districts : [];

  if (kind === 'cities' && MUNICIPALITIES.has(normalizedParent)) return [normalizedParent];

  const names = children
    .filter((item) => item.level !== 'street')
    .map((item) => item.name?.trim() || '')
    .filter(Boolean);
  return [...new Set(names)];
}

export async function requestAdministrativeOptions(
  fetcher: typeof fetch,
  parent: string,
  kind: AdministrativeOptionKind,
): Promise<string[]> {
  const response = await fetcher('/api/administrative-options', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parent: parent.trim(), kind }),
  });
  const data = await response.json() as { options?: string[]; error?: string };
  if (!response.ok) throw new Error(data.error || '行政区数据加载失败');
  return Array.isArray(data.options) ? data.options.filter((item) => typeof item === 'string' && item.trim()) : [];
}
