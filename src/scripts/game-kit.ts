// Shared helpers for the play/ games: theme colors for canvas drawing, theme-change
// notifications, reduced motion, and storage that never throws.

const root = document.documentElement;
const css = (name: string) => getComputedStyle(root).getPropertyValue(name).trim();

export type Palette = {
  base: string; surface: string; overlay: string; hl: string; fg: string; subtle: string;
  love: string; gold: string; rose: string; pine: string; foam: string; iris: string; unlit: string; ctl: string;
};

/** The current Rose Pine colors, read from the site tokens so day and night both work. */
export function palette(): Palette {
  return {
    base: css('--base'), surface: css('--surface'), overlay: css('--overlay'), hl: css('--hl'),
    fg: css('--fg'), subtle: css('--subtle'), unlit: css('--unlit'), ctl: css('--ctl'),
    love: css('--t-love'), gold: css('--t-gold'), rose: css('--t-rose'), pine: css('--p2'),
    foam: css('--t-foam'), iris: css('--t-iris'),
  };
}

/** Calls back with a fresh palette whenever the visitor switches day or night. */
export function onTheme(cb: (p: Palette) => void): void {
  new MutationObserver(() => cb(palette())).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
}

export const reduceMotion = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches;

export const store = {
  get<T>(key: string, fallback: T): T {
    try { const v = localStorage.getItem(key); return v == null ? fallback : (JSON.parse(v) as T); } catch { return fallback; }
  },
  set(key: string, value: unknown): void {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage blocked */ }
  },
};
