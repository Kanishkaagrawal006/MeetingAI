import { Link } from 'react-router-dom';
import { Plus, FileAudio } from 'lucide-react';
import { useMeetingsList } from '../hooks/useMeetings';
import MeetingCard from '../components/MeetingCard';
import { MeetingCardSkeleton } from '../components/Skeletons';
import ConnectionError from '../components/ConnectionError';

export default function Dashboard() {
  const { data: meetings, isLoading, isError, refetch } = useMeetingsList();

  return (
    <div>
      <section className="mb-10">
        <div className="mb-1 flex items-center gap-2.5">
          <span className="waveform text-signal">
            <span className="waveform-bar" />
            <span className="waveform-bar" />
            <span className="waveform-bar" />
            <span className="waveform-bar" />
            <span className="waveform-bar" />
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">MeetingAI</h1>
        </div>
        <p className="mb-5 max-w-xl text-sm text-ink-soft">
          Turn meeting recordings into transcripts, summaries, decisions and actionable tasks.
        </p>
        <Link
          to="/meetings/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-signal px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-signal-dark"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Meeting
        </Link>
      </section>

      <section>
        <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-ink-faint">
          Recent Meetings
        </h2>

        {isError ? (
          <ConnectionError onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <MeetingCardSkeleton key={i} />
            ))}
          </div>
        ) : !meetings || meetings.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-8 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-signal-soft text-signal">
              <FileAudio size={22} />
            </div>
            <div className="space-y-1">
              <p className="font-display text-base font-semibold text-ink">No meetings yet</p>
              <p className="text-sm text-ink-soft">Upload a recording to get your first transcript and summary.</p>
            </div>
            <Link
              to="/meetings/new"
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-signal px-4 py-2 text-sm font-semibold text-white transition hover:bg-signal-dark"
            >
              <Plus size={15} strokeWidth={2.5} />
              New Meeting
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {meetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
