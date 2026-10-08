import { useFetch } from '../../hooks/useFetch';
import { getSkills } from '../../api/endpoints';
import { useSite } from '../../context/ProfileContext';
import Avatar from '../ui/Avatar';
import ErrorState from '../ui/ErrorState';
import Reveal from '../ui/Reveal';
import Section from '../ui/Section';
import Skeleton from '../ui/Skeleton';

const CATEGORY_ORDER = ['Frontend', 'Backend', 'Database', 'Languages', 'Tools', 'Other'];

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
      <div className="grid items-start gap-12 lg:grid-cols-[320px_1fr]">
        <Reveal className="mx-auto w-full max-w-xs">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-brand-500 to-purple-600 opacity-30 blur-lg"
            />
            <Avatar className="relative aspect-square w-full rounded-3xl shadow-xl" />
          </div>
        </Reveal>

        <div>
          <Reveal className="space-y-4 text-lg leading-relaxed">
            {site.bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </Reveal>

          <h3 className="mb-5 mt-10 text-xl font-semibold text-slate-900 dark:text-white">Skills</h3>

          {loading && (
            <div className="space-y-5" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          )}
          {error && <ErrorState message={error} onRetry={refetch} />}
          {!loading && !error && groups.length === 0 && (
            <p className="text-slate-500">Skills will appear here soon.</p>
          )}

          <div className="space-y-6">
            {groups.map(([category, skills], i) => (
              <Reveal key={category} delay={i * 0.05}>
                <h4 className="mb-2.5 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {category}
                </h4>
                <ul className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <li
                      key={skill._id}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                      {skill.name}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
