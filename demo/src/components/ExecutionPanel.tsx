import { useState } from 'react';
import type { Route, ToolResult } from '../types';
import RouteMap from './RouteMap';

interface Props {
  tasks: ToolResult[];
  route: Route;
}

type ReservationActions = {
  copyScript?: boolean;
  callPhone?: boolean;
  openMeituan?: boolean;
};

type ReservationAssistResult = {
  reason?: string;
  script?: string;
  actions?: ReservationActions;
  phone?: string | null;
  meituanUrl?: string | null;
  disclaimer?: string;
  visitTimeText?: string;
  reservationNeeded?: boolean;
};

const STATUS_CONFIG: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  success: {
    icon: 'M5 13l4 4L19 7',
    color: '#16a34a',
    bg: '#dcfce7',
    border: '#bbf7d0',
  },
  running: {
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    color: '#2563eb',
    bg: '#dbeafe',
    border: '#bfdbfe',
  },
  failed: {
    icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
  },
};

export default function ExecutionPanel({ tasks, route }: Props) {
  const safeTasks = tasks ?? [];
  const reservationTasks = safeTasks.filter((task) => task.toolName === 'reservationAssist');
  const normalTasks = safeTasks.filter((task) => task.toolName !== 'reservationAssist');

  return (
    <div className="magic-card p-6 sm:p-8 animate-scale-in">
      <h3 className="text-lg font-display font-semibold purple-950 mb-5 flex items-center gap-2">
        <svg className="w-5 h-5 purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        执行结果
      </h3>

      {reservationTasks.length > 0 && (
        <div className="mb-6 space-y-4">
          {reservationTasks.map((task, i) => (
            <ReservationAssistCard key={`${task.poiId ?? 'reservation'}-${i}`} task={task} />
          ))}
        </div>
      )}

      {reservationTasks.length === 0 && (
        <div className="mb-6 rounded-2xl border border-purple-100 bg-purple-50/70 p-4">
          <p className="text-sm font-semibold text-purple-950">本次路线无需代预订辅助</p>
          <p className="mt-1 text-xs leading-relaxed text-purple-500">
            当前路线没有命中高排队、热门正餐或必须预约节点，因此 Agent 只把地点加入行程。
          </p>
        </div>
      )}

      {normalTasks.length > 0 && (
        <div className="mb-6 space-y-3">
          {normalTasks.map((task, i) => {
          const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.success;

          return (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-xl border transition-all duration-300"
              style={{ borderColor: status.border, background: status.bg }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: status.color }}
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={status.icon} />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium purple-950">{task.toolName}</p>
                <p className="text-xs purple-400 mt-0.5">{task.message}</p>
              </div>
            </div>
          );
          })}
        </div>
      )}

      <JourneyMapCard route={route} />
    </div>
  );
}

