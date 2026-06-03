import type { ToolResult, Plan } from '../types';

interface Props {
  toolStatus: ToolResult[];
  plan: Plan;
}

const TOOL_NAMES: Record<string, { label: string; short: string; icon: string }> = {
  checkQueue: {
    label: '排队检查',
    short: '排队',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  checkAvailability: {
    label: '可用性检查',
    short: '可用',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  reserveOrJoinPlan: {
    label: '预约/加入行程',
    short: '执行',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
};

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  waiting: { label: '等待', dot: 'bg-stone-300', badge: 'bg-stone-100 text-stone-500 border-stone-200' },
  running: { label: '运行', dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-600 border-blue-200' },
  success: { label: '完成', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  failed: { label: '失败', dot: 'bg-red-500', badge: 'bg-red-50 text-red-600 border-red-200' },
};

export default function ToolStatusPanel({ toolStatus, plan }: Props) {
  const completed = toolStatus.filter((tool) => tool.status === 'success').length;
  const grouped = toolStatus.reduce<Record<string, ToolResult[]>>((acc, tool) => {
    acc[tool.toolName] = [...(acc[tool.toolName] || []), tool];
    return acc;
  }, {});

  const getPoiName = (poiId?: string) => {
    if (!poiId) return null;
    return plan.route.steps.find((s) => s.poi.id === poiId)?.poi.name || poiId;
  };

  return (
    <div className="magic-card p-4">
      <div className="mb-4">
        <p className="text-xs font-semibold text-purple-950">调用工具栏</p>
        <div className="mt-2 h-1.5 rounded-full bg-purple-50 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-amber-400 transition-all"
            style={{ width: `${toolStatus.length ? Math.round((completed / toolStatus.length) * 100) : 0}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-purple-300">{completed}/{toolStatus.length} 个调用完成</p>
      </div>

      <div className="space-y-3">
        {Object.entries(grouped).map(([toolName, tools]) => {
          const config = TOOL_NAMES[toolName] || {
            label: toolName,
            short: toolName,
            icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
          };
          const firstStatus = STATUS_CONFIG[tools[0]?.status || 'waiting'] || STATUS_CONFIG.waiting;

          return (
            <details key={toolName} className="group rounded-xl border border-purple-100 bg-white/80 open:bg-white">
              <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-3">
                <span className={`h-2.5 w-2.5 rounded-full ${firstStatus.dot}`} />
                <svg className="h-4 w-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={config.icon} />
                </svg>
                <span className="min-w-0 flex-1 text-sm font-semibold text-purple-950">{config.short}</span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${firstStatus.badge}`}>
                  {tools.length}
                </span>
              </summary>

              <div className="border-t border-purple-50 px-3 pb-3 pt-2 space-y-2">
                {tools.map((tool, index) => {
                  const status = STATUS_CONFIG[tool.status] || STATUS_CONFIG.waiting;
                  const poiName = getPoiName(tool.poiId);

                  return (
                    <div key={`${tool.toolName}-${tool.poiId || index}`} className="rounded-lg bg-purple-50/60 p-2">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="truncate text-[11px] font-medium text-purple-950">
                          {poiName || config.label}
                        </span>
                        <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] ${status.badge}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-[11px] leading-4 text-purple-400">{tool.message}</p>
                    </div>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>

      {toolStatus.length === 0 && (
        <p className="rounded-xl bg-purple-50 px-3 py-4 text-center text-xs text-purple-300">暂无调用记录</p>
      )}
    </div>
  );
}
