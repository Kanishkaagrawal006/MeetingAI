import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  ScrollText,
  ShieldAlert,
  Scale,
  CheckSquare,
} from 'lucide-react';
import { useMeetingDetails, useDeleteMeeting } from '../hooks/useMeetings';
import { isProcessing } from '../api/meetings';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import ProcessingTimeline from '../components/ProcessingTimeline';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import ConnectionError from '../components/ConnectionError';
import { BlockSkeleton } from '../components/Skeletons';
import { formatDate, formatDuration, orNotSpecified } from '../lib/format';
import { downloadTextFile, buildSummaryTextFile } from '../lib/download';
import { isNetworkError } from '../api/client';

export default function MeetingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transcriptOpen, setTranscriptOpen] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: meeting, isLoading, isError, error, refetch } = useMeetingDetails(id);
  const deleteMutation = useDeleteMeeting();

  function handleDelete() {
    if (!id) return;
    deleteMutation.mutate(id, {
      onSuccess: () => navigate('/'),
    });
  }

  if (isError) {
    if (isNetworkError(error)) return <ConnectionError onRetry={() => refetch()} />;
    return <ErrorState message="Unable to load this meeting." onRetry={() => refetch()} />;
  }

  if (isLoading || !meeting) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-1/3 rounded skeleton" />
        <div className="rounded-2xl border border-border bg-surface p-6">
          <BlockSkeleton lines={4} />
        </div>
      </div>
    );
  }

  const processing = isProcessing(meeting.status);
  const summary = meeting.summary;
  const transcript = meeting.transcript;

  return (
    <div>
      <button
        onClick={() => navigate('/')}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to dashboard
      </button>

      {/* Meeting info header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1.5 font-display text-2xl font-bold text-ink">
            {meeting.title || meeting.originalFilename}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-soft">
            <StatusBadge status={meeting.status} />
            <span className="font-mono text-xs text-ink-faint">{meeting.originalFilename}</span>
            <span className="text-ink-faint">·</span>
            <span>{formatDate(meeting.createdAt)}</span>
            <span className="text-ink-faint">·</span>
            <span>{formatDuration(meeting.durationSeconds)}</span>
          </div>
        </div>

        <button
          onClick={() => setConfirmDelete(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-red-600 transition hover:border-red-200 hover:bg-red-50"
        >
          <Trash2 size={15} />
          Delete
        </button>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 font-display text-base font-semibold text-ink">
              Are you sure you want to delete this meeting?
            </h3>
            <p className="mb-5 text-sm text-ink-soft">This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink transition hover:bg-canvas"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing timeline (shown while processing or failed) */}
      {(processing || meeting.status === 'FAILED') && (
        <div className="mb-6 rounded-2xl border border-border bg-surface p-6">
          <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-ink-faint">
            Processing Status
          </h2>
          <ProcessingTimeline status={meeting.status} errorMessage={meeting.errorMessage} />
          {meeting.status === 'FAILED' && (
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => refetch()}
                className="rounded-lg bg-signal px-4 py-2 text-sm font-semibold text-white transition hover:bg-signal-dark"
              >
                Try again
              </button>
              <Link
                to="/"
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink transition hover:bg-canvas"
              >
                Back
              </Link>
            </div>
          )}
        </div>
      )}

      {meeting.status === 'COMPLETED' && (
        <>
          {/* Download buttons */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              disabled={!summary}
              onClick={() => summary && downloadTextFile('meeting-summary.txt', buildSummaryTextFile(summary))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-sm font-medium text-ink transition hover:border-signal/40 hover:text-signal-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={15} />
              Download Summary
            </button>
            <button
              disabled={!transcript}
              onClick={() => transcript && downloadTextFile('meeting-transcript.txt', transcript)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-sm font-medium text-ink transition hover:border-signal/40 hover:text-signal-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={15} />
              Download Transcript
            </button>
          </div>

          {/* Summary */}
          <section className="mb-6 rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-3 font-display text-base font-semibold text-ink">Meeting Summary</h2>
            {summary ? (
              <p className="text-[15px] leading-relaxed text-ink-soft">{summary.summary}</p>
            ) : (
              <ErrorState message="Unable to load the meeting summary." onRetry={() => refetch()} />
            )}
          </section>

          {summary && (
            <>
              {/* Key Decisions */}
              <section className="mb-6 rounded-2xl border border-border bg-surface p-6">
                <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-ink">
                  <Scale size={17} className="text-signal" />
                  Key Decisions
                </h2>
                {summary.keyDecisions.length === 0 ? (
                  <EmptyState message="No key decisions identified." />
                ) : (
                  <ul className="space-y-2.5">
                    {summary.keyDecisions.map((decision, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-ink-soft">
                        <CheckSquare size={16} className="mt-0.5 shrink-0 text-green-600" />
                        <span>{decision}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Action Items */}
              <section className="mb-6 rounded-2xl border border-border bg-surface p-6">
                <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-ink">
                  <CheckSquare size={17} className="text-signal" />
                  Action Items
                </h2>
                {summary.actionItems.length === 0 ? (
                  <EmptyState message="No action items identified." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border-soft text-xs font-semibold uppercase tracking-wide text-ink-faint">
                          <th className="pb-2.5 pr-4 font-semibold">Task</th>
                          <th className="pb-2.5 pr-4 font-semibold">Assignee</th>
                          <th className="pb-2.5 pr-4 font-semibold">Deadline</th>
                          <th className="pb-2.5 font-semibold">Priority</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.actionItems.map((item, i) => (
                          <tr key={i} className="border-b border-border-soft last:border-0">
                            <td className="py-3 pr-4 text-ink">{item.task}</td>
                            <td className="py-3 pr-4 text-ink-soft">{orNotSpecified(item.assignee)}</td>
                            <td className="py-3 pr-4 font-mono text-xs text-ink-soft">{orNotSpecified(item.deadline)}</td>
                            <td className="py-3">
                              <PriorityBadge priority={item.priority} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Risks */}
              <section className="mb-6 rounded-2xl border border-border bg-surface p-6">
                <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-ink">
                  <ShieldAlert size={17} className="text-red-500" />
                  Risks
                </h2>
                {summary.risks.length === 0 ? (
                  <EmptyState message="No risks identified." />
                ) : (
                  <ul className="space-y-2.5">
                    {summary.risks.map((risk, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-ink-soft">
                        <ShieldAlert size={16} className="mt-0.5 shrink-0 text-red-500" />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}

          {/* Transcript */}
          <section className="mb-6 rounded-2xl border border-border bg-surface">
            <button
              onClick={() => setTranscriptOpen((v) => !v)}
              className="flex w-full items-center justify-between px-6 py-5 text-left"
            >
              <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
                <ScrollText size={17} className="text-signal" />
                Full Transcript
              </h2>
              {transcriptOpen ? <ChevronUp size={18} className="text-ink-faint" /> : <ChevronDown size={18} className="text-ink-faint" />}
            </button>
            {transcriptOpen && (
              <div className="border-t border-border-soft px-6 py-5">
                {transcript ? (
                  <div className="max-h-[32rem] overflow-y-auto rounded-lg bg-canvas p-4">
                    <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-ink-soft">
                      {transcript}
                    </pre>
                  </div>
                ) : (
                  <ErrorState message="Unable to load the transcript." onRetry={() => refetch()} />
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
