import type { Locale } from './content';
export const LOCALES = ['tr', 'en'] as const;
export const validLocale = (v: string): v is Locale => v === 'tr' || v === 'en';
export const siteUrl = () => {
  const custom = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  return (custom || (vercel ? `https://${vercel}` : 'http://localhost:3000')).replace(/\/$/, '');
};
export const path = (locale: Locale, part = '') => `/${locale}${part.startsWith('/') ? part : part ? '/' + part : ''}`;
export const absolute = (locale: Locale, part = '') => siteUrl() + path(locale, part);
