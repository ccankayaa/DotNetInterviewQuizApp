import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BookOpen, Boxes, BrainCircuit, CheckCheck, Cpu, Database, Globe2, LockKeyhole, Network, ShieldCheck, Sparkles, TerminalSquare, Timer } from 'lucide-react';
import { categories, contentStats, type Locale } from '@/lib/content';
import { copy } from '@/lib/copy';
import { path } from '@/lib/routes';
import { HomeProgress } from '@/components/home-progress';
import { SectionTitle } from '@/components/ui-helpers';
const icons = [Cpu, Boxes, TerminalSquare, Network, LockKeyhole, BrainCircuit, BookOpen, Globe2, Database, Network, Boxes, Timer, ShieldCheck, CheckCheck, Globe2, BookOpen, Sparkles, ShieldCheck];
export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <>
    <section className="hero"><div className="hero-grid-bg" /><div className="hero-content"><div className="eyebrow badge-eyebrow"><span className="blinking-dot" />{copy(locale, 'topTag')} <span className="eyebrow-line" /></div>
      <h1>{copy(locale, 'heroTitle')}<br /><span className="gradient-text">{copy(locale, 'heroHighlight')}</span></h1>
      <p>{copy(locale, 'heroText')}</p>
      <div className="hero-buttons"><Link className="btn btn-primary" href={path(locale, '/practice')}>{copy(locale, 'startPractice')} <ArrowRight size={18} /></Link><Link className="btn btn-quiet" href={path(locale, '/topics')}>{copy(locale, 'exploreTopics')} <ArrowUpRight size={17} /></Link></div>
      <div className="hero-points"><span><CheckCheck size={15} />{locale === 'tr' ? 'İki dil, tek ilerleme' : 'Two languages, one progress'}</span><span><ShieldCheck size={15} />{locale === 'tr' ? 'Hesap gerektirmez' : 'No account needed'}</span><span><Timer size={15} />{locale === 'tr' ? 'Süreli deneme' : 'Timed exam mode'}</span></div>
    </div><div className="hero-visual" aria-hidden="true"><div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
        <div className="visual-code"><div className="visual-code-top"><span className="traffic-dots"><i /><i /><i /></span> <span>engineering.ts</span><span className="code-status">● READY</span></div>
          <pre><span className="syntax-comment">// {locale === 'tr' ? 'Derin mühendislik' : 'Engineering depth'}</span>{'\n'}<span className="syntax-pink">const</span> engineer = {'{'}{'\n'}  <span className="syntax-blue">fundamentals</span>: <span className="syntax-green">true</span>,{'\n'}  <span className="syntax-blue">systemDesign</span>: <span className="syntax-green">true</span>,{'\n'}  <span className="syntax-blue">tradeoffs</span>: <span className="syntax-orange">'measured'</span>{'\n'}{'};'}{'\n\n'}<span className="syntax-pink">await</span> learn({'{'} depth: <span className="syntax-green">'senior'</span> {'}'});</pre>
          <div className="visual-code-bottom"><span>01 / KNOWLEDGE</span><span>02 / JUDGMENT</span><span>03 / IMPACT</span></div>
        </div><div className="visual-floating"><span><Sparkles size={16} /></span><strong>1012</strong><small>{locale === 'tr' ? 'teknik soru' : 'technical questions'}</small></div>
      </div></section>
    <div className="stat-strip"><div><strong>{contentStats.questions.toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US')}</strong><span>{copy(locale, 'statQuestions')}</span></div><div><strong>{contentStats.topics}</strong><span>{copy(locale, 'statTopics')}</span></div><div><strong>{contentStats.categories}</strong><span>{copy(locale, 'statTracks')}</span></div><div><strong>{contentStats.curatedCases}</strong><span>{copy(locale, 'statCases')}</span></div></div>
    <HomeProgress locale={locale} />
    <section className="section"><div className="section-row"><SectionTitle eyebrow={locale === 'tr' ? 'BİLGİ EVRENİ' : 'KNOWLEDGE UNIVERSE'} title={copy(locale, 'trackHeading')} description={copy(locale, 'trackSub')} /><Link className="text-arrow desktop-only" href={path(locale, '/topics')}>{copy(locale, 'allTracks')} <ArrowRight size={17} /></Link></div>
      <div className="track-grid">{categories.map((cat, index) => {        
const Icon = icons[index]; return <Link key={cat.id} className="track-tile" href={path(locale, `/topics?category=${cat.id}`)}>
          <div className="track-tile-head"><span className={'track-pictogram cat-color-' + index % 6}><Icon size={21} /></span><span className="track-number">{String(index + 1).padStart(2, '0')}</span></div>
          <h3>{cat.title[locale]}</h3><p>{cat.description[locale]}</p><div className="track-tile-footer"><span>{cat.questionCount} {copy(locale, 'statQuestions').toLowerCase()}</span><ArrowUpRight size={17} /></div>
        </Link>;      
})}</div></section>
    <section className="bottom-cta"><div className="eyebrow">{locale === 'tr' ? 'SONRAKİ ADIMIN' : 'YOUR NEXT MOVE'}</div><h2>{locale === 'tr' ? 'Teoriyi çalış. Üretimde karar ver.' : 'Study the theory. Make production decisions.'}</h2><p>{locale === 'tr' ? 'Önce konu anlatımını incele, sonra vaka sorularıyla bilgini sınamaya başla.' : 'Read the lessons, then pressure-test your knowledge with applied cases.'}</p><Link className="btn btn-primary" href={path(locale, '/questions')}>{copy(locale, 'exploreQuestions')} <ArrowRight size={18} /></Link></section>
  </>;
}
