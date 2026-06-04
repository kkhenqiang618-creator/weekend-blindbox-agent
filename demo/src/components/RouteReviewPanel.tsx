import { useState } from 'react';
import type { Plan, RouteStep } from '../types';

interface Props {
  plan: Plan;
  isLoading: boolean;
  onConfirm: () => void;
  onReplaceRoute: () => void;
  onReplaceStep: (step: RouteStep) => void;
}

export default function RouteReviewPanel({
  plan,
  isLoading,
  onConfirm,
  onReplaceRoute,
  onReplaceStep,
}: Props) {
  const [mode, setMode] = useState<'idle' | 'route' | 'node'>('idle');
  const [selectedStepId, setSelectedStepId] = useState<string>(plan.route.steps[0]?.poi.id ?? '');
  const selectedStep = plan.route.steps.find((step) => step.poi.id === selectedStepId) ?? plan.route.steps[0];
  const latestChange = plan.planB?.changes?.[0];

  return (
    <div className="space-y-6 animate-slide-up">
      <section className="magic-card p-5 sm:p-6">
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_280px] md:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-300">Route approval</p>
            <h2 className="mt-2 text-2xl font-display font-semibold text-purple-950">这条路线满意吗？</h2>
            <p className="mt-3 text-sm leading-6 text-purple-500">
              确认后，Agent 会进入代预订辅助：生成确认座位话术、整理美团入口和最后一步操作提示。
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
            <p className="text-xs font-semibold text-amber-700">Agent 预订能力说明</p>
            <p className="mt-2 text-xs leading-5 text-amber-700/80">
              当前版本只模拟预订前的信息整理和入口跳转，不会真实登录美团、下单或声明预订成功。
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-2xl bg-purple-700 px-4 py-4 text-left text-white shadow-lg shadow-purple-500/20 transition hover:-translate-y-0.5 hover:bg-purple-800 disabled:opacity-50"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              满意，确认路线
            </span>
            <span className="mt-2 block text-xs leading-5 text-white/75">进入 Agent 代预订辅助</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('route')}
            disabled={isLoading}
            className={`rounded-2xl border px-4 py-4 text-left transition disabled:opacity-50 ${
              mode === 'route'
                ? 'border-amber-300 bg-amber-50 text-amber-800'
                : 'border-purple-100 bg-white text-purple-950 hover:border-amber-200 hover:bg-amber-50/60'
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8 8 0 004.582 9M4.582 9H9m11 11v-5h-.581m0 0a8 8 0 01-15.357-2m15.357 2H15" />
              </svg>
              不满意，换路线
            </span>
            <span className="mt-2 block text-xs leading-5 text-purple-400">替换核心节点并重新规划</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('node')}
            disabled={isLoading}
            className={`rounded-2xl border px-4 py-4 text-left transition disabled:opacity-50 ${
              mode === 'node'
                ? 'border-sky-300 bg-sky-50 text-sky-800'
                : 'border-purple-100 bg-white text-purple-950 hover:border-sky-200 hover:bg-sky-50/60'
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01" />
              </svg>
              只换一个节点
            </span>
            <span className="mt-2 block text-xs leading-5 text-purple-400">点选某一站替换成 Plan B</span>
          </button>
        </div>
      </section>

      {mode === 'route' && (
        <section className="magic-card p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-purple-950">重新更换路线</h3>
              <p className="mt-1 text-sm leading-6 text-purple-400">
                Demo 会先替换第一站核心节点，并让 Agent 重新计算后续路线。
              </p>
            </div>
            <button
              type="button"
              onClick={onReplaceRoute}
              disabled={isLoading}
              className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-purple-950 shadow-sm transition hover:bg-amber-400 disabled:opacity-50"
            >
              {isLoading ? '调整中...' : '生成替代路线'}
            </button>
          </div>
        </section>
      )}

      {mode === 'node' && selectedStep && (
        <section className="magic-card p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
            <div>
              <h3 className="text-lg font-semibold text-purple-950">选择要替换的节点</h3>
              <p className="mt-1 text-sm leading-6 text-purple-400">用户可以只修改某一站，其他偏好尽量保留。</p>
            </div>

            <div className="space-y-3">
              <div className="grid gap-2">
                {plan.route.steps.map((step) => (
                  <button
                    key={step.poi.id}
                    type="button"
                    onClick={() => setSelectedStepId(step.poi.id)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      selectedStepId === step.poi.id
                        ? 'border-purple-300 bg-purple-50 text-purple-950'
                        : 'border-purple-100 bg-white text-purple-500 hover:border-purple-200'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">
                          {step.order}. {step.poi.name}
                        </span>
                        <span className="mt-1 block truncate text-xs text-purple-300">
                          {step.poi.type} · {step.poi.businessDistrict}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-white/80 px-2 py-1 text-[10px] text-purple-400">
                        ¥{step.poi.price}
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => onReplaceStep(selectedStep)}
                disabled={isLoading}
                className="w-full rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
              >
                {isLoading ? '替换中...' : `替换「${selectedStep.poi.name}」`}
              </button>
            </div>
          </div>
        </section>
      )}

      {latestChange && (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm font-semibold text-emerald-800">已完成一次修改</p>
          <p className="mt-2 text-sm leading-6 text-emerald-700">
            {latestChange.from ? `已将「${latestChange.from}」` : '已调整路线'}
            {latestChange.to ? `替换为「${latestChange.to}」` : ''}
            。满意后可以继续确认进入预订辅助。
          </p>
        </section>
      )}
    </div>
  );
}
