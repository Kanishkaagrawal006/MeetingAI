import { WifiOff } from 'lucide-react';
import { API_BASE_URL } from '../api/config';

export default function ConnectionError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface px-8 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-risk-soft text-red-600">
        <WifiOff size={26} strokeWidth={2} />
      </div>
      <div className="space-y-1.5">
        <h2 className="font-display text-lg font-semibold text-ink">Unable to connect to the server</h2>
        <p className="max-w-sm text-sm text-ink-soft">
          Please make sure the backend is running on{' '}
          <code className="rounded bg-canvas px-1.5 py-0.5 font-mono text-xs">{API_BASE_URL}</code>.
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-signal px-4 py-2 text-sm font-semibold text-white transition hover:bg-signal-dark"
        >
          Try again
        </button>
      )}
    </div>
  );
}
