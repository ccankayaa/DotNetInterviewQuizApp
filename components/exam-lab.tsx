'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Bookmark, CheckCircle2, ChevronRight, Clock3, Flag, Play, RotateCcw, Settings2, Target, Timer, Trophy, X, XCircle } from 'lucide-react';
import { categories, questions, type Locale, type Question, type Level } from '@/lib/content';
import { copy } from '@/lib/copy';
import { path } from '@/lib/routes';
import { discardExamDraft, readExamDraft, saveExamDraft, type ExamDraft } from '@/lib/progress';
import { useProgress } from './progress-provider';
import { Chip, Difficulty, EmptyState } from './ui-helpers';

type Result = { draft: ExamDraft; correct: number; answered: number; finishedAt: string };
const questionById = new Map(questions.map(q => [q.id, q]));
function shuffle<T>(values: T[]): T[] { const arr = values.slice(); for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
const seconds = (ms: number) => `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;
export function ExamLab({ locale }: { locale: Locale }) {
  const { progress, answer, saveHistory, ready } = useProgress();
  const [mode, setMode] = useState<'study' | 'exam'>('study');
  const [category, setCategory] = useState('all'); const [level, setLevel] = useState('all');
  const [source, setSource] = useState<'all' | 'new' | 'incorrect' | 'bookmarked' | 'due'>('all');
  const [count, setCount] = useState(20); const [duration, setDuration] = useState(30);
  const [draft, setDraft] = useState<ExamDraft | null>(null); const [recovery, setRecovery] = useState<ExamDraft | null>(null);
  const [result, setResult] = useState<Result | null>(null); const [showReview, setShowReview] = useState(false);
  const [now, setNow] = useState(0); const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const finishedRef = useRef(new Set<string>());
  useEffect(() => { const existing = readExamDraft(); if (existing) setRecovery(existing); setNow(Date.now()); }, []);
  const pool = useMemo(() => questions.filter(q => {
    if (category !== 'all' && q.category !== category) return false;
    if (level !== 'all' && q.level !== level) return false;
    const a = progress.answers[q.id];
    if (source === 'new' && a) return false;
    if (source === 'incorrect' && (!a || a.lastCorrect)) return false;
    if (source === 'bookmarked' && !progress.bookmarks[q.id]) return false;
    if (source === 'due' && (!a || Date.parse(a.dueAt) > Date.now())) return false;
    return true;
  }), [category, level, source, progress]);
  const commitDraft = (next: ExamDraft) => { setDraft(next); saveExamDraft(next); };
  function begin() {
    if (!pool.length) return;
    const ids = shuffle(pool).slice(0, count).map(q => q.id);
    const created: ExamDraft = { version: 1, mode, ids, answers: {}, flags: [], position: 0, deadline: mode === 'exam' ? Date.now() + duration * 60000 : null, durationMinutes: duration, category, createdAt: new Date().toISOString() };
    setResult(null); setShowReview(false); setRecovery(null); setNow(Date.now()); commitDraft(created);
  }
  const finishDraft = useCallback((session: ExamDraft) => {
    if (finishedRef.current.has(session.createdAt)) return;
    finishedRef.current.add(session.createdAt);
    let correct = 0, answered = 0;
    for (const id of session.ids) {      
const chosen = session.answers[id]; const q = questionById.get(id);
      if (!q || chosen === undefined) continue;
      answered++; if (chosen === q.correctIndex) correct++;
      if (session.mode === 'exam') answer(q, chosen);
    }
    const finishedAt = new Date().toISOString();
    saveHistory({      
id: `exam-${session.createdAt}-${finishedAt}`, date: finishedAt, mode: session.mode, category: session.category,
      count: session.ids.length, answered, correct, durationMinutes: session.durationMinutes    
});
    discardExamDraft(); setDraft(null); setRecovery(null); setResult({ draft: session, correct, answered, finishedAt }); setShowReview(false);
  }, [answer, saveHistory]);
  useEffect(() => {
    if (!draft) return;
    const interval = window.setInterval(() => { const t = Date.now(); setNow(t); if (draft.deadline !== null && t >= draft.deadline) finishDraft(draft); }, 1000);
    return () => clearInterval(interval);
  }, [draft, finishDraft]);
  function select(i: number) {    
if (!draft) return; if (draft.deadline !== null && Date.now() >= draft.deadline) { finishDraft(draft); return; } const q = questionById.get(draft.ids[draft.position]); if (!q) return;
    if (draft.answers[q.id] !== undefined) return;
    if (draft.mode === 'study') answer(q, i);
    commitDraft({ ...draft, answers: { ...draft.answers, [q.id]: i } });
  }
  function toggleFlag() {    
if (!draft) return; const id = draft.ids[draft.position];
    const flags = draft.flags.includes(id) ? draft.flags.filter(x => x !== id) : [...draft.flags, id]; commitDraft({ ...draft, flags });  
}
  function abandon() { if (!window.confirm(copy(locale, 'confirmDiscard'))) return; discardExamDraft(); setDraft(null); setRecovery(null); setResult(null); }
  function resume() {    
if (!recovery) return; const safeIds = recovery.ids.filter(id => questionById.has(id));
    if (!safeIds.length) { discardExamDraft(); setRecovery(null); return; }
    const restored = { ...recovery, ids: safeIds, position: Math.min(recovery.position, safeIds.length - 1) };
    setRecovery(null); setDraft(restored); setNow(Date.now()); if (restored.deadline && restored.deadline <= Date.now()) finishDraft(restored);
  }
  const current = draft ? questionById.get(draft.ids[draft.position]) : undefined;
  const answerIndex = current && draft ? draft.answers[current.id] : undefined;
  const answeredCount = draft ? Object.keys(draft.answers).length : 0;
  if (!ready) return <div className="panel page-placeholder">{copy(locale, 'loading')}</div>;
  if (result) {    
const pct = Math.round(result.correct / Math.max(1, result.draft.ids.length) * 100);
    const byCat = categories.map(cat => {      
const set = result.draft.ids.map(id => questionById.get(id)).filter((q): q is Question => q?.category === cat.id);
      return { cat, total: set.length, correct: set.filter(q => result.draft.answers[q.id] === q.correctIndex).length };    
}).filter(x => x.total > 0);
    return <div className="results-page"><section className="results-hero panel"><div className="result-icon"><Trophy size={30} /></div><div className="eyebrow">{locale === 'tr' ? 'SINAV SONRASI ANALİZ' : 'POST-EXAM DEBRIEF'}</div>
      <div className="result-percent">{pct}<span>%</span></div><h2>{copy(locale, 'results')}</h2><p>{result.correct} {copy(locale, 'correct').toLowerCase()} · {result.answered} / {result.draft.ids.length} {copy(locale, 'answered').toLowerCase()}</p>
      <div className="result-action-row"><button className="btn btn-primary" onClick={() => { setResult(null); setShowReview(false); }}><RotateCcw size={17} />{copy(locale, 'newExam')}</button><button className="btn btn-outline" onClick={() => setShowReview(v => !v)}>{copy(locale, 'reviewAnswers')}<ChevronRight size={17} /></button></div>
    </section><div className="result-stats"><div className="mini-stat"><span>{copy(locale, 'accuracy')}</span><strong>{pct}%</strong></div><div className="mini-stat"><span>{copy(locale, 'correct')}</span><strong>{result.correct}</strong></div><div className="mini-stat"><span>{copy(locale, 'unanswered')}</span><strong>{result.draft.ids.length - result.answered}</strong></div></div>
      <section className="panel results-breakdown"><h3>{locale === 'tr' ? 'Alan bazında değerlendirme' : 'Performance by discipline'}</h3>{byCat.map(x => <div key={x.cat.id} className="breakdown-row"><div><span>{x.cat.title[locale]}</span><strong>{x.correct}/{x.total}</strong></div><div className="progress-bar"><span style={{ width: `${x.correct / x.total * 100}%` }} /></div></div>)}</section>
      {showReview && <section className="exam-review"><h2>{copy(locale, 'reviewAnswers')}</h2>{result.draft.ids.map((id, i) => {        
const q = questionById.get(id); if (!q) return null; const chosen = result.draft.answers[id]; const good = chosen === q.correctIndex;
        return <article className="review-entry panel" key={id}><div className="review-top"><span>#{i + 1} / {q.type === 'case' ? copy(locale, 'case') : copy(locale, 'concept')}</span>{chosen === undefined ? <Chip>{copy(locale, 'unanswered')}</Chip> : good ? <Chip tone="green">{copy(locale, 'correct')}</Chip> : <Chip tone="orange">{copy(locale, 'incorrect')}</Chip>}</div>
          <h3>{q.prompt[locale]}</h3>{q.code && <pre className="review-code">{q.code}</pre>}
          {chosen !== undefined && <p><strong>{copy(locale, 'yourAnswer')}:</strong> {q.options[locale][chosen]}</p>}
          <p className="review-correct"><strong>{copy(locale, 'correctAnswer')}:</strong> {q.options[locale][q.correctIndex]}</p>
          <div className="explanation-lines">{q.explanation[locale].split('\n').map((ln, j) => <p key={j}>{ln}</p>)}</div>
          <Link className="text-arrow" href={path(locale, `/topics/${q.topicId}`)}>{copy(locale, 'readLesson')} <ArrowRight size={15} /></Link>
        </article>;      
})}</section>}
    </div>;
  }
  if (!draft || !current) {    
return <div className="exam-setup"><div className="exam-config panel"><div className="eyebrow">{locale === 'tr' ? 'KİŞİSEL MÜLAKAT MOTORU' : 'CUSTOM INTERVIEW ENGINE'}</div><h2>{copy(locale, 'practiceHeader')}</h2><p>{copy(locale, 'practiceIntro')}</p>
      {recovery && <div className="resume-banner"><div><strong><Clock3 size={18} />{copy(locale, 'resumeExam')}</strong><p>{recovery.ids.length} {copy(locale, 'statQuestions').toLowerCase()} · {recovery.mode === 'exam' ? copy(locale, 'modeExam') : copy(locale, 'modeStudy')}</p></div><div className="resume-buttons"><button className="btn btn-primary" onClick={resume}>{copy(locale, 'resume')}</button><button className="btn btn-outline" onClick={abandon}>{copy(locale, 'discard')}</button></div></div>}
      <div className="config-group"><label>{copy(locale, 'mode')}</label><div className="mode-grid"><button type="button" className={'mode-choice ' + (mode === 'study' ? 'selected' : '')} onClick={() => setMode('study')}><BookMarkSymbol /><strong>{copy(locale, 'modeStudy')}</strong><small>{locale === 'tr' ? 'Her yanıttan sonra öğren' : 'Explanation after every answer'}</small></button>
        <button type="button" className={'mode-choice ' + (mode === 'exam' ? 'selected' : '')} onClick={() => setMode('exam')}><Timer size={21} /><strong>{copy(locale, 'modeExam')}</strong><small>{locale === 'tr' ? 'Sonuçlar sonda' : 'Score revealed at the end'}</small></button></div></div>
      <div className="config-two"><div className="config-group"><label htmlFor="exam-cat">{copy(locale, 'category')}</label><select id="exam-cat" value={category} onChange={e => setCategory(e.target.value)}><option value="all">{copy(locale, 'all')}</option>{categories.map(c => <option key={c.id} value={c.id}>{c.title[locale]}</option>)}</select></div>
        <div className="config-group"><label htmlFor="exam-level">{copy(locale, 'level')}</label><select id="exam-level" value={level} onChange={e => setLevel(e.target.value)}><option value="all">{copy(locale, 'all')}</option>{(['basic', 'intermediate', 'advanced'] as Level[]).map(l => <option key={l} value={l}>{copy(locale, l)}</option>)}</select></div></div>
      <div className="config-group"><label htmlFor="exam-source">{copy(locale, 'pickFrom')}</label><select id="exam-source" value={source} onChange={e => setSource(e.target.value as typeof source)}>
        <option value="all">{copy(locale, 'pickAll')}</option><option value="new">{copy(locale, 'pickNew')}</option><option value="incorrect">{copy(locale, 'pickWrong')}</option><option value="bookmarked">{copy(locale, 'pickSaved')}</option><option value="due">{copy(locale, 'pickDue')}</option></select></div>
      <div className="config-group"><div className="config-label-row"><label htmlFor="exam-count">{copy(locale, 'questionCount')}</label><strong>{Math.min(count, pool.length)}</strong></div><input id="exam-count" type="range" min={1} max={60} step={1} value={count} onChange={e => setCount(Number(e.target.value))} /><div className="scale-label"><span>1</span><span>60</span></div></div>
      {mode === 'exam' && <div className="config-group"><label>{copy(locale, 'duration')}</label><div className="duration-list">{[10, 20, 30, 45, 60, 90].map(n => <button className={duration === n ? 'selected' : ''} key={n} onClick={() => setDuration(n)}>{n} {copy(locale, 'minutes')}</button>)}</div></div>}
      <button className="btn btn-primary wide-button" disabled={pool.length === 0} onClick={begin}><Play size={18} fill="currentColor" />{copy(locale, 'start')}<ArrowRight size={18} /></button>
      <p className="tiny-note">{pool.length} {copy(locale, 'poolMatch').toLowerCase()} · {copy(locale, 'studyNotice')}</p>
    </div><aside className="exam-setup-side"><div className="eyebrow">{locale === 'tr' ? 'NASIL USTALAŞIRSIN?' : 'HOW TO MASTER IT'}</div><h2>{locale === 'tr' ? 'Her soruda daha iyi karar ver.' : 'Build better judgment with every question.'}</h2>
        {[["01", locale === 'tr' ? 'Hedefini seç' : 'Choose your focus', locale === 'tr' ? 'Disiplin, zorluk ve yanlış soruları filtrele.' : 'Select discipline, difficulty, and missed questions.'],
        ["02", locale === 'tr' ? 'Aktif hatırlama' : 'Active recall', locale === 'tr' ? 'Cevaptan önce gerekçeni zihninde açıkla.' : 'Explain your reasoning before revealing the answer.'],
        ["03", locale === 'tr' ? 'Ölç ve pekiştir' : 'Measure & reinforce', locale === 'tr' ? 'Sonuçları cihazında tut, aralıklı tekrar yap.' : 'Save results locally and use spaced repetition.']].map(([num, title, text]) => <div key={num} className="exam-step"><span>{num}</span><div><strong>{title}</strong><p>{text}</p></div></div>)}
        <div className="exam-setup-foot"><Target size={18} />{locale === 'tr' ? 'İlerleme aynı tarayıcıda otomatik saklanır.' : 'Progress is saved automatically in this browser.'}</div>
      </aside></div>  
}
  const remaining = draft.deadline === null ? null : Math.max(0, draft.deadline - now);
  const chosen = answerIndex !== undefined, correct = chosen && answerIndex === current.correctIndex;
  return <div className="active-exam"><div className="exam-main"><div className="exam-toolbar"><div><span className="eyebrow">{draft.mode === 'exam' ? (locale === 'tr' ? 'SÜRELİ MÜLAKAT' : 'TIMED INTERVIEW') : (locale === 'tr' ? 'ÇALIŞMA MODU' : 'LEARN MODE')}</span><strong>{copy(locale, 'statQuestions')} {draft.position + 1} / {draft.ids.length}</strong></div>
    <div className="toolbar-right">{remaining !== null && <span className={'exam-clock ' + (remaining < 60000 ? 'urgent' : '')}><Clock3 size={18} />{seconds(remaining)}</span>}<button type="button" className="finish-button" onClick={() => setShowFinishConfirm(true)}>{copy(locale, draft.mode === 'exam' ? 'finish' : 'endSession')}</button></div></div>
    <div className="exam-progress-track"><span style={{ width: `${(draft.position + 1) / draft.ids.length * 100}%` }} /></div>
    <article className="exam-question panel"><div className="exam-question-head"><div><Chip tone="accent">{categories.find(x => x.id === current.category)?.title[locale]}</Chip><Difficulty locale={locale} level={current.level} /></div><span>{current.type === 'case' ? copy(locale, 'case') : copy(locale, 'concept')}</span></div>
      <h2>{current.prompt[locale]}</h2>{current.code && <pre className="review-code">{current.code}</pre>}
      <div className="options">{current.options[locale].map((text, i) => {        
const revealed = draft.mode === 'study' && chosen;
        const right = revealed && i === current.correctIndex, wrong = revealed && i === answerIndex && !correct;
        return <button key={i} disabled={chosen} type="button" onClick={() => select(i)} className={'option ' + (right ? 'option-correct ' : '') + (wrong ? 'option-wrong ' : '') + (chosen && !revealed && answerIndex === i ? 'option-selected' : '') + (chosen && revealed && !right && !wrong ? 'option-dimmed' : '')}>
          <span className="option-letter">{String.fromCharCode(65 + i)}</span><span>{text}</span>{right && <CheckCircle2 size={20} className="success-icon" />}{wrong && <XCircle size={20} className="warning-icon" />}</button>;      
})}</div>
      {draft.mode === 'study' && chosen && <div className={'explanation ' + (correct ? 'explanation-correct' : 'explanation-incorrect')}><div className="explanation-head">{correct ? <CheckCircle2 size={20} /> : <XCircle size={20} />}<strong>{correct ? copy(locale, 'correctAnswer') : copy(locale, 'wrongAnswer')}</strong></div>
        <p className="correct-option-text"><strong>{copy(locale, 'correctAnswer')}:</strong> {current.options[locale][current.correctIndex]}</p>
        <div className="explanation-lines">{current.explanation[locale].split('\n').map((s, i) => <p key={i}>{s}</p>)}</div></div>}
    </article><div className="exam-bottom-bar"><button className="btn btn-outline" disabled={draft.position === 0} onClick={() => commitDraft({ ...draft, position: draft.position - 1 })}><ArrowLeft size={18} />{copy(locale, 'prev')}</button>
      <button className={'btn btn-quiet ' + (draft.flags.includes(current.id) ? 'flag-on' : '')} onClick={toggleFlag}><Flag size={17} />{copy(locale, draft.flags.includes(current.id) ? 'unflag' : 'flag')}</button>
      <button className="btn btn-primary" onClick={() => draft.position === draft.ids.length - 1 ? setShowFinishConfirm(true) : commitDraft({ ...draft, position: draft.position + 1 })}>{draft.position === draft.ids.length - 1 ? copy(locale, 'finish') : copy(locale, 'next')}<ArrowRight size={18} /></button></div>
  </div><aside className="exam-map panel"><div className="exam-map-head"><h3>{copy(locale, 'questionMap')}</h3><span>{answeredCount}/{draft.ids.length}</span></div><div className="progress-bar"><span style={{ width: `${answeredCount / draft.ids.length * 100}%` }} /></div>
      <div className="question-dots">{draft.ids.map((id, i) => <button key={id} aria-label={`${copy(locale, 'statQuestions')} ${i + 1}`} aria-current={draft.position === i ? 'step' : undefined}
        className={(draft.position === i ? 'current ' : '') + (draft.answers[id] !== undefined ? 'answered ' : '') + (draft.flags.includes(id) ? 'flagged' : '')}
        onClick={() => commitDraft({ ...draft, position: i })}>{i + 1}</button>)}</div><div className="dot-legend"><span><i className="legend-filled" />{copy(locale, 'answered')}</span><span><i className="legend-flagged" />{copy(locale, 'flag')}</span></div>
      <p>{locale === 'tr' ? 'Sayfayı yenilesen de bu oturum saklanır.' : 'This session survives page refreshes.'}</p></aside>
    {showFinishConfirm && <div className="modal-scrim" role="presentation"><div className="confirm-modal panel" role="dialog" aria-modal="true" aria-labelledby="finish-question"><h3 id="finish-question">{copy(locale, draft.mode === 'exam' ? 'finish' : 'endSession')}?</h3><p>{answeredCount}/{draft.ids.length} {copy(locale, 'answered').toLowerCase()}.</p><div className="modal-actions"><button className="btn btn-outline" onClick={() => setShowFinishConfirm(false)}>{locale === 'tr' ? 'İptal' : 'Cancel'}</button><button className="btn btn-primary" onClick={() => { setShowFinishConfirm(false); finishDraft(draft); }}>{copy(locale, 'finish')}</button></div></div></div>}
  </div>;
}
function BookMarkSymbol() { return <Bookmark size={21} />; }
