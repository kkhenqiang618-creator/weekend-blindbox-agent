import { useState, useCallback } from 'react';
import type { Plan, AppStep, LlmReplanConfig } from './types';
import InputPanel from './components/InputPanel';
import GiftBoxAnimation from './components/GiftBoxAnimation';
import RibbonsBackground from './components/RibbonsBackground';
import RouteTimeline from './components/RouteTimeline';
import PlanBComparison from './components/PlanBComparison';
import ExecutionPanel from './components/ExecutionPanel';
import RouteReviewPanel from './components/RouteReviewPanel';

interface HistoryEntry {
  step: AppStep;
  plan: Plan | null;
}

const API = {
  async generatePlan(rawText: string, quickSelections: Record<string, unknown> = {}): Promise<Plan> {
    const res = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText, quickSelections }),
    });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    return res.json();
  },

  async executePlan(plan: Plan): Promise<Plan> {
    const res = await fetch('/api/execute-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    return res.json();
  },

  async handleReplan(event: Record<string, unknown>, plan: Plan, llmConfig?: LlmReplanConfig): Promise<Plan> {
    const res = await fetch('/api/replan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, plan, llmConfig }),
    });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    return res.json();
  },
};

export default function App() {
  const [step, setStep] = useState<AppStep>('input');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [llmConfig, setLlmConfig] = useState<LlmReplanConfig>({
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
  });

  // Push current state to history before navigating
  const pushHistory = useCallback((currentStep: AppStep, currentPlan: Plan | null) => {
    setHistory((prev) => [...prev, { step: currentStep, plan: currentPlan }]);
  }, []);

  // Navigate to a new step
  const navigateTo = useCallback((newStep: AppStep, newPlan: Plan | null, currentStep: AppStep, currentPlan: Plan | null) => {
    pushHistory(currentStep, currentPlan);
    setPlan(newPlan);
    setStep(newStep);
  }, [pushHistory]);

  // Go back one step
  const handleBack = useCallback(() => {
    if (history.length === 0) return;
    setError(null);

    const newHistory = [...history];
    const prev = newHistory.pop()!;
    setHistory(newHistory);

    // If we're going back to input, clear plan
    if (prev.step === 'input' || prev.step === 'unboxing') {
      setPlan(null);
      setStep('input');
    } else {
      setPlan(prev.plan);
      setStep(prev.step);
    }
  }, [history]);

  const handleGenerate = useCallback(async (rawText: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await API.generatePlan(rawText);
      setPlan(result);
      setStep('unboxing');
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生未知错误');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUnboxComplete = useCallback(() => {
    if (plan) {
      navigateTo('plan', plan, 'unboxing', plan);
    }
  }, [plan, navigateTo]);

  const handleExecute = useCallback(async () => {
    if (!plan) return;
    setIsLoading(true);
    setError(null);

    try {
      const executed = await API.executePlan(plan);
      navigateTo('executed', executed, step, plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生未知错误');
    } finally {
      setIsLoading(false);
    }
  }, [plan, step, navigateTo]);

  const handleTriggerPlanB = useCallback(async (event: Record<string, unknown>, nextStep: AppStep = 'planb', llmConfig?: LlmReplanConfig) => {
    if (!plan) return;
    setIsLoading(true);
    setError(null);

    try {
      const replanned = await API.handleReplan(event, plan, llmConfig);
      navigateTo(nextStep, replanned, step, plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生未知错误');
    } finally {
      setIsLoading(false);
    }
  }, [plan, step, navigateTo]);

  const handleReset = useCallback(() => {
    setStep('input');
    setPlan(null);
    setHistory([]);
    setError(null);
  }, []);

  const canGoBack = history.length > 0 && !isLoading;

  const getBackLabel = () => {
    if (history.length === 0) return '';
    const prev = history[history.length - 1].step;
    const labels: Record<string, string> = {
      'input': '返回首页',
      'unboxing': '返回',
      'plan': '返回路线',
      'review': '返回确认',
      'executed': '撤回执行',
      'planb': '返回路线',
    };
    return labels[prev] || '返回';
  };

  return (
    <div className="min-h-screen relative">
      <RibbonsBackground />
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-purple-100 bg-white/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {canGoBack && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-500 hover:text-purple-700
                         bg-purple-50/80 hover:bg-purple-100 rounded-lg transition-all duration-200
                         border border-transparent hover:border-purple-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {getBackLabel()}
              </button>
            )}

            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #FDE68A 0%, #FBBF24 50%, #F59E0B 100%)', boxShadow: '0 4px 16px rgba(251,191,36,0.4)' }}>
              <svg className="w-5 h-5" style={{ color: '#5B21B6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7l8 4m0 0v10M4 7v10l8 4" />
              </svg>
            </div>
            <h1 className="text-xl font-logo font-semibold tracking-tight" style={{ color: '#FBBF24', textShadow: '0 2px 8px rgba(251,191,36,0.3)' }}>
              Weekend<span style={{ color: '#7C3AED' }}>Buddy</span>
            </h1>
          </div>

          {step !== 'input' && !isLoading && (
            <button
              onClick={handleReset}
              className="text-sm text-purple-400 hover:text-purple-600 transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">重新开始</span>
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        {/* Loading overlay */}
        {isLoading && step !== 'unboxing' && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-gift-gold/20 border-t-gift-gold rounded-full animate-spin" />
              <p className="text-sm text-gift-dark/50">处理中...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-in">
            {error}
          </div>
        )}

        {step === 'input' && !isLoading && (
          <InputPanel
            onSubmit={handleGenerate}
            isLoading={isLoading}
            llmConfig={llmConfig}
            onLlmConfigChange={setLlmConfig}
          />
        )}

        {step === 'unboxing' && plan && (
          <GiftBoxAnimation
            blindBox={plan.blindBox}
            stepCount={plan.route.steps.length}
            poiNames={plan.route.steps.map((s) => s.poi.name)}
            onComplete={handleUnboxComplete}
          />
        )}

        {step === 'plan' && plan && (
          <section className="mx-auto max-w-5xl space-y-5 animate-slide-up">
            <RouteTimeline route={plan.route} />
            <div className="rounded-[1.5rem] border border-white/60 bg-white/70 p-4 shadow-[0_18px_54px_rgba(91,33,182,0.12)] backdrop-blur-xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-extrabold text-purple-950">这条路线先收进盲盒结果</p>
                  <p className="mt-1 text-xs font-semibold text-purple-500">满意就让 Agent 进入预订辅助；不满意可以进入下一页调整路线。</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <button
                    onClick={handleReset}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-purple-200 bg-white/70 px-5 py-3 text-sm font-bold text-purple-700
                             transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-300 hover:bg-purple-50 hover:shadow-md
                             disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    重新生成
                  </button>
                  <button
                    onClick={() => navigateTo('review', plan, 'plan', plan)}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-200 bg-amber-50/80 px-5 py-3 text-sm font-bold text-amber-700
                             transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-100 hover:shadow-md
                             disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m12 14a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    调整需求
                  </button>
                  <button
                    onClick={handleExecute}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-purple-900 px-6 py-3 text-sm font-extrabold text-white
                             shadow-[0_14px_30px_rgba(124,58,237,0.32)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(124,58,237,0.42)]
                             disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    确认路线
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {step === 'review' && plan && (
          <section className="mx-auto max-w-4xl">
            <RouteReviewPanel
              plan={plan}
              isLoading={isLoading}
              llmConfig={llmConfig}
              onConfirm={handleExecute}
              onReplaceRoute={async () => {
                const target = plan.route.steps.find((routeStep) => routeStep.role === 'activity') ?? plan.route.steps[0];
                if (!target) return;
                await handleTriggerPlanB({
                  type: 'unavailable',
                  poiId: target.poi.id,
                  message: '用户不满意当前路线，希望先替换核心节点并重新规划',
                }, 'review');
              }}
              onReplaceStep={async (routeStep, candidateName, llmConfig, customPrompt) => {
                await handleTriggerPlanB({
                  type: 'unavailable',
                  poiId: routeStep.poi.id,
                  message: [
                    candidateName
                      ? `用户希望将「${routeStep.poi.name}」替换为「${candidateName}」`
                      : `用户希望更换「${routeStep.poi.name}」这个节点`,
                    customPrompt?.trim() ? `用户补充偏好：${customPrompt.trim()}` : '',
                  ].filter(Boolean).join('；'),
                }, 'review', llmConfig);
              }}
            />
          </section>
        )}

        {step === 'executed' && plan?.executionTasks && (
          <section className="mx-auto max-w-3xl animate-slide-up">
            <ExecutionPanel tasks={plan.executionTasks} />
          </section>
        )}

        {step === 'planb' && plan?.planB && (
          <section className="mx-auto max-w-4xl animate-slide-up">
            <PlanBComparison planB={plan.planB} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 mt-10">
        <p className="text-center text-xs font-medium tracking-wide text-purple-300/70">Weekend Buddy · 周末盲盒 Demo</p>
      </footer>
    </div>
  );
}
