import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getErrorMessage } from '../../api/client';
import ErrorState from '../../components/ui/ErrorState';
import Skeleton from '../../components/ui/Skeleton';
import { resourceApi } from '../api';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from './ConfirmDialog';
import EntityForm, { toFormValues } from './EntityForm';
import Modal from './Modal';
import PageHeader from './PageHeader';

/**
 * Generic list + create/edit modal + delete confirmation for one REST resource.
 * columns: [{ label, render(item), className }]
 */
export default function ResourceManager({ title, singular, description, resource, columns, fields, itemLabel }) {
  const api = useMemo(() => resourceApi(resource), [resource]);
  const toast = useToast();
  const [state, setState] = useState({ items: [], total: 0, loading: true, error: '' });
  const [editing, setEditing] = useState(null); // null | 'new' | item
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.list();
      setState({ items: res.data, total: res.total, loading: false, error: '' });
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: getErrorMessage(err) }));
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (payload) => {
    if (editing === 'new') {
      await api.create(payload);
      toast.success(`${singular} created`);
    } else {
      await api.update(editing._id, payload);
      toast.success(`${singular} updated`);
    }
    setEditing(null);
    await load();
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await api.remove(deleting._id);
      toast.success(`${singular} deleted`);
      setDeleting(null);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const { items, total, loading, error } = state;

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={
          <button type="button" onClick={() => setEditing('new')} className="btn btn-primary">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New {singular.toLowerCase()}
          </button>
        }
      />

      {loading && (
        <div className="space-y-3" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {error && (
        <ErrorState
          message={error}
          onRetry={() => {
            setState((s) => ({ ...s, loading: true, error: '' }));
            load();
          }}
        />
      )}

      {!loading && !error && items.length === 0 && (
        <div className="card p-10 text-center text-slate-500">
          No {title.toLowerCase()} yet. Click &quot;New {singular.toLowerCase()}&quot; to add one.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
              <tr>
                {columns.map((c) => (
                  <th key={c.label} scope="col" className={`px-4 py-3 font-semibold ${c.className || ''}`}>
                    {c.label}
                  </th>
                ))}
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  {columns.map((c) => (
                    <td key={c.label} className={`px-4 py-3 align-middle ${c.className || ''}`}>
                      {c.render(item)}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setEditing(item)}
                      aria-label={`Edit ${itemLabel(item)}`}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(item)}
                      aria-label={`Delete ${itemLabel(item)}`}
                      className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {total > items.length && (
            <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500 dark:border-slate-800">
              Showing the first {items.length} of {total}.
            </p>
          )}
        </div>
      )}

      {editing && (
        <Modal
          title={editing === 'new' ? `New ${singular.toLowerCase()}` : `Edit ${singular.toLowerCase()}`}
          onClose={() => setEditing(null)}
          size="max-w-3xl"
        >
          <EntityForm
            fields={fields}
            initialValues={toFormValues(fields, editing === 'new' ? null : editing)}
            onSubmit={handleSave}
            onCancel={() => setEditing(null)}
            submitLabel={editing === 'new' ? 'Create' : 'Save changes'}
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title={`Delete ${singular.toLowerCase()}?`}
          message={`"${itemLabel(deleting)}" will be permanently deleted. This cannot be undone.`}
          busy={busy}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}
