import type { Metadata } from 'next';
import { DashboardView } from '@/components/dashboard-view';
import type { Locale } from '@/lib/content';
export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params; return { title: locale === 'tr' ? 'İlerleme Panosu' : 'Learning Dashboard', robots: { index: false, follow: true } };
}
export default async function DashboardPage({ params }: {
  params: Promise<{
    locale: Locale;
  }>;
}) { const { locale } = await params; return <DashboardView locale={locale} />; }
