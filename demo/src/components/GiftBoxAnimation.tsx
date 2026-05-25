import { useEffect, useState, useMemo } from 'react';
import type { BlindBox } from '../types';

interface Props {
  blindBox: BlindBox;
  stepCount: number;
  poiNames: string[];
  onComplete: () => void;
}

const MAGIC_COLORS = ['#7C3AED', '#A78BFA', '#C084FC', '#FBBF24', '#FDE68A', '#F59E0B'];

function Sparkle({ x, y, size, delay, color }: { x: number; y: number; size: number; delay: number; color: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        animation: `sparklePop 1.2s ease-out ${delay}s both`,
      }}
    >
      <svg viewBox="0 0 24 24" fill={color}>
        <path d="M12 2l2.4 7.4L22 9.5l-6 4.8 1.8 7.7L12 17.5l-5.8 4.5L8 14.3l-6-4.8 7.6-.1z" />
      </svg>
    </div>
  );
}

function Particle({ i }: { i: number }) {
  const angle = (i * 137.5) % 360;
  const dist = 100 + Math.random() * 180;
  const rad = (angle * Math.PI) / 180;
  const tx = Math.cos(rad) * dist;
  const ty = Math.sin(rad) * dist - 50;
  const color = MAGIC_COLORS[i % MAGIC_COLORS.length];
  const size = 4 + Math.random() * 7;
  const delay = Math.random() * 0.5;
  const rot = (Math.random() - 0.5) * 720;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: size,
        height: size * (Math.random() > 0.5 ? 1 : 0.6),
        backgroundColor: color,
        borderRadius: Math.random() > 0.6 ? '50%' : '2px',
        opacity: 0,
        animation: `particleBurst 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s forwards`,
        ['--tx' as string]: `${tx}px`,
        ['--ty' as string]: `${ty}px`,
        ['--rot' as string]: `${rot}deg`,
      }}
    />
  );
}

