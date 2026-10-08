import { Briefcase, GraduationCap } from 'lucide-react';
import { getExperience } from '../../api/endpoints';
import { useFetch } from '../../hooks/useFetch';
import { formatRange } from '../../utils/format';
import ErrorState from '../ui/ErrorState';
import Reveal from '../ui/Reveal';
import Section from '../ui/Section';
import Skeleton from '../ui/Skeleton';

function Timeline({ title, icon: Icon, items }) {
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="mb-7 flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        {title}
      </h3>
      <ol className="relative space-y-6 border-l-2 border-slate-200 pl-8 dark:border-slate-800">
        {items.map((item, i) => (
          <Reveal as="li" key={item._id} delay={i * 0.05} className="relative">
            <span
              aria-hidden="true"
              className="absolute -left-[41px] top-6 h-4 w-4 rounded-full border-4 border-slate-50 bg-brand-600 ring-2 ring-brand-600/30 dark:border-slate-950"
            />
            <div className="card p-6 transition hover:border-brand-500/50 hover:shadow-lg">
              <p className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                {formatRange(item.startDate, item.endDate, item.current)}
              </p>
              <h4 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h4>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {item.organization}
                {item.location && ` · ${item.location}`}
              </p>
              {item.description && (
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
              )}
            </div>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}

export default function Experience() {
  const { data, loading, error, refetch } = useFetch((signal) =>
    getExperience({ limit: 100 }, signal),
  );
  const items = data?.data ?? [];
  const work = items.filter((i) => i.type === 'work');
  const education = items.filter((i) => i.type === 'education');

  return (
    <Section
      id="experience"
      eyebrow="Journey"
      title="Experience & education"
      className="bg-slate-50 dark:bg-slate-900/40"
    >
      {loading && (
        <div className="grid gap-12 md:grid-cols-2" aria-hidden="true">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      )}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && items.length === 0 && (
        <p className="text-slate-500">Experience details coming soon.</p>
      )}
      {!loading && !error && items.length > 0 && (
        <div className="grid gap-12 md:grid-cols-2">
          <Timeline title="Work" icon={Briefcase} items={work} />
          <Timeline title="Education" icon={GraduationCap} items={education} />
        </div>
      )}
    </Section>
  );
}
