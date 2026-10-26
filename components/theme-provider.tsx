'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { THEME_KEY } from '@/lib/progress';
export type Theme = 'dark' | 'light' | 'system';
const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({ theme: 'system', setTheme: () => { } });
function updateDocument(theme: Theme) {
  const os = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme === 'system' ? os : theme;
}
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setValue] = useState<Theme>('system');
  useEffect(() => {
    let stored: Theme = 'system'; try { const raw = localStorage.getItem(THEME_KEY); if (raw === 'dark' || raw === 'light' || raw === 'system') stored = raw; } catch { }
    setValue(stored); updateDocument(stored);
    const media = window.matchMedia('(prefers-color-scheme: dark)'); const cb = () => { let current: Theme = 'system'; try { const found = localStorage.getItem(THEME_KEY); if (found === 'dark' || found === 'light' || found === 'system') current = found; } catch {/* storage unavailable */ } updateDocument(current); };
    media.addEventListener('change', cb); return () => media.removeEventListener('change', cb);
  }, []);
  const setTheme = (next: Theme) => { setValue(next); try { localStorage.setItem(THEME_KEY, next); } catch { } updateDocument(next); };
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
