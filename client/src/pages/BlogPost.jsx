import { ArrowLeft, Clock } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getPost } from '../api/endpoints';
import ErrorState from '../components/ui/ErrorState';
import Markdown from '../components/ui/Markdown';
import Seo from '../components/ui/Seo';
import Skeleton from '../components/ui/Skeleton';
import { useSite } from '../context/ProfileContext';
import { useFetch } from '../hooks/useFetch';
import { formatLongDate } from '../utils/format';
import NotFound from './NotFound';

export default function BlogPost() {
  const site = useSite();
  const { slug } = useParams();
  const { data, loading, error, status, refetch } = useFetch((signal) => getPost(slug, signal), [slug]);
  const post = data?.data;

  if (status === 404) return <NotFound message="That post doesn't exist or isn't published." />;

  const published = post?.publishedAt || post?.createdAt;

  return (
    <article className="container-page max-w-3xl py-12 sm:py-16">
      <Link
        to="/blog"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All posts
      </Link>

      {loading && (
        <div className="space-y-4" aria-hidden="true">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {error && <ErrorState message={error} onRetry={refetch} />}

      {post && (
        <>
          <Seo
            title={post.title}
            description={post.excerpt || site.description}
            path={`/blog/${post.slug}`}
            image={post.coverImage?.url}
            type="article"
            jsonLd={{
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: post.title,
              datePublished: published,
              dateModified: post.updatedAt,
              author: { '@type': 'Person', name: site.name },
              image: post.coverImage?.url,
              keywords: post.tags?.join(', '),
            }}
          />

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
            {post.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <time dateTime={published}>{formatLongDate(published)}</time>
            {post.readingTime && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" aria-hidden="true" />
                {post.readingTime} min read
              </span>
            )}
          </div>

          {post.tags?.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <li key={t} className="tag">
                  #{t}
                </li>
              ))}
            </ul>
          )}

          {post.coverImage?.url && (
            <img
              src={post.coverImage.url}
              alt=""
              className="mt-8 w-full rounded-2xl border border-slate-200 shadow-lg dark:border-slate-800"
            />
          )}

          <div className="mt-10">
            <Markdown>{post.content}</Markdown>
          </div>
        </>
      )}
    </article>
  );
}
