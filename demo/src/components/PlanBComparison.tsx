import type { PlanBResult, Route } from '../types';

interface Props {
  planB: PlanBResult;
}

const EVENT_COPY: Record<string, { title: string; tone: string; icon: string }> = {
  queue: {
    title: '检测到异常：排队过长',
    tone: 'border-amber-200 bg-amber-50 text-amber-700',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  rain: {
    title: '检测到异常：天气变化',
    tone: 'border-sky-200 bg-sky-50 text-sky-700',
    icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-4.34-7.41 3 3 0 10-6.28.81A3.988 3.988 0 003 15z',
  },
};

function RouteSummary({ title, route, accent }: { title: string; route: Route; accent: 'before' | 'after' }) {
  const isAfter = accent === 'after';

  return (
    <div className={`magic-card p-5 ${isAfter ? 'ring-1 ring-purple-200' : ''}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-purple-950">
          <svg className={`h-4 w-4 ${isAfter ? 'text-purple-600' : 'text-purple-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isAfter ? 'M13 10V3L4 14h7v7l9-11h-7z' : 'M11 19l-7-7 7-7m8 14l-7-7 7-7'} />
          </svg>
          {title}
        </h4>
        {isAfter && (
          <span className="rounded-full border border-purple-200 bg-purple-50 px-2 py-1 text-[10px] font-semibold text-purple-600">
            Plan B
          </span>
        )}
      </div>

      <div className="space-y-3">
        {route.steps.map((step) => (
          <div key={`${title}-${step.poi.id}`} className="grid grid-cols-[26px_minmax(0,1fr)] gap-3">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${
              isAfter ? 'border-purple-200 bg-purple-50 text-purple-600' : 'border-slate-200 bg-white text-slate-500'
            }`}>
              {step.order}
            </span>
            <div className="min-w-0">
              <p className={`truncate text-sm ${isAfter ? 'font-semibold text-purple-950' : 'text-slate-600'}`}>
                {step.poi.name}
              </p>
              <p className="truncate text-xs text-purple-300">{step.poi.businessDistrict} · {step.poi.stayMinutes}min</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3 border-t border-purple-50 pt-4 text-sm text-purple-400">
        <span>{route.totalMinutes} 分钟</span>
        <span className="h-1 w-1 rounded-full bg-purple-200" />
        <span>¥{route.totalBudget}</span>
      </div>
    </div>
  );
}

export default function PlanBComparison({ planB }: Props) {
  const event = EVENT_COPY[planB.event.type] || {
    title: `检测到异常：${planB.event.type}`,
    tone: 'border-purple-200 bg-purple-50 text-purple-700',
    icon: 'M12 9v2m0 4h.01M11 3h2l7 18H4L11 3z',
  };

  return (
    <div className="space-y-6">
      <section className={`rounded-3xl border p-5 sm:p-6 ${event.tone}`}>
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-current/20 bg-white/70">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={event.icon} />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">Route recovery</p>
            <h2 className="mt-1 text-2xl font-display font-semibold text-purple-950">{event.title}</h2>
            <p className="mt-2 text-sm text-purple-950/75">{planB.event.message || planB.impact}</p>
          </div>
        </div>
      </section>

      <section className="magic-card p-5 sm:p-6">
        <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-300">Decision logic</p>
            <h3 className="mt-2 text-lg font-semibold text-purple-950">调整逻辑</h3>
          </div>
          <div className="space-y-3">
            <p className="rounded-2xl border border-purple-100 bg-white px-4 py-3 text-sm leading-6 text-purple-950">
              {planB.impact}
            </p>
            <p className="rounded-2xl bg-purple-50 px-4 py-3 text-sm leading-6 text-purple-700">
              {planB.message}
            </p>
          </div>
        </div>
      </section>

      <section className="magic-card p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-300">Change log</p>
            <h3 className="mt-2 text-lg font-semibold text-purple-950">路线调整记录</h3>
          </div>
          <span className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs text-purple-500">
            {planB.changes.length} 项变更
          </span>
        </div>

        <div className="space-y-3">
          {planB.changes.map((change, index) => (
            <div key={`${change.action}-${index}`} className="rounded-2xl border border-purple-100 bg-white p-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600">
                  {change.action === 'replace' ? '替换' : change.action === 'shorten' ? '缩短' : '移除'}
                </span>
                {change.from && <span className="text-slate-400 line-through">{change.from}</span>}
                {change.from && change.to && (
                  <svg className="h-4 w-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                )}
                {change.to && <span className="font-semibold text-purple-950">{change.to}</span>}
              </div>
              <p className="mt-2 text-sm leading-6 text-purple-400">{change.reason}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <RouteSummary title="调整前路线" route={planB.beforeRoute} accent="before" />
        <RouteSummary title="调整后路线" route={planB.afterRoute} accent="after" />
      </section>

      <section className="flex flex-wrap gap-3 text-sm">
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          保留：{planB.keptPreferences.join('、') || '无'}
        </div>
        {planB.sacrificed.length > 0 && (
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            牺牲：{planB.sacrificed.join('、')}
          </div>
        )}
      </section>
    </div>
  );
}
