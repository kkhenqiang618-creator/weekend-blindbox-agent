import { useEffect, useRef, useState, useCallback } from 'react';
import type { Route } from '../types';

interface Props {
  route: Route;
  onClose: () => void;
}

interface MapPoint {
  name: string;
  lng: number;
  lat: number;
}

// 等待 AMap 加载完毕（带超时）
function useAMapReady(): { ready: boolean; error: boolean } {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 已加载
    if ((window as Window & { AMap?: unknown }).AMap) {
      setReady(true);
      return;
    }

    // 等待加载，最多 10 秒
    const start = Date.now();
    const timer = setInterval(() => {
      if ((window as Window & { AMap?: unknown }).AMap) {
        setReady(true);
        clearInterval(timer);
      } else if (Date.now() - start > 10000) {
        // 超时
        clearInterval(timer);
        setError(true);
      }
    }, 200);

    return () => clearInterval(timer);
  }, []);

  return { ready, error };
}

// 起终点标记 HTML
function makeMarkerContent(name: string, index: number, total: number): string {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  let bg = '#7C3AED';
  let label = `${index + 1}`;
  if (isFirst) { bg = '#16A34A'; label = '起'; }
  if (isLast && !isFirst) { bg = '#DC2626'; label = '终'; }
  return `
    <div style="display:flex;flex-direction:column;align-items:center;pointer-events:none;">
      <div style="width:28px;height:28px;border-radius:50%;background:${bg};color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,0.25);border:2px solid #fff;">${label}</div>
      <div style="margin-top:4px;background:#fff;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;color:#1e1b4b;box-shadow:0 1px 4px rgba(0,0,0,0.15);white-space:nowrap;">${name}</div>
    </div>
  `;
}

