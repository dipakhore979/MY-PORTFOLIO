import { useEffect, useState } from 'react';

/** Returns the id of the section currently in view (observes the middle of the screen). */
export function useScrollSpy(ids, enabled = true) {
  const [active, setActive] = useState('');
  const key = ids.join('|');

  useEffect(() => {
    if (!enabled) {
      setActive('');
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-40% 0px -55% 0px' },
    );
    key.split('|').forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [enabled, key]);

  return active;
}