function PoiRevealCard({ name, index, total }: { name: string; index: number; total: number }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 bg-white/85 backdrop-blur-sm rounded-xl border border-purple-200/50 shadow-sm"
      style={{
        animation: `poiBounceIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.6 + index * 0.18}s both`,
      }}
    >
      <span className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {index + 1}
      </span>
      <span className="text-sm text-purple-950 font-medium">{name}</span>
      {index < total - 1 && (
        <svg className="w-3 h-3 text-purple-300 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </div>
  );
}

export default function GiftBoxAnimation({ blindBox, stepCount, poiNames, onComplete }: Props) {
  const [phase, setPhase] = useState<'summon' | 'ready' | 'opening' | 'reveal'>('summon');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('ready'), 400);
    const t2 = setTimeout(() => setPhase('opening'), 1800);
    const t3 = setTimeout(() => setPhase('reveal'), 2600);
    const t4 = setTimeout(() => onComplete(), 4600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  const particles = useMemo(() => Array.from({ length: 30 }, (_, i) => i), []);
  const sparkles = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    size: 6 + Math.random() * 10,
    delay: Math.random() * 0.8,
    color: MAGIC_COLORS[i % MAGIC_COLORS.length],
  })), []);

  const isOpen = phase === 'opening' || phase === 'reveal';

  return (
    <div className="relative flex flex-col items-center justify-center py-8 min-h-[520px]">
      {/* Particle keyframes */}
      <style>{`
        @keyframes particleBurst {
          0%   { opacity:1; transform:translate(0,0) scale(1) rotate(0deg); }
          40%  { opacity:1; transform:translate(var(--tx),var(--ty)) scale(0.8) rotate(var(--rot)); }
          100% { opacity:0; transform:translate(var(--tx), calc(var(--ty) - 40px)) scale(0) rotate(var(--rot)); }
        }
        @keyframes poiBounceIn {
          0%   { opacity:0; transform:translateY(20px) scale(0.85); }
          60%  { opacity:1; transform:translateY(-4px) scale(1.02); }
          100% { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes boxSummon {
          0%   { transform:translateY(40px) scale(0.5); opacity:0; }
          100% { transform:translateY(0) scale(1); opacity:1; }
        }
        @keyframes boxWobble {
          0%,100% { transform:rotate(0deg) scale(1); }
          20%  { transform:rotate(3deg) scale(1.03); }
          40%  { transform:rotate(-3deg) scale(1.03); }
          60%  { transform:rotate(2deg) scale(1.02); }
          80%  { transform:rotate(-2deg) scale(1.02); }
        }
        @keyframes lidOpen {
          0%   { transform:translateY(0) rotate(0deg); opacity:1; }
          100% { transform:translateY(-50px) rotate(-12deg) translateX(15px); opacity:0.6; }
        }
        @keyframes contentReveal {
          0%   { max-height:0; opacity:0; }
          100% { max-height:300px; opacity:1; }
        }
        @keyframes glowExpand {
          0%   { transform:scale(0.5); opacity:0; }
          60%  { transform:scale(1.3); opacity:0.6; }
          100% { transform:scale(1.5); opacity:0; }
        }
      `}</style>

      {/* Phase text */}
      <div className="text-center mb-8 z-10 transition-all duration-500">
        {phase === 'summon' && (
          <p className="text-purple-400 text-sm font-medium animate-pulse-soft">召唤你的周末盲盒...</p>
        )}
        {phase === 'ready' && (
          <p className="text-purple-500 text-sm font-medium animate-pulse-soft">轻点即可开启...</p>
        )}
        {phase === 'opening' && (
          <p className="text-purple-600 text-lg font-logo font-semibold animate-bounce-in">正在为你打开...</p>
        )}
        {phase === 'reveal' && (
          <p className="text-purple-500 text-sm animate-fade-in">{blindBox.unlockText || '你的周末路线已就绪'}</p>
        )}
      </div>

      {/* Magic Box */}
      <div className="relative z-10" style={{ width: 200, height: 200 }}>
        {/* Glow aura */}
        {phase === 'ready' && (
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, rgba(251,191,36,0.1) 40%, transparent 70%)',
              animation: 'glowExpand 1.5s ease-out infinite',
            }}
          />
        )}
        {isOpen && (
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(251,191,36,0.25) 0%, rgba(124,58,237,0.15) 40%, transparent 70%)',
              animation: 'pulseGlow 1.5s ease-in-out infinite',
            }}
          />
        )}

        {/* Particles burst on open */}
        {isOpen && particles.map((i) => <Particle key={i} i={i} />)}

        {/* Sparkles around the box */}
        {phase === 'ready' && sparkles.map((s, i) => (
          <Sparkle key={i} x={s.x} y={s.y} size={s.size} delay={s.delay} color={s.color} />
        ))}

        {/* The Box */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            animation: phase === 'summon' ? 'boxSummon 0.6s cubic-bezier(0.34,1.56,0.64,1) both' :
                       phase === 'ready' ? 'boxWobble 2s ease-in-out infinite' : 'none',
          }}
        >
          {/* Box shadow */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-purple-900/20 rounded-full blur-md" />

          {/* Box body */}
          <div
            className="relative w-36 h-36 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(145deg, #8B5CF6 0%, #7C3AED 40%, #5B21B6 100%)',
              boxShadow: '0 8px 32px rgba(124,58,237,0.35), inset 0 2px 4px rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.15)',
            }}
          >
            {/* Question mark */}
            <span
              className={`text-5xl font-logo font-bold transition-all duration-500 ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
              style={{
                color: '#FBBF24',
                textShadow: '0 0 20px rgba(251,191,36,0.5), 0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              ?
            </span>

            {/* Inner glow */}
            <div className="absolute inset-4 rounded-xl border border-white/10" />

            {/* Decorative corners */}
            <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-gold/60" />
            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-gold/60" />
            <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full bg-gold/60" />
            <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-gold/60" />
          </div>

          {/* Lid */}
          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-40 h-10 rounded-t-2xl"
            style={{
              background: 'linear-gradient(180deg, #A78BFA 0%, #7C3AED 100%)',
              boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
              border: '2px solid rgba(255,255,255,0.2)',
              borderBottom: 'none',
              animation: isOpen ? 'lidOpen 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'none',
            }}
          >
            {/* Lid ribbon */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-4">
              <svg width="40" height="28" viewBox="0 0 40 28">
                <ellipse cx="12" cy="12" rx="10" ry="8" fill="#FBBF24" transform="rotate(-15 12 12)" />
                <ellipse cx="28" cy="12" rx="10" ry="8" fill="#FBBF24" transform="rotate(15 28 12)" />
                <circle cx="20" cy="12" r="4" fill="#D97706" />
                <path d="M17 22 Q14 28 10 30" stroke="#FBBF24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M23 22 Q26 28 30 30" stroke="#FBBF24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Content reveal area */}
      <div className={`z-20 w-full max-w-sm mt-6 transition-all duration-700 ${phase === 'reveal' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {phase === 'reveal' && (
          <div className="space-y-3">
            {/* BlindBox header */}
            <div className="text-center mb-4" style={{ animation: 'poiBounceIn 0.5s cubic-bezier(0.16,1,0.3,1) 0.3s both' }}>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium border border-purple-200 mb-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7l8 4m0 0v10M4 7v10l8 4" />
                </svg>
                {blindBox.theme}
              </span>
              <h3 className="text-lg font-logo font-semibold text-purple-950">{blindBox.title}</h3>
            </div>

            {/* POI cards */}
            {poiNames.map((name, i) => (
              <PoiRevealCard key={name} name={name} index={i} total={poiNames.length} />
            ))}

            {/* Hint */}
            <div className="text-center pt-2" style={{ animation: 'poiBounceIn 0.5s cubic-bezier(0.16,1,0.3,1) 1.8s both' }}>
              <span className="text-xs text-purple-300">路线已就绪，即将展开详情...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
