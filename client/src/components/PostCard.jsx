import { Clock, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatLongDate } from '../utils/format';

export default function PostCard({ post }) {
  const { slug, title, excerpt, coverImage, tags = [], publishedAt, createdAt, readingTime } = post;

  return (
    <article className="card group flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/blog/${slug}`} className="block overflow-hidden" aria-label={`Read ${title}`}>
        {coverImage?.url ? (
          <img
            src={coverImage.url}
            alt=""
            loading="lazy"
            decoding="async"
            className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
            <FileText className="h-10 w-10 text-white/70" aria-hidden="true" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <time dateTime={publishedAt || createdAt}>{formatLongDate(publishedAt || createdAt)}</time>
          {readingTime && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {readingTime} min read
            </span>
          )}
        </div>
        <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
          <Link to={`/blog/${slug}`} className="hover:text-brand-600 dark:hover:text-brand-400">
            {title}
          </Link>
        </h3>
        {excerpt && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-600 dark:text-slate-400">{excerpt}</p>
        )}
        {tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li key={tag} className="tag">
                #{tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
