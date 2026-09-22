export default function SkeletonCard({ className = '', lines = 2 }) {
    return (
        <div className={`animate-pulse rounded-3xl border border-slate-200 bg-white p-5 ${className}`}>
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-slate-200" />
                <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-2/3 rounded-full bg-slate-200" />
                    <div className="h-3 w-1/3 rounded-full bg-slate-100" />
                </div>
            </div>

            {Array.from({ length: lines }).map((_, i) => (
                <div key={i} className="mt-4 h-2.5 w-full rounded-full bg-slate-100" />
            ))}
        </div>
    );
}