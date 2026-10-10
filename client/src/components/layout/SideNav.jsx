import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import { navItems, sectionIds } from './navItems';

/** Floating vertical dock with one icon per section (large screens, home page only). */
export default function SideNav() {
  const { pathname } = useLocation();
  const enabled = pathname === '/';
  const active = useScrollSpy(sectionIds, enabled);

  if (!enabled) return null;

  return (
    <nav
      aria-label="Page sections"
      className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 lg:block xl:left-6"
    >
      <ul className="flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-lg backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
        {navItems.map(({ id, label, icon: Icon, to }) => {
          const current = active === id;
          return (
            <li key={id} className="group relative">
              <Link
                to={to}
                aria-label={label}
                aria-current={current ? 'location' : undefined}
                className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                  current
                    ? 'text-brand-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {current && (
                  <motion.span
                    layoutId="side-nav-active"
                    className="absolute inset-0 rounded-xl bg-brand-50 dark:bg-brand-500/20"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="relative h-5 w-5" aria-hidden="true" />
              </Link>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 dark:bg-white dark:text-slate-900"
              >
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
