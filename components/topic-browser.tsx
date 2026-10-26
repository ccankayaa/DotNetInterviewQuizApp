'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Search, X } from 'lucide-react';
import { categories, topics, type Locale, type Level } from '@/lib/content';
import { copy } from '@/lib/copy';
import { path } from '@/lib/routes';
import { Chip, Difficulty, EmptyState } from './ui-helpers';
export function TopicBrowser({ locale, initialCategory = 'all' }: { locale: Locale; initialCategory?: string }) {
  const [search, setSearch] = useState(''); const [category, setCategory] = useState(initialCategory); const [level, setLevel] = useState('all'); const [page, setPage] = useState(1);
  const filtered = useMemo(() => topics.filter(x => {
    const text = [x.title.tr, x.title.en, ...Object.values(x.facts).flatMap(v => [v.tr, v.en])].join(' ').toLocaleLowerCase(locale === 'tr' ? 'tr' : 'en');
    return (category === 'all' || x.category === category) && (level === 'all' || x.level === level) && (!search || text.includes(search.toLocaleLowerCase(locale === 'tr' ? 'tr' : 'en')));
  }), [search, category, level, locale]);
  const size = 18, pages = Math.ceil(filtered.length / size), shown = filtered.slice((page - 1) * size, page * size);
  function changeCategory(v: string) { setCategory(v); setPage(1); } function changeLevel(v: string) { setLevel(v); setPage(1); }
  return <><div className="library-filter panel"><div className="search-wrap"><Search size={19} /><input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder={copy(locale, 'searchPlace')} aria-label={copy(locale, 'search')} />{search && <button onClick={() => setSearch('')} aria-label={locale === 'tr' ? 'Aramayı temizle' : 'Clear search'}><X size={16} /></button>}</div>
    <div className="filter-row"><div className="field-inline"><label htmlFor="topic-cat">{copy(locale, 'category')}</label><select id="topic-cat" value={category} onChange={e => changeCategory(e.target.value)}><option value="all">{copy(locale, 'all')}</option>{categories.map(c => <option key={c.id} value={c.id}>{c.title[locale]}</option>)}</select></div>
      <div className="field-inline"><label htmlFor="topic-level">{copy(locale, 'level')}</label><select id="topic-level" value={level} onChange={e => changeLevel(e.target.value)}><option value="all">{copy(locale, 'all')}</option>{(['basic', 'intermediate', 'advanced'] as Level[]).map(l => <option key={l} value={l}>{copy(locale, l)}</option>)}</select></div>
      <span className="filter-count">{filtered.length} {copy(locale, 'statTopics').toLowerCase()}</span></div></div>
    {shown.length === 0 ? <EmptyState message={copy(locale, 'noResults')}><button className="btn btn-secondary" onClick={() => { setCategory('all'); setLevel('all'); setSearch(''); }}>{copy(locale, 'clearFilters')}</button></EmptyState> :
      <><div className="topic-list">{shown.map((topic, i) => {        
const cat = categories.find(x => x.id === topic.category); return <Link className="topic-row" href={path(locale, `/topics/${topic.id}`)} key={topic.id}>
          <div className="topic-seq">{String((page - 1) * size + i + 1).padStart(2, '0')}</div><div className="topic-row-main"><div className="topic-row-tags"><Chip tone="accent">{cat?.title[locale]}</Chip><Difficulty locale={locale} level={topic.level} /></div>
            <h3>{topic.title[locale]}</h3><p>{topic.facts.mechanism[locale]}</p></div><span className="topic-row-arrow"><ArrowRight size={19} /></span>
        </Link>;      
})}</div><Pagination locale={locale} page={page} pages={pages} go={setPage} /></>}
  </>;
}
export function Pagination({ locale, page, pages, go }: { locale: Locale; page: number; pages: number; go: (page: number) => void }) {
  if (pages < 2) return null;
  return <div className="pagination"><button disabled={page <= 1} onClick={() => go(page - 1)}>{copy(locale, 'prev')}</button><span>{page} / {pages}</span><button disabled={page >= pages} onClick={() => go(page + 1)}>{copy(locale, 'next')}</button></div>;
}
