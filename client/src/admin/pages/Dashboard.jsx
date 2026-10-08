import { Briefcase, FileText, FolderKanban, Mail, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import ErrorState from '../../components/ui/ErrorState';
import Skeleton from '../../components/ui/Skeleton';
import { formatLongDate } from '../../utils/format';
import { getCount, listMessages } from '../api';
import PageHeader from '../components/PageHeader';

const cards = [
  { key: 'projects', label: 'Projects', to: '/admin/projects', icon: FolderKanban },
  { key: 'skills', label: 'Skills', to: '/admin/skills', icon: Wrench },
  { key: 'experience', label: 'Experience entries', to: '/admin/experience', icon: Briefcase },
  { key: 'posts', label: 'Blog posts', to: '/admin/posts', icon: FileText },
];

export default function Dashboard() {
  const [state, setState] = useState({ loading: true, error: '', counts: {}, unread: 0, recent: [] });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: '' }));

    Promise.all([...cards.map((c) => getCount(c.key)), listMessages({ limit: 5 })])
      .then((results) => {
        if (!active) return;
        const messages = results[results.length - 1];
        setState({
          loading: false,
          error: '',
          counts: Object.fromEntries(cards.map((c, i) => [c.key, results[i].total])),
          unread: messages.unread,
          recent: messages.data,
        });
      })
      .catch((err) => active && setState((s) => ({ ...s, loading: false, error: getErrorMessage(err) })));

    return () => {
      active = false;
    };
  }, [tick]);

  const { loading, error, counts, unread, recent } = state;

  return (
    <>
      <PageHeader title="Dashboard" description="An overview of your portfolio content." />

      {error && <ErrorState message={error} onRetry={() => setTick((t) => t + 1)} />}

      {!error && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {cards.map(({ key, label, to, icon: Icon }) => (
              <Link key={key} to={to} className="card p-5 transition hover:border-brand-500">
                <Icon className="mb-3 h-5 w-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
                {loading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{counts[key]}</p>
                )}
                <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
              </Link>
            ))}
            <Link to="/admin/messages" className="card p-5 transition hover:border-brand-500">
              <Mail className="mb-3 h-5 w-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
              {loading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{unread}</p>
              )}
              <p className="text-sm text-slate-500 dark:text-slate-400">Unread messages</p>
            </Link>
          </div>

          <section className="mt-10" aria-labelledby="recent-title">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="recent-title" className="text-lg font-semibold text-slate-900 dark:text-white">
                Recent messages
              </h2>
              <Link to="/admin/messages" className="text-sm font-medium text-brand-600 dark:text-brand-400">
                View all
              </Link>
            </div>
            <div className="card divide-y divide-slate-100 dark:divide-slate-800">
              {loading && <Skeleton className="m-4 h-16" />}
              {!loading && recent.length === 0 && <p className="p-6 text-center text-slate-500">No messages yet.</p>}
              {recent.map((m) => (
                <Link
                  key={m._id}
                  to="/admin/messages"
                  className="flex items-center justify-between gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900 dark:text-white">
                      {!m.read && (
                        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-brand-600" aria-label="Unread" />
                      )}
                      {m.name}
                    </p>
                    <p className="truncate text-sm text-slate-500 dark:text-slate-400">{m.subject || m.message}</p>
                  </div>
                  <time className="shrink-0 text-xs text-slate-500 dark:text-slate-400" dateTime={m.createdAt}>
                    {formatLongDate(m.createdAt)}
                  </time>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
