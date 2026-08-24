import { Link, Outlet } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="waveform text-signal">
              <span className="waveform-bar" />
              <span className="waveform-bar" />
              <span className="waveform-bar" />
              <span className="waveform-bar" />
              <span className="waveform-bar" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-ink">MeetingAI</span>
          </Link>
          <Link
            to="/meetings/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-signal px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-signal-dark"
          >
            <Plus size={16} strokeWidth={2.5} />
            New Meeting
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
