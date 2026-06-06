import { useEffect, useRef, useState, useCallback } from 'react';
import type { Route } from '../types';

interface Props {
  route: Route;
  onClose: () => void;
}

// 等待 AMap 加载完毕
function useAMapReady(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as Window & { AMap?: unknown }).AMap) {
      setReady(true);
      return;
    }
    const timer = setInterval(() => {
      if ((window as Window & { AMap?: unknown }).AMap) {
        setReady(true);
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return ready;
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
  const ready = useAMapReady();

  const destroyMap = useCallback(() => {
    if (mapInstance.current) {
      mapInstance.current.destroy();
      mapInstance.current = null;
    }
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const AMap = (window as Window & { AMap?: typeof AMap }).AMap;
    if (!AMap || mapInstance.current) return;

    // 收集有坐标的 step
    const stepsWithCoord = route.steps.filter(s => s.poi.lat && s.poi.lng);
    if (stepsWithCoord.length === 0) return;

    const path: { lng: number; lat: number }[] = stepsWithCoord.map(s => ({
      lng: s.poi.lng!,
      lat: s.poi.lat!,
    }));

    // 计算中心点
    const lats = path.map(p => p.lat);
    const lngs = path.map(p => p.lng);
    const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const center: [number, number] = [centerLng, centerLat];

    // 初始化地图
    const map = new AMap.Map(mapRef.current, {
      zoom: 13,
      center,
      resizeEnable: true,
    });
    mapInstance.current = map;

    // 画折线（虚线 + 方向箭头）
    const polyline = new AMap.Polyline({
      path: path as unknown as [number, number][],
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
    stepsWithCoord.forEach((step, i) => {
      const marker = new AMap.Marker({
        position: [step.poi.lng, step.poi.lat] as [number, number],
        content: makeMarkerContent(step.poi.name, i, stepsWithCoord.length),
        offset: new AMap.Pixel(-16, -42),
      });
      map.add(marker);
    });

    // 调整视野
    map.setFitView();

    return () => { destroyMap(); };
  }, [ready, route, destroyMap]);

  const hasCoords = route.steps.some(s => s.poi.lat && s.poi.lng);

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
        {!hasCoords ? (
          <div className="flex-1 flex items-center justify-center text-purple-400">
            <p>当前路线暂无坐标数据，无法显示地图。</p>
          </div>
        ) : !ready ? (
          <div className="flex-1 flex items-center justify-center text-purple-400">
            <p>地图加载中…</p>
          </div>
        ) : (
          <div ref={mapRef} className="flex-1 w-full" style={{ minHeight: 0 }} />
        )}

        {/* 底部图例 */}
        {hasCoords && (
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
