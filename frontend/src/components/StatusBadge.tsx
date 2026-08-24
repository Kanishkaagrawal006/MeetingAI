import { CheckCircle2, Loader2, XCircle, UploadCloud } from 'lucide-react';
import type { MeetingStatus } from '../types/meeting';

const CONFIG: Record<MeetingStatus, { label: string; className: string; icon: React.ReactNode }> = {
  UPLOADED: {
    label: 'Uploaded',
    className: 'bg-signal-soft text-signal-dark',
    icon: <UploadCloud size={13} strokeWidth={2.5} />,
  },
  UPLOADING: {
    label: 'Uploading',
    className: 'bg-signal-soft text-signal-dark',
    icon: <Loader2 size={13} strokeWidth={2.5} className="animate-spin" />,
  },
  TRANSCRIBING: {
    label: 'Transcribing',
    className: 'bg-amber-soft text-amber-700',
    icon: <Loader2 size={13} strokeWidth={2.5} className="animate-spin" />,
  },
  SUMMARIZING: {
    label: 'Summarizing',
    className: 'bg-amber-soft text-amber-700',
    icon: <Loader2 size={13} strokeWidth={2.5} className="animate-spin" />,
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-success-soft text-green-700',
    icon: <CheckCircle2 size={13} strokeWidth={2.5} />,
  },
  FAILED: {
    label: 'Failed',
    className: 'bg-risk-soft text-red-700',
    icon: <XCircle size={13} strokeWidth={2.5} />,
  },
};

export default function StatusBadge({ status }: { status: MeetingStatus }) {
  const cfg = CONFIG[status] ?? CONFIG.UPLOADED;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${cfg.className}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}
