import { Link } from 'react-router-dom';
import { CheckSquare, Scale, ShieldAlert } from 'lucide-react';
import type { Meeting } from '../types/meeting';
import StatusBadge from './StatusBadge';
import { formatDate, formatDuration } from '../lib/format';

export default function MeetingCard({ meeting }: { meeting: Meeting }) {
  const counts = meeting.summaryPreview;

  return (
    <Link
      to={`/meetings/${meeting.id}`}
      className="group block rounded-2xl border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:border-signal/40 hover:shadow-md"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-semibold text-ink group-hover:text-signal-dark">
          {meeting.title || meeting.originalFilename}
        </h3>
        <StatusBadge status={meeting.status} />
      </div>

      <p className="mb-3 font-mono text-xs text-ink-faint">
        {formatDate(meeting.createdAt)} · {formatDuration(meeting.durationSeconds)}
      </p>

      {meeting.summaryPreview?.text ? (
        <p className="mb-4 line-clamp-2 text-sm text-ink-soft">{meeting.summaryPreview.text}</p>
      ) : (
        <p className="mb-4 text-sm italic text-ink-faint">
          {meeting.status === 'FAILED' ? 'Processing failed.' : 'Summary not available yet.'}
        </p>
      )}

      {counts && (
        <div className="flex items-center gap-4 border-t border-border-soft pt-3 text-xs font-medium text-ink-soft">
          <span className="flex items-center gap-1.5">
            <CheckSquare size={13} className="text-signal" /> {counts.actionCount} Actions
          </span>
          <span className="flex items-center gap-1.5">
            <Scale size={13} className="text-signal" /> {counts.decisionCount} Decisions
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldAlert size={13} className="text-red-500" /> {counts.riskCount} Risks
          </span>
        </div>
      )}
    </Link>
  );
}
