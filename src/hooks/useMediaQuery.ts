import { useState, useEffect } from 'react';

/**
 * Hook that tracks a CSS media query and returns whether it matches.
 * Uses matchMedia API for efficient, event-driven breakpoint detection.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Sync in case it changed between render and effect
    setMatches(mql.matches);

    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/** Below Tailwind md (768px) — phone */
export function useIsMobile(): boolean {
  return !useMediaQuery('(min-width: 768px)');
}

/** Below Tailwind lg (1024px) — phone or tablet */
export function useIsTablet(): boolean {
  return !useMediaQuery('(min-width: 1024px)');
}