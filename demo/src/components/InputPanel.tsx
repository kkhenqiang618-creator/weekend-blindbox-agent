import { useMemo, useState } from 'react';
import type { LlmReplanConfig } from '../types';

const DISTRICT_OPTIONS = ['福田', '南山', '罗湖', '宝安', '龙岗', '龙华', '盐田', '坪山', '光明', '大鹏'];

const PEOPLE_OPTIONS = [
  { value: '单人', label: '1 人', desc: '自己逛逛' },
  { value: '情侣', label: '2 人', desc: '约会轻松走' },
  { value: '朋友', label: '3-4 人', desc: '朋友小队' },
  { value: '亲子', label: '亲子', desc: '带娃低强度' },
];

const BUDGET_OPTIONS = [
  { value: 120, label: '¥120 内', desc: '省钱快乐' },
  { value: 200, label: '¥200 内', desc: '轻松吃喝' },
  { value: 350, label: '¥350 内', desc: '体验丰富' },
  { value: 500, label: '¥500 内', desc: '更有仪式感' },
];

const BLIND_BOX_THEMES = [
  { value: '惊喜盲盒', label: '惊喜盲盒', desc: '让 Agent 自动判断风格' },
  { value: '小众拍照吃货盒', label: '拍照吃货', desc: '打卡、咖啡和美食' },
  { value: '夜景微醺盒', label: '夜景微醺', desc: '夜景、简餐和小酌' },
  { value: '雨天室内回血盒', label: '室内回血', desc: '室内、解压、稳定执行' },
  { value: '亲子轻松放电盒', label: '亲子放电', desc: '低强度亲子半日路线' },
  { value: '城市散步疗愈盒', label: '散步疗愈', desc: '安静、散步和轻体验' },
  { value: '省钱快乐盒', label: '省钱快乐', desc: '预算友好和性价比' },
];

interface Props {
  onSubmit: (rawText: string, quickSelections?: Record<string, unknown>) => void;
  isLoading: boolean;
  llmConfig: LlmReplanConfig;
  onLlmConfigChange: (config: LlmReplanConfig) => void;
}

