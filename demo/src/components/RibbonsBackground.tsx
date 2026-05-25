import { useMemo } from 'react';

// 演唱会彩带 - 长条 streamers + 小纸片 confetti
const COLORS = ['#7C3AED', '#A78BFA', '#C084FC', '#FBBF24', '#FDE68A', '#F59E0B', '#8B5CF6', '#E9D5FF'];

interface ConfettiItem {
  type: 'streamer' | 'confetti';
  left: number;
  width: number;
  height: number;
  color: string;
  duration: number;
  delay: number;
  rotation: number;
  drift: 1 | 2 | 3;
}

export default function RibbonsBackground() {
  const items = useMemo((): ConfettiItem[] => {
    const list: ConfettiItem[] = [];
    // Streamers - 统一短彩带
    for (let i = 0; i < 12; i++) {
      list.push({
        type: 'streamer',
        left: i * 8 + Math.random() * 4,
        width: 5,
        height: 40,
        color: COLORS[i % COLORS.length],
        duration: 12 + Math.random() * 14,
        delay: Math.random() * 8,
        rotation: (Math.random() - 0.5) * 25,
        drift: (i % 2 === 0 ? 1 : 2) as 1 | 2,
      });
    }
    // Confetti
    for (let i = 0; i < 30; i++) {
      list.push({
        type: 'confetti',
        left: Math.random() * 98,
        width: 4 + Math.random() * 5,
        height: 4 + Math.random() * 5,
        color: COLORS[i % COLORS.length],
        duration: 10 + Math.random() * 15,
        delay: Math.random() * 10,
        rotation: Math.random() * 360,
        drift: ((i % 3) + 1) as 1 | 2 | 3,
      });
    }
    return list;
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {items.map((item, i) => {
        if (item.type === 'streamer') {
          const animName = item.drift === 1 ? 'streamerWave1' : 'streamerWave2';
          return (
            <div
              key={`s-${i}`}
              style={{
                position: 'absolute',
                top: -item.height,
                left: `${item.left}%`,
                width: item.width,
                height: item.height,
                backgroundColor: item.color,
                borderRadius: item.width / 2,
                opacity: 0,
                animation: `${animName} ${item.duration}s linear ${item.delay}s infinite`,
                transform: `rotate(${item.rotation}deg)`,
                filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.08))',
              }}
            />
          );
        }

        // Confetti pieces
        const shape = i % 3;
        const animName = `confettiDrift${item.drift}`;
        return (
          <div
            key={`c-${i}`}
            style={{
              position: 'absolute',
              top: -10,
              left: `${item.left}%`,
              width: item.width,
              height: item.height,
              backgroundColor: item.color,
              borderRadius: shape === 0 ? '50%' : shape === 1 ? '2px' : '0',
              clipPath: shape === 2 ? 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' : undefined,
              opacity: 0,
              animation: `${animName} ${item.duration}s linear ${item.delay}s infinite`,
              boxShadow: '0 0 3px rgba(0,0,0,0.06)',
            }}
          />
        );
      })}
    </div>
  );
}
