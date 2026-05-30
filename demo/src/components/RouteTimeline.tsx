import type { Route, RouteStep } from '../types';

interface Props {
  route: Route;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  activity: { label: '活动', color: '#7C3AED', bg: '#EDE9FE', border: '#C4B5FD', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  break: { label: '休憩', color: '#D97706', bg: '#FEF3C7', border: '#FDE68A', icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' },
  meal: { label: '美食', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  ending: { label: '结束', color: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB', icon: 'M5 13l4 4L19 7' },
};

const QUEUE_BADGES: Record<string, { label: string; css: string }> = {
  low: { label: '排队少', css: 'bg-green-50 text-green-600 border border-green-200' },
  medium: { label: '排队中', css: 'bg-amber-50 text-amber-600 border border-amber-200' },
  high: { label: '排队多', css: 'bg-red-50 text-red-500 border border-red-200' },
};

function PoiCard({ step, isLast }: { step: RouteStep; isLast: boolean }) {
  const role = ROLE_CONFIG[step.role] || ROLE_CONFIG.activity;
  const poi = step.poi;

  return (
    <div className="flex gap-4">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 shadow-sm transition-transform hover:scale-110"
          style={{ borderColor: role.border, background: role.bg }}
        >
          <svg className="w-5 h-5" fill="none" stroke={role.color} strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={role.icon} />
          </svg>
        </div>
        {!isLast && (
          <div className="w-0.5 h-16 my-1 rounded-full" style={{ background: `linear-gradient(180deg, ${role.border}, transparent)` }} />
        )}
      </div>

      {/* Card */}
      <div className={`flex-1 pb-6 ${isLast ? '' : ''}`}>
        <div className="bg-white rounded-2xl border border-purple-100 p-5
                      hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-0.5
                      transition-all duration-200">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="px-2 py-0.5 text-xs font-medium rounded-md border"
                  style={{ background: role.bg, color: role.color, borderColor: role.border }}
                >
                  {role.label}
                </span>
                <span className="text-[10px] text-purple-300 uppercase tracking-wider">
                  {step.startTimeText || `第${step.order}站`}
                </span>
              </div>
              <h4 className="text-base font-semibold text-purple-950">{poi.name}</h4>
            </div>
            {poi.meituanRating && (
              <div className="flex items-center gap-1 text-amber-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium">{poi.meituanRating}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-purple-400 mb-2">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {poi.routeCluster ?? poi.businessDistrict}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ¥{poi.price}/人
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {poi.stayMinutes}min
            </span>
            {QUEUE_BADGES[poi.queueLevel] && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${QUEUE_BADGES[poi.queueLevel].css}`}>
                {QUEUE_BADGES[poi.queueLevel].label}
              </span>
            )}
            {poi.weatherSensitive && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-500 border border-blue-200">
                天气敏感
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {poi.tags.map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 text-[10px] rounded-md bg-purple-50 text-purple-400">
                {tag}
              </span>
            ))}
          </div>

          {/* Note */}
          {step.note && (
            <p className="text-xs text-purple-300 italic">{step.note}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RouteTimeline({ route }: Props) {
  return (
    <div className="magic-card p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-display font-semibold text-purple-950 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13l-6-3m6 3V4m0 0L9 7" />
          </svg>
          出行路线
        </h3>
        <div className="flex items-center gap-4 text-sm text-purple-400">
          <span className="flex items-center gap-1 bg-purple-50 px-3 py-1 rounded-full">
            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {route.totalMinutes} 分钟
          </span>
          <span className="flex items-center gap-1 bg-gold-soft px-3 py-1 rounded-full">
            <svg className="w-4 h-4 text-gold-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ¥{route.totalBudget}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {route.steps.map((step, i) => (
          <PoiCard key={step.poi.id} step={step} isLast={i === route.steps.length - 1} />
        ))}
      </div>
    </div>
  );
}
