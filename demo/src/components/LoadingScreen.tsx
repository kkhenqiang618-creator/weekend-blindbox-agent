interface Props {
  messages: string[];
}

const LOADING_ICONS = [
  <svg key="search" className="w-16 h-16 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>,
  <svg key="box" className="w-16 h-16 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7l8 4m0 0v10M4 7v10l8 4" />
  </svg>,
  <svg key="route" className="w-16 h-16 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13l-6-3m6 3V4m0 0L9 7" />
  </svg>,
  <svg key="check" className="w-16 h-16 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>,
];

export default function LoadingScreen({ messages }: Props) {
  const activeIndex = messages.filter(Boolean).length - 1;

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      {/* Animated icon */}
      <div className="mb-8 relative">
        <div className="w-24 h-24 rounded-full bg-brand-50 flex items-center justify-center animate-scale-in"
             style={{ animation: 'pulseGlow 2s ease-in-out infinite' }}>
          {LOADING_ICONS[Math.min(activeIndex, LOADING_ICONS.length - 1)]}
        </div>
      </div>

      {/* Loading messages */}
      <div className="space-y-3 w-full max-w-xs">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-500 ${
              msg
                ? 'bg-white border border-zinc-200 opacity-100'
                : 'opacity-0'
            }`}
          >
            {msg ? (
              <>
                <svg className="w-4 h-4 text-brand-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-zinc-700">{msg}</span>
              </>
            ) : (
              <span className="text-sm text-zinc-700">&nbsp;</span>
            )}
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-zinc-400 animate-pulse-soft">AI 正在为你精心策划...</p>
    </div>
  );
}
