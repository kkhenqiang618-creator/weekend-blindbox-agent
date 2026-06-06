import { useState } from 'react';
import type { LlmReplanConfig } from '../types';

const QUICK_CHIPS = [
  { label: '朋友出行', key: 'peopleType', value: '朋友' },
  { label: '情侣约会', key: 'peopleType', value: '情侣' },
  { label: '亲子活动', key: 'peopleType', value: '亲子' },
  { label: '一个人', key: 'peopleType', value: '单人' },
  { label: '不想排队', key: 'constraints', value: '不想排队' },
  { label: '室内优先', key: 'constraints', value: '室内优先' },
];

const PLACEHOLDERS = [
  '现在有点无聊，有没有什么可以打卡拍照的地方？',
  '周末下午想和朋友喝咖啡吃甜点，不想排队',
  '带娃出去玩半天，要轻松一点',
  '今天想一个人去逛逛公园',
  '下雨天想找室内好玩的地方',
];

const MOCK_SUGGESTIONS = [
  '现在有点无聊，附近有没有可以打卡拍照的地方？',
  '周末下午想和朋友在深圳拍照喝咖啡，不想排队',
  '带娃出去玩半天，要亲子的',
  '一个人想找个安静的地方看书喝咖啡',
  '今晚想和朋友看夜景，吃点简餐，别太赶',
  '情侣约会想找夜景好一点、能小酌的地方',
  '龙岗附近有没有适合拍照又能顺便吃点东西的路线？',
  '下雨天想找室内手作或者展览，附近再喝杯咖啡',
  '周末想省钱一点，公园散步加平价美食',
  '想找个小众文化点，适合一个人慢慢逛',
];

const BLIND_BOX_THEMES = [
  { value: '惊喜盲盒', label: '惊喜盲盒', desc: '让 Agent 自动判断风格' },
  { value: '小众拍照吃货盒', label: '小众拍照吃货盒', desc: '打卡、咖啡和美食优先' },
  { value: '夜景微醺盒', label: '夜景微醺盒', desc: '夜景、简餐和小酌氛围' },
  { value: '雨天室内回血盒', label: '雨天室内回血盒', desc: '室内、解压、稳定执行' },
  { value: '亲子轻松放电盒', label: '亲子轻松放电盒', desc: '低强度亲子半日路线' },
  { value: '城市散步疗愈盒', label: '城市散步疗愈盒', desc: '散步、安静和轻体验' },
  { value: '省钱快乐盒', label: '省钱快乐盒', desc: '预算友好和性价比' },
];

interface Props {
  onSubmit: (rawText: string, quickSelections?: Record<string, unknown>) => void;
  isLoading: boolean;
  llmConfig: LlmReplanConfig;
  onLlmConfigChange: (config: LlmReplanConfig) => void;
}

