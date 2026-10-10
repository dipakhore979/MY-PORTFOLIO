import { Briefcase, Download, FileText, Maximize2, Wrench } from 'lucide-react';
import { useRef } from 'react';
import { getResumeInfo, resumeUrl } from '../../api/endpoints';
import { useSite } from '../../context/ProfileContext';
import { useFetch } from '../../hooks/useFetch';
import Reveal from '../ui/Reveal';
import Section from '../ui/Section';
import Skeleton from '../ui/Skeleton';

export default function ResumeSection() {
  const site = useSite();
  const { data, loading } = useFetch((signal) => getResumeInfo(signal));
  const frameRef = useRef(null);

  const available = Boolean(data?.available);
  const previewUrl = data?.previewUrl;

  const openFullScreen = () => {
    const frame = frameRef.current;
    const fallback = () => window.open(previewUrl, '_blank', 'noopener,noreferrer');
    if (frame?.requestFullscreen) frame.requestFullscreen().catch(fallback);
    else fallback();
  };

  const facts = [
    { icon: Briefcase, text: site.role },
    { icon: Wrench, text: site.stack.slice(0, 4).join(', ') },
    { icon: FileText, text: 'PDF document' },
  ];

  return (
    <Section
      id="resume"
      eyebrow="06 — My resume"
      title="Download my resume"
      subtitle="A summary of my education, skills and projects."
    >
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <Reveal>
          <div className="card p-8">
            <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <FileText className="h-7 w-7" aria-hidden="true" />
            </span>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {site.name} — Resume
            </h3>

            <ul className="mt-6 space-y-3 text-slate-600 dark:text-slate-400">
              {facts.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400" aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>

            {loading && <Skeleton className="mt-8 h-12 w-full" />}

            {!loading && !available && (
              <p className="mt-8 rounded-lg bg-slate-100 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                My resume will be available here soon.
              </p>
            )}

            {available && (
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary font-mono uppercase tracking-wider"
                >
                  Download PDF
                  <Download className="h-4 w-4" aria-hidden="true" />
                </a>
                <button
                  type="button"
                  onClick={openFullScreen}
                  className="btn btn-secondary font-mono uppercase tracking-wider"
                >
                  View full screen
                  <Maximize2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </Reveal>

        {/* Live preview: desktop only (phones cannot scroll PDFs inside frames) */}
        <Reveal delay={0.1} className="hidden lg:block">
          <div className="card overflow-hidden bg-white">
            {available ? (
              <iframe
                ref={frameRef}
                src={`${previewUrl}#view=FitH&toolbar=0`}
                title={`${site.name} resume preview`}
                loading="lazy"
                className="h-[34rem] w-full bg-white"
              />
            ) : (
              <div className="flex h-[34rem] items-center justify-center text-slate-400">
                {loading ? 'Loading preview…' : 'Preview will appear here'}
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
