'use client';

import { useEffect, useState } from 'react';

/* =============================================================================
   ThemeToggle — bascule clair / sombre.
   Lit et écrit data-theme sur <html>. Persiste dans localStorage ("tc-theme").
   Valeurs : "light" | "dark". null = suit le système (media query CSS).
   ============================================================================= */

type Theme = 'light' | 'dark';

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem('tc-theme');
    if (v === 'light' || v === 'dark') return v;
  } catch {}
  return null;
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('tc-theme', theme); } catch {}
}

export function ThemeToggle() {
  // On commence avec null (non monté) pour éviter tout flash de contenu
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const stored = getStoredTheme();
    const current: Theme = stored ?? getSystemTheme();
    setTheme(current);
    // Synchronise l'attribut HTML au cas où le script anti-flash n'aurait pas tourné
    document.documentElement.setAttribute('data-theme', current);
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
  }

  // Avant hydration : placeholder invisible de même taille pour éviter le layout shift
  if (theme === null) {
    return <span className="inline-block h-5 w-36" aria-hidden />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 text-sm font-medium transition hover:underline"
      style={{ color: 'var(--text-muted)' }}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
      {isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
    </button>
  );
}

/* ── Icons ─────────────────────────────────────────────────────────────────── */

function SunIcon() {
  return (
    <svg
      width="15" height="15" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="15" height="15" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