export default function InputPanel({ onSubmit, isLoading, llmConfig, onLlmConfigChange }: Props) {
  const [peopleType, setPeopleType] = useState('朋友');
  const [budget, setBudget] = useState(200);
  const [district, setDistrict] = useState('南山');
  const [blindBoxTheme, setBlindBoxTheme] = useState('惊喜盲盒');
  const [showModelConfig, setShowModelConfig] = useState(false);

  const generatedWish = useMemo(() => {
    const themeText = blindBoxTheme === '惊喜盲盒' ? '惊喜周末路线' : blindBoxTheme;
    const peopleText = peopleType === '单人' ? '一个人' : peopleType === '亲子' ? '带娃亲子' : peopleType;
    return `周末下午想在深圳${district}区开一个${themeText}，${peopleText}出行，人均预算控制在${budget}元以内，路线要连贯、好执行，尽量少绕路。`;
  }, [blindBoxTheme, budget, district, peopleType]);

  const handleSubmit = () => {
    onSubmit(generatedWish, {
      city: '深圳',
      budget,
      peopleType,
      blindBoxTheme,
      durationHours: 4,
      preferences: [blindBoxTheme.replace('盒', '').replace('盲', '')].filter(Boolean),
      constraints: ['路线连贯', '少绕路'],
    });
  };

  return (
    <div className="animate-scale-in">
      <div className="relative mx-auto max-w-4xl">
        <div className="absolute -inset-x-8 top-10 h-48 rounded-full bg-purple-400/16 blur-3xl" />
        <div className="absolute -bottom-8 left-10 h-36 w-36 rounded-full bg-amber-300/24 blur-3xl" />

        <div className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-gradient-to-br from-purple-50/76 via-white/48 to-amber-50/70 p-5 shadow-[0_26px_90px_rgba(91,33,182,0.18)] backdrop-blur-2xl sm:p-7">
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full border border-amber-300/28" />
          <div className="pointer-events-none absolute -left-20 bottom-16 h-52 w-52 rounded-full border border-purple-300/24" />

          <div className="relative text-center">
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
              选好人数、预算和深圳区域，Buddy 直接替你开盒出路线。
            </p>
          </div>

          <div className="relative mt-8 grid gap-5">
            <OptionGroup
              title="几个人出发？"
              badge="人数"
              options={PEOPLE_OPTIONS}
              activeValue={peopleType}
              onSelect={setPeopleType}
              disabled={isLoading}
            />

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <OptionGroup
                title="人均预算"
                badge="价格"
                options={BUDGET_OPTIONS.map((item) => ({ ...item, value: String(item.value) }))}
                activeValue={String(budget)}
                onSelect={(value) => setBudget(Number(value))}
                disabled={isLoading}
              />

              <section className="rounded-[1.5rem] border border-purple-100 bg-white/64 p-4 shadow-sm backdrop-blur">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold text-purple-950">深圳哪个区？</p>
                    <p className="mt-1 text-xs font-semibold text-purple-500">高德检索会优先围绕这个区域找点。</p>
                  </div>
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">地点</span>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {DISTRICT_OPTIONS.map((item) => {
                    const active = district === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setDistrict(item)}
                        disabled={isLoading}
                        className={`min-h-11 rounded-2xl border px-3 text-sm font-extrabold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 ${
                          active
                            ? 'border-purple-400 bg-purple-700 text-white shadow-md shadow-purple-300/40'
                            : 'border-purple-100 bg-white/76 text-purple-700 hover:border-amber-300 hover:bg-amber-50'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            <section className="rounded-[1.5rem] border border-amber-200/70 bg-white/64 p-4 shadow-sm backdrop-blur">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-purple-950">盲盒口味</p>
                  <p className="mt-1 text-xs font-semibold text-purple-500">不确定就选惊喜盲盒。</p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">路线风格</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
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
            </section>

            <section className="rounded-[1.5rem] border border-purple-200/70 bg-gradient-to-br from-purple-100/70 via-white/68 to-amber-100/68 p-4 shadow-[0_16px_40px_rgba(124,58,237,0.12)] backdrop-blur">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-600">Buddy will ask</p>
                  <p className="mt-2 text-sm font-extrabold leading-6 text-purple-950">{generatedWish}</p>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="inline-flex min-h-[3.5rem] shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-purple-900 px-6 text-base font-extrabold text-white shadow-[0_16px_34px_rgba(124,58,237,0.36)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(124,58,237,0.44)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isLoading ? '生成中...' : '开启路线盲盒'}
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7l8 4m0 0v10M4 7v10l8 4" />
                  </svg>
                </button>
              </div>
            </section>

            <div className="rounded-[1.35rem] border border-purple-100 bg-white/58 p-4 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-extrabold text-purple-950">大模型判断已配置</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-purple-600/78">
                    默认使用 DeepSeek，API Key 在后端隐藏保存；需要更换时可在这里覆盖。
                  </p>
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
                  <ConfigInput label="API Key" type="password" value={llmConfig.apiKey ?? ''} placeholder="默认 Key 已隐藏，输入后覆盖" onChange={(value) => onLlmConfigChange({ ...llmConfig, apiKey: value })} />
                  <ConfigInput label="Base URL" value={llmConfig.baseUrl ?? ''} placeholder="https://api.deepseek.com/v1" onChange={(value) => onLlmConfigChange({ ...llmConfig, baseUrl: value })} />
                  <ConfigInput label="Model" value={llmConfig.model ?? ''} placeholder="deepseek-chat" onChange={(value) => onLlmConfigChange({ ...llmConfig, model: value })} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionGroup({
  title,
  badge,
  options,
  activeValue,
  onSelect,
  disabled,
}: {
  title: string;
  badge: string;
  options: Array<{ value: string; label: string; desc: string }>;
  activeValue: string;
  onSelect: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <section className="rounded-[1.5rem] border border-purple-100 bg-white/64 p-4 shadow-sm backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-extrabold text-purple-950">{title}</p>
        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">{badge}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const active = activeValue === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              disabled={disabled}
              className={`rounded-2xl border px-4 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 ${
                active
                  ? 'border-purple-400 bg-purple-50 text-purple-950 shadow-md shadow-purple-200/50'
                  : 'border-purple-100 bg-white/76 text-purple-800 hover:border-amber-300 hover:bg-amber-50'
              }`}
            >
              <span className="block text-sm font-extrabold">{option.label}</span>
              <span className="mt-1 block text-xs font-semibold text-purple-500">{option.desc}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ConfigInput({
  label,
  value,
  placeholder,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-purple-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-purple-100 bg-white/88 px-4 py-3 text-sm font-semibold text-purple-950 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10"
      />
    </label>
  );
}
