import { AnimatePresence, motion } from 'framer-motion';
import { Download, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { resumeUrl } from '../../api/endpoints';
import { useSite } from '../../context/ProfileContext';
import ThemeToggle from '../ui/ThemeToggle';

const links = [
  { label: 'About', to: '/#about', id: 'about' },
  { label: 'Projects', to: '/#projects', id: 'projects' },
  { label: 'Experience', to: '/#experience', id: 'experience' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/#contact', id: 'contact' },
];
const sectionIds = links.filter((l) => l.id).map((l) => l.id);

/** Highlights the nav link of the section currently in view (home page only). */
function useScrollSpy(enabled) {
  const [active, setActive] = useState('');

  useEffect(() => {
    if (!enabled) {
      setActive('');
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-40% 0px -55% 0px' },
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [enabled]);

  return active;
}

export default function Navbar() {
  const site = useSite();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useScrollSpy(pathname === '/');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (link) => (link.id ? active === link.id : pathname.startsWith(link.to));

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
          <span className="hidden tracking-tight sm:inline">{site.name}</span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <ul className="flex items-center gap-0.5 rounded-full border border-slate-200 bg-white/70 p-1 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            {links.map((link) => {
              const current = isActive(link);
              return (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    aria-current={current ? 'page' : undefined}
                    className={`relative block rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
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
                    <span className="relative">{link.label}</span>
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
            className="btn btn-primary !py-2"
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
              {links.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`rounded-lg px-3 py-2.5 text-base font-medium ${
                    isActive(link)
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-white'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.label}
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
