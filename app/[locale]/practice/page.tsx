import type { Metadata } from 'next';
import { ExamLab } from '@/components/exam-lab';
import type { Locale } from '@/lib/content';
import { copy } from '@/lib/copy';
export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> { const { locale } = await params; return { title: locale === 'tr' ? 'Sınav Merkezi | Süreli Yazılım Mühendisliği Mülakatı' : 'Exam Lab | Timed Software Engineering Interviews', description: locale === 'tr' ? 'Süreli veya anında açıklamalı deneme sınavları; kalıcı ilerleme ve konu bazlı sonuç analizi.' : 'Timed practice interviews and study mode with persistent local progress and category-by-category results.' }; }
export default async function PracticePage({ params }: { params: Promise<{ locale: Locale }> }) { const { locale } = await params; return <div className="page-stack"><div className="page-heading"><div className="eyebrow">{locale === 'tr' ? 'MÜLAKAT SİMÜLASYONU' : 'INTERVIEW SIMULATION'}</div><h1>{copy(locale, 'practiceHeader')}</h1><p>{copy(locale, 'practiceIntro')}</p></div><ExamLab locale={locale} /></div>; }
