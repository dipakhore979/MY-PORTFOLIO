import { Link } from 'react-router-dom';
import { useSite } from '../../context/ProfileContext';
import SocialLinks from '../ui/SocialLinks';

const links = [
  { label: 'About', to: '/#about' },
  { label: 'Projects', to: '/#projects' },
  { label: 'Experience', to: '/#experience' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/#contact' },
];

export default function Footer() {
  const site = useSite();

  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5 font-bold text-slate-900 dark:text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 text-sm text-white">
              {site.initials}
            </span>
            {site.name}
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {site.role}. {site.tagline}
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
            Explore
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {links.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="text-slate-600 transition hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
            Get in touch
          </h2>
          <a
            href={`mailto:${site.email}`}
            className="mt-4 block break-all text-sm text-slate-600 transition hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
          >
            {site.email}
          </a>
          <SocialLinks className="-ml-2 mt-3" />
        </div>
      </div>

      <div className="border-t border-slate-200 py-5 dark:border-slate-800">
        <p className="container-page text-center text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} {site.name}. Built with MongoDB, Express, React and Node.js.
        </p>
      </div>
    </footer>
  );
}
