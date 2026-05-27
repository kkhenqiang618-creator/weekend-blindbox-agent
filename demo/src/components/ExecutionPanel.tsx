import type { ToolResult } from '../types';

interface Props {
  tasks: ToolResult[];
}

type ReservationActions = {
  copyScript?: boolean;
  callPhone?: boolean;
  openMeituan?: boolean;
};

type ReservationAssistResult = {
  reason?: string;
  script?: string;
  actions?: ReservationActions;
  phone?: string | null;
  meituanUrl?: string | null;
  disclaimer?: string;
  visitTimeText?: string;
};

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

  const reservationTasks = tasks.filter((task) => task.toolName === 'reservationAssist');
  const normalTasks = tasks.filter((task) => task.toolName !== 'reservationAssist');

  return (
    <div className="magic-card p-6 sm:p-8 animate-scale-in">
      <h3 className="text-lg font-display font-semibold purple-950 mb-5 flex items-center gap-2">
        <svg className="w-5 h-5 purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        执行结果
      </h3>

      {reservationTasks.length > 0 && (
        <div className="mb-6 space-y-4">
          {reservationTasks.map((task, i) => (
            <ReservationAssistCard key={`${task.poiId ?? 'reservation'}-${i}`} task={task} />
          ))}
        </div>
      )}

      {normalTasks.length > 0 && (
        <div className="space-y-3">
          {normalTasks.map((task, i) => {
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
      )}
    </div>
  );
}

function ReservationAssistCard({ task }: { task: ToolResult }) {
  const result = (task.result ?? {}) as ReservationAssistResult;
  const actions = result.actions ?? {};

  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-purple-50 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-200">
          <svg className="w-5 h-5 text-purple-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M5 11h14M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <p className="text-sm font-semibold text-purple-950">Agent 代预订辅助</p>
            <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-[11px] font-semibold">
              等待用户确认
            </span>
          </div>

          <p className="text-sm text-purple-700 leading-relaxed">{task.message}</p>

          {result.reason && (
            <div className="mt-4 rounded-xl bg-white/80 border border-amber-100 p-3">
              <p className="text-[11px] font-semibold text-purple-400 mb-1">为什么建议提前确认</p>
              <p className="text-sm text-purple-900 leading-relaxed">{result.reason}</p>
            </div>
          )}

          {result.script && (
            <div className="mt-3 rounded-xl bg-purple-950 p-4 text-white">
              <p className="text-[11px] font-semibold text-amber-200 mb-2">预订/确认座位话术</p>
              <p className="text-sm leading-relaxed">{result.script}</p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {actions.copyScript && (
              <ActionPill label="复制话术" iconPath="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            )}
            {actions.callPhone && (
              <ActionPill label={result.phone ? `拨打 ${result.phone}` : '拨打商家电话'} iconPath="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.49a1 1 0 01-.5 1.21l-2.26 1.13a11.04 11.04 0 005.52 5.52l1.13-2.26a1 1 0 011.21-.5l4.49 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z" />
            )}
            {actions.openMeituan && (
              <ActionPill label="打开美团入口" iconPath="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            )}
          </div>

          {result.disclaimer && (
            <p className="mt-4 text-xs text-purple-400 leading-relaxed">{result.disclaimer}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionPill({ label, iconPath }: { label: string; iconPath: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-white px-3 py-2 text-xs font-semibold text-purple-700 shadow-sm transition hover:border-purple-300 hover:bg-purple-50"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
      </svg>
      {label}
    </button>
  );
}
