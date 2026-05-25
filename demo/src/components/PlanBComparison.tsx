import type { PlanBResult } from '../types';

interface Props {
  planB: PlanBResult;
}

export default function PlanBComparison({ planB }: Props) {
  return (
    <div className="space-y-6 animate-scale-in">
      {/* Alert banner */}
      <div className="rounded-2xl border-2 border-gold/30 bg-gold-soft/20 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gold-soft flex items-center justify-center flex-shrink-0 border border-gold/30">
            <svg className="w-5 h-5 gold-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold purple-950 mb-1">
              检测到异常：{planB.event.type === 'queue' ? '排队过长' : planB.event.type === 'rain' ? '天气变化' : planB.event.type}
            </h3>
            <p className="text-sm purple-400">{planB.event.message}</p>
          </div>
        </div>
      </div>

      {/* Impact */}
      <div className="magic-card p-6">
        <h4 className="text-sm font-semibold purple-950 mb-2 flex items-center gap-2">
          <svg className="w-4 h-4 gold-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          影响分析
        </h4>
        <p className="text-sm purple-400 mb-4">{planB.impact}</p>
        <p className="text-sm purple-950 purple-50 rounded-xl p-3 border purple-100">
          {planB.message}
        </p>
      </div>

      {/* Changes */}
      <div className="magic-card p-6">
        <h4 className="text-sm font-semibold purple-950 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          路线调整记录
        </h4>

        <div className="space-y-3">
          {planB.changes.map((change, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-purple-50 border border-purple-100">
              <span className={`px-2 py-0.5 text-xs rounded-md font-medium border ${
                change.action === 'replace' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                change.action === 'shorten' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                'bg-red-50 text-red-500 border-red-200'
              }`}>
                {change.action === 'replace' ? '替换' : change.action === 'shorten' ? '缩短' : '移除'}
              </span>
              <div className="flex-1">
                {change.from && change.to ? (
                  <p className="text-sm purple-950">
                    <span className="line-through purple-300">{change.from}</span>
                    <svg className="w-4 h-4 inline mx-1 purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <span className="purple-600-dark font-medium">{change.to}</span>
                  </p>
                ) : change.to ? (
                  <p className="text-sm purple-950">
                    新增：<span className="purple-600-dark font-medium">{change.to}</span>
                  </p>
                ) : (
                  <p className="text-sm purple-950">
                    移除：<span className="line-through purple-300">{change.from}</span>
                  </p>
                )}
                <p className="text-xs purple-400 mt-1">{change.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Before / After route comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="magic-card p-5">
          <h4 className="text-sm font-semibold purple-400 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            调整前路线
          </h4>
          <div className="space-y-2">
            {planB.beforeRoute.steps.map((step) => (
              <div key={step.poi.id} className="flex items-center gap-2 text-sm">
                <span className="w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center text-xs purple-400 font-medium border border-purple-100">
                  {step.order}
                </span>
                <span className="purple-400">{step.poi.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs purple-300">
            {planB.beforeRoute.totalMinutes}分钟 · ¥{planB.beforeRoute.totalBudget}
          </div>
        </div>

        <div className="magic-card p-5 relative overflow-hidden purple-300">
          <div className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-semibold rounded-md purple-100 purple-600-dark border purple-200">
            Plan B
          </div>
          <h4 className="text-sm font-semibold purple-600-dark mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            调整后路线
          </h4>
          <div className="space-y-2">
            {planB.afterRoute.steps.map((step) => (
              <div key={step.poi.id} className="flex items-center gap-2 text-sm">
                <span className="w-5 h-5 rounded-full purple-100 flex items-center justify-center text-xs purple-600-dark font-medium border purple-200">
                  {step.order}
                </span>
                <span className="purple-950 font-medium">{step.poi.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs purple-300">
            {planB.afterRoute.totalMinutes}分钟 · ¥{planB.afterRoute.totalBudget}
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="flex flex-wrap gap-3 text-sm">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 border border-green-200">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="purple-400">
            保留了：{planB.keptPreferences.join('、') || '无'}
          </span>
        </div>
        {planB.sacrificed.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50 border border-purple-100">
            <svg className="w-4 h-4 purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="purple-400">
              牺牲了：{planB.sacrificed.join('、')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
