import { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { CalendarDays, CheckCircle2, Clock3, Inbox, Loader2, Target, XCircle } from 'lucide-react';

import RemajaLayout from '@/Layouts/RemajaLayout';
import { formatDate, formatRupiah } from '@/lib/ayom-theme';

const STATUS_META = {
    open: { label: 'Terbuka', icon: Target, className: 'bg-emerald-50 text-emerald-800 ring-emerald-200' },
    submitted: { label: 'Menunggu review', icon: Clock3, className: 'bg-amber-50 text-amber-800 ring-amber-200' },
    approved: { label: 'Disetujui', icon: CheckCircle2, className: 'bg-green-50 text-green-800 ring-green-200' },
    rejected: { label: 'Ditolak', icon: XCircle, className: 'bg-rose-50 text-rose-700 ring-rose-200' },
};

const FILTERS = [
    { value: 'all', label: 'Semua' },
    { value: 'open', label: 'Terbuka' },
    { value: 'submitted', label: 'Menunggu' },
    { value: 'approved', label: 'Disetujui' },
    { value: 'rejected', label: 'Ditolak' },
];

const EMPTY_TEXT = {
    all: 'Belum ada misi dari orang tua.',
    open: 'Tidak ada misi yang sedang terbuka.',
    submitted: 'Tidak ada misi yang menunggu review.',
    approved: 'Belum ada misi yang disetujui.',
    rejected: 'Tidak ada misi yang ditolak.',
};

function StatusBadge({ status }) {
    const meta = STATUS_META[status] ?? {
        label: status,
        icon: Target,
        className: 'bg-slate-50 text-slate-600 ring-slate-200',
    };
    const Icon = meta.icon;

    return (
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${meta.className}`}>
            <Icon className="h-3.5 w-3.5" />
            {meta.label}
        </span>
    );
}

function TaskCard({ task, onSubmit, submitting }) {
    return (
        <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 text-base font-semibold text-slate-900">{task.title}</h3>
                <StatusBadge status={task.status} />
            </div>

            {task.description && (
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{task.description}</p>
            )}

            {task.status === 'rejected' && task.rejection_reason && (
                <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    Alasan ditolak: {task.rejection_reason}
                </p>
            )}

            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
                <div>
                    <p className="text-lg font-bold tabular-nums text-emerald-700">
                        {formatRupiah(task.reward_amount)}
                    </p>
                    {task.due_date && (
                        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Tenggat {formatDate(task.due_date)}
                        </p>
                    )}
                </div>

                {task.status === 'open' && (
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={() => onSubmit(task)}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Mengirim...
                            </>
                        ) : (
                            'Tandai selesai'
                        )}
                    </button>
                )}
            </div>
        </article>
    );
}

export default function Tasks({ tasks = [] }) {
    const [filter, setFilter] = useState('all');
    const [submittingId, setSubmittingId] = useState(null);

    const counts = useMemo(() => {
        const result = { all: tasks.length, open: 0, submitted: 0, approved: 0, rejected: 0 };
        tasks.forEach((task) => {
            if (result[task.status] !== undefined) result[task.status] += 1;
        });
        return result;
    }, [tasks]);

    const visible = useMemo(
        () => (filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)),
        [tasks, filter],
    );

    function handleSubmit(task) {
        setSubmittingId(task.id);
        router.put(
            route('remaja.tasks.submit', task.id),
            {},
            { preserveScroll: true, onFinish: () => setSubmittingId(null) },
        );
    }

    return (
        <RemajaLayout>
            <Head title="Misi Saya" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Misi Saya</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Selesaikan misi untuk mendapatkan uang saku tambahan.
                    </p>
                </div>

                <div
                    role="tablist"
                    aria-label="Filter misi"
                    className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
                >
                    {FILTERS.map((item) => {
                        const active = filter === item.value;
                        return (
                            <button
                                key={item.value}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => setFilter(item.value)}
                                className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition duration-200 ${
                                    active
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700'
                                }`}
                            >
                                {item.label}
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                                        active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                                    }`}
                                >
                                    {counts[item.value]}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {visible.length ? (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {visible.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onSubmit={handleSubmit}
                                submitting={submittingId === task.id}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
                        <Inbox className="h-8 w-8 text-slate-300" />
                        <p className="mt-3 text-sm text-slate-500">{EMPTY_TEXT[filter]}</p>
                    </div>
                )}
            </div>
        </RemajaLayout>
    );
}