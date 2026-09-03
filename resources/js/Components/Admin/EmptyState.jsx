import { AyomMark } from '@/Layouts/AdminLayout';

export default function EmptyState({ title, description, action = null }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--ayom-border)] px-6 py-14 text-center">
      <div className="opacity-40">
        <AyomMark size={28} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[var(--ayom-ink)]">{title}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-sm text-[var(--ayom-muted)]">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
