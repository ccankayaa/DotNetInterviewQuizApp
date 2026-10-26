import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategory, getTopic, relatedQuestions, topics, type Locale } from '@/lib/content';
import { getDeepDive } from '@/lib/deep-dives';
import { copy } from '@/lib/copy';
import { absolute, path } from '@/lib/routes';

type PageProps = { params: Promise<{ locale: Locale; id: string }> };
type Fact = 'mechanism' | 'practice' | 'pitfall' | 'tradeoff' | 'signal';

const sections: { fact: Fact; label: string }[] = [
  { fact: 'mechanism', label: 'lessonMechanism' },
  { fact: 'practice', label: 'lessonPractice' },
  { fact: 'pitfall', label: 'lessonPitfall' },
  { fact: 'tradeoff', label: 'lessonTradeoff' },
  { fact: 'signal', label: 'lessonSignal' },
];

export function generateStaticParams() {
  return topics.map(topic => ({ id: topic.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const topic = getTopic(id);
  if (!topic) return {};
  return {
    title: topic.title[locale],
    description: topic.facts.mechanism[locale],
    alternates: {
      canonical: absolute(locale, '/topics/' + id),
      languages: {
        tr: absolute('tr', '/topics/' + id),
        en: absolute('en', '/topics/' + id),
      },
    },
  };
}

export default async function TopicDetail({ params }: PageProps) {
  const { locale, id } = await params;
  const topic = getTopic(id);
  if (!topic) notFound();

  const category = getCategory(topic.category);
  const questions = relatedQuestions(topic.id);
  const deepDive = getDeepDive(topic.id);

  return (
    <article className="lesson-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href={path(locale, '/topics')}>{copy(locale, 'navTopics')}</Link>
        <span>/</span>
        <span>{category?.title[locale]}</span>
      </nav>
      <header className="lesson-hero">
        <div className="lesson-tags">
          <span className="eyebrow">{category?.title[locale]}</span>
          <span className="eyebrow">{questions.length} {copy(locale, 'statQuestions')}</span>
        </div>
        <h1>{topic.title[locale]}</h1>
        <p>{topic.facts.mechanism[locale]}</p>
        <div className="lesson-top-links">
          <Link className="btn btn-primary" href={path(locale, '/questions?topic=' + topic.id)}>
            {copy(locale, 'seeQuestions')}
          </Link>
          <a className="btn btn-outline" href={topic.source} target="_blank" rel="noopener noreferrer">
            {copy(locale, 'readSource')}
          </a>
        </div>
      </header>
      <div className="lesson-layout">
        <div className="lesson-body">
          <div className="eyebrow">{locale === 'tr' ? 'TEKNİK DERİNLEŞME' : 'TECHNICAL DEEP DIVE'}</div>
          {sections.map((section, index) => (
            <section className="lesson-section" id={section.fact} key={section.fact}>
              <div className="lesson-section-number">{String(index + 1).padStart(2, '0')}</div>
              <div>
                <div className="lesson-section-top"><h2>{copy(locale, section.label as Parameters<typeof copy>[1])}</h2></div>
                <p>{topic.facts[section.fact][locale]}</p>
              </div>
            </section>
          ))}
          {deepDive && (
            <section className="deep-lab">
              <div className="eyebrow">{locale === 'tr' ? 'MÜHENDİSLİK NOTLARI' : 'ENGINEERING FIELD NOTES'}</div>
              <h2>{locale === 'tr' ? 'Pratik zihinsel model ve kod örneği' : 'Mental model and practical code example'}</h2>
              <p>{deepDive.mentalModel[locale]}</p>
              <div className="code-caption">{deepDive.language}</div>
              <pre className="guide-code"><code>{deepDive.code}</code></pre>
              <p><strong>{locale === 'tr' ? 'Mülakatta açıklanacak nokta:' : 'Interview checkpoint:'}</strong> {deepDive.checkpoint[locale]}</p>
            </section>
          )}
          <section className="lesson-related">
            <div className="eyebrow">{locale === 'tr' ? 'ÖĞRENME KONTROLÜ' : 'PRACTICE CHECKPOINT'}</div>
            <h2>{copy(locale, 'seeQuestions')}</h2>
            <div className="related-list">
              {questions.map((question, index) => (
                <Link key={question.id} href={path(locale, '/questions/' + question.id)}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div><strong>{question.title[locale]}</strong><small>{question.prompt[locale]}</small></div>
                </Link>
              ))}
            </div>
          </section>
        </div>
        <aside className="lesson-aside">
          <div className="sticky-aside">
            <span className="eyebrow">{locale === 'tr' ? 'KONU HARİTASI' : 'LESSON MAP'}</span>
            <ol>{sections.map((section, index) => (
              <li key={section.fact}>
                <a href={'#' + section.fact}>
                  <span>{index + 1}.</span>
                  {copy(locale, section.label as Parameters<typeof copy>[1])}
                </a>
              </li>
            ))}</ol>
          </div>
        </aside>
      </div>
    </article>
  );
}
