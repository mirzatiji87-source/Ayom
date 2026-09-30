import { useMemo, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    Inbox,
    Loader2,
    Target,
    XCircle,
} from "lucide-react";

import OrangTuaLayout from "@/Layouts/OrangTuaLayout";
import CreateTaskDialog from "@/Components/OrangTua/CreateTaskDialog";
import {
    formatDate,
    formatDateTime,
    formatRupiah,
    initials,
} from "@/lib/ayom-theme";

const STATUS_META = {
    open: {
        label: "Berjalan",
        icon: Target,
        className:
            "bg-[var(--ayom-primary)]/10 text-[var(--ayom-primary)] ring-[var(--ayom-primary)]/20",
    },
    submitted: {
        label: "Perlu direview",
        icon: Clock3,
        className: "bg-amber-50 text-amber-800 ring-amber-200",
    },
    approved: {
        label: "Selesai",
        icon: CheckCircle2,
        className: "bg-green-50 text-green-800 ring-green-200",
    },
    rejected: {
        label: "Ditolak",
        icon: XCircle,
        className: "bg-rose-50 text-rose-700 ring-rose-200",
    },
};

const FILTERS = [
    { value: "submitted", label: "Perlu direview" },
    { value: "open", label: "Berjalan" },
    { value: "approved", label: "Selesai" },
    { value: "rejected", label: "Ditolak" },
    { value: "all", label: "Semua" },
];

const EMPTY_TEXT = {
    submitted: "Tidak ada misi yang menunggu keputusanmu.",
    open: "Tidak ada misi yang sedang dikerjakan.",
    approved: "Belum ada misi yang selesai.",
    rejected: "Tidak ada misi yang ditolak.",
    all: "Belum ada misi. Buat misi pertama untuk anak.",
};

function StatusBadge({ status }) {
    const meta = STATUS_META[status] ?? {
        label: status,
        icon: Target,
        className: "bg-slate-50 text-slate-600 ring-slate-200",
    };

    const Icon = meta.icon;

    return (
        <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${meta.className}`}
        >
            <Icon className="h-3.5 w-3.5" />
            {meta.label}
        </span>
    );
}

export default function Tasks({ tasks = [], dependents = [] }) {
    const { flash } = usePage().props;

    const [filter, setFilter] = useState(() =>
        tasks.some((task) => task.status === "submitted") ? "submitted" : "all",
    );

    const [busyId, setBusyId] = useState(null);
    const [rejectingId, setRejectingId] = useState(null);
    const [reason, setReason] = useState("");

    const counts = useMemo(() => {
        const result = {
            all: tasks.length,
            open: 0,
            submitted: 0,
            approved: 0,
            rejected: 0,
        };

        tasks.forEach((task) => {
            if (result[task.status] !== undefined) {
                result[task.status] += 1;
            }
        });

        return result;
    }, [tasks]);

    const visible = useMemo(
        () =>
            filter === "all"
                ? tasks
                : tasks.filter((task) => task.status === filter),
        [tasks, filter],
    );

    function approve(task) {
        setBusyId(task.id);

        router.put(
            route("tasks.approve", task.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setBusyId(null),
            },
        );
    }

    function reject(task) {
        setBusyId(task.id);

        router.put(
            route("tasks.reject", task.id),
            {
                reason: reason.trim() || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRejectingId(null);
                    setReason("");
                },
                onFinish: () => setBusyId(null),
            },
        );
    }

    return (
        <OrangTuaLayout
            title="Misi"
            subtitle="Buat, tugaskan, dan tinjau misi anak"
        >
            <Head title="Misi" />

            <div className="mx-auto max-w-4xl space-y-6">
                {flash?.success && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                        {flash.error}
                    </div>
                )}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div
                        role="tablist"
                        aria-label="Filter misi"
                        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
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
                                            ? "bg-[var(--ayom-primary)] text-white shadow-sm"
                                            : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800"
                                    }`}
                                >
                                    {item.label}

                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                                            active
                                                ? "bg-white/20 text-white"
                                                : "bg-slate-100 text-slate-600"
                                        }`}
                                    >
                                        {counts[item.value]}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <CreateTaskDialog dependents={dependents} />
                </div>

                {visible.length ? (
                    <div className="space-y-4">
                        {visible.map((task) => (
                            <article
                                key={task.id}
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:shadow-md"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-xs font-bold text-white">
                                            {initials(task.assignee?.name)}
                                        </span>

                                        <div className="min-w-0">
                                            <h3 className="truncate font-semibold text-slate-900">
                                                {task.title}
                                            </h3>

                                            <p className="text-sm text-slate-500">
                                                {task.assignee?.name ?? "—"}
                                            </p>
                                        </div>
                                    </div>

                                    <StatusBadge status={task.status} />
                                </div>

                                {task.description && (
                                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                        {task.description}
                                    </p>
                                )}

                                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                                    <span className="font-bold tabular-nums text-slate-900">
                                        {formatRupiah(task.reward_amount)}
                                    </span>

                                    {task.due_date && (
                                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                                            <CalendarDays className="h-4 w-4" />
                                            Tenggat {formatDate(task.due_date)}
                                        </span>
                                    )}

                                    {task.submitted_at && (
                                        <span className="text-slate-500">
                                            Dikirim{" "}
                                            {formatDateTime(task.submitted_at)}
                                        </span>
                                    )}
                                </div>

                                {task.status === "rejected" &&
                                    task.rejection_reason && (
                                        <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                                            Alasan: {task.rejection_reason}
                                        </p>
                                    )}

                                {task.status === "submitted" && (
                                    <div className="mt-5 border-t border-slate-100 pt-4">
                                        {rejectingId === task.id ? (
                                            <div className="space-y-3">
                                                <label
                                                    htmlFor={`reason-${task.id}`}
                                                    className="block text-sm font-medium text-slate-700"
                                                >
                                                    Alasan penolakan (opsional)
                                                </label>

                                                <input
                                                    id={`reason-${task.id}`}
                                                    value={reason}
                                                    onChange={(e) =>
                                                        setReason(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Contoh: Kamar belum rapi"
                                                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[var(--ayom-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ayom-primary)]/10"
                                                />

                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            busyId === task.id
                                                        }
                                                        onClick={() =>
                                                            reject(task)
                                                        }
                                                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        {busyId === task.id && (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        )}
                                                        Kirim penolakan
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setRejectingId(
                                                                null,
                                                            );
                                                            setReason("");
                                                        }}
                                                        className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition duration-200 hover:bg-slate-50"
                                                    >
                                                        Batal
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        busyId === task.id
                                                    }
                                                    onClick={() =>
                                                        approve(task)
                                                    }
                                                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--ayom-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-[var(--ayom-primary-dark)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {busyId === task.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    )}
                                                    Setujui
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setRejectingId(task.id)
                                                    }
                                                    className="cursor-pointer rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 transition duration-200 hover:bg-rose-50"
                                                >
                                                    Tolak
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
                        <Inbox className="h-8 w-8 text-slate-300" />

                        <p className="mt-3 text-sm text-slate-500">
                            {EMPTY_TEXT[filter]}
                        </p>
                    </div>
                )}
            </div>
        </OrangTuaLayout>
    );
}
