import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { getErrorMessage } from '../../api/client';
import Markdown from '../../components/ui/Markdown';
import ImageUpload from './ImageUpload';

const URL_PATTERN = /^https?:\/\/\S+$/i;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Doc from the API -> values for the form inputs. */
export const toFormValues = (fields, doc) =>
  Object.fromEntries(
    fields.map((f) => {
      const raw = doc?.[f.name];
      switch (f.type) {
        case 'tags':
          return [f.name, (raw || []).join(', ')];
        case 'date':
          return [f.name, raw ? String(raw).slice(0, 10) : ''];
        case 'checkbox':
          return [f.name, doc ? Boolean(raw) : Boolean(f.default)];
        case 'image':
          return [f.name, raw || { url: '', publicId: '' }];
        case 'select':
          return [f.name, raw ?? f.default ?? f.options[0]?.value ?? ''];
        default:
          return [f.name, raw ?? f.default ?? ''];
      }
    }),
  );

/** Form values -> JSON body for the API. */
export const buildPayload = (fields, values) => {
  const out = {};
  fields.forEach((f) => {
    let value = values[f.name];
    switch (f.type) {
      case 'tags':
        value = [
          ...new Set(
            String(value || '')
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean),
          ),
        ];
        break;
      case 'number':
        value = value === '' || value == null || Number.isNaN(Number(value)) ? undefined : Number(value);
        break;
      case 'checkbox':
        value = Boolean(value);
        break;
      case 'image':
        value = { url: value?.url || '', publicId: value?.publicId || '' };
        break;
      default:
        value = typeof value === 'string' ? value.trim() : value;
    }
    if (f.omitIfEmpty && (value === '' || value === undefined)) return;
    if (value !== undefined) out[f.name] = value;
  });
  return out;
};

const rulesFor = (f) => {
  const rules = {};
  if (f.required) rules.required = `${f.label} is required`;
  if (f.max) rules.maxLength = { value: f.max, message: `${f.label} must be ${f.max} characters or fewer` };
  if (f.min && f.type !== 'number')
    rules.minLength = { value: f.min, message: `${f.label} must be at least ${f.min} characters` };
  if (f.type === 'url') rules.pattern = { value: URL_PATTERN, message: 'Must start with http:// or https://' };
  if (f.type === 'slug') rules.pattern = { value: SLUG_PATTERN, message: 'Use lowercase letters, numbers and hyphens' };
  if (f.type === 'number') {
    if (f.min !== undefined) rules.min = { value: f.min, message: `Minimum is ${f.min}` };
    if (f.maxValue !== undefined) rules.max = { value: f.maxValue, message: `Maximum is ${f.maxValue}` };
  }
  return rules;
};

function MarkdownField({ id, register, rules, name, watchValue, rows }) {
  const [preview, setPreview] = useState(false);
  return (
    <div>
      <div className="mb-2 flex gap-1" role="tablist" aria-label="Editor mode">
        {['Write', 'Preview'].map((tab) => {
          const active = (tab === 'Preview') === preview;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setPreview(tab === 'Preview')}
              className={`rounded-md px-3 py-1 text-xs font-medium ${
                active
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>
      {preview ? (
        <div className="min-h-[10rem] rounded-lg border border-slate-300 p-4 dark:border-slate-700">
          {watchValue ? <Markdown>{watchValue}</Markdown> : <p className="text-slate-500 dark:text-slate-400">Nothing to preview</p>}
        </div>
      ) : (
        <textarea id={id} rows={rows || 12} className="input font-mono" {...register(name, rules)} />
      )}
    </div>
  );
}

/**
 * Generic form driven by a `fields` config:
 * { name, label, type, required, max, min, wide, help, options, rows, default, omitIfEmpty, showIf }
 * type: text | slug | url | email | textarea | markdown | number | date | checkbox | select | tags | image
 */
export default function EntityForm({ fields, initialValues, onSubmit, onCancel, submitLabel = 'Save' }) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: initialValues });
  const [serverError, setServerError] = useState('');
  const values = watch();

  const submit = async (formValues) => {
    setServerError('');
    try {
      await onSubmit(buildPayload(fields, formValues));
    } catch (err) {
      const details = err?.response?.data?.details;
      let mapped = false;
      if (Array.isArray(details)) {
        details.forEach(({ field, message }) => {
          const name = String(field).split('.')[0];
          if (fields.some((f) => f.name === name)) {
            setError(name, { type: 'server', message });
            mapped = true;
          }
        });
      }
      if (!mapped) setServerError(getErrorMessage(err));
    }
  };

  const visible = fields.filter((f) => !f.showIf || f.showIf(values));

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="grid gap-5 sm:grid-cols-2">
      {visible.map((f) => {
        const id = `field-${f.name}`;
        const error = errors[f.name];
        const rules = rulesFor(f);
        const describedBy = [error && `${id}-error`, f.help && `${id}-help`].filter(Boolean).join(' ') || undefined;
        const common = { id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy };
        const wide = f.wide || ['textarea', 'markdown', 'image', 'tags'].includes(f.type);

        return (
          <div key={f.name} className={wide ? 'sm:col-span-2' : ''}>
            {f.type === 'checkbox' ? (
              <label className="flex items-center gap-2.5 text-sm font-medium text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-brand-600"
                  {...common}
                  {...register(f.name)}
                />
                {f.label}
              </label>
            ) : (
              <label htmlFor={id} className="label">
                {f.label}
                {!f.required && <span className="font-normal text-slate-500 dark:text-slate-400"> (optional)</span>}
              </label>
            )}

            {['text', 'slug', 'url', 'email', 'number', 'date', 'tags'].includes(f.type) && (
              <input
                {...common}
                type={f.type === 'slug' || f.type === 'tags' ? 'text' : f.type}
                step={f.type === 'number' ? 1 : undefined}
                placeholder={f.placeholder}
                className="input"
                {...register(f.name, rules)}
              />
            )}

            {f.type === 'textarea' && (
              <textarea {...common} rows={f.rows || 4} className="input resize-y" {...register(f.name, rules)} />
            )}

            {f.type === 'select' && (
              <select {...common} className="input" {...register(f.name, rules)}>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}

            {f.type === 'markdown' && (
              <MarkdownField
                id={id}
                name={f.name}
                register={register}
                rules={rules}
                watchValue={values[f.name]}
                rows={f.rows}
              />
            )}

            {f.type === 'image' && (
              <Controller
                name={f.name}
                control={control}
                render={({ field }) => <ImageUpload id={id} value={field.value} onChange={field.onChange} />}
              />
            )}

            {f.help && (
              <p id={`${id}-help`} className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                {f.help}
              </p>
            )}
            {error && (
              <p id={`${id}-error`} role="alert" className="field-error">
                {error.message}
              </p>
            )}
          </div>
        );
      })}

      {serverError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700 sm:col-span-2 dark:bg-red-500/10 dark:text-red-400"
        >
          {serverError}
        </p>
      )}

      <div className="flex justify-end gap-3 sm:col-span-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={isSubmitting}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
