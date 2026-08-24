import type { ReactNode } from 'react';

export default function EmptyState({
  icon,
  message,
}: {
  icon?: ReactNode;
  message: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-canvas/60 px-4 py-3 text-sm text-ink-faint">
      {icon}
      <span>{message}</span>
    </div>
  );
}
