import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ExternalLink, GraduationCap } from 'lucide-react';
import { getQuestion, getTopic, getCategory, questionIndex, type Locale } from '@/lib/content';
import { copy } from '@/lib/copy';
import { absolute, path } from '@/lib/routes';
import { AnswerPanel } from '@/components/answer-panel';
import { Chip, Difficulty } from '@/components/ui-helpers';
export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params; const q = getQuestion(id); if (!q) return {};
  return { title: q.prompt[locale], description: q.explanation[locale].slice(0, 155), alternates: { canonical: absolute(locale, `/questions/${id}`), languages: { tr: absolute('tr', `/questions/${id}`), en: absolute('en', `/questions/${id}`) } } };
}
export default async function QuestionDetail({ params }: { params: Promise<{ locale: Locale; id: string }> }) {
  const { locale, id } = await params; const q = getQuestion(id); if (!q) notFound(); const topic = getTopic(q.topicId); const cat = getCategory(q.category);
  const pos = questionIndex.findIndex(x => x.id === id), prev = questionIndex[pos - 1], next = questionIndex[pos + 1];
  return <article className="question-detail"><div className="breadcrumbs"><Link href={path(locale, '/questions')}><ArrowLeft size={16} />{copy(locale, 'backToQuestions')}</Link><span>/</span><span>{cat?.title[locale]}</span></div>
    <div className="question-heading"><div className="question-header-chips"><Chip tone="accent">{q.type === 'case' ? copy(locale, 'case') : copy(locale, 'concept')}</Chip><Difficulty locale={locale} level={q.level} /><span className="question-id">{q.id}</span></div><h1>{q.prompt[locale]}</h1>
      <p>{topic?.facts.mechanism[locale]}</p></div>
    <div className="question-detail-layout"><section className="answer-container panel"><AnswerPanel key={q.id} q={q} locale={locale} /></section>
      <aside className="question-side"><div className="side-info panel"><div className="eyebrow">{locale === 'tr' ? 'BAĞLAM' : 'CONTEXT'}</div><h3>{topic?.title[locale]}</h3><p>{topic?.facts.practice[locale]}</p><Link href={path(locale, `/topics/${q.topicId}`)} className="text-arrow">{copy(locale, 'readLesson')}<ArrowRight size={16} /></Link>
        <div className="divider" /><span className="muted-small">{copy(locale, 'source')}</span>{q.sources.map(s => <a href={s} rel="noreferrer" target="_blank" className="source-link" key={s}>{new URL(s).hostname}<ExternalLink size={15} /></a>)}</div></aside></div>
    <nav className="detail-nav" aria-label={locale === 'tr' ? 'Soru gezinme' : 'Question navigation'}>{prev ? <Link href={path(locale, `/questions/${prev.id}`)}><ArrowLeft size={17} />{copy(locale, 'prev')}</Link> : <span />}{next && <Link href={path(locale, `/questions/${next.id}`)}>{copy(locale, 'next')}<ArrowRight size={17} /></Link>}</nav>
  </article>;
}
