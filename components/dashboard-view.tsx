'use client';
import Link from 'next/link';
import { ArrowRight, BookOpenCheck, CalendarClock, CheckCircle2, ClipboardCheck, Flame, History, Lightbulb, Play, Target, TrendingUp } from 'lucide-react';
import { categories, contentStats, questionIndex, topics, type Locale } from '@/lib/content';
import { copy } from '@/lib/copy';
import { path } from '@/lib/routes';
import { getCoachRecommendation } from '@/lib/coach';
import { useProgress } from './progress-provider';

export function DashboardView({ locale }: { locale: Locale }) {
  const { progress, ready } = useProgress();
  const answers = Object.values(progress.answers), done = answers.length;
  const correct = answers.filter(a => a.lastCorrect).length;
  const accuracy = done ? Math.round(correct / done * 100) : 0;
  const due = answers.filter(a => new Date(a.dueAt).getTime() <= Date.now()).length;
  const recomm = getCoachRecommendation(progress, locale);
  const totals = categories.map(c => {
    const related = questionIndex.filter(q => q.category === c.id);
    const solved = related.filter(q => !!progress.answers[q.id]);
    return { cat: c, all: related.length, done: solved.length, percent: Math.round(solved.length / Math.max(1, related.length) * 100), accurate: solved.filter(q => progress.answers[q.id].lastCorrect).length };
  });
  const history = progress.history;
  return <div className="page-stack">
    <div className="dashboard-hero"><div><div className="eyebrow"><TrendingUp size={15} /> {locale === 'tr' ? 'KİŞİSEL MÜHENDİSLİK RAPORU' : 'PERSONAL ENGINEERING REPORT'}</div><h1>{copy(locale, 'dashboardHeading')}</h1><p>{copy(locale, 'dashboardIntro')}</p></div><Link href={path(locale, '/practice')} className="btn btn-primary"><Play size={17} />{copy(locale, 'startPractice')}</Link></div>
    {!ready ? <div className="panel page-placeholder">{copy(locale, 'loading')}</div> : <>
      <div className="dashboard-stats">
        <div className="dash-stat"><span>{copy(locale, 'completed')}</span><strong>{done}<small> / {contentStats.questions}</small></strong><small>{locale === 'tr' ? 'Tekil soru sayısı' : 'Unique questions'}</small></div>
        <div className="dash-stat"><span>{copy(locale, 'accuracy')}</span><strong>{accuracy}%</strong><small>{locale === 'tr' ? 'Her sorunun son cevabı' : 'Latest result per question'}</small></div>
        <div className="dash-stat"><span>{copy(locale, 'bookmarked')}</span><strong>{Object.keys(progress.bookmarks).length}</strong><small>{locale === 'tr' ? 'Kaydettiğin sorular' : 'Questions saved'}</small></div>
        <div className="dash-stat"><span>{locale === 'tr' ? 'Tekrar zamanı gelen' : 'Due for review'}</span><strong>{due}</strong><small><Link href={path(locale, '/questions?status=due')} className="text-arrow">{locale === 'tr' ? 'Tekrar sorularını aç' : 'Open due questions'} <ArrowRight size={13} /></Link></small></div>
      </div>
      <div className="dashboard-layout"><section className="panel"><div className="panel-heading"><h2>{locale === 'tr' ? 'Alanlara göre ilerleme' : 'Progress by discipline'}</h2><Link href={path(locale, '/questions')} className="text-arrow">{copy(locale, 'navQuestions')} <ArrowRight size={16} /></Link></div>
        {totals.map(t => <div className="progress-discipline" key={t.cat.id}><div className="progress-discipline-top"><span>{t.cat.title[locale]}</span><strong>{t.done} / {t.all}</strong></div><div className="progress-bar"><span style={{ width: `${t.percent}%` }} /></div></div>)}
      </section><div><section className="panel"><div className="panel-heading"><h2>{locale === 'tr' ? 'Son sınavlar' : 'Recent exams'}</h2><History size={18} color="var(--accent)" /></div>
        {history.length === 0 ? <div className="dashboard-empty"><ClipboardCheck size={30} /><p>{locale === 'tr' ? 'Henüz tamamlanmış bir sınavın yok.' : 'No completed exam sessions yet.'}</p></div> : <div className="history-list">{history.slice(0, 8).map(item => <div className="history-item" key={item.id}><span className="history-icon"><BookOpenCheck size={17} /></span><div><strong>{item.mode === 'exam' ? copy(locale, 'modeExam') : copy(locale, 'modeStudy')}</strong><small>{new Date(item.date).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')} · {item.answered}/{item.count} {copy(locale, 'answered').toLowerCase()}</small></div><span className="history-score">{Math.round(item.correct / Math.max(1, item.count) * 100)}%</span></div>)}</div>}
      </section><section className="panel" style={{ marginTop: 16 }}><div className="eyebrow"><Lightbulb size={15} />{copy(locale, 'todayPlan')}</div><div className="coach-callout"><h3>{recomm.topic?.title[locale]}</h3><p>{recomm.reason}</p><Link href={path(locale, `/topics/${recomm.topic?.id || topics[0].id}`)} className="text-arrow">{copy(locale, 'coachStart')}<ArrowRight size={16} /></Link></div><p style={{ fontSize: 11, margin: '15px 0 0' }}>{copy(locale, 'coachNote')}</p></section>
          <section className="panel" style={{ marginTop: 16 }}><div className="panel-heading"><h2>{locale === 'tr' ? 'Çalışma önerisi' : 'Suggested routine'}</h2><CalendarClock size={18} color="var(--accent)" /></div><p style={{ fontSize: 12 }}>{locale === 'tr' ? 'Her oturumda 10–20 soruyu kapalı kitap çöz. Yanlış cevapların teknik gerekçesini oku; bir sonraki gün hatırlamaya çalış. İleri konularda örnek kodu ve üretim riskini sözlü açıkla.' : 'Answer 10–20 questions from memory. Review mechanisms behind mistakes; retrieve them again tomorrow. For advanced topics, explain production risk and code aloud.'}</p></section></div></div>
    </>}
  </div>;
}
