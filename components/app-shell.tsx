'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Activity, ArrowUpRight, BookOpen, BrainCircuit, ChevronDown, ChevronRight, CodeXml, Compass, Github, GraduationCap, LayoutDashboard, Menu, Moon, Search, Settings2, ShieldCheck, Sun, X } from 'lucide-react';
import { copy } from '@/lib/copy';
import { path } from '@/lib/routes';
import type { Locale } from '@/lib/content';
import { useTheme } from './theme-provider';

const NAV = [
  { href: '', key: 'navHome', icon: Compass },
  { href: '/topics', key: 'navTopics', icon: BookOpen },
  { href: '/questions', key: 'navQuestions', icon: Search },
  { href: '/practice', key: 'navPractice', icon: BrainCircuit },
  { href: '/dashboard', key: 'navDashboard', icon: LayoutDashboard },
  { href: '/settings', key: 'navSettings', icon: Settings2 },
] as const;
export function AppShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const pathname = usePathname() || '/' + locale; const { theme, setTheme } = useTheme(); const [open, setOpen] = useState(false);
  const other: Locale = locale === 'tr' ? 'en' : 'tr';
  const otherPath = pathname.replace(/^\/(en|tr)(?=\/|$)/, `/${other}`);
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">{locale === 'tr' ? 'İçeriğe atla' : 'Skip to content'}</a>
    <div className={`mobile-scrim ${open ? 'show' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
    <aside className={`sidebar ${open ? 'mobile-open' : ''}`}>
      <div className="sidebar-top"><Link className="brand" href={path(locale)} onClick={() => setOpen(false)} aria-label={locale === 'tr' ? 'Engineering Mastery ana sayfa' : 'Engineering Mastery home'}>
        <span className="brand-icon"><CodeXml size={21} strokeWidth={2.3} /></span><span className="brand-wordmark"><strong>ENGINEERING<span>·</span>MASTERY</strong><small>THE INTERVIEW LAB</small></span>
      </Link><button className="mobile-close icon-button" onClick={() => setOpen(false)} aria-label={locale === 'tr' ? 'Menüyü kapat' : 'Close menu'}><X size={20} /></button></div>
      <div className="nav-group-label">{locale === 'tr' ? 'ÇALIŞMA ALANI' : 'WORKSPACE'}</div>
      <nav aria-label={locale === 'tr' ? 'Ana menü' : 'Main navigation'} className="nav-list">
        {NAV.map(({ href, key, icon: Icon }) => {          
const uri = path(locale, href); const active = href === '' ? pathname === uri : pathname === uri || pathname.startsWith(uri + '/');
          return <Link key={key} className={'nav-item ' + (active ? 'active' : '')} href={uri} onClick={() => setOpen(false)} aria-current={active ? 'page' : undefined}>
            <Icon size={19} strokeWidth={active ? 2.3 : 1.9} /><span>{copy(locale, key)}</span>{active && <span className="nav-active-dot" />}</Link>;        
})}
      </nav>
      <div className="sidebar-bottom"><div className="side-guide"><span className="side-guide-icon"><GraduationCap size={20} /></span><strong>{locale === 'tr' ? 'Senior zihniyeti' : 'Senior mindset'}</strong><p>{locale === 'tr' ? 'Ezberden fazlası: mekanizma, risk, ölçüm ve doğru karar.' : 'Beyond memorization: mechanism, risk, evidence, and sound decisions.'}</p><Link href={path(locale, '/about')} onClick={() => setOpen(false)}>{locale === 'tr' ? 'Platformu keşfet' : 'Learn more'} <ArrowUpRight size={14} /></Link></div>
        <a className="sidebar-github" href="https://github.com/ccankayaa" rel="noopener noreferrer" target="_blank"><Github size={16} /> github.com/ccankayaa <ArrowUpRight size={13} /></a></div>
    </aside>
    <div className="page-column">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu icon-button" onClick={() => setOpen(true)} aria-label={locale === 'tr' ? 'Menüyü aç' : 'Open menu'}><Menu size={22} /></button><div className="topbreadcrumb"><span className="top-breadcrumb-icon"><Activity size={15} /></span><span>{locale === 'tr' ? 'Engineering Excellence / Hazırlık' : 'Engineering Excellence / Preparation'}</span></div></div>
        <div className="topbar-right"><span className="top-status"><i />{locale === 'tr' ? 'Çalışma alanı hazır' : 'Learning space ready'}</span>
          <button className="icon-button theme-toggle" type="button" title={theme === 'dark' ? 'Light theme' : 'Dark theme'} aria-label={locale === 'tr' ? 'Tema değiştir' : 'Toggle theme'} onClick={() => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark')}><Sun size={18} className="icon-sun" /><Moon size={18} className="icon-moon" /></button>
          <Link className="language-toggle" href={otherPath || '/' + other} aria-label={other === 'en' ? 'Switch to English' : 'Türkçeye geç'}><span>{locale.toUpperCase()}</span><ChevronDown size={13} /><strong>{other.toUpperCase()}</strong></Link>
        </div></header>
      <main id="main-content" className="main-content">{children}</main>
      <footer className="site-footer"><p>{copy(locale, 'independent')}</p><a href="https://github.com/ccankayaa" target="_blank" rel="noreferrer">{copy(locale, 'footerDev')} <strong>ccankaya</strong><Github size={15} /></a></footer>
    </div>
  </div>;
}
