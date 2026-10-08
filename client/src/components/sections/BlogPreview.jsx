import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPosts } from '../../api/endpoints';
import { useFetch } from '../../hooks/useFetch';
import PostCard from '../PostCard';
import Section from '../ui/Section';
import { CardSkeleton } from '../ui/Skeleton';

/** Latest posts. The blog is optional, so the section hides itself when there are none. */
export default function BlogPreview() {
  const { data, loading, error } = useFetch((signal) => getPosts({ limit: 3 }, signal));
  const posts = data?.data ?? [];

  if (!loading && (error || posts.length === 0)) return null;

  return (
    <Section id="blog" eyebrow="Blog" title="Latest writing" subtitle="Notes on what I'm building and learning.">
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post._id}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
          <div className="mt-10 text-center">
            <Link to="/blog" className="btn btn-secondary">
              All posts
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </>
      )}
    </Section>
  );
}
