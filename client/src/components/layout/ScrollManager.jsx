import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scrolls to the #hash target on navigation, or to the top for a new page. */
export default function ScrollManager() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      // Wait a frame so the target section exists after a route change.
      const frame = requestAnimationFrame(() => {
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      });
      return () => cancelAnimationFrame(frame);
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    // Move keyboard / screen-reader focus to the new page content
    document.getElementById('main')?.focus({ preventScroll: true });
    return undefined;
  }, [pathname, hash, key]);

  return null;
}
