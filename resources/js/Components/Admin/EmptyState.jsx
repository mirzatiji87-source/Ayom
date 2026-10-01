import { AyomMark } from "@/Layouts/AdminLayout";

export default function EmptyState({ title, description, action = null }) {
    return (
        <div className="flex min-h-[190px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--ayom-border)] bg-[var(--ayom-surface)] px-6 py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ayom-primary)]/[0.06]">
                <AyomMark size={30} className="opacity-75" />
            </div>

            <div className="max-w-md space-y-1.5">
                <p className="text-sm font-semibold text-[var(--ayom-ink)]">
                    {title}
                </p>

                {description ? (
                    <p className="text-sm leading-relaxed text-[var(--ayom-muted)]">
                        {description}
                    </p>
                ) : null}
            </div>

            {action ? <div className="mt-4">{action}</div> : null}
        </div>
    );
}
