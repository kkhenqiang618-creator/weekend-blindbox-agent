import {
  extractAdministrativeOptions,
  type AdministrativeOptionKind,
} from '../demo/src/administrativeDivisions.ts';

function setCors(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.status(204).json({});
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const parent = typeof req.body?.parent === 'string' ? req.body.parent.trim() : '';
  const kind = req.body?.kind as AdministrativeOptionKind;
  if (!parent || (kind !== 'cities' && kind !== 'districts')) {
    res.status(400).json({ error: '缺少有效的上级行政区' });
    return;
  }

  const key = process.env.AMAP_API_KEY || process.env.AMAP_WEB_SERVICE_KEY;
  if (!key) {
    res.status(503).json({ error: '未配置高德行政区服务' });
    return;
  }

  try {
    const url = new URL('https://restapi.amap.com/v3/config/district');
    url.searchParams.set('key', key);
    url.searchParams.set('keywords', parent);
    url.searchParams.set('subdistrict', '1');
    url.searchParams.set('extensions', 'base');
    const response = await fetch(url);
    const data = await response.json() as { status?: string; info?: string; districts?: unknown[] };
    if (!response.ok || data.status !== '1') {
      res.status(502).json({ error: data.info || '行政区数据加载失败' });
      return;
    }
    res.status(200).json({ options: extractAdministrativeOptions(data, parent, kind) });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : '行政区数据加载失败' });
  }
}
