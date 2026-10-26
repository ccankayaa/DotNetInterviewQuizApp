import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, BrainCircuit, Database, Globe2, GraduationCap, Layers3, ShieldCheck } from 'lucide-react';
import { copy } from '@/lib/copy';
import { path } from '@/lib/routes';
import { contentStats, type Locale } from '@/lib/content';
export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === 'tr' ? 'Platform Hakkında' : 'About the Academy', description: locale === 'tr' ? 'Bilgisayar mühendisliği temelleri ve kıdemli yazılım mühendisliği mülakatları için bağımsız Türkçe-İngilizce eğitim platformu.' : 'An independent bilingual learning platform for computer-science fundamentals and senior-engineering interviews.' };
}
const sources = [
  ['Microsoft .NET', 'https://learn.microsoft.com/en-us/dotnet/'],
  ['ASP.NET Core', 'https://learn.microsoft.com/en-us/aspnet/core/'],
  ['OWASP', 'https://cheatsheetseries.owasp.org/'],
  ['MIT Algorithms', 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/'],
  ['Operating Systems: Three Easy Pieces', 'https://pages.cs.wisc.edu/~remzi/OSTEP/'],
  ['Google SRE', 'https://sre.google/books/'],
  ['MDN Web Docs', 'https://developer.mozilla.org/en-US/'],
  ['Kubernetes Docs', 'https://kubernetes.io/docs/'],
  ['OWASP GenAI LLM Top 10 (2026)', 'https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/'],
  ['Dotnet Tips Türkçe', 'https://muratdincc.github.io/dotnet-tips-turkish/'],
];
export default async function AboutPage({ params }: {
  params: Promise<{
    locale: Locale;
  }>;
}) {
  const { locale } = await params;
  const features = [
    { icon: GraduationCap, title: locale === 'tr' ? 'Derinlemesine konular' : 'Deep engineering topics', desc: locale === 'tr' ? 'Her konu çalışma ilkesi, doğru uygulama, sık hata, ödünleşim ve teşhis sinyali olarak bölümlendi.' : 'Topics are organized into mechanism, production use, pitfalls, trade-offs, and diagnostic signals.' },
    { icon: BrainCircuit, title: locale === 'tr' ? 'Aktif öğrenme' : 'Active recall', desc: locale === 'tr' ? 'Kısa sorular, uygulamalı vaka analizi, süreli mülakat ve yanlışlara dönüş.' : 'Concept drills, applied scenarios, timed interviews and review of mistakes.' },
    { icon: Database, title: locale === 'tr' ? 'Kalıcı, yerel ilerleme' : 'Local, persistent progress', desc: locale === 'tr' ? 'Login yok: cevaplar bu tarayıcıda saklanır ve taşınabilir JSON dosyası olarak dışa aktarılır.' : 'No login: store progress in this browser and export portable JSON backups.' },
    { icon: Globe2, title: locale === 'tr' ? 'İki dil' : 'Two languages', desc: locale === 'tr' ? 'Türkçe ve İngilizce içerik aynı ID’lere bağlıdır; dil değişimi ilerlemeyi sıfırlamaz.' : 'Turkish and English share stable question IDs; changing language does not reset progress.' },
    { icon: ShieldCheck, title: locale === 'tr' ? 'Gerçekçi, şeffaf kapsam' : 'Transparent editorial scope', desc: locale === 'tr' ? '990 yapılandırılmış kavram/karar sorusu + 22 özgün vaka. Hepsi bağımsız teknik gözden geçirme yerine geçmez.' : '990 structured concept/decision drills + 22 authored scenarios. This is not a substitute for independent technical review.' },
    { icon: Layers3, title: locale === 'tr' ? 'Platformdan bağımsız temel' : 'Beyond the language stack', desc: locale === 'tr' ? 'C# ve CLR ayrıntılarından OS, kriptografi, ağ, algoritma, sistem tasarımı ve AI mühendisliğine.' : 'From C# and CLR to OS, cryptography, networking, algorithms, system design, and AI engineering.' },
  ];
  return <div className="page-stack"><section className="about-intro"><div className="eyebrow">{locale === 'tr' ? 'AMAÇ VE YÖNTEM' : 'MISSION & METHODOLOGY'}</div><h1>{copy(locale, 'aboutHeading')}</h1><p>{locale === 'tr' ? `Engineering Mastery; bilgisayar mühendisliği temellerini üretimde karar verme becerisiyle birleştirmek için geliştirilen bağımsız bir çalışma alanıdır. ${contentStats.categories} alan, ${contentStats.topics} konu ve ${contentStats.questions.toLocaleString('tr-TR')} soruya doğrudan, ücretsiz erişim sağlar.` : `Engineering Mastery is an independent learning environment combining computer science fundamentals with production engineering judgment. Explore ${contentStats.categories} disciplines, ${contentStats.topics} topics, and ${contentStats.questions.toLocaleString('en-US')} questions without signing in.`}</p><Link className="btn btn-primary" href={path(locale, '/practice')}>{copy(locale, 'startPractice')} <ArrowRight size={17} /></Link></section>
    <div className="about-grid">{features.map(x => { const Icon = x.icon; return <article className="about-feature" key={x.title}><Icon size={24} /><h3>{x.title}</h3><p>{x.desc}</p></article>; })}</div>
    <section className="about-editorial"><h2>{locale === 'tr' ? 'İçerik ve doğrulama ilkeleri' : 'Editorial standards and limitations'}</h2>
      <p>{copy(locale, 'editorial')} {locale === 'tr' ? 'Soruların açıklamalarındaki beş teknik boyut gerçek soruya doğrudan bağlanır. Seçenekler aynı alanın diğer başlıklarından seçilmiştir; bazı kavram soruları ileri mülakat seviyesinde zorlayıcı olmayabilir.' : 'Explanations map five technical dimensions to each question. Distractors are derived from other topics in the same discipline; some concept questions will not be challenging enough for advanced interviews.'}</p>
      <p>{locale === 'tr' ? 'Kaynak bağlantıları ek okuma amacı taşır. Her sorunun tek tek orijinal belge tarafından doğrulandığı anlamına gelmez. Banka veya işveren kurumları adına mülakat içeriği sunulmaz.' : 'References are for further study; they do not mean every question was individually verified against the linked document. This is not an official employer or banking assessment.'}</p>
      <h3>{locale === 'tr' ? 'Başlangıç kaynakları' : 'Primary learning references'}</h3><ul>{sources.map(([label, url]) => <li key={url}><a href={url} target="_blank" rel="noopener noreferrer">{label}</a></li>)}</ul>
      <h3>{locale === 'tr' ? 'Veri gizliliği ve gelecekteki hesaplar' : 'Privacy & planned accounts'}</h3><p>{locale === 'tr' ? 'İlerleme bilgisi yalnızca aynı origin içindeki localStorage’a kaydedilir. Site sunucusuna kişisel bir profil veya sınav sonucu gönderilmez. Cihaz değiştirmek için Ayarlar bölümünden JSON yedeği indirebilir ve başka cihazda içe aktarabilirsin. Firebase oturum yönetimi bu sürümde bulunmuyor.' : 'Progress is saved to origin-scoped localStorage. No individual profile or results are sent to the site server. Use JSON backup/import to transfer between devices. Firebase authentication is not present in this version.'}</p>
      <p>{locale === 'tr' ? 'Bu proje bağımsız olarak geliştirilmiştir.' : 'Independently developed by'} <a href="https://github.com/ccankayaa" target="_blank" rel="noopener noreferrer">ccankaya</a>.</p></section></div>;
}
