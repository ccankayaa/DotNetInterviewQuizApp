'use client';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Database, RotateCcw, Sparkles } from 'lucide-react';
import type { Locale } from '@/lib/content';
import { contentStats } from '@/lib/content';
import { copy } from '@/lib/copy';
import { path } from '@/lib/routes';
import { useProgress } from './progress-provider';
import { getCoachRecommendation } from '@/lib/coach';
export function HomeProgress({ locale }: { locale: Locale }) {
  const { progress, ready } = useProgress(); const answered = Object.keys(progress.answers).length;
  const correct = Object.values(progress.answers).filter(a => a.lastCorrect).length;
  const recommend = getCoachRecommendation(progress, locale);
  const ratio = contentStats.questions === 0 ? 0 : Math.round(answered / contentStats.questions * 100);
  return <div className="home-progress-grid"><section className="progress-panel panel">
    <div className="panel-top"><span className="eyebrow"><Database size={14} /> {copy(locale, 'dashboardHeading')}</span><span className="status-pill"><span className="small-live-dot" />{copy(locale, 'localOnly')}</span></div>
    <div className="progress-large"><strong>{ready ? answered : '—'}</strong><span> / {contentStats.questions}</span></div>
    <div className="progress-bar"><span style={{ width: `${ratio}%` }} /></div>
    <div className="progress-subline"><span>{ratio}% {locale === 'tr' ? 'tamamlandı' : 'completed'}</span><span><CheckCircle2 size={15} /> {correct} {locale === 'tr' ? 'doğru' : 'correct'}</span></div>
    <Link className="text-arrow" href={path(locale, '/dashboard')}>{copy(locale, 'goDashboard')} <ArrowRight size={17} /></Link>
  </section><section className="coach-panel panel"><div className="panel-top"><span className="eyebrow"><Sparkles size={14} /> {copy(locale, 'todayPlan')}</span><span className="coach-badge">{locale === 'tr' ? 'UYARLANIR' : 'ADAPTIVE'}</span></div>
      <h3>{recommend.topic?.title[locale] || 'Engineering'}</h3><p className="coach-reason">{recommend.reason}</p>
      <p className="coach-disclaimer">{copy(locale, 'coachNote')}</p>
      <Link className="btn btn-secondary" href={path(locale, `/topics/${recommend.topic?.id || ''}`)}>{copy(locale, 'coachStart')} <ArrowRight size={16} /></Link>
    </section></div>;
}
