import type { ReactNode } from 'react';
import type { Poi, Route, RouteStep } from '../types';

interface Props {
  route: Route;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  activity: { label: '玩乐', color: '#7C3AED', bg: '#EDE9FE', border: '#C4B5FD', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  break: { label: '休憩', color: '#D97706', bg: '#FEF3C7', border: '#FDE68A', icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' },
  meal: { label: '美食', color: '#C2410C', bg: '#FFEDD5', border: '#FDBA74', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  ending: { label: '收尾', color: '#5B21B6', bg: '#F5F3FF', border: '#DDD6FE', icon: 'M5 13l4 4L19 7' },
};

const QUEUE_BADGES: Record<string, { label: string; css: string }> = {
  low: { label: '排队少', css: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  medium: { label: '排队中', css: 'bg-amber-50 text-amber-700 border border-amber-200' },
  high: { label: '排队多', css: 'bg-rose-50 text-rose-600 border border-rose-200' },
};

function DetailPill({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-100 bg-white/74 px-3 py-1.5 text-xs font-semibold text-purple-800 shadow-sm">
      {icon}
      {children}
    </span>
  );
}

function getDistrict(poi: Poi) {
  return poi.routeCluster ?? poi.businessDistrict ?? poi.area ?? '附近';
}

function PoiCard({ step, isLast, isFeatured }: { step: RouteStep; isLast: boolean; isFeatured: boolean }) {
  const role = ROLE_CONFIG[step.role] || ROLE_CONFIG.activity;
  const poi = step.poi;

  return (
    <div className="grid grid-cols-[3rem_minmax(0,1fr)] gap-4 sm:grid-cols-[3.75rem_minmax(0,1fr)]">
      <div className="relative flex flex-col items-center">
        <div
          className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border-2 shadow-[0_10px_22px_rgba(124,58,237,0.18)] transition-transform duration-200 hover:scale-105 sm:h-14 sm:w-14"
          style={{
            borderColor: isFeatured ? '#FBBF24' : role.border,
            background: isFeatured ? 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' : role.bg,
          }}
        >
          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke={isFeatured ? '#FFFFFF' : role.color} strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={role.icon} />
          </svg>
        </div>
        {!isLast && (
          <div className="absolute top-14 h-[calc(100%-1rem)] w-1 rounded-full bg-gradient-to-b from-purple-300 via-amber-200 to-purple-100 sm:top-16" />
        )}
      </div>

      <div className={isLast ? '' : 'pb-6'}>
        <div className="group rounded-[1.35rem] border border-purple-100/80 bg-white/78 p-4 shadow-[0_12px_34px_rgba(91,33,182,0.09)] backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-300 hover:bg-white/92 hover:shadow-[0_18px_42px_rgba(91,33,182,0.14)] sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full border px-2.5 py-1 text-xs font-bold"
                  style={{ background: role.bg, color: role.color, borderColor: role.border }}
                >
                  {role.label}
                </span>
                <span className="rounded-full border border-purple-100 bg-purple-50/80 px-2.5 py-1 text-xs font-bold text-purple-700">
                  第 {step.order} 站
                </span>
                {step.startTimeText && (
                  <span className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                    {step.startTimeText}
                  </span>
                )}
              </div>
              <h4 className="text-xl font-extrabold leading-tight text-purple-950">{poi.name}</h4>
            </div>

            {poi.meituanRating && (
              <div className="inline-flex items-center gap-1.5 self-start rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-700 shadow-sm">
                <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-extrabold">{poi.meituanRating}</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <DetailPill
              icon={(
                <svg className="h-3.5 w-3.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              )}
            >
              {getDistrict(poi)}
            </DetailPill>
            <DetailPill
              icon={(
                <svg className="h-3.5 w-3.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            >
              ¥{poi.price}/人
            </DetailPill>
            <DetailPill
              icon={(
                <svg className="h-3.5 w-3.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            >
              停留 {poi.stayMinutes} 分钟
            </DetailPill>
            {QUEUE_BADGES[poi.queueLevel] && (
              <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${QUEUE_BADGES[poi.queueLevel].css}`}>
                {QUEUE_BADGES[poi.queueLevel].label}
              </span>
            )}
            {poi.weatherSensitive && (
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-600">
                天气敏感
              </span>
            )}
          </div>

          {poi.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {poi.tags.slice(0, 5).map((tag) => (
                <span key={tag} className="rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-600">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 rounded-2xl border border-amber-100/80 bg-gradient-to-br from-amber-50/82 to-white/66 px-4 py-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-extrabold text-amber-700">
              <svg className="h-3.5 w-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364l-2.121 2.121M7.757 16.243l-2.121 2.121m12.728 0l-2.121-2.121M7.757 7.757L5.636 5.636" />
              </svg>
              Buddy 推荐理由
            </div>
            <p className="text-sm font-semibold leading-6 text-purple-900/78">
              {step.note || poi.reason}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RouteTimeline({ route }: Props) {
  const firstDistrict = route.steps[0]?.poi ? getDistrict(route.steps[0].poi) : '周末目的地';

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/58 bg-gradient-to-br from-white/80 via-purple-50/58 to-amber-50/72 p-5 shadow-[0_26px_90px_rgba(91,33,182,0.16)] backdrop-blur-2xl sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full border border-amber-300/30" />
      <div className="pointer-events-none absolute -left-20 bottom-10 h-56 w-56 rounded-full border border-purple-300/22" />

      <div className="relative rounded-[1.5rem] border border-purple-100/70 bg-white/48 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-amber-100/76 px-4 py-2 text-sm font-extrabold text-amber-700 shadow-sm">
              <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              开盒结果
            </div>
            <h3 className="font-logo text-3xl font-extrabold tracking-normal text-purple-950 sm:text-4xl">
              Buddy 已经帮你拆出路线了
            </h3>
            <p className="mt-3 max-w-xl text-base font-semibold leading-7 text-purple-800/72">
              从「{firstDistrict}」开始，按顺序走完这条轻松周末路线。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[18rem]">
            <div className="rounded-2xl border border-purple-200/70 bg-white/70 px-4 py-3 shadow-sm">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-purple-500">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                总时长
              </div>
              <div className="text-2xl font-extrabold text-purple-950">{route.totalMinutes}</div>
              <div className="text-xs font-bold text-purple-400">分钟</div>
            </div>
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/74 px-4 py-3 shadow-sm">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-amber-600">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                预计预算
              </div>
              <div className="text-2xl font-extrabold text-amber-700">¥{route.totalBudget}</div>
              <div className="text-xs font-bold text-amber-500">人均合计</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-full border border-purple-100 bg-purple-50/84 px-3 py-1.5 text-xs font-extrabold text-purple-700">
            {route.steps.length} 个节点
          </span>
          <span className="rounded-full border border-amber-100 bg-amber-50/84 px-3 py-1.5 text-xs font-extrabold text-amber-700">
            已按排队和停留时间排序
          </span>
        </div>
      </div>

      <div className="relative mt-6 space-y-0">
        {route.steps.map((step, i) => (
          <PoiCard key={step.poi.id} step={step} isLast={i === route.steps.length - 1} isFeatured={i === 0} />
        ))}
      </div>
    </div>
  );
}
