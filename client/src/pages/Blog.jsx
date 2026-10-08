import { useMemo, useState } from 'react';
import { getPosts } from '../api/endpoints';
import PostCard from '../components/PostCard';
import ErrorState from '../components/ui/ErrorState';
import Seo from '../components/ui/Seo';
import { CardSkeleton } from '../components/ui/Skeleton';
import { useFetch } from '../hooks/useFetch';

export default function Blog() {
  const { data, loading, error, refetch } = useFetch((signal) => getPosts({ limit: 100 }, signal));
  const [tag, setTag] = useState('');

  const posts = useMemo(() => data?.data ?? [], [data]);
  const tags = useMemo(() => [...new Set(posts.flatMap((p) => p.tags || []))].sort(), [posts]);
  const visible = tag ? posts.filter((p) => p.tags?.includes(tag)) : posts;

  return (
    <div className="container-page py-12 sm:py-16">
      <Seo title="Blog" description="Articles on web development, the MERN stack and what I'm learning." path="/blog" />

      <header className="mb-10 max-w-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Blog</h1>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
          Notes on web development, the MERN stack and what I&apos;m learning.
        </p>
      </header>

      {tags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter posts by tag">
          {['', ...tags].map((t) => (
            <button
              key={t || 'all'}
              type="button"
              onClick={() => setTag(t)}
              aria-pressed={tag === t}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                tag === t
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {t ? `#${t}` : 'All'}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && visible.length === 0 && (
        <p className="text-slate-500">No posts yet. Check back soon!</p>
      )}

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((post) => (
          <li key={post._id}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>
    </div>
  );
}
