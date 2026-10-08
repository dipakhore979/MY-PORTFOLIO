import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { getProjects } from '../../api/endpoints';
import { useFetch } from '../../hooks/useFetch';
import ProjectCard from '../ProjectCard';
import ErrorState from '../ui/ErrorState';
import Section from '../ui/Section';
import { CardSkeleton } from '../ui/Skeleton';

const ALL = 'All';

export default function Projects() {
  const { data, loading, error, refetch } = useFetch((signal) =>
    getProjects({ limit: 100 }, signal),
  );
  const [filter, setFilter] = useState(ALL);

  const projects = useMemo(() => data?.data ?? [], [data]);

  // Unique tech tags, most-used first
  const techs = useMemo(() => {
    const counts = new Map();
    projects.forEach((p) => p.tech?.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([t]) => t);
  }, [projects]);

  const visible = filter === ALL ? projects : projects.filter((p) => p.tech?.includes(filter));

  return (
    <Section
      id="projects"
      eyebrow="Projects"
      title="Things I've built"
      subtitle="A selection of projects. Filter by technology to find what interests you."
    >
      {techs.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter projects by technology">
          {[ALL, ...techs].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilter(t)}
              aria-pressed={filter === t}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filter === t
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {t}
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

      {!loading && !error && projects.length === 0 && (
        <p className="text-slate-500">No projects yet. Check back soon!</p>
      )}

      {!loading && !error && projects.length > 0 && (
        <motion.ul layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((project) => (
              <motion.li
                key={project._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                <ProjectCard project={project} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </Section>
  );
}
