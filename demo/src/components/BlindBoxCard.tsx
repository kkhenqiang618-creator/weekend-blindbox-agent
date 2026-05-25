import type { BlindBox, Requirements } from '../types';

interface Props { blindBox: BlindBox; requirements: Requirements; }

const PEOPLE_LABELS: Record<string, string> = {
  '单人': '一个人', '情侣': '情侣', '朋友': '和朋友', '亲子': '亲子',
};

export default function BlindBoxCard({ blindBox, requirements }: Props) {
  return (
    <div className="magic-card animate-scale-in">
      <div className="absolute -top-1 -right-1 w-16 h-16 overflow-hidden z-10">
        <div className="absolute top-0 right-0 w-24 h-6 origin-center translate-x-4 translate-y-4 rotate-45"
             style={{ background: 'linear-gradient(90deg, #A78BFA, #7C3AED)' }} />
      </div>
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium border border-purple-200">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7l8 4m0 0v10M4 7v10l8 4" />
            </svg>
            {blindBox.theme}
          </span>
        </div>
        <div className="ribbon-accent mb-3">
          <h3 className="text-2xl font-display font-bold text-purple-950">{blindBox.title}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-purple-400 mb-4 ml-5">
          <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>{requirements.city}</span>
          <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>{requirements.durationHours} 小时</span>
          <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>{PEOPLE_LABELS[requirements.peopleType] || requirements.peopleType}</span>
          <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>¥{requirements.budgetMax} 以内</span>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-gold-soft rounded-xl p-4 border border-purple-100 mb-4 ml-5">
          <p className="text-sm text-purple-900/70 leading-relaxed">{blindBox.story}</p>
        </div>
        <div className="flex flex-wrap gap-2 ml-5">
          {blindBox.tags.map((tag) => <span key={tag} className="px-2.5 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-medium border border-purple-200">#{tag}</span>)}
          {requirements.preferences.map((pref) => <span key={pref} className="px-2.5 py-1 text-xs rounded-full bg-gold-soft text-gold-dark font-medium border border-gold/30">{pref}</span>)}
          {requirements.constraints.map((c) => <span key={c} className="px-2.5 py-1 text-xs rounded-full bg-amber-50 text-amber-600 font-medium border border-amber-200">{c}</span>)}
        </div>
      </div>
    </div>
  );
}
