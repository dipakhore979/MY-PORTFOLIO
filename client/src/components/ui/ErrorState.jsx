import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="card mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center"
    >
      <AlertCircle className="h-8 w-8 text-red-500" aria-hidden="true" />
      <p className="text-sm text-slate-700 dark:text-slate-300">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-secondary">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  );
}
