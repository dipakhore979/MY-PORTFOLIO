import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { getErrorMessage } from '../../api/client';
import { changePassword } from '../api';
import PageHeader from '../components/PageHeader';
import { useToast } from '../context/ToastContext';

export default function Account() {
  const toast = useToast();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { currentPassword: '', newPassword: '', confirm: '' } });

  const onSubmit = async ({ currentPassword, newPassword }) => {
    setServerError('');
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password updated');
      reset();
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  const field = (name, label, rules, autoComplete) => (
    <div>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <input
        id={name}
        type="password"
        autoComplete={autoComplete}
        aria-invalid={Boolean(errors[name])}
        className="input"
        {...register(name, rules)}
      />
      {errors[name] && (
        <p role="alert" className="field-error">
          {errors[name].message}
        </p>
      )}
    </div>
  );

  return (
    <>
      <PageHeader title="Account" description="Change your admin password." />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="card max-w-md space-y-5 p-6">
        {field('currentPassword', 'Current password', { required: 'Enter your current password' }, 'current-password')}
        {field(
          'newPassword',
          'New password',
          {
            required: 'Enter a new password',
            minLength: { value: 10, message: 'Use at least 10 characters' },
            maxLength: { value: 128, message: 'Use 128 characters or fewer' },
          },
          'new-password',
        )}
        {field(
          'confirm',
          'Confirm new password',
          {
            required: 'Confirm your new password',
            validate: (v) => v === getValues('newPassword') || 'Passwords do not match',
          },
          'new-password',
        )}

        {serverError && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
            {serverError}
          </p>
        )}

        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Update password
        </button>
      </form>
    </>
  );
}
