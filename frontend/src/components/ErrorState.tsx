import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-risk-soft bg-risk-soft/50 px-5 py-4 text-sm">
      <div className="flex items-center gap-2 text-red-700">
        <AlertTriangle size={16} strokeWidth={2.5} />
        <span className="font-medium">{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
        >
          <RefreshCw size={13} />
          Retry
        </button>
      )}
    </div>
  );
}
