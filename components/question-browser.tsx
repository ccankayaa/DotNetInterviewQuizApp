'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bookmark, CheckCircle2, Search, X } from 'lucide-react';
import { categories, questionIndex, topics, type Locale, type Level } from '@/lib/content';
import { copy } from '@/lib/copy';
import { path } from '@/lib/routes';
import { useProgress } from './progress-provider';
import { Chip, Difficulty, EmptyState } from './ui-helpers';
import { Pagination } from './topic-browser';
const lookup = new Map(topics.map(t => [t.id, t]));
export function QuestionBrowser({ locale, initialTopic = 'all', initialCategory = 'all', initialStatus = 'all' }: { locale: Locale; initialTopic?: string; initialCategory?: string; initialStatus?: string }) {
  const [search, setSearch] = useState(''); const [category, setCategory] = useState(initialCategory);
  const [topic, setTopic] = useState(initialTopic); const [level, setLevel] = useState('all'); const [status, setStatus] = useState(initialStatus); const [type, setType] = useState('all');
  const [page, setPage] = useState(1); const { progress } = useProgress();
  const filtered = useMemo(() => questionIndex.filter(q => {
    if (category !== 'all' && category !== q.category) return false;
    if (topic !== 'all' && topic !== q.topicId) return false;
    if (level !== 'all' && level !== q.level) return false;
    if (type !== 'all' && type !== q.type) return false;
    const attempt = progress.answers[q.id];
    if (status === 'new' && attempt) return false; if (status === 'correct' && (!attempt || !attempt.lastCorrect)) return false;
    if (status === 'incorrect' && (!attempt || attempt.lastCorrect)) return false;
    if (status === 'bookmarked' && !progress.bookmarks[q.id]) return false;
    if (status === 'due' && (!attempt || Date.parse(attempt.dueAt) > Date.now())) return false;
    if (search) {      
const needle = search.toLocaleLowerCase(locale === 'tr' ? 'tr' : 'en');
      if (![q.prompt.tr, q.prompt.en, lookup.get(q.topicId)?.title.tr, lookup.get(q.topicId)?.title.en].join(' ').toLocaleLowerCase(locale === 'tr' ? 'tr' : 'en').includes(needle)) return false;    
}
    return true;
  }), [category, topic, level, status, type, search, locale, progress]);
  const pageSize = 24, pages = Math.ceil(filtered.length / pageSize), shown = filtered.slice((page - 1) * pageSize, page * pageSize);
  const change = (setter: (x: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => { setter(e.target.value); setPage(1); };
  const clear = () => { setSearch(''); setCategory('all'); setLevel('all'); setStatus('all'); setType('all'); setTopic('all'); setPage(1); };
  return <><div className="library-filter panel"><div className="search-wrap"><Search size={19} /><input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} aria-label={copy(locale, 'search')} placeholder={copy(locale, 'searchPlace')} />{search && <button aria-label={locale === 'tr' ? 'Aramayı temizle' : 'Clear search'} onClick={() => setSearch('')}><X size={16} /></button>}</div>
    <div className="filter-row filter-wrap"><div className="field-inline"><label htmlFor="q-category">{copy(locale, 'category')}</label><select id="q-category" value={category} onChange={change(setCategory)}><option value="all">{copy(locale, 'all')}</option>{categories.map(c => <option key={c.id} value={c.id}>{c.title[locale]}</option>)}</select></div>
      <div className="field-inline"><label htmlFor="q-level">{copy(locale, 'level')}</label><select id="q-level" value={level} onChange={change(setLevel)}><option value="all">{copy(locale, 'all')}</option>{(['basic', 'intermediate', 'advanced'] as Level[]).map(l => <option key={l} value={l}>{copy(locale, l)}</option>)}</select></div>
      <div className="field-inline"><label htmlFor="q-status">{copy(locale, 'status')}</label><select id="q-status" value={status} onChange={change(setStatus)}><option value="all">{copy(locale, 'allStatuses')}</option>{(['new', 'correct', 'incorrect', 'bookmarked', 'due'] as const).map(v => <option key={v} value={v}>{copy(locale, v)}</option>)}</select></div>
      <div className="field-inline"><label htmlFor="q-type">{copy(locale, 'mode')}</label><select id="q-type" value={type} onChange={change(setType)}><option value="all">{copy(locale, 'all')}</option><option value="concept">{copy(locale, 'concept')}</option><option value="case">{copy(locale, 'case')}</option></select></div>
      {topic !== 'all' && <button className="pill-button" onClick={() => setTopic('all')}><X size={14} />{lookup.get(topic)?.title[locale]}</button>}
      <span className="filter-count">{filtered.length} {copy(locale, 'statQuestions').toLowerCase()}</span></div></div>
    {shown.length === 0 ? <EmptyState message={copy(locale, 'noResults')}><button onClick={clear} className="btn btn-secondary">{copy(locale, 'clearFilters')}</button></EmptyState> :
      <><div className="question-grid">{shown.map((q, i) => {        
const attempts = progress.answers[q.id]; const tag = categories.find(c => c.id === q.category);
        return <Link key={q.id} className="question-tile" href={path(locale, `/questions/${q.id}`)}>
          <div className="question-tile-meta"><span className="question-tile-index">#{String((page - 1) * pageSize + i + 1).padStart(3, '0')}</span><Difficulty locale={locale} level={q.level} /><span className="tile-spacer" />{progress.bookmarks[q.id] && <Bookmark className="saved-icon" size={16} fill="currentColor" />}{attempts && <CheckCircle2 size={17} className={attempts.lastCorrect ? 'success-icon' : 'warning-icon'} />}</div>
          <div className="question-type">{q.type === 'case' ? '◈  ' + copy(locale, 'case') : '⌘  ' + copy(locale, 'concept')}</div><h3>{q.prompt[locale]}</h3><div className="question-tile-footer"><span>{tag?.title[locale]}</span><ArrowRight size={18} /></div>
        </Link>;      
})}</div><Pagination locale={locale} page={page} pages={pages} go={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} /></>}
  </>;
}
