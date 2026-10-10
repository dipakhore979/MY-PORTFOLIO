import { getExperience } from '../../api/endpoints';
import { useFetch } from '../../hooks/useFetch';
import { formatRange } from '../../utils/format';
import ErrorState from '../ui/ErrorState';
import Reveal from '../ui/Reveal';
import Section from '../ui/Section';
import Skeleton from '../ui/Skeleton';

function Timeline({ items }) {
  return (
    <ol className="relative max-w-3xl space-y-6 border-l-2 border-slate-200 pl-8 dark:border-slate-800">
      {items.map((item, i) => (
        <Reveal as="li" key={item._id} delay={i * 0.05} className="relative">
          <span
            aria-hidden="true"
            className="absolute -left-[41px] top-6 h-4 w-4 rounded-full border-4 border-white bg-brand-600 ring-2 ring-brand-600/30 dark:border-slate-950"
          />
          <div className="card p-6 transition hover:border-brand-500/50 hover:shadow-lg">
            <p className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              {formatRange(item.startDate, item.endDate, item.current)}
            </p>
            <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h3>
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
  );
}

function Body({ loading, error, refetch, items, emptyText }) {
  if (loading) {
    return (
      <div className="max-w-3xl space-y-4" aria-hidden="true">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (items.length === 0) return <p className="text-slate-500 dark:text-slate-400">{emptyText}</p>;
  return <Timeline items={items} />;
}

/** Two separate sections (Experience, Education) from a single API request. */
export default function Experience() {
  const { data, loading, error, refetch } = useFetch((signal) =>
    getExperience({ limit: 100 }, signal),
  );
  const items = data?.data ?? [];
  const shared = { loading, error, refetch };

  return (
    <>
      <Section
        id="experience"
        eyebrow="03 — Experience"
        title="Where I've worked"
        subtitle="Roles, internships and hands-on experience."
        className="bg-slate-50 dark:bg-slate-900/40"
      >
        <Body
          {...shared}
          items={items.filter((i) => i.type === 'work')}
          emptyText="Work experience will appear here."
        />
      </Section>

      <Section
        id="education"
        eyebrow="04 — Education"
        title="Where I've studied"
        subtitle="Degrees, courses and certifications."
      >
        <Body
          {...shared}
          items={items.filter((i) => i.type === 'education')}
          emptyText="Education details will appear here."
        />
      </Section>
    </>
  );
}
