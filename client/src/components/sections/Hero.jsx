import { motion } from 'framer-motion';
import { ArrowRight, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProjects, getSkills, resumeUrl } from '../../api/endpoints';
import { useSite } from '../../context/ProfileContext';
import { useFetch } from '../../hooks/useFetch';
import SocialLinks from '../ui/SocialLinks';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const TOKEN_COLORS = {
  kw: 'text-purple-600 dark:text-purple-400',
  name: 'text-sky-700 dark:text-sky-300',
  prop: 'text-slate-800 dark:text-slate-200',
  str: 'text-emerald-700 dark:text-emerald-400',
  plain: 'text-slate-500 dark:text-slate-400',
};

/** Decorative code card built from the live profile data. */
function CodeCard({ site }) {
  const lines = [
    [['const ', 'kw'], ['developer', 'name'], [' = {', 'plain']],
    [['  name', 'prop'], [': ', 'plain'], [`'${site.name}'`, 'str'], [',', 'plain']],
    [['  role', 'prop'], [': ', 'plain'], [`'${site.role}'`, 'str'], [',', 'plain']],
    [['  stack', 'prop'], [': [', 'plain']],
    ...site.stack.map((tech) => [['    ', 'plain'], [`'${tech}'`, 'str'], [',', 'plain']]),
    [['  ],', 'plain']],
    ...(site.status ? [[['  openToWork', 'prop'], [': ', 'plain'], ['true', 'kw'], [',', 'plain']]] : []),
    [['};', 'plain']],
  ];

  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0, y: 30, rotate: 1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
      className="relative"
    >
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-brand-500/30 to-purple-500/30 blur-2xl" />
      <div className="card relative overflow-hidden font-mono text-sm shadow-2xl">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-3 text-xs text-slate-500 dark:text-slate-400">developer.js</span>
        </div>
        <pre className="overflow-x-auto p-5 leading-7">
          <code>
            {lines.map((tokens, i) => (
              <motion.div
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.07 }}
                className="whitespace-pre"
              >
                {tokens.map(([text, kind], j) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <span key={j} className={TOKEN_COLORS[kind]}>
                    {text}
                  </span>
                ))}
              </motion.div>
            ))}
          </code>
        </pre>
      </div>
    </motion.div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

export default function Hero() {
  const site = useSite();
  const projects = useFetch((signal) => getProjects({ limit: 1 }, signal));
  const skills = useFetch((signal) => getSkills({ limit: 1 }, signal));
  const projectCount = projects.data?.total ?? 0;
  const skillCount = skills.data?.total ?? 0;

  return (
    <section id="home" className="relative isolate overflow-hidden" aria-label="Introduction">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0" />
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -right-24 top-40 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      <div className="container-page grid min-h-[calc(100vh-4rem)] items-center gap-14 py-16 lg:grid-cols-[1.15fr_1fr] lg:py-24">
        <motion.div variants={container} initial="hidden" animate="show">
          {site.status && (
            <motion.p
              variants={item}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-sm font-medium text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {site.status}
            </motion.p>
          )}

          <motion.p variants={item} className="mb-3 text-lg font-medium text-slate-600 dark:text-slate-400">
            Hi, I&apos;m
          </motion.p>
          <motion.h1
            variants={item}
            className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl dark:text-white"
          >
            {site.name}
          </motion.h1>
          <motion.p variants={item} className="heading-gradient mt-3 pb-1 font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
            {site.role}
          </motion.p>
          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 sm:text-xl dark:text-slate-400"
          >
            {site.tagline}
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-3">
            <Link to="/#projects" className="btn btn-primary !px-6 !py-3">
              View Projects
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/#contact" className="btn btn-secondary !px-6 !py-3">
              Contact Me
            </Link>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary !px-6 !py-3"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Resume
            </a>
          </motion.div>

          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-6">
            <SocialLinks className="-ml-2" />
            {(projectCount > 0 || skillCount > 0) && (
              <div className="flex gap-8 border-l border-slate-200 pl-8 dark:border-slate-800">
                {projectCount > 0 && <Stat value={projectCount} label="Projects" />}
                {skillCount > 0 && <Stat value={skillCount} label="Skills" />}
              </div>
            )}
          </motion.div>
        </motion.div>

        <div className="hidden lg:block">
          <CodeCard site={site} />
        </div>
      </div>
    </section>
  );
}
