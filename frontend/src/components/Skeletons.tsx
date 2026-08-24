export function MeetingCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-3 h-4 w-2/5 rounded skeleton" />
      <div className="mb-4 h-3 w-1/4 rounded skeleton" />
      <div className="mb-2 h-3 w-full rounded skeleton" />
      <div className="mb-4 h-3 w-3/4 rounded skeleton" />
      <div className="h-3 w-1/2 rounded skeleton" />
    </div>
  );
}

export function BlockSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3.5 rounded skeleton" style={{ width: `${95 - i * 12}%` }} />
      ))}
    </div>
  );
}
