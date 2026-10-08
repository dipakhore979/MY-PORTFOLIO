import { Database, Monitor, Server, Sparkles, Terminal, Wrench } from 'lucide-react';
import { getSkills } from '../../api/endpoints';
import { useSite } from '../../context/ProfileContext';
import { useFetch } from '../../hooks/useFetch';
import Avatar from '../ui/Avatar';
import ErrorState from '../ui/ErrorState';
import Reveal from '../ui/Reveal';
import Section from '../ui/Section';
import Skeleton from '../ui/Skeleton';

const CATEGORY_ORDER = ['Frontend', 'Backend', 'Database', 'Languages', 'Tools', 'Other'];
const CATEGORY_ICONS = {
  Frontend: Monitor,
  Backend: Server,
  Database,
  Languages: Terminal,
  Tools: Wrench,
  Other: Sparkles,
};

const groupSkills = (skills) => {
  const groups = skills.reduce((acc, skill) => {
    (acc[skill.category] ||= []).push(skill);
    return acc;
  }, {});
  return CATEGORY_ORDER.filter((c) => groups[c]?.length).map((c) => [c, groups[c]]);
};

export default function About() {
  const site = useSite();
  const { data, loading, error, refetch } = useFetch((signal) => getSkills({ limit: 100 }, signal));
  const groups = data ? groupSkills(data.data) : [];

  return (
    <Section id="about" eyebrow="About" title="A bit about me" className="bg-slate-50 dark:bg-slate-900/40">
      <div className="grid items-center gap-12 lg:grid-cols-[300px_1fr] lg:gap-16">
        <Reveal className="mx-auto w-full max-w-[18rem]">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-brand-500 to-purple-600 opacity-30 blur-xl"
            />
            <Avatar className="relative aspect-square w-full rounded-3xl shadow-xl ring-1 ring-slate-900/10 dark:ring-white/10" />
          </div>
        </Reveal>

        <Reveal className="space-y-5 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
          {site.bio.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </Reveal>
      </div>

      <h3 className="mb-6 mt-16 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        Skills &amp; tools
      </h3>

      {loading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      )}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && groups.length === 0 && (
        <p className="text-slate-500">Skills will appear here soon.</p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map(([category, skills], i) => {
          const Icon = CATEGORY_ICONS[category] || Sparkles;
          return (
            <Reveal key={category} delay={i * 0.06} className="h-full">
              <div className="card h-full p-6 transition hover:border-brand-500/50 hover:shadow-lg">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{category}</h4>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <li
                      key={skill._id}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {skill.name}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
