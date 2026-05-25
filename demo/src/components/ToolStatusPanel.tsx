import type { ToolResult, Plan } from '../types';

interface Props {
  toolStatus: ToolResult[];
  plan: Plan;
}

const TOOL_NAMES: Record<string, { label: string; icon: string }> = {
  checkQueue: {
    label: '排队检查',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  checkAvailability: {
    label: '可用性检查',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  reserveOrJoinPlan: {
    label: '预约/加入行程',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  waiting: { label: '等待中', color: '#8B7355', bg: '#F5F0E8', border: '#E0D5C5' },
  running: { label: '检查中', color: '#2563eb', bg: '#dbeafe', border: '#bfdbfe' },
  success: { label: '已完成', color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0' },
  failed: { label: '失败', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

export default function ToolStatusPanel({ toolStatus, plan }: Props) {
  const getPoiName = (poiId?: string) => {
    if (!poiId) return null;
    return plan.route.steps.find((s) => s.poi.id === poiId)?.poi.name || poiId;
  };

  return (
    <div className="magic-card p-6 sm:p-8">
      <h3 className="text-lg font-display font-semibold purple-950 mb-5 flex items-center gap-2">
        <svg className="w-5 h-5 purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        工具调用状态
      </h3>

      <div className="grid gap-3">
        {toolStatus.map((tool) => {
          const config = TOOL_NAMES[tool.toolName] || { label: tool.toolName, icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' };
          const status = STATUS_CONFIG[tool.status] || STATUS_CONFIG.waiting;
          const poiName = getPoiName(tool.poiId);

          return (
            <div
              key={`${tool.toolName}-${tool.poiId || ''}`}
              className="flex items-start gap-3 p-3.5 rounded-xl border border-purple-100 hover:purple-200 transition-colors bg-white"
            >
              {/* Status dot */}
              <div
                className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                style={{ background: status.color }}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium purple-950">{config.label}</span>
                  <span
                    className="px-1.5 py-0.5 text-[10px] rounded font-medium border"
                    style={{ background: status.bg, color: status.color, borderColor: status.border }}
                  >
                    {status.label}
                  </span>
                </div>
                {poiName && (
                  <p className="text-xs purple-400 mb-1">POI: {poiName}</p>
                )}
                <p className="text-xs purple-300">{tool.message}</p>
              </div>

              <svg className="w-5 h-5 purple-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={config.icon} />
              </svg>
            </div>
          );
        })}
      </div>

      {toolStatus.length === 0 && (
        <p className="text-sm purple-300 text-center py-4">暂无工具调用记录</p>
      )}
    </div>
  );
}
