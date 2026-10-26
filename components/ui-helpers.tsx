import type { Locale, Level } from '@/lib/content';
import { copy } from '@/lib/copy';
export function Chip({ children, tone = 'muted' }: { children: React.ReactNode; tone?: 'muted' | 'accent' | 'green' | 'orange' | 'blue' }) {
  return <span className={`chip chip-${tone}`}>{children}</span>;
}
export function Difficulty({ locale, level }: { locale: Locale; level: Level }) {
  return <Chip tone={level === 'advanced' ? 'orange' : level === 'intermediate' ? 'blue' : 'green'}>{copy(locale, level)}</Chip>;
}
export function EmptyState({ message, children }: { message: string; children?: React.ReactNode }) {
  return <div className="empty-state"><div className="empty-symbol">⌁</div><p>{message}</p>{children}</div>;
}
export function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return <div className="section-title"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{description && <p>{description}</p>}</div>;
}