function JourneyMapCard({ route }: { route: Route }) {
  const [showMap, setShowMap] = useState(false);
  const points = route.steps.filter((step) => step.poi.lng && step.poi.lat);
  const hasRouteCoords = points.length >= 2;
  const fullNavigationUrl = hasRouteCoords ? buildNavigationUrl(points[0], points[points.length - 1]) : null;

  return (
    <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-purple-50 shadow-sm">
      <div className="p-4">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">已加入行程</span>
            <span className="rounded-full bg-white/82 px-3 py-1 text-xs font-bold text-purple-600">
              {route.steps.length} 站 · {route.totalMinutes} 分钟 · ¥{route.totalBudget}/人
            </span>
          </div>
          <h4 className="text-base font-extrabold text-purple-950">路线地图和到达方式</h4>
          <p className="mt-1 text-xs font-semibold leading-5 text-purple-600/80">
            下面是已加入行程的路线节点。确认顺序后，再打开完整地图或跳转高德导航。
          </p>
        </div>
      </div>

      <div className="border-t border-emerald-100 bg-white/64 p-4">
        <div className="grid gap-3">
          {route.steps.map((step, index) => {
            const nextStep = route.steps[index + 1];
            const legUrl = nextStep ? buildNavigationUrl(step, nextStep) : null;

            return (
              <div key={`${step.poi.id}-${index}`} className="rounded-2xl border border-purple-100 bg-white/78 p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-700 text-xs font-extrabold text-white">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-purple-950">{step.poi.name}</p>
                      <p className="mt-1 text-xs font-semibold text-purple-500">
                        {step.startTimeText ?? '按路线顺序'} · {step.poi.businessDistrict} · 停留 {step.poi.stayMinutes} 分钟
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {step.poi.lng && step.poi.lat && (
                      <a
                        href={buildMarkerUrl(step)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-purple-200 bg-white px-3 py-2 text-xs font-bold text-purple-700 transition hover:bg-purple-50"
                      >
                        看地点
                      </a>
                    )}
                    {legUrl && (
                      <a
                        href={legUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-200"
                      >
                        去下一站
                      </a>
                    )}
                  </div>
                </div>
                {nextStep && (
                  <p className="mt-3 border-t border-purple-50 pt-3 text-xs font-semibold leading-5 text-purple-500">
                    下一站：{nextStep.poi.name}。打开高德后可选择步行、公交、驾车或打车确认实际路程。
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/72 p-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => setShowMap(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-purple-700 px-5 py-3 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(16,185,129,0.24)] transition hover:-translate-y-0.5"
          >
            查看完整地图
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13l-6-3m6 3V4m0 0L9 7" />
            </svg>
          </button>
          {fullNavigationUrl && (
            <a
              href={fullNavigationUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white/86 px-5 py-3 text-sm font-bold text-emerald-800 transition hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              打开高德总导航
            </a>
          )}
        </div>
      </div>

      {showMap && <RouteMap route={route} onClose={() => setShowMap(false)} />}
    </section>
  );
}

function buildMarkerUrl(step: Route['steps'][number]) {
  const { lng, lat, name } = step.poi;
  return `https://uri.amap.com/marker?position=${lng},${lat}&name=${encodeURIComponent(name)}&coordinate=gaode&src=weekendbuddy`;
}

function buildNavigationUrl(from: Route['steps'][number], to: Route['steps'][number]) {
  if (!from.poi.lng || !from.poi.lat || !to.poi.lng || !to.poi.lat) return null;
  const fromName = encodeURIComponent(from.poi.name);
  const toName = encodeURIComponent(to.poi.name);
  return `https://uri.amap.com/navigation?from=${from.poi.lng},${from.poi.lat},${fromName}&to=${to.poi.lng},${to.poi.lat},${toName}&mode=walk&policy=1&coordinate=gaode&src=weekendbuddy`;
}

function ReservationAssistCard({ task }: { task: ToolResult }) {
  const [copied, setCopied] = useState(false);
  const [mockOpened, setMockOpened] = useState(false);
  const result = (task.result ?? {}) as ReservationAssistResult;
  const actions = result.actions ?? {};
  const needsReservation = result.reservationNeeded !== false;

  const handleCopyScript = async () => {
    if (!result.script) return;
    try {
      await navigator.clipboard.writeText(result.script);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const handleOpenMeituan = () => {
    if (result.meituanUrl && !result.meituanUrl.startsWith('mock://')) {
      window.open(result.meituanUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    setMockOpened(true);
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${
      needsReservation
        ? 'border-amber-200 bg-gradient-to-br from-amber-50 via-white to-purple-50'
        : 'border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-purple-50'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
          needsReservation ? 'bg-amber-400 shadow-amber-200' : 'bg-emerald-400 shadow-emerald-200'
        }`}>
          <svg className="w-5 h-5 text-purple-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M5 11h14M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <p className="text-sm font-semibold text-purple-950">Agent 代预订辅助</p>
            <span className={`px-2 py-1 rounded-full text-[11px] font-semibold ${
              needsReservation ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {needsReservation ? '等待用户确认' : '无需提前预订'}
            </span>
          </div>

          <p className="text-sm text-purple-700 leading-relaxed">{task.message}</p>

          {result.reason && (
            <div className="mt-4 rounded-xl bg-white/80 border border-amber-100 p-3">
              <p className="text-[11px] font-semibold text-purple-400 mb-1">为什么建议提前确认</p>
              <p className="text-sm text-purple-900 leading-relaxed">{result.reason}</p>
            </div>
          )}

          {needsReservation && result.script && (
            <div className="mt-3 rounded-xl bg-purple-950 p-4 text-white">
              <p className="text-[11px] font-semibold text-amber-200 mb-2">预订/确认座位话术</p>
              <p className="text-sm leading-relaxed">{result.script}</p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {needsReservation && actions.copyScript && (
              <ActionPill
                label={copied ? '已复制话术' : '复制话术'}
                iconPath="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                onClick={handleCopyScript}
              />
            )}
            {needsReservation && actions.callPhone && (
              <ActionPill label={result.phone ? `拨打 ${result.phone}` : '拨打商家电话'} iconPath="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.49a1 1 0 01-.5 1.21l-2.26 1.13a11.04 11.04 0 005.52 5.52l1.13-2.26a1 1 0 011.21-.5l4.49 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z" />
            )}
            {actions.openMeituan && (
              <ActionPill
                label={mockOpened ? '已模拟打开入口' : '打开美团入口'}
                iconPath="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                onClick={handleOpenMeituan}
              />
            )}
          </div>

          {mockOpened && (
            <div className="mt-3 rounded-xl border border-purple-100 bg-white/80 p-3">
              <p className="text-xs font-semibold text-purple-700">美团入口模拟</p>
              <p className="mt-1 text-xs leading-5 text-purple-400">
                Demo 已模拟打开 {result.meituanUrl || '美团入口'}。真实环境需要接入美团开放能力或跳转真实商家页后由用户完成确认。
              </p>
            </div>
          )}

          {result.disclaimer && (
            <p className="mt-4 text-xs text-purple-400 leading-relaxed">{result.disclaimer}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionPill({ label, iconPath, onClick }: { label: string; iconPath: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-white px-3 py-2 text-xs font-semibold text-purple-700 shadow-sm transition hover:border-purple-300 hover:bg-purple-50"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
      </svg>
      {label}
    </button>
  );
}
