'use client';
import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Bookmark, Check, CheckCircle2, ChevronRight, ExternalLink, RotateCcw, XCircle } from 'lucide-react';
import type { Locale, Question } from '@/lib/content';
import { copy } from '@/lib/copy';
import { path } from '@/lib/routes';
import { useProgress } from './progress-provider';
export function AnswerPanel({ q, locale }: { q: Question; locale: Locale }) {
  const { progress, answer, bookmark, ready } = useProgress(); const [selected, setSelected] = useState<number | null>(null);
  const old = progress.answers[q.id]; const saved = progress.bookmarks[q.id]; const revealed = selected !== null;
  const good = selected === q.correctIndex;
  return <div className="answer-panel"><div className="question-actions"><span className="muted-small">{old && ready ? copy(locale, 'youAnswered') : copy(locale, 'chooseAnswer')}</span>
    <button className={'bookmark-button ' + (saved ? 'bookmarked' : '')} type="button" aria-pressed={!!saved} onClick={() => bookmark(q.id)}><Bookmark size={17} fill={saved ? 'currentColor' : 'none'} />{saved ? copy(locale, 'saved') : copy(locale, 'save')}</button></div>
    {q.code && <div className="code-example"><div className="code-example-header"><span className="traffic-dots"><i /><i /><i /></span><code>scenario.cs</code></div><pre><code>{q.code}</code></pre></div>}
    <div className="options" role="group" aria-label={copy(locale, 'chooseAnswer')}>{q.options[locale].map((opt, i) => {
      const isRight = revealed && i === q.correctIndex; const isWrong = revealed && i === selected && !good;
      return <button key={i} type="button" disabled={revealed} onClick={() => { setSelected(i); answer(q, i); }}
        className={'option ' + (isRight ? 'option-correct ' : '') + (isWrong ? 'option-wrong ' : '') + (revealed && !isRight && !isWrong ? 'option-dimmed' : '')}>
        <span className="option-letter">{String.fromCharCode(65 + i)}</span><span>{opt}</span>{isRight && <CheckCircle2 size={20} className="success-icon" />}{isWrong && <XCircle size={20} className="warning-icon" />}
      </button>;    
})}</div>
    {revealed && <div className={'explanation ' + (good ? 'explanation-correct' : 'explanation-incorrect')} aria-live="polite"><div className="explanation-head">{good ? <CheckCircle2 size={21} /> : <BookOpen size={21} />}<strong>{good ? copy(locale, 'correctAnswer') : copy(locale, 'wrongAnswer')}</strong></div>
      <p className="correct-option-text"><strong>{copy(locale, 'correctAnswer')}:</strong> {q.options[locale][q.correctIndex]}</p>
      <h3>{copy(locale, 'why')}</h3><div className="explanation-lines">{q.explanation[locale].split('\n').map((line, i) => <p key={i}>{line}</p>)}</div>
      <div className="answer-footer"><button className="btn btn-secondary" onClick={() => setSelected(null)}><RotateCcw size={16} />{copy(locale, 'tryAgain')}</button><Link className="text-arrow" href={path(locale, `/topics/${q.topicId}`)}>{copy(locale, 'readLesson')}<ChevronRight size={16} /></Link></div>
    </div>}
    {!revealed && old && <div className="previous-record">{locale === 'tr' ? `Önceki denemeler: ${old.attempts} · Son sonuç: ${old.lastCorrect ? 'Doğru' : 'Yanlış'}` : `Previous attempts: ${old.attempts} · Latest: ${old.lastCorrect ? 'Correct' : 'Incorrect'}`}</div>}
  </div>;
}
