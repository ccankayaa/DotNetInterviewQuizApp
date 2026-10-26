import type { MetadataRoute } from 'next';
import { questions, topics } from '@/lib/content';
import { absolute } from '@/lib/routes';
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/topics', '/questions', '/practice', '/about'];
  const items: MetadataRoute.Sitemap = [];
  for (const locale of ['tr', 'en'] as const) {
    for (const route of routes) items.push({ url: absolute(locale, route), changeFrequency: 'weekly', priority: route === '' ? 1 : 0.7 });
    for (const topic of topics) items.push({ url: absolute(locale, `/topics/${topic.id}`), changeFrequency: 'monthly', priority: 0.75 });
    for (const q of questions) items.push({ url: absolute(locale, `/questions/${q.id}`), changeFrequency: 'monthly', priority: q.type === 'case' ? 0.65 : 0.5 });
  }
  return items;
}
