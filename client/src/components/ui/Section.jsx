import Reveal from './Reveal';

export default function Section({ id, eyebrow, title, subtitle, children, className = '' }) {
  return (
    <section id={id} className={`py-20 sm:py-24 ${className}`} aria-labelledby={`${id}-title`}>
      <div className="container-page">
        <Reveal className="mb-12 max-w-2xl">
          {eyebrow && (
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              {eyebrow}
            </p>
          )}
          <h2
            id={`${id}-title`}
            className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white"
          >
            {title}
          </h2>
          {subtitle && <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">{subtitle}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
