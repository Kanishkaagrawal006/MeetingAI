import type { Priority } from '../types/meeting';

const CONFIG: Record<Priority, string> = {
  HIGH: 'bg-risk-soft text-red-700',
  MEDIUM: 'bg-amber-soft text-amber-700',
  LOW: 'bg-border-soft text-ink-soft',
};

export default function PriorityBadge({ priority }: { priority: Priority | null | undefined }) {
  const value = priority ?? 'LOW';
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold tracking-wide ${CONFIG[value]}`}
    >
      {value}
    </span>
  );
}
