import type { Metadata } from 'next';
import { TopicBrowser } from '@/components/topic-browser';
import { categories, topics, type Locale } from '@/lib/content';
import { copy } from '@/lib/copy';
import { SectionTitle } from '@/components/ui-helpers';
export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> { const { locale } = await params; return { title: locale === 'tr' ? 'Konu Kütüphanesi | 198 Bilgisayar Mühendisliği Konusu' : 'Knowledge Library | 198 Engineering Topics', description: locale === 'tr' ? 'OOP, SOLID, CLR, IL, veri yapıları, kriptografi, ağ, AI ve 18 mühendislik alanında iki dilli konu anlatımları.' : '198 bilingual technical lessons across OOP, SOLID, CLR, IL, algorithms, cryptography, networking, AI and 18 fields.' }; }
export default async function TopicsPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<{ category?: string }> }) {
  const { locale } = await params; const search = await searchParams;
  return <div className="page-stack"><div className="page-heading"><SectionTitle eyebrow={locale === 'tr' ? 'BİLGİ KÜTÜPHANESİ' : 'THE KNOWLEDGE BASE'} title={copy(locale, 'navTopics')} description={`${topics.length} ${copy(locale, 'statTopics').toLowerCase()} · ${categories.length} ${copy(locale, 'statTracks').toLowerCase()}`} /></div>
    <TopicBrowser locale={locale} initialCategory={search.category && categories.some(c => c.id === search.category) ? search.category : 'all'} /></div>;
}
