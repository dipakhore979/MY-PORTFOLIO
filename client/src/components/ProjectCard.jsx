import { ExternalLink, Folder } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GitHubIcon } from './ui/SocialIcons';

const MAX_TAGS = 5;

export default function ProjectCard({ project }) {
  const { slug, title, description, image, tech = [], liveUrl, githubUrl } = project;
  const extra = tech.length - MAX_TAGS;

  return (
    <article className="card group flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/projects/${slug}`} className="block overflow-hidden" aria-label={`View ${title}`}>
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
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          <Link to={`/projects/${slug}`} className="hover:text-brand-600 dark:hover:text-brand-400">
            {title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-600 dark:text-slate-400">
          {description}
        </p>

        {tech.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies used">
            {tech.slice(0, MAX_TAGS).map((t) => (
              <li key={t} className="tag">
                {t}
              </li>
            ))}
            {extra > 0 && <li className="tag">+{extra}</li>}
          </ul>
        )}

        {(liveUrl || githubUrl) && (
          <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4 text-sm font-medium dark:border-slate-800">
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Live<span className="sr-only"> demo of {title}</span>
              </a>
            )}
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
              >
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
