import { Check, Loader2, X } from 'lucide-react';
import type { MeetingStatus } from '../types/meeting';

interface Step {
  key: string;
  label: string;
}

const STEPS: (Step & { progressLabel: string })[] = [
  { key: 'uploaded', label: 'Audio uploaded', progressLabel: 'Uploading audio…' },
  { key: 'stored', label: 'Audio stored securely', progressLabel: 'Storing audio…' },
  { key: 'transcribed', label: 'Speech transcription completed', progressLabel: 'Transcribing audio…' },
  { key: 'summarized', label: 'AI summary generated', progressLabel: 'Generating AI summary…' },
];

// How many of the four steps are complete for a given status.
function completedCount(status: MeetingStatus): number {
  switch (status) {
    case 'UPLOADED':
    case 'UPLOADING':
      return 2; // uploaded + stored
    case 'TRANSCRIBING':
      return 2;
    case 'SUMMARIZING':
      return 3;
    case 'COMPLETED':
      return 4;
    case 'FAILED':
      return 2;
    default:
      return 0;
  }
}

// Which step index is currently in progress (0-based), or -1 if none.
function inProgressIndex(status: MeetingStatus): number {
  switch (status) {
    case 'UPLOADING':
      return 0;
    case 'TRANSCRIBING':
      return 2;
    case 'SUMMARIZING':
      return 3;
    default:
      return -1;
  }
}

export default function ProcessingTimeline({
  status,
  errorMessage,
}: {
  status: MeetingStatus;
  errorMessage?: string | null;
}) {
  const done = completedCount(status);
  const active = inProgressIndex(status);
  const failed = status === 'FAILED';

  return (
    <div className="space-y-0">
      {STEPS.map((step, i) => {
        const isDone = i < done;
        const isActive = i === active && !failed;
        const isFailedHere = failed && i === done;
        const isLast = i === STEPS.length - 1;

        return (
          <div key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                  isDone
                    ? 'bg-success text-white'
                    : isFailedHere
                    ? 'bg-risk text-white'
                    : isActive
                    ? 'bg-amber-soft text-amber-600'
                    : 'bg-border-soft text-ink-faint'
                }`}
              >
                {isDone ? (
                  <Check size={14} strokeWidth={3} />
                ) : isFailedHere ? (
                  <X size={14} strokeWidth={3} />
                ) : isActive ? (
                  <Loader2 size={13} strokeWidth={3} className="animate-spin" />
                ) : (
                  <span className="size-1.5 rounded-full bg-current" />
                )}
              </div>
              {!isLast && (
                <div className={`w-px flex-1 ${isDone ? 'bg-success' : 'bg-border'}`} style={{ minHeight: 24 }} />
              )}
            </div>
            <div className={`pb-6 pt-0.5 text-sm ${isDone ? 'font-medium text-ink' : isActive ? 'font-medium text-amber-700' : 'text-ink-faint'}`}>
              {isFailedHere ? 'Processing failed' : isActive ? step.progressLabel : step.label}
              {isFailedHere && errorMessage && (
                <p className="mt-1 max-w-sm text-xs font-normal text-red-600">{errorMessage}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
