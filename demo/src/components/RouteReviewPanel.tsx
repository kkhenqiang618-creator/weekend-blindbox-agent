import { useState } from 'react';
import type { LlmReplanConfig, Plan, RouteStep } from '../types';

interface Props {
  plan: Plan;
  isLoading: boolean;
  llmConfig: LlmReplanConfig;
  onConfirm: () => void;
  onReplaceRoute: () => void;
  onReplaceStep: (step: RouteStep, candidateName?: string, llmConfig?: LlmReplanConfig, customPrompt?: string) => void;
}

const ROLE_LABEL: Record<string, string> = {
  activity: '玩乐',
  break: '休憩',
  meal: '美食',
  ending: '收尾',
};

interface ReplacementCandidate {
  id: string;
  name: string;
  type: string;
  area: string;
  price: number;
  stayMinutes: number;
  reason: string;
  tags: string[];
}

const MOCK_CANDIDATES_BY_ROLE: Record<string, ReplacementCandidate[]> = {
  activity: [
    { id: 'mock-activity-1', name: '华侨城创意文化园', type: '文化体验', area: '南山华侨城', price: 0, stayMinutes: 90, reason: '同样适合拍照和轻松闲逛，室内外空间都有，替换后不会打乱咖啡和正餐节奏。', tags: ['拍照', '小众', '轻松'] },
    { id: 'mock-activity-2', name: '深业上城空中小镇', type: '休闲娱乐', area: '福田莲花', price: 0, stayMinutes: 80, reason: '动线集中，适合朋友边逛边拍照，距离餐饮点更容易衔接。', tags: ['城市漫步', '拍照', '少走路'] },
    { id: 'mock-activity-3', name: '深圳湾万象城艺文街区', type: '拍照地标', area: '南山后海', price: 0, stayMinutes: 75, reason: '商业配套完整，天气变化时也更稳，适合做路线中的核心节点。', tags: ['雨天友好', '拍照', '好衔接'] },
    { id: 'mock-activity-4', name: '海上世界文化艺术中心', type: '文化体验', area: '蛇口', price: 40, stayMinutes: 100, reason: '更有展览和海边氛围，适合把原本的普通打卡点升级成更有记忆点的一站。', tags: ['展览', '海边', '氛围感'] },
  ],
  break: [
    { id: 'mock-break-1', name: 'Gee Coffee Roasters', type: '轻食甜饮', area: '南山科技园', price: 45, stayMinutes: 60, reason: '咖啡稳定、停留时间可控，适合作为中途休息，不会拖慢后续路线。', tags: ['咖啡', '休息', '少排队'] },
    { id: 'mock-break-2', name: '野萃山茶咖', type: '轻食甜饮', area: '福田中心', price: 38, stayMinutes: 50, reason: '价格更轻，适合替换高峰期排队的甜饮点，并保留轻松聊天氛围。', tags: ['茶咖', '预算友好', '轻松'] },
    { id: 'mock-break-3', name: 'M Stand 社区店', type: '轻食甜饮', area: '南山后海', price: 52, stayMinutes: 55, reason: '出品和空间更稳定，适合朋友出行时作为明确集合/休息节点。', tags: ['咖啡', '空间稳定', '好集合'] },
    { id: 'mock-break-4', name: 'Baker & Spice', type: '轻食甜饮', area: '福田COCO Park', price: 58, stayMinutes: 65, reason: '轻食和甜点选择多，能同时满足休息和补能，替换后路线体验更完整。', tags: ['甜点', '轻食', '补能'] },
  ],
  meal: [
    { id: 'mock-meal-1', name: '大良陈记老铺·顺德双皮奶', type: '餐饮正餐', area: '福田中心', price: 75, stayMinutes: 80, reason: '排队风险相对可控，口味接受度高，适合朋友路线中的正餐替代。', tags: ['美食', '顺德', '稳妥'] },
    { id: 'mock-meal-2', name: '啫火啫啫煲', type: '餐饮正餐', area: '南山后海', price: 88, stayMinutes: 90, reason: '烟火气更强，适合把普通餐饮换成更有周末感的一站。', tags: ['热闹', '正餐', '氛围'] },
    { id: 'mock-meal-3', name: '陶陶居', type: '餐饮正餐', area: '罗湖万象城', price: 95, stayMinutes: 90, reason: '菜品覆盖面广，适合多人同行，替换后更不容易踩偏口味。', tags: ['粤菜', '多人友好', '经典'] },
    { id: 'mock-meal-4', name: '蘩楼', type: '餐饮正餐', area: '福田皇庭', price: 90, stayMinutes: 85, reason: '位置更好衔接商圈路线，适合作为后半程餐饮节点。', tags: ['粤菜', '商圈', '好衔接'] },
  ],
  ending: [
    { id: 'mock-ending-1', name: '深圳人才公园夜景段', type: '户外散步', area: '南山后海', price: 0, stayMinutes: 60, reason: '适合作为收尾散步点，成本低、氛围轻松，能让路线自然结束。', tags: ['夜景', '散步', '免费'] },
    { id: 'mock-ending-2', name: '海上世界明华轮广场', type: '拍照地标', area: '蛇口', price: 0, stayMinutes: 70, reason: '夜间辨识度更强，适合最后拍照打卡，替换后结果感更好。', tags: ['夜景', '拍照', '地标'] },
    { id: 'mock-ending-3', name: '卓悦中心街区', type: '休闲娱乐', area: '福田中心', price: 0, stayMinutes: 60, reason: '交通和商业配套更稳，适合作为不确定天气下的收尾选择。', tags: ['商圈', '雨天友好', '交通方便'] },
    { id: 'mock-ending-4', name: '欢乐港湾摩天轮广场', type: '拍照地标', area: '宝安中心', price: 0, stayMinutes: 80, reason: '更有仪式感和盲盒惊喜感，适合把路线结尾做得更难忘。', tags: ['仪式感', '拍照', '海边'] },
  ],
};

