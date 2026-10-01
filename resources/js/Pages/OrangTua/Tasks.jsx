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
    EmptyState,
    FlashMessage,
    InitialsAvatar,
    Panel,
    SHAPE_CARD,
    SHAPE_CARD_ALT,
    btnDanger,
    btnDangerOutline,
    btnOutline,
    btnPrimary,
} from "@/Components/OrangTua/ui";
import { formatDate, formatDateTime, formatRupiah } from "@/lib/ayom-theme";

const STATUS_META = {
    open: {
        label: "Berjalan",
        icon: Target,
        className:
            "bg-[var(--ayom-primary-soft)] text-[var(--ayom-primary)] ring-[var(--ayom-primary-line)]",
    },
    submitted: {
        label: "Perlu direview",
        icon: Clock3,
        className: "bg-amber-100 text-amber-900 ring-amber-300",
    },
    approved: {
        label: "Selesai",
        icon: CheckCircle2,
        className: "bg-emerald-100 text-emerald-900 ring-emerald-300",
    },
    rejected: {
        label: "Ditolak",
        icon: XCircle,
        className: "bg-red-100 text-red-800 ring-red-300",
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
        className: "bg-slate-100 text-slate-700 ring-slate-300",
    };

    const Icon = meta.icon;

    return (
        <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ring-1 ${meta.className}`}
        >
            <Icon className="h-4 w-4" />
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
            { reason: reason.trim() || null },
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

            <div className="mx-auto w-full max-w-6xl space-y-6 sm:space-y-8">
                <FlashMessage type="success">{flash?.success}</FlashMessage>

                <FlashMessage type="error">{flash?.error}</FlashMessage>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div
                        role="tablist"
                        aria-label="Filter misi"
                        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
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
                                    className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-base font-semibold transition-colors duration-200 ${
                                        active
                                            ? "bg-[var(--ayom-primary)] text-white"
                                            : "bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
                                    }`}
                                >
                                    {item.label}

                                    <span
                                        className={`rounded-full px-2 py-0.5 text-sm tabular-nums ${
                                            active
                                                ? "bg-white/20 text-white"
                                                : "bg-slate-100 text-slate-700"
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
                    <div className="grid items-start gap-5 sm:gap-6 lg:grid-cols-2">
                        {visible.map((task, i) => (
                            <article
                                key={task.id}
                                className={`flex flex-col p-5 ring-1 transition-shadow duration-200 hover:shadow-md sm:p-7 ${
                                    task.status === "submitted"
                                        ? "bg-amber-50 ring-amber-200"
                                        : "bg-white ring-slate-200"
                                } ${i % 2 === 0 ? SHAPE_CARD : SHAPE_CARD_ALT}`}
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <InitialsAvatar
                                            name={task.assignee?.name}
                                            className="h-12 w-12 text-sm"
                                        />

                                        <div className="min-w-0">
                                            <h3 className="break-words text-lg font-semibold leading-snug text-slate-900">
                                                {task.title}
                                            </h3>

                                            <p className="text-base text-slate-600">
                                                {task.assignee?.name ?? "—"}
                                            </p>
                                        </div>
                                    </div>

                                    <StatusBadge status={task.status} />
                                </div>

                                {task.description && (
                                    <p className="mt-4 text-base leading-relaxed text-slate-700">
                                        {task.description}
                                    </p>
                                )}

                                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-base">
                                    <span className="text-xl font-extrabold tabular-nums text-slate-900">
                                        {formatRupiah(task.reward_amount)}
                                    </span>

                                    {task.due_date && (
                                        <span className="inline-flex items-center gap-1.5 text-slate-600">
                                            <CalendarDays className="h-4 w-4" />
                                            Tenggat {formatDate(task.due_date)}
                                        </span>
                                    )}

                                    {task.submitted_at && (
                                        <span className="text-slate-600">
                                            Dikirim{" "}
                                            {formatDateTime(task.submitted_at)}
                                        </span>
                                    )}
                                </div>

                                {task.status === "rejected" &&
                                    task.rejection_reason && (
                                        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-base text-red-800">
                                            Alasan: {task.rejection_reason}
                                        </p>
                                    )}

                                {task.status === "submitted" && (
                                    <div className="mt-5 border-t border-slate-900/10 pt-5">
                                        {rejectingId === task.id ? (
                                            <div className="space-y-3">
                                                <label
                                                    htmlFor={`reason-${task.id}`}
                                                    className="block text-base font-medium text-slate-800"
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
                                                    className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base placeholder:text-slate-500 focus:border-[var(--ayom-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--ayom-primary-line)]"
                                                />

                                                <div className="flex flex-col gap-3 sm:flex-row">
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            busyId === task.id
                                                        }
                                                        onClick={() =>
                                                            reject(task)
                                                        }
                                                        className={`${btnDanger} flex-1`}
                                                    >
                                                        {busyId === task.id && (
                                                            <Loader2 className="h-5 w-5 animate-spin" />
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
                                                        className={btnOutline}
                                                    >
                                                        Batal
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-3 sm:flex-row">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        busyId === task.id
                                                    }
                                                    onClick={() =>
                                                        approve(task)
                                                    }
                                                    className={`${btnPrimary} flex-1`}
                                                >
                                                    {busyId === task.id ? (
                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="h-5 w-5" />
                                                    )}
                                                    Setujui
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setRejectingId(task.id)
                                                    }
                                                    className={`${btnDangerOutline} flex-1`}
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
                    <Panel className="py-6">
                        <EmptyState icon={Inbox}>
                            {EMPTY_TEXT[filter]}
                        </EmptyState>
                    </Panel>
                )}
            </div>
        </OrangTuaLayout>
    );
}
