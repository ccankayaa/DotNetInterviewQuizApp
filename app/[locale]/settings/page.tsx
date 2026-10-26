import type { Metadata } from 'next';
import type { Locale } from '@/lib/content';
import { SettingsView } from '@/components/settings-view';
export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params; return { title: locale === 'tr' ? 'Görünüm ve Yedekleme' : 'Preferences & Backup', robots: { index: false, follow: true } };
}
export default async function SettingsPage({ params }: { params: Promise<{ locale: Locale }> }) { const { locale } = await params; return <SettingsView locale={locale} />; }
