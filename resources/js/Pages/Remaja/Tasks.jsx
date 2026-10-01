// resources/js/Pages/Remaja/Tasks.jsx
import { useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { CalendarDays, CheckCircle2, Clock3, Inbox, Loader2, Target, XCircle } from "lucide-react";

import RemajaLayout from "@/Layouts/RemajaLayout";
import { formatDate, formatRupiah } from "@/lib/ayom-theme";

const STATUS_META = {
    open: { label: "Terbuka", icon: Target, pil: "bg-emerald-100 text-emerald-900 ring-emerald-300", kartu: "bg-white ring-emerald-900/15", ikon: "bg-emerald-100 text-emerald-800" },
    submitted: { label: "Menunggu review", icon: Clock3, pil: "bg-amber-100 text-amber-900 ring-amber-300", kartu: "bg-amber-50 ring-amber-200", ikon: "bg-amber-100 text-amber-800" },
    approved: { label: "Disetujui", icon: CheckCircle2, pil: "bg-green-100 text-green-900 ring-green-300", kartu: "bg-emerald-50 ring-emerald-200", ikon: "bg-emerald-200 text-emerald-900" },
    rejected: { label: "Ditolak", icon: XCircle, pil: "bg-rose-100 text-rose-800 ring-rose-300", kartu: "bg-rose-50 ring-rose-200", ikon: "bg-rose-100 text-rose-700" },
};

const FALLBACK_META = {
    label: "",
    icon: Target,
    pil: "bg-slate-100 text-slate-700 ring-slate-300",
    kartu: "bg-white ring-slate-200",
    ikon: "bg-slate-100 text-slate-700",
};

const FILTERS = [
    { value: "all", label: "Semua" },
    { value: "open", label: "Terbuka" },
    { value: "submitted", label: "Menunggu" },
    { value: "approved", label: "Disetujui" },
    { value: "rejected", label: "Ditolak" },
];

const EMPTY_TEXT = {
    all: "Belum ada misi dari orang tua.",
    open: "Tidak ada misi yang sedang terbuka.",
    submitted: "Tidak ada misi yang menunggu review.",
    approved: "Belum ada misi yang disetujui.",
    rejected: "Tidak ada misi yang ditolak.",
};

function TaskCard({ task, onSubmit, submitting }) {
    const meta = STATUS_META[task.status] ?? { ...FALLBACK_META, label: task.status };
    const Icon = meta.icon;

    return (
        <article
            className={`flex h-full flex-col rounded-bl-3xl rounded-br-3xl rounded-tl-3xl rounded-tr-[3rem] p-5 ring-1 sm:p-7 ${meta.kartu}`}
        >
            <div className="flex items-start gap-4">
                <span
                    aria-hidden="true"
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${meta.ikon}`}
                >
                    <Icon className="h-7 w-7" />
                </span>

                <div className="min-w-0 flex-1">
                    <h3 className="break-words font-heading text-2xl leading-snug text-slate-900">
                        {task.title}
                    </h3>
                    <span
                        className={`mt-1.5 inline-flex rounded-full px-3 py-1 text-sm font-semibold ring-1 ${meta.pil}`}
                    >
                        {meta.label}
                    </span>
                </div>
            </div>

            {task.description && (
                <p className="mt-4 text-base leading-relaxed text-slate-600">{task.description}</p>
            )}

            {task.status === "rejected" && task.rejection_reason && (
                <p className="mt-4 rounded-2xl bg-rose-100 px-4 py-3 text-base text-rose-800">
                    Alasan ditolak: {task.rejection_reason}
                </p>
            )}

            <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-slate-900/10 pt-5 mt-5">
                <div>
                    <p className="text-3xl font-extrabold tracking-tight tabular-nums text-emerald-800">
                        {formatRupiah(task.reward_amount)}
                    </p>
                    {task.due_date && (
                        <p className="mt-1 inline-flex items-center gap-1.5 text-base text-slate-500">
                            <CalendarDays className="h-4 w-4" />
                            Tenggat {formatDate(task.due_date)}
                        </p>
                    )}
                </div>

                {task.status === "open" && (
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={() => onSubmit(task)}
                        className="inline-flex h-14 cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-800 px-7 text-lg font-bold text-white transition hover:bg-emerald-700 active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Mengirim...
                            </>
                        ) : (
                            "Tandai selesai"
                        )}
                    </button>
                )}
            </div>
        </article>
    );
}

export default function Tasks({ tasks = [] }) {
    const [filter, setFilter] = useState("all");
    const [submittingId, setSubmittingId] = useState(null);

    const counts = useMemo(() => {
        const result = { all: tasks.length, open: 0, submitted: 0, approved: 0, rejected: 0 };
        tasks.forEach((task) => {
            if (result[task.status] !== undefined) result[task.status] += 1;
        });
        return result;
    }, [tasks]);

    const visible = useMemo(
        () => (filter === "all" ? tasks : tasks.filter((task) => task.status === filter)),
        [tasks, filter],
    );

    function handleSubmit(task) {
        setSubmittingId(task.id);
        router.put(
            route("remaja.tasks.submit", task.id),
            {},
            { preserveScroll: true, onFinish: () => setSubmittingId(null) },
        );
    }

    return (
        <RemajaLayout>
            <Head title="Misi Saya" />

            <div className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6">
                {/* RINGKASAN */}
                <section className="relative overflow-hidden rounded-bl-3xl rounded-br-[3.5rem] rounded-tl-[3.5rem] rounded-tr-3xl bg-emerald-800 px-6 py-8 text-white sm:px-10 sm:py-10">
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 400 400"
                        className="pointer-events-none absolute -bottom-28 -right-28 h-[24rem] w-[24rem] text-emerald-600/40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="200" cy="200" r="60" />
                        <circle cx="200" cy="200" r="110" />
                        <circle cx="200" cy="200" r="160" />
                        <circle cx="200" cy="200" r="195" />
                    </svg>

                    <h1 className="relative font-heading text-3xl sm:text-4xl">Misi Saya</h1>
                    <p className="relative mt-2 text-lg text-emerald-200">
                        Selesaikan misi untuk mendapatkan uang saku tambahan.
                    </p>

                    <dl className="relative mt-6 grid grid-cols-3 gap-x-4">
                        <div>
                            <dt className="text-base text-emerald-200 sm:text-lg">Terbuka</dt>
                            <dd className="text-4xl font-extrabold sm:text-5xl">{counts.open}</dd>
                        </div>
                        <div>
                            <dt className="text-base text-emerald-200 sm:text-lg">Menunggu</dt>
                            <dd className="text-4xl font-extrabold sm:text-5xl">{counts.submitted}</dd>
                        </div>
                        <div>
                            <dt className="text-base text-emerald-200 sm:text-lg">Disetujui</dt>
                            <dd className="text-4xl font-extrabold sm:text-5xl">{counts.approved}</dd>
                        </div>
                    </dl>
                </section>

                {/* FILTER */}
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
                                className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-5 py-3 text-base font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400 ${
                                    active
                                        ? "bg-emerald-800 text-white"
                                        : "bg-white text-slate-700 ring-1 ring-emerald-900/15 hover:ring-emerald-700"
                                }`}
                            >
                                {item.label}
                                <span
                                    className={`rounded-full px-2.5 py-0.5 text-sm tabular-nums ${
                                        active ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-900"
                                    }`}
                                >
                                    {counts[item.value]}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* DAFTAR MISI */}
                {visible.length ? (
                    <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2">
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
                    <section className="flex flex-col items-center gap-3 rounded-3xl bg-emerald-50 px-6 py-14 text-center">
                        <Inbox className="h-14 w-14 text-emerald-600" />
                        <p className="text-lg text-slate-600">{EMPTY_TEXT[filter]}</p>
                    </section>
                )}
            </div>
        </RemajaLayout>
    );
}

