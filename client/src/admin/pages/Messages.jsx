import { ChevronLeft, ChevronRight, Mail, MailOpen, Reply, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../../api/client';
import ErrorState from '../../components/ui/ErrorState';
import Skeleton from '../../components/ui/Skeleton';
import { formatLongDate } from '../../utils/format';
import { deleteMessage, listMessages, setMessageRead } from '../api';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { useToast } from '../context/ToastContext';

const PAGE_SIZE = 20;

export default function Messages() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [state, setState] = useState({ items: [], total: 0, unread: 0, pages: 1, loading: true, error: '' });
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await listMessages({
        page,
        limit: PAGE_SIZE,
        ...(onlyUnread && { unread: true }),
      });
      setState({
        items: res.data,
        total: res.total,
        unread: res.unread,
        pages: res.pages,
        loading: false,
        error: '',
      });
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: getErrorMessage(err) }));
    }
  }, [page, onlyUnread]);

  useEffect(() => {
    load();
  }, [load]);

  const patchLocal = (id, patch) =>
    setState((s) => ({
      ...s,
      items: s.items.map((m) => (m._id === id ? { ...m, ...patch } : m)),
      unread: patch.read === undefined ? s.unread : s.unread + (patch.read ? -1 : 1),
    }));

  const open = async (message) => {
    setSelected(message);
    if (!message.read) {
      try {
        await setMessageRead(message._id, true);
        patchLocal(message._id, { read: true });
        setSelected((m) => (m ? { ...m, read: true } : m));
      } catch {
        /* non-critical: the message is still shown */
      }
    }
  };

  const toggleRead = async (message) => {
    try {
      await setMessageRead(message._id, !message.read);
      patchLocal(message._id, { read: !message.read });
      setSelected((m) => (m ? { ...m, read: !message.read } : m));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteMessage(deleting._id);
      toast.success('Message deleted');
      setDeleting(null);
      setSelected(null);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const { items, total, unread, pages, loading, error } = state;

  return (
    <>
      <PageHeader
        title="Messages"
        description={`${unread} unread · ${total} ${onlyUnread ? 'unread shown' : 'total'}`}
        action={
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-brand-600"
              checked={onlyUnread}
              onChange={(e) => {
                setPage(1);
                setState((s) => ({ ...s, loading: true }));
                setOnlyUnread(e.target.checked);
              }}
            />
            Unread only
          </label>
        }
      />

      {loading && (
        <div className="space-y-3" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && items.length === 0 && (
        <div className="card p-10 text-center text-slate-500">No messages here.</div>
      )}

      {!loading && !error && items.length > 0 && (
        <ul className="card divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((m) => (
            <li key={m._id}>
              <button
                type="button"
                onClick={() => open(m)}
                className="flex w-full items-center gap-4 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <span className="shrink-0 text-slate-500 dark:text-slate-400">
                  {m.read ? <MailOpen className="h-5 w-5" aria-label="Read" /> : <Mail className="h-5 w-5 text-brand-600" aria-label="Unread" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate ${m.read ? 'text-slate-700 dark:text-slate-300' : 'font-semibold text-slate-900 dark:text-white'}`}>
                    {m.name} <span className="font-normal text-slate-500 dark:text-slate-400">&lt;{m.email}&gt;</span>
                  </span>
                  <span className="block truncate text-sm text-slate-500 dark:text-slate-400">
                    {m.subject ? `${m.subject} — ` : ''}
                    {m.message}
                  </span>
                </span>
                <time className="hidden shrink-0 text-xs text-slate-500 dark:text-slate-400 sm:block" dateTime={m.createdAt}>
                  {formatLongDate(m.createdAt)}
                </time>
              </button>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-4" aria-label="Pagination">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Previous
          </button>
          <span className="text-sm text-slate-500">
            Page {page} of {pages}
          </span>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </nav>
      )}

      {selected && !deleting && (
        <Modal title={selected.subject || 'Message'} onClose={() => setSelected(null)}>
          <dl className="mb-4 grid gap-1 text-sm">
            <div className="flex gap-2">
              <dt className="w-16 text-slate-500">From</dt>
              <dd className="text-slate-900 dark:text-white">
                {selected.name} (
                <a className="text-brand-600 hover:underline dark:text-brand-400" href={`mailto:${selected.email}`}>
                  {selected.email}
                </a>
                )
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-16 text-slate-500">Received</dt>
              <dd className="text-slate-900 dark:text-white">
                {new Date(selected.createdAt).toLocaleString()}
              </dd>
            </div>
          </dl>
          <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-slate-800 dark:bg-slate-800/60 dark:text-slate-200">
            {selected.message}
          </p>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button type="button" onClick={() => toggleRead(selected)} className="btn btn-secondary">
              {selected.read ? 'Mark as unread' : 'Mark as read'}
            </button>
            <a
              href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject || 'your message'}`)}`}
              className="btn btn-primary"
            >
              <Reply className="h-4 w-4" aria-hidden="true" />
              Reply
            </a>
            <button
              type="button"
              onClick={() => setDeleting(selected)}
              className="btn bg-red-600 text-white hover:bg-red-500"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete
            </button>
          </div>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete message?"
          message={`The message from ${deleting.name} will be permanently deleted.`}
          busy={busy}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}