function getReplacementCandidates(step: RouteStep): ReplacementCandidate[] {
  return MOCK_CANDIDATES_BY_ROLE[step.role] ?? MOCK_CANDIDATES_BY_ROLE.activity;
}

function StepGuide() {
  const steps = ['点选路线节点', '查看推荐替代', '确认更新路线'];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {steps.map((label, index) => (
        <div key={label} className="rounded-2xl border border-purple-100 bg-white/66 p-4 shadow-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-extrabold text-purple-700">
            {index + 1}
          </span>
          <p className="mt-3 text-sm font-extrabold text-purple-950">{label}</p>
        </div>
      ))}
    </div>
  );
}

function EmptyTuningState({ onStart }: { onStart: () => void }) {
  return (
    <section className="animate-fade-in rounded-[2rem] border border-white/58 bg-gradient-to-br from-white/78 via-purple-50/60 to-amber-50/72 p-5 shadow-[0_22px_70px_rgba(91,33,182,0.14)] backdrop-blur-2xl sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-amber-100/76 px-4 py-2 text-sm font-extrabold text-amber-700">
            <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01" />
            </svg>
            路线微调工作台
          </div>
          <h3 className="text-2xl font-extrabold text-purple-950">想微调哪一站？</h3>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-purple-800/70">
            只替换一个节点，其余路线会保持不变。Buddy 会根据你的原始愿望、预算和排队情况推荐 Plan B。
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="relative flex h-36 w-36 items-center justify-center rounded-[2rem] border border-purple-200/70 bg-white/62 shadow-[0_16px_42px_rgba(124,58,237,0.12)]">
            <div className="absolute h-24 w-24 rounded-full border border-amber-300/70" />
            <div className="absolute h-16 w-16 rounded-full border border-purple-300/70" />
            <svg className="relative h-12 w-12 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13l-6-3m6 3V4m0 0L9 7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <StepGuide />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-bold text-purple-500">先选择一站，Buddy 会只替换这一个节点。</p>
        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-purple-900 px-6 py-3 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(124,58,237,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(124,58,237,0.4)]"
        >
          选择要替换的节点
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </section>
  );
}

