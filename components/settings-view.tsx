'use client';
import { useRef, useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, CloudOff, Download, FileJson, Globe, HardDrive, Monitor, Moon, ShieldCheck, Sun, Trash2, UploadCloud } from 'lucide-react';
import type { Locale } from '@/lib/content';
import { copy } from '@/lib/copy';
import { path } from '@/lib/routes';
import { downloadBackup, normalizeProgress, discardExamDraft } from '@/lib/progress';
import { useProgress } from './progress-provider';
import { useTheme, type Theme } from './theme-provider';

export function SettingsView({ locale }: { locale: Locale }) {
  const { theme, setTheme } = useTheme(); const { progress, importData, clear, storageError, ready } = useProgress();
  const fileRef = useRef<HTMLInputElement | null>(null); const [feedback, setFeedback] = useState('');
  const themes: { id: Theme; icon: typeof Moon; label: string }[] = [{ id: 'dark', icon: Moon, label: copy(locale, 'dark') }, { id: 'light', icon: Sun, label: copy(locale, 'light') }, { id: 'system', icon: Monitor, label: copy(locale, 'system') }];
  async function onImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      if (file.size > 2_000_000) throw new Error('File too large');
      const raw = JSON.parse(await file.text()); normalizeProgress(raw); importData(raw); setFeedback(copy(locale, 'importSuccess'));
    } catch { setFeedback(copy(locale, 'importError')); } finally { if (fileRef.current) fileRef.current.value = ''; }
  }
  return <div className="page-stack"><div className="page-heading"><div className="eyebrow">{locale === 'tr' ? 'TERCİHLER VE VERİ KONTROLÜ' : 'PREFERENCES & DATA OWNERSHIP'}</div><h1>{copy(locale, 'settingsHeading')}</h1><p>{copy(locale, 'settingsIntro')}</p></div>
    <div className="settings-grid"><section className="settings-card panel"><div className="eyebrow"><Sun size={16} /> {locale === 'tr' ? 'ARAYÜZ' : 'INTERFACE'}</div><h2>{copy(locale, 'appearance')}</h2><p>{locale === 'tr' ? 'Göz konforuna uygun temayı ve soruların görüntüleme dilini seç. İlerleme her iki dilde de ortaktır.' : 'Choose your preferred appearance and question language. Progress stays the same across both languages.'}</p>
      <div className="theme-options" role="group" aria-label={copy(locale, 'appearance')}>{themes.map(item => { const Icon = item.icon; return <button key={item.id} type="button" className={'theme-option ' + (theme === item.id ? 'selected' : '')} onClick={() => setTheme(item.id)} aria-pressed={theme === item.id}><Icon size={16} />{item.label}</button> })}</div>
      <div className="setting-divider" /><div className="eyebrow"><Globe size={15} />{copy(locale, 'lang')}</div><div className="settings-actions"><Link href="/tr/settings" className={'theme-option ' + (locale === 'tr' ? 'selected' : '')}>Türkçe</Link><Link href="/en/settings" className={'theme-option ' + (locale === 'en' ? 'selected' : '')}>English</Link></div></section>
      <section className="settings-card panel"><div className="eyebrow"><HardDrive size={16} /> {locale === 'tr' ? 'YEREL KAYITLAR' : 'OFFLINE-FIRST RECORDS'}</div><h2>{copy(locale, 'privacy')}</h2><p>{locale === 'tr' ? 'Doğru/yanlış cevaplar, tekrar takvimi, favoriler ve sınav geçmişi bu sitenin tarayıcı depolamasına yazılır.' : 'Answers, revision due dates, bookmarks and completed exams are stored in this browser under this website origin.'}</p>
        <div className="setting-warning"><AlertCircle size={18} />{copy(locale, 'storageWarning')}</div>
        <div className="settings-actions"><button type="button" disabled={!ready} className="btn btn-primary" onClick={() => { try { downloadBackup(progress); setFeedback(''); } catch { setFeedback(copy(locale, 'exportFailed')); } }}><Download size={17} />{copy(locale, 'backup')}</button>
          <label htmlFor="import-backup" className="btn btn-outline file-label"><UploadCloud size={17} />{copy(locale, 'restore')}</label><input id="import-backup" aria-label={copy(locale, 'restore')} className="file-input" ref={fileRef} type="file" accept=".json,application/json" onChange={onImport} /></div>
        <p style={{ fontSize: 11, marginTop: 11 }}>{copy(locale, 'importSaved')}</p>{feedback && <p className="setting-feedback" role="status">{feedback}</p>}
        <div className="setting-divider" /><button type="button" className="btn btn-outline danger" onClick={() => { if (window.confirm(copy(locale, 'resetConfirm'))) { clear(); discardExamDraft(); setFeedback(locale === 'tr' ? 'İlerleme sıfırlandı.' : 'Progress reset.'); } }}><Trash2 size={17} />{copy(locale, 'reset')}</button>
        {storageError && <p className="setting-warning" role="alert"><AlertCircle size={17} />{locale === 'tr' ? 'Tarayıcıya kayıt başarısız oldu; gizli mod veya depolama kotasını kontrol et.' : 'Browser storage failed; check private browsing or available storage.'}</p>}</section>
    </div><div className="account-teaser"><CloudOff size={18} style={{ verticalAlign: 'middle', marginRight: 7 }} />{copy(locale, 'accountLater')} <Link href={path(locale, '/about')} className="text-arrow" style={{ marginLeft: 10 }}>{copy(locale, 'details')}<ArrowRight size={15} /></Link></div>
  </div>;
}
