import { ArrowUpRight, ExternalLink, Folder } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GitHubIcon } from './ui/SocialIcons';

const MAX_TAGS = 5;

export default function ProjectCard({ project }) {
  const { slug, title, description, image, tech = [], liveUrl, githubUrl, featured } = project;
  const extra = tech.length - MAX_TAGS;
  const linkClass =
    'inline-flex items-center gap-1.5 text-slate-700 transition hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400';

  return (
    <article className="group card flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1.5 hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-600/10">
      <Link
        to={`/projects/${slug}`}
        className="relative block overflow-hidden"
        aria-label={`View ${title}`}
      >
        {image?.url ? (
          <img
            src={image.url}
            alt={`Screenshot of ${title}`}
            loading="lazy"
            decoding="async"
            className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-brand-500 to-purple-600">
            <Folder className="h-10 w-10 text-white/80" aria-hidden="true" />
          </div>
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-3 right-3 inline-flex translate-y-2 items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-900 opacity-0 shadow transition group-hover:translate-y-0 group-hover:opacity-100"
        >
          View project
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
        {featured && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white shadow">
            Featured
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
          <Link to={`/projects/${slug}`} className="hover:text-brand-600 dark:hover:text-brand-400">
            {title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {description}
        </p>

        {tech.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Technologies used">
            {tech.slice(0, MAX_TAGS).map((t) => (
              <li key={t} className="tag">
                {t}
              </li>
            ))}
            {extra > 0 && <li className="tag">+{extra}</li>}
          </ul>
        )}

        {(liveUrl || githubUrl) && (
          <div className="mt-5 flex items-center gap-5 border-t border-slate-100 pt-4 text-sm font-medium dark:border-slate-800">
            {liveUrl && (
              <a href={liveUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Live<span className="sr-only"> demo of {title}</span>
              </a>
            )}
            {githubUrl && (
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                <GitHubIcon className="h-4 w-4" />
                Code<span className="sr-only"> for {title}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