function NodeSelectionPanel({
  plan,
  selectedStep,
  selectedStepId,
  isLoading,
  onSelect,
  onPrepareReplace,
  onCancel,
}: {
  plan: Plan;
  selectedStep: RouteStep;
  selectedStepId: string;
  isLoading: boolean;
  onSelect: (id: string) => void;
  onPrepareReplace: () => void;
  onCancel: () => void;
}) {
  return (
    <section className="animate-fade-in rounded-[2rem] border border-white/58 bg-gradient-to-br from-white/80 via-purple-50/58 to-amber-50/72 p-5 shadow-[0_22px_70px_rgba(91,33,182,0.14)] backdrop-blur-2xl sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-600">Node tuning</p>
          <h3 className="mt-2 text-2xl font-extrabold text-purple-950">选择要替换的节点</h3>
          <p className="mt-3 text-sm font-semibold leading-6 text-purple-800/70">
            点选其中一站，Buddy 会生成替代节点，并尽量保留其他路线安排。
          </p>

          <div className="mt-5 rounded-2xl border border-purple-100 bg-white/64 p-4">
            <p className="text-xs font-bold text-purple-500">当前选中</p>
            <p className="mt-2 text-base font-extrabold text-purple-950">{selectedStep.poi.name}</p>
            <p className="mt-1 text-xs font-semibold text-purple-500">
              {ROLE_LABEL[selectedStep.role] ?? selectedStep.poi.type} · {selectedStep.poi.businessDistrict} · ¥{selectedStep.poi.price}/人
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3">
            {plan.route.steps.map((step) => {
              const isSelected = selectedStepId === step.poi.id;

              return (
                <button
                  key={step.poi.id}
                  type="button"
                  onClick={() => onSelect(step.poi.id)}
                  className={`rounded-2xl border px-4 py-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    isSelected
                      ? 'border-purple-400 bg-purple-50/90 text-purple-950 shadow-purple-200/50'
                      : 'border-purple-100 bg-white/74 text-purple-800 hover:border-amber-200 hover:bg-amber-50/70'
                  }`}
                >
                  <span className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold ${isSelected ? 'bg-purple-700 text-white' : 'bg-purple-100 text-purple-700'}`}>
                          {step.order}
                        </span>
                        <span className="rounded-full border border-purple-100 bg-white/74 px-2.5 py-1 text-xs font-bold text-purple-600">
                          {ROLE_LABEL[step.role] ?? step.poi.type}
                        </span>
                      </span>
                      <span className="mt-2 block truncate text-base font-extrabold">{step.poi.name}</span>
                      <span className="mt-1 block truncate text-xs font-semibold text-purple-500">
                        {step.poi.businessDistrict} · {step.poi.routeCluster ?? step.poi.area ?? '附近'}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-wrap gap-2">
                      <span className="rounded-full bg-white/82 px-3 py-1.5 text-xs font-bold text-purple-600">¥{step.poi.price}/人</span>
                      <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">{step.poi.stayMinutes} 分钟</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-white/70 bg-white/58 p-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-full border border-purple-200 bg-white/70 px-5 py-3 text-sm font-bold text-purple-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-purple-50 disabled:opacity-40"
            >
              取消调整
            </button>
            <button
              type="button"
              onClick={onPrepareReplace}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-purple-900 px-6 py-3 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(124,58,237,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(124,58,237,0.4)] disabled:opacity-40"
            >
              {isLoading ? '准备中...' : `查看替换「${selectedStep.poi.name}」的理由`}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReplacementOptionsCard({
  step,
  candidates,
  selectedCandidateId,
  customPrompt,
  isLoading,
  llmConfig,
  onCustomPromptChange,
  onSelectCandidate,
  onConfirm,
  onCancel,
}: {
  step: RouteStep;
  candidates: ReplacementCandidate[];
  selectedCandidateId: string;
  customPrompt: string;
  isLoading: boolean;
  llmConfig: LlmReplanConfig;
  onCustomPromptChange: (value: string) => void;
  onSelectCandidate: (id: string) => void;
  onConfirm: (candidate: ReplacementCandidate, llmConfig?: LlmReplanConfig, customPrompt?: string) => void;
  onCancel: () => void;
}) {
  const selectedCandidate = candidates.find((candidate) => candidate.id === selectedCandidateId) ?? candidates[0];
  const hasCustomPrompt = customPrompt.trim().length > 0;

  return (
    <section className="animate-fade-in rounded-[2rem] border border-amber-200/80 bg-gradient-to-br from-amber-50/88 via-white/78 to-purple-50/60 p-5 shadow-[0_22px_70px_rgba(217,119,6,0.13)] backdrop-blur-2xl sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-600">Replacement options</p>
          <h3 className="mt-2 text-2xl font-extrabold text-purple-950">推荐替换成哪个节点？</h3>
          <p className="mt-3 text-sm font-semibold leading-6 text-purple-800/72">
            已为「{step.poi.name}」准备了 3-4 个替代方向。每个候选都说明为什么适合替换这一站。
          </p>
        </div>

        <div className="rounded-2xl border border-purple-100 bg-white/70 p-4 shadow-sm">
          <p className="text-xs font-bold text-purple-500">即将替换</p>
          <p className="mt-2 text-lg font-extrabold text-purple-950">{step.poi.name}</p>
          <p className="mt-1 text-xs font-semibold text-purple-500">
            {ROLE_LABEL[step.role] ?? step.poi.type} · {step.poi.businessDistrict} · ¥{step.poi.price}/人
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {candidates.map((candidate) => {
          const isSelected = selectedCandidate.id === candidate.id;

          return (
            <button
              key={candidate.id}
              type="button"
              onClick={() => onSelectCandidate(candidate.id)}
              className={`rounded-2xl border p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                isSelected
                  ? 'border-purple-400 bg-purple-50/90 text-purple-950 shadow-purple-200/50'
                  : 'border-purple-100 bg-white/72 text-purple-800 hover:border-amber-200 hover:bg-amber-50/70'
              }`}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${isSelected ? 'bg-purple-700 text-white' : 'bg-purple-100 text-purple-700'}`}>
                      推荐
                    </span>
                    <span className="rounded-full bg-white/82 px-2.5 py-1 text-xs font-bold text-amber-700">
                      ¥{candidate.price}/人
                    </span>
                  </span>
                  <span className="mt-3 block text-lg font-extrabold">{candidate.name}</span>
                  <span className="mt-1 block text-xs font-semibold text-purple-500">
                    {candidate.type} · {candidate.area} · {candidate.stayMinutes} 分钟
                  </span>
                </span>
              </span>
              <span className="mt-3 block text-sm font-semibold leading-6 text-purple-900/74">
                {candidate.reason}
              </span>
              <span className="mt-3 flex flex-wrap gap-1.5">
                {candidate.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white/76 px-2.5 py-1 text-[11px] font-bold text-purple-600">
                    {tag}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-[1.35rem] border border-purple-100 bg-white/66 p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-extrabold text-purple-950">使用首页的大模型配置判断</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-purple-600/80">
              确认后会优先让 {llmConfig.model || 'deepseek-chat'} 从真实 POI 候选池中判断替代点；如果模型不可用，会自动规则兜底。
            </p>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
            Key 已隐藏
          </span>
        </div>
      </div>

      <div className="mt-5 rounded-[1.35rem] border border-amber-200/80 bg-amber-50/68 p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-extrabold text-purple-950">都不满意？描述你想换成什么样</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-purple-700/76">
              例如：“这个节点我想换成去玩的地方”“想要室内、不排队、适合拍照”。Buddy 会按这句话重新让模型判断。
            </p>
          </div>
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-amber-700">
            自定义优先
          </span>
        </div>
        <textarea
          value={customPrompt}
          onChange={(event) => onCustomPromptChange(event.target.value)}
          rows={3}
          placeholder="比如：我想把这一站换成更好玩的室内项目，最好别排队，适合朋友一起拍照。"
          className="mt-3 min-h-[6rem] w-full resize-none rounded-2xl border border-amber-200 bg-white/86 px-4 py-3 text-sm font-semibold leading-6 text-purple-950 outline-none transition placeholder:text-purple-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10"
        />
      </div>

      <div className="mt-5 flex flex-col gap-2 rounded-2xl border border-white/70 bg-white/58 p-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-full border border-purple-200 bg-white/76 px-5 py-3 text-sm font-bold text-purple-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-purple-50 disabled:opacity-40"
        >
          返回重新选择
        </button>
        <button
          type="button"
          onClick={() => onConfirm(selectedCandidate, llmConfig, customPrompt)}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-purple-900 px-6 py-3 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(124,58,237,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(124,58,237,0.4)] disabled:opacity-40"
        >
          {isLoading ? '替换中...' : hasCustomPrompt ? '按我的描述重新判断' : `确认替换为「${selectedCandidate.name}」`}
        </button>
      </div>
    </section>
  );
}

function NoReplacementState({ message, impact, onRetry }: { message?: string; impact?: string; onRetry: () => void }) {
  return (
    <section className="animate-fade-in rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50/86 via-white/78 to-purple-50/56 p-5 shadow-[0_18px_54px_rgba(217,119,6,0.12)] backdrop-blur sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-700">Plan B pending</p>
          <h3 className="mt-2 text-2xl font-extrabold text-purple-950">暂时没有找到合适替代点</h3>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-purple-800/74">
            {message || impact || '当前规则没有找到满足预算、距离、同行人和路线顺序的替代节点。你可以换另一个节点再试。'}
          </p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-white/76 px-5 py-3 text-sm font-bold text-amber-800 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-50"
        >
          换一个节点试试
        </button>
      </div>
    </section>
  );
}

export default function RouteReviewPanel({
  plan,
  isLoading,
  llmConfig,
  onConfirm,
  onReplaceRoute,
  onReplaceStep,
}: Props) {
  const [mode, setMode] = useState<'idle' | 'route' | 'node'>('idle');
  const [selectedStepId, setSelectedStepId] = useState<string>(plan.route.steps[0]?.poi.id ?? '');
  const [pendingConfirmStep, setPendingConfirmStep] = useState<RouteStep | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [customReplacementPrompt, setCustomReplacementPrompt] = useState('');
  const selectedStep = plan.route.steps.find((step) => step.poi.id === selectedStepId) ?? plan.route.steps[0];
  const replacementCandidates = pendingConfirmStep ? getReplacementCandidates(pendingConfirmStep) : [];
  const latestChange = plan.planB?.changes?.[0];
  const noReplacementFound = Boolean(plan.planB && !latestChange);

  return (
    <div className="space-y-6 animate-slide-up">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/58 bg-gradient-to-br from-white/80 via-purple-50/58 to-amber-50/72 p-5 shadow-[0_22px_70px_rgba(91,33,182,0.14)] backdrop-blur-2xl sm:p-6">
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_280px] md:items-start">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-600">Route approval</p>
            <h2 className="mt-2 text-3xl font-extrabold text-purple-950">这条路线满意吗？</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-purple-800/70">
              你可以直接进入 Agent 预订辅助，也可以先让 Buddy 微调路线。
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm">
            <p className="text-xs font-extrabold text-amber-700">Agent 预订能力说明</p>
            <p className="mt-2 text-xs font-semibold leading-5 text-amber-700/80">
              当前版本只模拟预订前的信息整理和入口跳转，不会真实登录美团、下单或声明预订成功。
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-2xl bg-gradient-to-r from-purple-600 via-purple-700 to-purple-900 px-4 py-4 text-left text-white shadow-[0_14px_30px_rgba(124,58,237,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(124,58,237,0.38)] disabled:opacity-50"
          >
            <span className="flex items-center gap-2 text-sm font-extrabold">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              满意，确认路线
            </span>
            <span className="mt-2 block text-xs font-semibold leading-5 text-white/78">进入 Agent 代预订辅助</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('route')}
            disabled={isLoading}
            className={`rounded-2xl border px-4 py-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 ${
              mode === 'route'
                ? 'border-amber-300 bg-amber-50 text-amber-800 shadow-amber-200/40'
                : 'border-purple-100 bg-white/72 text-purple-950 hover:border-amber-200 hover:bg-amber-50/70'
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-extrabold">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8 8 0 004.582 9M4.582 9H9m11 11v-5h-.581m0 0a8 8 0 01-15.357-2m15.357 2H15" />
              </svg>
              不满意，换路线
            </span>
            <span className="mt-2 block text-xs font-semibold leading-5 text-purple-500">替换核心节点并重新规划</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('node')}
            disabled={isLoading}
            className={`rounded-2xl border px-4 py-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 ${
              mode === 'node'
                ? 'border-purple-300 bg-purple-50 text-purple-950 shadow-purple-200/50'
                : 'border-purple-100 bg-white/72 text-purple-950 hover:border-purple-300 hover:bg-purple-50/70'
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-extrabold">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01" />
              </svg>
              只换一个节点
            </span>
            <span className="mt-2 block text-xs font-semibold leading-5 text-purple-500">点选某一站替换成 Plan B</span>
          </button>
        </div>
      </section>

      {mode === 'idle' && !latestChange && !noReplacementFound && (
        <EmptyTuningState onStart={() => setMode('node')} />
      )}

      {mode === 'route' && (
        <section className="animate-fade-in rounded-[2rem] border border-white/58 bg-gradient-to-br from-white/78 via-amber-50/68 to-purple-50/60 p-5 shadow-[0_22px_70px_rgba(91,33,182,0.14)] backdrop-blur-2xl sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-600">Route Plan B</p>
              <h3 className="mt-2 text-2xl font-extrabold text-purple-950">重新更换路线</h3>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-purple-800/70">
                Demo 会先替换第一站核心节点，并让 Agent 重新计算后续路线。生成后会保留你的预算、人数和偏好。
              </p>
            </div>
            <button
              type="button"
              onClick={onReplaceRoute}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-3 text-sm font-extrabold text-purple-950 shadow-[0_12px_28px_rgba(217,119,6,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-300 disabled:opacity-50"
            >
              {isLoading ? '调整中...' : '生成替代路线'}
            </button>
          </div>
        </section>
      )}

      {mode === 'node' && selectedStep && (
        <NodeSelectionPanel
          plan={plan}
          selectedStep={selectedStep}
          selectedStepId={selectedStepId}
          isLoading={isLoading}
          onSelect={(id) => {
            setSelectedStepId(id);
            setPendingConfirmStep(null);
            setSelectedCandidateId('');
            setCustomReplacementPrompt('');
          }}
          onPrepareReplace={() => {
            const candidates = getReplacementCandidates(selectedStep);
            setPendingConfirmStep(selectedStep);
            setSelectedCandidateId(candidates[0]?.id ?? '');
            setCustomReplacementPrompt('');
          }}
          onCancel={() => {
            setPendingConfirmStep(null);
            setSelectedCandidateId('');
            setCustomReplacementPrompt('');
            setMode('idle');
          }}
        />
      )}

      {mode === 'node' && pendingConfirmStep && (
        <ReplacementOptionsCard
          step={pendingConfirmStep}
          candidates={replacementCandidates}
          selectedCandidateId={selectedCandidateId}
          customPrompt={customReplacementPrompt}
          isLoading={isLoading}
          llmConfig={llmConfig}
          onCustomPromptChange={setCustomReplacementPrompt}
          onSelectCandidate={setSelectedCandidateId}
          onCancel={() => {
            setPendingConfirmStep(null);
            setSelectedCandidateId('');
            setCustomReplacementPrompt('');
          }}
          onConfirm={(candidate, config, prompt) => onReplaceStep(pendingConfirmStep, candidate.name, config, prompt)}
        />
      )}

      {noReplacementFound && (
        <NoReplacementState
          message={plan.planB?.message}
          impact={plan.planB?.impact}
          onRetry={() => {
            setPendingConfirmStep(null);
            setMode('node');
          }}
        />
      )}

      {latestChange && (
        <section className="animate-fade-in rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white/78 to-purple-50/54 p-5 shadow-[0_18px_54px_rgba(16,185,129,0.12)] backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">Updated</p>
              <h3 className="mt-2 text-2xl font-extrabold text-emerald-900">已完成一次修改</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-emerald-800/82">
                {latestChange.from ? `已将「${latestChange.from}」` : '已调整路线'}
                {latestChange.to ? `替换为「${latestChange.to}」` : ''}
                。满意后可以继续确认进入预订辅助。
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setMode('node')}
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white/76 px-5 py-3 text-sm font-bold text-emerald-800 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 disabled:opacity-40"
              >
                再换一个节点
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-purple-900 px-6 py-3 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(124,58,237,0.28)] transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40"
              >
                继续确认路线
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
