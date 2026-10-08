import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getProject } from '../api/endpoints';
import ErrorState from '../components/ui/ErrorState';
import Markdown from '../components/ui/Markdown';
import Seo from '../components/ui/Seo';
import Skeleton from '../components/ui/Skeleton';
import { GitHubIcon } from '../components/ui/SocialIcons';
import { useFetch } from '../hooks/useFetch';
import NotFound from './NotFound';

export default function ProjectDetail() {
  const { slug } = useParams();
  const { data, loading, error, status, refetch } = useFetch((signal) => getProject(slug, signal), [slug]);
  const project = data?.data;

  if (status === 404) return <NotFound message="That project doesn't exist or isn't published." />;

  return (
    <article className="container-page max-w-4xl py-12 sm:py-16">
      <Link
        to="/#projects"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All projects
      </Link>

      {loading && (
        <div className="space-y-4" aria-hidden="true">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="aspect-video w-full" />
        </div>
      )}

      {error && <ErrorState message={error} onRetry={refetch} />}

      {project && (
        <>
          <Seo
            title={project.title}
            description={project.description}
            path={`/projects/${project.slug}`}
            image={project.image?.url}
          />

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
            {project.title}
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">{project.description}</p>

          {project.tech?.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Technologies used">
              {project.tech.map((t) => (
                <li key={t} className="tag">
                  {t}
                </li>
              ))}
            </ul>
          )}

          {(project.liveUrl || project.githubUrl) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  Live demo
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                  <GitHubIcon className="h-4 w-4" />
                  Source code
                </a>
              )}
            </div>
          )}

          {project.image?.url && (
            <img
              src={project.image.url}
              alt={`Screenshot of ${project.title}`}
              className="mt-10 w-full rounded-2xl border border-slate-200 shadow-lg dark:border-slate-800"
            />
          )}

          {project.content && (
            <div className="mt-10">
              <Markdown>{project.content}</Markdown>
            </div>
          )}
        </>
      )}
    </article>
  );
}
