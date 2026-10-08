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
      <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
        <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
        {title}
      </h3>
      <ol className="relative space-y-8 border-l-2 border-slate-200 pl-6 dark:border-slate-800">
        {items.map((item, i) => (
          <Reveal as="li" key={item._id} delay={i * 0.05} className="relative">
            <span
              aria-hidden="true"
              className="absolute -left-[33px] top-1.5 h-4 w-4 rounded-full border-4 border-white bg-brand-600 dark:border-slate-950"
            />
            <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
              {formatRange(item.startDate, item.endDate, item.current)}
            </p>
            <h4 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {item.organization}
              {item.location && ` · ${item.location}`}
            </p>
            {item.description && <p className="mt-2 text-slate-600 dark:text-slate-400">{item.description}</p>}
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