export default function RouteMap({ route, onClose }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<AMap.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const { ready, error: amapError } = useAMapReady();

  const destroyMap = useCallback(() => {
    if (mapInstance.current) {
      mapInstance.current.destroy();
      mapInstance.current = null;
    }
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const AMap = (window as Window & { AMap: typeof AMap }).AMap;
    if (!AMap || mapInstance.current) return;

    const mapPoints = buildMapPoints(route);
    if (mapPoints.length === 0) return;

    const path: [number, number][] = mapPoints.map(point => [point.lng, point.lat]);

    // 计算中心点
    const lats = path.map(([, lat]) => lat);
    const lngs = path.map(([lng]) => lng);
    const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const center: [number, number] = [centerLng, centerLat];

    try {
      setMapError(null);

      // 初始化地图
      const map = new AMap.Map(mapRef.current, {
        zoom: 13,
        center,
        resizeEnable: true,
      });
      mapInstance.current = map;

      // 画折线（虚线 + 方向箭头）
      const polyline = new AMap.Polyline({
        path,
        strokeColor: '#7C3AED',
        strokeWeight: 4,
        strokeStyle: 'dashed',
        strokeDasharray: [10, 8],
        lineJoin: 'round',
        showDir: true,
        dirColor: '#7C3AED',
        dirNum: 4,
      });
      map.add(polyline);

      // 画标记
      mapPoints.forEach((point, i) => {
        const marker = new AMap.Marker({
          position: [point.lng, point.lat],
          content: makeMarkerContent(point.name, i, mapPoints.length),
          offset: new AMap.Pixel(-16, -42),
        });
        map.add(marker);
      });

      // 调整视野
      map.setFitView(undefined, false, [60, 60, 60, 60]);
    } catch (err) {
      console.error('AMap render failed:', err);
      setMapError(err instanceof Error ? err.message : '地图渲染异常');
      destroyMap();
    }

    return () => { destroyMap(); };
  }, [ready, route, destroyMap]);

  const hasCoords = route.steps.some(s => s.poi.lat && s.poi.lng);
  const routeSignature = route.steps.map((step) => `${step.poi.id}:${step.poi.name}:${step.poi.lat ?? 'x'}:${step.poi.lng ?? 'x'}`).join('|');
  const shouldShowFallback = !hasCoords || amapError || mapError;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-[94vw] max-w-4xl h-[82vh] rounded-[2rem] bg-white shadow-2xl overflow-hidden flex flex-col animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* 顶部栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-amber-50">
          <div>
            <h3 className="text-lg font-extrabold text-purple-950">🗺️ 路线地图</h3>
            <p className="text-xs text-purple-500 mt-0.5">
              共 {route.steps.length} 站 · {route.totalMinutes} 分钟 · ¥{route.totalBudget}/人
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 hover:bg-purple-200 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 地图容器 */}
        {shouldShowFallback ? (
          <FallbackRouteMap
            route={route}
            reason={
              !hasCoords
                ? '当前路线暂无完整坐标，已切换为备用路线图。'
                : '高德地图暂时不可用，已切换为备用路线图。'
            }
          />
        ) : !ready ? (
          <div className="flex-1 flex items-center justify-center text-purple-400">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-3" />
              <p>地图加载中…</p>
            </div>
          </div>
        ) : (
          <div key={routeSignature} className="relative flex-1 w-full" style={{ minHeight: 0 }}>
            <div ref={mapRef} className="absolute inset-0" />
            <RouteNodeOverlay route={route} />
          </div>
        )}

        {/* 底部图例 */}
        {hasCoords && !amapError && (
          <div className="px-6 py-3 border-t border-purple-100 bg-purple-50/60 flex items-center gap-6 text-xs text-purple-700">
            <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full" style={{ background: '#16A34A' }} /> 起点</span>
            <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full" style={{ background: '#7C3AED' }} /> 途经点</span>
            <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full" style={{ background: '#DC2626' }} /> 终点</span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-6 h-0.5 rounded-full" style={{ background: 'repeating-linear-gradient(to right, #7C3AED 0 6px, transparent 6px 12px)' }} />
              推荐路线
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function buildMapPoints(route: Route): MapPoint[] {
  const realPoints = route.steps
    .map((step, index) => (
      step.poi.lat && step.poi.lng
        ? { index, name: step.poi.name, lng: step.poi.lng, lat: step.poi.lat }
        : null
    ))
    .filter((point): point is MapPoint & { index: number } => Boolean(point));

  if (realPoints.length === 0) return [];

  return route.steps.map((step, index) => {
    if (step.poi.lat && step.poi.lng) {
      return { name: step.poi.name, lng: step.poi.lng, lat: step.poi.lat };
    }

    const before = [...realPoints].reverse().find((point) => point.index < index);
    const after = realPoints.find((point) => point.index > index);

    if (before && after) {
      return {
        name: step.poi.name,
        lng: (before.lng + after.lng) / 2,
        lat: (before.lat + after.lat) / 2,
      };
    }

    const anchor = before ?? after ?? realPoints[0];
    const offset = 0.004 * (index + 1);
    return {
      name: step.poi.name,
      lng: anchor.lng + offset,
      lat: anchor.lat + offset / 2,
    };
  });
}

function FallbackRouteMap({ route, reason }: { route: Route; reason: string }) {
  return (
    <div className="flex-1 overflow-hidden bg-gradient-to-br from-purple-50 via-white to-amber-50 p-6">
      <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs font-semibold text-amber-700">
        {reason}
      </div>

      <div className="relative h-[calc(100%-4.5rem)] min-h-[22rem] overflow-hidden rounded-[1.5rem] border border-purple-100 bg-white/76 shadow-inner">
        <div className="absolute inset-x-12 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-400 via-purple-500 to-red-400 opacity-70" />
        <div className="absolute inset-0">
          {route.steps.map((step, index) => {
            const total = Math.max(route.steps.length - 1, 1);
            const left = 10 + (index / total) * 80;
            const top = index % 2 === 0 ? 38 : 58;
            const isFirst = index === 0;
            const isLast = index === route.steps.length - 1;
            const color = isFirst ? '#16A34A' : isLast ? '#DC2626' : '#7C3AED';

            return (
              <div
                key={`${step.poi.id}-${index}`}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-xs font-extrabold text-white shadow-lg"
                  style={{ background: color }}
                >
                  {isFirst ? '起' : isLast ? '终' : index + 1}
                </div>
                <div className="mt-2 max-w-[9rem] rounded-xl border border-purple-100 bg-white/95 px-3 py-2 text-center shadow-md">
                  <p className="truncate text-xs font-extrabold text-purple-950">{step.poi.name}</p>
                  <p className="mt-0.5 truncate text-[10px] font-semibold text-purple-400">
                    {step.poi.routeCluster ?? step.poi.businessDistrict}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RouteNodeOverlay({ route }: { route: Route }) {
  return (
    <div className="pointer-events-none absolute left-4 right-4 bottom-4 rounded-2xl border border-white/70 bg-white/92 p-3 shadow-xl backdrop-blur">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {route.steps.map((step, index) => {
          const isFirst = index === 0;
          const isLast = index === route.steps.length - 1;
          const color = isFirst ? '#16A34A' : isLast ? '#DC2626' : '#7C3AED';

          return (
            <div key={`${step.poi.id}-${index}`} className="flex min-w-fit items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl bg-purple-50 px-3 py-2">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-extrabold text-white"
                  style={{ background: color }}
                >
                  {isFirst ? '起' : isLast ? '终' : index + 1}
                </span>
                <span className="max-w-[9rem] truncate text-xs font-extrabold text-purple-950">
                  {step.poi.name}
                </span>
              </div>
              {!isLast && <span className="text-xs font-bold text-purple-300">→</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