export default function InputPanel({ onSubmit, isLoading, llmConfig, onLlmConfigChange }: Props) {
  const [rawText, setRawText] = useState('');
  const [blindBoxTheme, setBlindBoxTheme] = useState('惊喜盲盒');
  const [showModelConfig, setShowModelConfig] = useState(false);
  const [placeholder] = useState(() => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]);
  const [suggestions] = useState(() => shuffle(MOCK_SUGGESTIONS).slice(0, 4));

  const handleSubmit = () => {
    const text = rawText.trim();
    if (!text) return;
    onSubmit(text, { blindBoxTheme });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="animate-scale-in">
      <div className="relative mx-auto max-w-3xl">
        <div className="absolute -inset-x-8 top-10 h-48 rounded-full bg-purple-400/16 blur-3xl" />
        <div className="absolute -bottom-8 left-10 h-36 w-36 rounded-full bg-amber-300/24 blur-3xl" />

        <div className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-gradient-to-br from-purple-50/76 via-white/48 to-amber-50/70 p-5 shadow-[0_26px_90px_rgba(91,33,182,0.18)] backdrop-blur-2xl sm:p-7">
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full border border-amber-300/28" />
          <div className="pointer-events-none absolute -left-20 bottom-16 h-52 w-52 rounded-full border border-purple-300/24" />

          <div className="relative text-center">
            <div className="mb-5 flex justify-center gap-3">
              <svg className="h-7 w-7 animate-float text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}
                   style={{ animationDelay: '0s', filter: 'drop-shadow(0 4px 12px rgba(251,191,36,0.36))' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2.4 7.4L22 9.5l-6 4.8 1.8 7.7L12 17.5l-5.8 4.5L8 14.3l-6-4.8 7.6-.1z" />
              </svg>
              <svg className="h-10 w-10 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}
                   style={{ animationDelay: '0.3s', color: '#7C3AED', filter: 'drop-shadow(0 6px 18px rgba(124,58,237,0.44))' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7l8 4m0 0v10M4 7v10l8 4" />
              </svg>
              <svg className="h-7 w-7 animate-float text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}
                   style={{ animationDelay: '0.6s', filter: 'drop-shadow(0 4px 12px rgba(251,191,36,0.36))' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2.4 7.4L22 9.5l-6 4.8 1.8 7.7L12 17.5l-5.8 4.5L8 14.3l-6-4.8 7.6-.1z" />
              </svg>
            </div>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-amber-100/76 px-4 py-2 text-sm font-bold text-amber-700 shadow-[0_8px_22px_rgba(251,191,36,0.18)]">
              <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7l8 4m0 0v10M4 7v10l8 4" />
              </svg>
              打开属于你的周末盲盒
            </div>

            <h2 className="font-logo text-5xl font-extrabold tracking-normal sm:text-6xl" style={{ color: '#C86512', textShadow: '0 4px 0 rgba(253,230,138,0.76), 0 18px 38px rgba(124,58,237,0.16)' }}>
              周末去哪儿？
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base font-semibold leading-7 text-purple-800/82 sm:text-lg">
              告诉 <span className="font-extrabold text-purple-700">Buddy</span> 你的想法，拆开一个
              <span className="font-extrabold text-amber-600">惊喜盲盒</span>
            </p>
          </div>

          <div className="relative mt-8">
            <div className="rounded-[1.7rem] border border-purple-200/70 bg-purple-950/[0.03] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_18px_42px_rgba(124,58,237,0.13)] transition-all duration-200 focus-within:border-purple-500 focus-within:bg-white/38 focus-within:ring-4 focus-within:ring-purple-500/16">
              <div className="mb-3 flex items-center justify-between gap-3 px-2">
                <div className="flex items-center gap-2 text-sm font-extrabold text-purple-800">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-white shadow-md shadow-purple-500/25">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>
                  </span>
                  给 Buddy 的周末愿望
                </div>
                <div className="hidden rounded-full bg-amber-100/80 px-3 py-1 text-xs font-bold text-amber-700 sm:block">
                  AI 会理解人数、预算、天气和排队
                </div>
              </div>

              <div className="rounded-[1.35rem] border border-amber-200/82 bg-gradient-to-br from-amber-50/90 via-white/72 to-purple-50/76 p-2 shadow-[0_12px_28px_rgba(217,119,6,0.09)]">
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  rows={3}
                  disabled={isLoading}
                  className="min-h-[8.25rem] w-full resize-none rounded-[1rem] border-0 bg-transparent px-4 py-4 text-base font-medium leading-7 text-purple-950 outline-none placeholder:text-purple-300 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={!rawText.trim() || isLoading}
                  className="flex min-h-[3.5rem] shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-purple-900 px-6 text-base font-extrabold text-white shadow-[0_16px_34px_rgba(124,58,237,0.36)]
                             transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(124,58,237,0.44)]
                             disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-[0_16px_34px_rgba(124,58,237,0.36)] sm:min-w-[11.5rem]"
                >
                  {isLoading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      生成中...
                    </>
                  ) : (
                    <>
                      开启周末盲盒
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7l8 4m0 0v10M4 7v10l8 4" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-[1.35rem] border border-purple-100 bg-white/58 p-4 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c.251.023.501.05.75.082m-.75-.082a24.301 24.301 0 00-4.5 0m4.5 0v.001M15 11.25l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-purple-950">大模型判断已配置</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-purple-600/78">
                      默认使用 DeepSeek，API Key 在后端隐藏保存；需要更换时可在这里覆盖。
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModelConfig((value) => !value)}
                  className="inline-flex items-center justify-center rounded-full border border-purple-200 bg-white/78 px-4 py-2 text-xs font-extrabold text-purple-700 transition hover:-translate-y-0.5 hover:bg-purple-50"
                >
                  {showModelConfig ? '收起配置' : '更换 API Key'}
                </button>
              </div>

              {showModelConfig && (
                <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.8fr)]">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-purple-500">API Key</span>
                    <input
                      type="password"
                      value={llmConfig.apiKey ?? ''}
                      onChange={(event) => onLlmConfigChange({ ...llmConfig, apiKey: event.target.value })}
                      placeholder="默认 Key 已隐藏，输入后覆盖"
                      className="w-full rounded-2xl border border-purple-100 bg-white/88 px-4 py-3 text-sm font-semibold text-purple-950 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-purple-500">Base URL</span>
                    <input
                      type="text"
                      value={llmConfig.baseUrl ?? ''}
                      onChange={(event) => onLlmConfigChange({ ...llmConfig, baseUrl: event.target.value })}
                      placeholder="https://api.deepseek.com/v1"
                      className="w-full rounded-2xl border border-purple-100 bg-white/88 px-4 py-3 text-sm font-semibold text-purple-950 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-purple-500">Model</span>
                    <input
                      type="text"
                      value={llmConfig.model ?? ''}
                      onChange={(event) => onLlmConfigChange({ ...llmConfig, model: event.target.value })}
                      placeholder="deepseek-chat"
                      className="w-full rounded-2xl border border-purple-100 bg-white/88 px-4 py-3 text-sm font-semibold text-purple-950 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10"
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-amber-200/70 bg-white/64 p-4 shadow-sm backdrop-blur">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-purple-950">选择盲盒类型</p>
                  <p className="mt-1 text-xs font-semibold text-purple-500">不确定就选惊喜盲盒，Agent 会自动判断。</p>
                </div>
                <span className="hidden rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 sm:inline-flex">
                  路线风格约束
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {BLIND_BOX_THEMES.map((theme) => {
                  const active = blindBoxTheme === theme.value;
                  return (
                    <button
                      key={theme.value}
                      type="button"
                      onClick={() => setBlindBoxTheme(theme.value)}
                      disabled={isLoading}
                      className={`rounded-2xl border px-4 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 ${
                        active
                          ? 'border-amber-300 bg-amber-50 text-purple-950 shadow-md shadow-amber-200/40'
                          : 'border-purple-100 bg-white/72 text-purple-800 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <span className="block text-sm font-extrabold">{theme.label}</span>
                      <span className="mt-1 block text-xs font-semibold leading-5 text-purple-500">{theme.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-2.5">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={`${chip.key}-${chip.value}`}
                  onClick={() => { const cur = rawText; setRawText(cur ? `${cur}，${chip.label}` : chip.label); }}
                  disabled={isLoading}
                  className="rounded-full border border-purple-200/80 bg-white/64 px-4 py-2 text-sm font-bold text-purple-700 shadow-sm backdrop-blur
                             transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50/80 hover:text-purple-900 hover:shadow-md
                             active:scale-95 disabled:opacity-40"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="mt-7 rounded-[1.5rem] border border-purple-300/60 bg-gradient-to-br from-purple-100/70 via-white/58 to-amber-100/68 p-4 shadow-[0_16px_40px_rgba(124,58,237,0.14)] backdrop-blur sm:p-5">
              <div className="mb-3 flex items-center justify-center gap-2 text-sm font-extrabold text-amber-700">
                <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364l-2.121 2.121M7.757 16.243l-2.121 2.121m12.728 0l-2.121-2.121M7.757 7.757L5.636 5.636" />
                </svg>
                试试这样说
              </div>
              <div className="grid gap-2.5">
                {suggestions.map((s, i) => (
                  <button
                  key={i}
                  onClick={() => setRawText(s)}
                  disabled={isLoading}
                    className="group w-full rounded-2xl border border-purple-200/80 bg-white/82 px-4 py-3 text-left text-sm font-bold leading-6 text-purple-800 shadow-sm shadow-purple-200/30
                               transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 hover:text-purple-950 hover:shadow-lg hover:shadow-purple-300/24
                               active:scale-[0.98] disabled:opacity-40"
                  >
                    <span className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs text-purple-700 transition-colors group-hover:bg-amber-200 group-hover:text-amber-800">
                        {i + 1}
                      </span>
                      <span>{s}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}
