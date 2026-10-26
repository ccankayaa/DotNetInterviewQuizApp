'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { answerUpdated, emptyProgress, mergeProgress, normalizeProgress, persistProgress, readProgress, STORAGE_KEY, type ExamHistory, type Progress } from '@/lib/progress';
import type { Question } from '@/lib/content';

type Context = {  
progress: Progress; ready: boolean; storageError: boolean; answer: (q: Question, selected: number) => void;
  bookmark: (id: string) => void; saveHistory: (item: ExamHistory) => void; importData: (raw: unknown) => void; clear: () => void
};
const ProgressContext = createContext<Context | null>(null);
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const current = useRef<Progress>(emptyProgress());
  useEffect(() => {
    const data = readProgress(); current.current = data; setProgress(data); setReady(true);
    const onStorage = (event: StorageEvent) => { if (event.key === STORAGE_KEY) { const updated = readProgress(); current.current = updated; setProgress(updated); } };
    window.addEventListener('storage', onStorage); return () => window.removeEventListener('storage', onStorage);
  }, []);
  const commit = useCallback((next: Progress) => { current.current = next; setProgress(next); if (!persistProgress(next)) setStorageError(true); }, []);
  const answer = useCallback((q: Question, selected: number) => {
    if (!Number.isInteger(selected) || selected < 0 || selected >= q.options.tr.length) return;
    const base = current.current; commit({      
...base, updatedAt: new Date().toISOString(),
      answers: { ...base.answers, [q.id]: answerUpdated(base.answers[q.id], selected, selected === q.correctIndex) }    
});
  }, [commit]);
  const bookmark = useCallback((id: string) => {    
const base = current.current; const b = { ...base.bookmarks }; if (b[id]) delete b[id]; else b[id] = true;
    commit({ ...base, bookmarks: b });  
}, [commit]);
  const saveHistory = useCallback((item: ExamHistory) => { const base = current.current; commit({ ...base, history: [item, ...base.history].slice(0, 100) }); }, [commit]);
  const importData = useCallback((raw: unknown) => { const incoming = normalizeProgress(raw); commit(mergeProgress(current.current, incoming)); }, [commit]);
  const clear = useCallback(() => { commit(emptyProgress()); }, [commit]);
  return <ProgressContext.Provider value={{ progress, ready, storageError, answer, bookmark, saveHistory, importData, clear }}>{children}</ProgressContext.Provider>;
}
export function useProgress() { const state = useContext(ProgressContext); if (!state) throw new Error('ProgressProvider missing'); return state; }
