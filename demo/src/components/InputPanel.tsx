import { useState } from 'react';

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
];

interface Props {
  onSubmit: (rawText: string) => void;
  isLoading: boolean;
}

export default function InputPanel({ onSubmit, isLoading }: Props) {
  const [rawText, setRawText] = useState('');
  const [placeholder] = useState(() => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]);

  const handleSubmit = () => {
    const text = rawText.trim();
    if (!text) return;
    onSubmit(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="animate-scale-in">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="flex justify-center gap-3 mb-6">
          <svg className="w-8 h-8 text-gold animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}
               style={{ animationDelay: '0s' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2.4 7.4L22 9.5l-6 4.8 1.8 7.7L12 17.5l-5.8 4.5L8 14.3l-6-4.8 7.6-.1z" />
          </svg>
          <svg className="w-10 h-10 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}
               style={{ animationDelay: '0.3s', color: '#7C3AED', filter: 'drop-shadow(0 2px 8px rgba(124,58,237,0.4))' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7l8 4m0 0v10M4 7v10l8 4" />
          </svg>
          <svg className="w-8 h-8 text-gold animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}
               style={{ animationDelay: '0.6s' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2.4 7.4L22 9.5l-6 4.8 1.8 7.7L12 17.5l-5.8 4.5L8 14.3l-6-4.8 7.6-.1z" />
          </svg>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-soft text-gold-dark text-sm font-medium border border-gold/30 mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7l8 4m0 0v10M4 7v10l8 4" />
          </svg>
          打开属于你的周末盲盒
        </div>
        <h2 className="text-3xl font-logo font-semibold mb-3" style={{ color: '#FBBF24', textShadow: '0 2px 8px rgba(251,191,36,0.2)' }}>
          周末去哪儿？
        </h2>
        <p className="text-lg max-w-md mx-auto" style={{ color: '#D97706' }}>
          告诉 <span className="font-semibold" style={{ color: '#FBBF24' }}>Buddy</span> 你的想法，拆开一个<span className="font-semibold" style={{ color: '#FBBF24' }}>惊喜盲盒</span>
        </p>
      </div>

      {/* Input area */}
      <div className="max-w-xl mx-auto">
        <div className="relative">
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={3}
            disabled={isLoading}
            className="w-full px-5 py-4 text-base rounded-2xl border-2 border-purple-200 bg-white resize-none
                       focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/20
                       transition-all duration-200 placeholder:text-purple-300
                       disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSubmit}
            disabled={!rawText.trim() || isLoading}
            className="absolute bottom-4 right-4 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold
                       hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0
                       transition-all duration-200 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                生成中...
              </>
            ) : (
              <>
                开启周末盲盒
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7l8 4m0 0v10M4 7v10l8 4" />
                </svg>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={`${chip.key}-${chip.value}`}
              onClick={() => { const cur = rawText; setRawText(cur ? `${cur}，${chip.label}` : chip.label); }}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm rounded-full border border-purple-200 text-purple-500
                         hover:text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-gold/10 hover:border-purple-300 hover:shadow-sm
                         active:scale-95 transition-all duration-200 disabled:opacity-40"
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          <p className="text-xs mb-3 text-center" style={{ color: '#D97706' }}>试试这样说：</p>
          <div className="grid gap-2">
            {MOCK_SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => setRawText(s)}
                disabled={isLoading}
                className="w-full text-left px-4 py-2.5 text-sm text-purple-500 bg-white rounded-xl border border-purple-200
                           hover:text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-gold/5 hover:border-purple-300 hover:shadow-md
                           active:scale-[0.98] transition-all duration-200 disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
