import type { Metadata } from 'next';
import { QuestionBrowser } from '@/components/question-browser';
import { SectionTitle } from '@/components/ui-helpers';
import { copy } from '@/lib/copy';
import { topics, categories, questionIndex, type Locale } from '@/lib/content';
export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> { const { locale } = await params; return { title: locale === 'tr' ? 'Mülakat Soru Havuzu | 1.012 Teknik Soru' : 'Interview Question Bank | 1,012 Questions', description: locale === 'tr' ? 'Zorluk, kategori ve çözüm durumuna göre filtrelenebilen 1.012 açıklamalı Türkçe ve İngilizce mülakat sorusu.' : 'Browse 1,012 explained Turkish-English questions by difficulty, category, and personal progress.' }; }
export default async function QuestionsPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<{ category?: string; topic?: string; status?: string }> }) {
  const { locale } = await params; const filters = await searchParams;
  return <div className="page-stack"><div className="page-heading"><SectionTitle eyebrow={locale === 'tr' ? 'SORU MOTORU' : 'THE QUESTION ENGINE'} title={copy(locale, 'navQuestions')} description={`${questionIndex.length.toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US')} ${copy(locale, 'statQuestions').toLowerCase()} · ${copy(locale, 'editorial')}`} /></div>
    <QuestionBrowser locale={locale} initialCategory={filters.category && categories.some(c => c.id === filters.category) ? filters.category : 'all'} initialTopic={filters.topic && topics.some(t => t.id === filters.topic) ? filters.topic : 'all'} initialStatus={filters.status === 'due' ? 'due' : 'all'} /></div>;
}
