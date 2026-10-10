import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { getGithub } from '../../api/endpoints';
import { useSite } from '../../context/ProfileContext';
import { useFetch } from '../../hooks/useFetch';
import ErrorState from '../ui/ErrorState';
import Reveal from '../ui/Reveal';
import Section from '../ui/Section';
import Skeleton from '../ui/Skeleton';

function Stat({ value, label, delay }) {
  return (
    <Reveal delay={delay}>
      <div className="card flex h-full flex-col items-center justify-center p-8 text-center">
        <p className="heading-gradient font-display text-5xl font-extrabold">{value}</p>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{label}</p>
      </div>
    </Reveal>
  );
}

export default function GitHubSection() {
  const site = useSite();
  const { data, loading, error, status, refetch } = useFetch((signal) => getGithub(signal));

  // No GitHub link configured: leave the section out entirely
  if (status === 404) return null;

  const gh = data?.data;

  return (
    <Section
      id="github"
      eyebrow="05 — Open source"
      title="GitHub highlights"
      subtitle="Live numbers from my public GitHub profile"
      className="bg-slate-50 dark:bg-slate-900/40"
    >
      {loading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {error && <ErrorState message={error} onRetry={refetch} />}

      {gh && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Stat value={gh.publicRepos} label="Public repositories" delay={0} />
            <Stat value={gh.stars} label="Stars received" delay={0.05} />
            <Stat value={gh.followers} label="Followers" delay={0.1} />
            <Stat value={gh.languageCount} label="Languages used" delay={0.15} />
          </div>

          {gh.languages.length > 0 && (
            <div className="mt-12 max-w-3xl">
              <h3 className="mb-6 font-mono text-sm font-semibold uppercase tracking-[0.25em] text-brand-600 dark:text-brand-400">
                Most used languages
              </h3>
              <ul className="space-y-4">
                {gh.languages.map((language, i) => (
                  <li
                    key={language.name}
                    className="grid grid-cols-[7rem_1fr_3.5rem] items-center gap-4 text-sm sm:grid-cols-[9rem_1fr_4rem]"
                  >
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                      {language.name}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
                    >
                      <motion.span
                        className="block h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-400"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.max(language.percent, 0.5)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
                      />
                    </span>
                    <span className="text-right font-mono text-slate-600 dark:text-slate-400">
                      {language.percent.toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <a
        href={gh?.url || site.github}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-secondary mt-12 font-mono uppercase tracking-wider"
      >
        Visit GitHub profile
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </a>
    </Section>
  );
}
