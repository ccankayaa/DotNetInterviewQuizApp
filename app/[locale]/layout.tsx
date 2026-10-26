import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { ProgressProvider } from '@/components/progress-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { validLocale, absolute } from '@/lib/routes';
import type { Locale } from '@/lib/content';
import '../globals.css';
type Props = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};
export async function generateStaticParams() { return [{ locale: 'tr' }, { locale: 'en' }]; }
export async function generateMetadata({ params }: {
  params: Promise<{
    locale: string;
  }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const lang: Locale = validLocale(raw) ? raw : 'tr';
  const title = lang === 'tr' ? 'Engineering Mastery | Kıdemli Yazılım Mühendisliği' : 'Engineering Mastery | Senior Software Engineering';
  const description = lang === 'tr'
    ? '1.012 Türkçe/İngilizce teknik mülakat sorusu, 198 konu ve 18 bilgisayar mühendisliği alanı. .NET, IL, OOP, algoritmalar, kriptografi, ağ, sistem tasarımı ve AI.'
    : '1,012 bilingual interview questions, 198 lessons and 18 engineering tracks. .NET, IL, OOP, algorithms, cryptography, networking, system design and AI.';
  return {
    metadataBase: new URL(absolute(lang).replace(/\/(en|tr)$/, '')), title: { default: title, template: '%s | Engineering Mastery' }, description,
    alternates: { canonical: absolute(lang), languages: { tr: absolute('tr'), en: absolute('en'), 'x-default': absolute('en') } },
    openGraph: { type: 'website', locale: lang === 'tr' ? 'tr_TR' : 'en_US', title, description, url: absolute(lang), siteName: 'Engineering Mastery' },
    robots: { index: true, follow: true }, manifest: '/site.webmanifest'
  };
}
export default async function LocaleLayout({ params, children }: Props) {
  const { locale: raw } = await params;
  if (!validLocale(raw))
    notFound();
  const locale = raw;
  const themeScript = `(function(){try{var t=localStorage.getItem('engineering-mastery.theme.v1')||'system';var dark=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=t==='system'?(dark?'dark':'light'):t;}catch(e){}})();`;
  return <html lang={locale} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head><body>
    <ThemeProvider><ProgressProvider><AppShell locale={locale}>{children}</AppShell></ProgressProvider></ThemeProvider>
  </body></html>;
}
