/** Anonymous persistence boundary. Replace the repository with Firebase later;
 * keep stable question IDs and schema migrations. Never store secrets here. */
export const STORAGE_KEY = 'engineering-mastery.progress.v2';
export const EXAM_KEY = 'engineering-mastery.exam.v1';
export const THEME_KEY = 'engineering-mastery.theme.v1';
export const STORAGE_VERSION = 2;
export type AnswerRecord = { attempts: number; correctAttempts: number; wrongAttempts: number; lastCorrect: boolean; lastSelected: number; streak: number; lastAnsweredAt: string; dueAt: string };
export type ExamHistory = { id: string; date: string; mode: 'exam' | 'study'; category: string; count: number; answered: number; correct: number; durationMinutes: number };
export type Progress = { schemaVersion: 2; updatedAt: string; answers: Record<string, AnswerRecord>; bookmarks: Record<string, boolean>; history: ExamHistory[] };
export type ExamDraft = { version: 1; mode: 'exam' | 'study'; ids: string[]; answers: Record<string, number>; flags: string[]; position: number; deadline: number | null; durationMinutes: number; category: string; createdAt: string };
export const emptyProgress = (): Progress => ({ schemaVersion: 2, updatedAt: '', answers: {}, bookmarks: {}, history: [] });
const answerId = (v: string) => /^(case--[a-z0-9-]+|[a-z0-9-]+--(mechanism|practice|pitfall|tradeoff|signal))$/.test(v) && v.length <= 160;
const iso = (v: unknown) => typeof v === 'string' && !Number.isNaN(Date.parse(v)) ? v : new Date(0).toISOString();
const cap = (n: unknown, max = 100000) => Number.isFinite(n) ? Math.max(0, Math.min(max, Math.floor(n as number))) : 0;
export function normalizeProgress(value: unknown): Progress {
  if (!value || typeof value !== 'object' || (value as { schemaVersion?: unknown }).schemaVersion !== 2) throw Error('Unsupported backup schema');
  const candidate = value as Partial<Progress>;
  const out = emptyProgress();
  if (candidate.answers && typeof candidate.answers === 'object') {
    for (const [key, rec] of Object.entries(candidate.answers).slice(0, 10000)) {
      if (!answerId(key) || !rec || typeof rec !== 'object') continue;
      const a = rec as AnswerRecord;
      out.answers[key] = {        
attempts: cap(a.attempts), correctAttempts: cap(a.correctAttempts), wrongAttempts: cap(a.wrongAttempts),
        lastCorrect: a.lastCorrect === true, lastSelected: Math.min(3, cap(a.lastSelected)), streak: cap(a.streak, 999),
        lastAnsweredAt: iso(a.lastAnsweredAt), dueAt: iso(a.dueAt)      
};
    }
  }
  if (candidate.bookmarks && typeof candidate.bookmarks === 'object') {
    for (const [key, isSaved] of Object.entries(candidate.bookmarks).slice(0, 10000)) if (answerId(key) && isSaved === true) out.bookmarks[key] = true;
  }
  if (Array.isArray(candidate.history)) {
    out.history = candidate.history.slice(0, 100).filter(x => x && typeof x === 'object').map(x => ({      
id: String(x.id || '').slice(0, 90),
      date: iso(x.date), mode: x.mode === 'study' ? 'study' : 'exam', category: String(x.category || 'all').slice(0, 50),
      count: cap(x.count, 100), answered: cap(x.answered, 100), correct: cap(x.correct, 100), durationMinutes: cap(x.durationMinutes, 180)    
}));
  }
  out.updatedAt = iso(candidate.updatedAt);
  return out;
}
export function readProgress(): Progress {
  if (typeof window === 'undefined') return emptyProgress();
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? normalizeProgress(JSON.parse(raw)) : emptyProgress(); } catch { return emptyProgress(); }
}
export function persistProgress(p: Progress): boolean {
  if (typeof window === 'undefined') return false;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...p, updatedAt: new Date().toISOString() })); return true; } catch { return false; }
}
export function answerUpdated(old: AnswerRecord | undefined, selected: number, correct: boolean): AnswerRecord {
  const now = Date.now(); const streak = correct ? (old?.streak || 0) + 1 : 0;
  const days = [1, 3, 7, 14, 30, 60, 90];
  const due = new Date(now + (correct ? days[Math.min(streak - 1, days.length - 1)] * 86400000 : 6 * 3600000));
  return {    
attempts: (old?.attempts || 0) + 1, correctAttempts: (old?.correctAttempts || 0) + (correct ? 1 : 0),
    wrongAttempts: (old?.wrongAttempts || 0) + (correct ? 0 : 1), lastCorrect: correct, lastSelected: selected,
    streak, lastAnsweredAt: new Date(now).toISOString(), dueAt: due.toISOString()  
};
}
export function readExamDraft(): ExamDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(EXAM_KEY); if (!raw) return null;
    const data = JSON.parse(raw) as ExamDraft;
    if (data.version !== 1 || !Array.isArray(data.ids) || data.ids.length < 1 || data.ids.length > 100 || !data.ids.every((id: string) => typeof id === 'string' && answerId(id))) return null;
    if (!data.answers || typeof data.answers !== 'object' || !Array.isArray(data.flags)) return null;
    return data;
  } catch { return null; }
}
export function saveExamDraft(draft: ExamDraft): boolean {
  try { localStorage.setItem(EXAM_KEY, JSON.stringify(draft)); return true; } catch { return false; }
}
export function discardExamDraft() { try { localStorage.removeItem(EXAM_KEY); } catch {/* storage disabled */ } }
export function downloadBackup(progress: Progress) {
  const file = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a'); link.href = url; link.download = `engineering-mastery-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function mergeProgress(existing: Progress, incoming: Progress): Progress {
  const answers = { ...existing.answers };
  for (const [id, row] of Object.entries(incoming.answers)) {
    if (!answers[id] || row.lastAnsweredAt > answers[id].lastAnsweredAt) answers[id] = row;
  }
  const history = [...incoming.history, ...existing.history].sort((a, b) => b.date.localeCompare(a.date));
  const seen = new Set<string>();
  return {    
schemaVersion: 2, updatedAt: new Date().toISOString(), answers,
    bookmarks: { ...existing.bookmarks, ...incoming.bookmarks },
    history: history.filter(h => { if (seen.has(h.id)) return false; seen.add(h.id); return true; }).slice(0, 100)  
};
}
