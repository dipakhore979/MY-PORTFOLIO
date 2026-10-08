import { Mail } from 'lucide-react';
import { useSite } from '../../context/ProfileContext';
import { GitHubIcon, LinkedInIcon } from './SocialIcons';

const linkClass =
  'inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-brand-400';

export default function SocialLinks({ className = '' }) {
  const site = useSite();
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <a href={site.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className={linkClass}>
        <GitHubIcon />
      </a>
      <a href={site.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={linkClass}>
        <LinkedInIcon />
      </a>
      <a href={`mailto:${site.email}`} aria-label="Email" className={linkClass}>
        <Mail className="h-5 w-5" aria-hidden="true" />
      </a>
    </div>
  );
}
