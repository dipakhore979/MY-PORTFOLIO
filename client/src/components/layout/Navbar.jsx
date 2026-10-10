import { AnimatePresence, motion } from 'framer-motion';
import { Download, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { resumeUrl } from '../../api/endpoints';
import { useSite } from '../../context/ProfileContext';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import ThemeToggle from '../ui/ThemeToggle';
import { navItems, sectionIds, topBarItems } from './navItems';

export default function Navbar() {
  const site = useSite();
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useScrollSpy(sectionIds, isHome);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? 'border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80'
          : 'border-b border-transparent'
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between" aria-label="Main">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 text-sm font-bold text-white shadow-md shadow-brand-600/30">
            {site.initials}
          </span>
          <span className="hidden tracking-tight lg:inline">{site.name}</span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          {/* Section links stay in the top bar; the side dock repeats them as icons */}
          <ul className="flex items-center gap-0.5 rounded-full border border-slate-200 bg-white/70 p-1 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            {topBarItems.map((item) => {
              const current = isHome && active === item.id;
              return (
                <li key={item.id}>
                  <Link
                    to={item.to}
                    aria-current={current ? 'location' : undefined}
                    className={`relative block rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      current
                        ? 'text-brand-700 dark:text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {current && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-full bg-brand-50 dark:bg-brand-500/20"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <ThemeToggle />
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary hidden !py-2 lg:inline-flex"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Resume
          </a>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden md:hidden"
          >
            <div className="container-page flex flex-col gap-1 pb-4">
              {navItems.map(({ id, label, icon: Icon, to }) => (
                <Link
                  key={id}
                  to={to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium ${
                    isHome && active === id
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-white'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {label}
                </Link>
              ))}
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary mt-2"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download resume
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
