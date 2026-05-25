import type { ToolResult } from '../types';

interface Props {
  tasks: ToolResult[];
}

const STATUS_CONFIG: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  success: {
    icon: 'M5 13l4 4L19 7',
    color: '#16a34a',
    bg: '#dcfce7',
    border: '#bbf7d0',
  },
  running: {
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    color: '#2563eb',
    bg: '#dbeafe',
    border: '#bfdbfe',
  },
  failed: {
    icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
  },
};

export default function ExecutionPanel({ tasks }: Props) {
  if (!tasks || tasks.length === 0) return null;

  return (
    <div className="magic-card p-6 sm:p-8 animate-scale-in">
      <h3 className="text-lg font-display font-semibold purple-950 mb-5 flex items-center gap-2">
        <svg className="w-5 h-5 purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        执行结果
      </h3>

      <div className="space-y-3">
        {tasks.map((task, i) => {
          const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.success;

          return (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-xl border transition-all duration-300"
              style={{ borderColor: status.border, background: status.bg }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: status.color }}
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={status.icon} />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium purple-950">{task.toolName}</p>
                <p className="text-xs purple-400 mt-0.5">{task.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
