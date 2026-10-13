import {
    AlertCircle,
    CheckCircle2,
    Circle,
    ExternalLink,
    Loader2,
    ShieldAlert,
} from "lucide-react";

import { formatDate, formatRupiah } from "@/lib/ayom-theme";
import { TONES } from "@/lib/status-tones";

const CARD = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm";

const VERIFICATION_UI = {
    pending: {
        label: "Menunggu verifikasi",
        tone: "warning",
    },
    verified: {
        label: "Terverifikasi admin",
        tone: "success",
    },
    rejected: {
        label: "Laporan ditolak",
        tone: "danger",
    },
};

const BPJS_UI = {
    not_reported: {
        label: "Belum dicatat keluarga",
        tone: "neutral",
    },
    reported_by_family: {
        label: "Sudah dilaporkan keluarga",
        tone: "info",
    },
    confirmed_by_family: {
        label: "Konfirmasi dicatat keluarga",
        tone: "success",
    },
};

function verificationKey(report) {
    return report?.verification_status ?? "pending";
}

function bpjsKey(report) {
    return report?.bpjs_report_status ?? "not_reported";
}

function memberName(report) {
    return (
        report?.subject?.name ??
        report?.member_user?.name ??
        report?.memberUser?.name ??
        "Anggota keluarga"
    );
}

function eventDate(report) {
    return report?.reported_death_date ?? null;
}

function Pill({ children, tone = "neutral", className = "" }) {
    const toneClass = TONES[tone] ?? TONES.neutral;

    return (
        <span
            className={[
                "inline-flex max-w-full items-center rounded-full px-2.5 py-1",
                "text-xs font-semibold ring-1 ring-inset",
                toneClass,
                className,
            ].join(" ")}
        >
            {children}
        </span>
    );
}

function Fact({ label, value, children }) {
    return (
        <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <div className="mt-1 break-words text-sm font-medium text-slate-800">
                {children ?? value ?? "—"}
            </div>
        </div>
    );
}

function ErrorList({ errors }) {
    const messages = Array.isArray(errors)
        ? errors
        : Object.values(errors ?? {}).flat();

    if (!messages.length) return null;

    return (
        <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
        >
            <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <ul className="list-inside list-disc space-y-1">
                    {messages.map((message, index) => (
                        <li key={`${index}-${message}`}>{message}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function ActionButton({
    children,
    onClick,
    type = "button",
    variant = "primary",
    disabled = false,
    processing = false,
    className = "",
}) {
    const variants = {
        primary:
            "bg-teal-800 text-white hover:bg-teal-900 focus-visible:ring-teal-700",
        secondary:
            "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400",
        danger: "bg-rose-700 text-white hover:bg-rose-800 focus-visible:ring-rose-600",
        success:
            "bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-600",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || processing}
            className={[
                "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5",
                "text-sm font-semibold transition focus:outline-none focus-visible:ring-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                variants[variant] ?? variants.primary,
                className,
            ].join(" ")}
        >
            {processing && <Loader2 className="h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
}

function OfficialChannelCard() {
    return (
        <section className={`${CARD} border-sky-200 bg-sky-50/70`}>
            <div className="flex items-start gap-3">
                <div className="rounded-xl bg-sky-100 p-2 text-sky-800">
                    <ShieldAlert className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">
                        Informasi penting tentang BPJS Kesehatan
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                        Ayom hanya mencatat tindak lanjut yang dilaporkan
                        keluarga. Pencatatan ini bukan pengajuan resmi dan bukan
                        bukti bahwa kepesertaan sudah dinonaktifkan. Hubungi
                        kanal resmi BPJS untuk proses dan konfirmasi
                        administrasi.
                    </p>

                    <a
                        href="https://www.bpjs-kesehatan.go.id/"
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-sky-800 underline underline-offset-4"
                    >
                        Buka situs resmi BPJS Kesehatan
                        <ExternalLink className="h-4 w-4" />
                    </a>
                </div>
            </div>
        </section>
    );
}

function Timeline({ report }) {
    const verificationStatus = verificationKey(report);
    const bpjsStatus = bpjsKey(report);

    const steps = [
        {
            title: "Laporan dibuat",
            description: report?.created_at
                ? formatDate(report.created_at)
                : "Tanggal tidak tersedia",
            done: true,
        },
        {
            title: "Verifikasi admin",
            description:
                verificationStatus === "pending"
                    ? "Menunggu pemeriksaan admin"
                    : report?.verified_at
                      ? formatDate(report.verified_at)
                      : (VERIFICATION_UI[verificationStatus]?.label ??
                        "Status tidak diketahui"),
            done: verificationStatus === "verified",
            rejected: verificationStatus === "rejected",
        },
        {
            title: "Tindak lanjut BPJS oleh keluarga",
            description: BPJS_UI[bpjsStatus]?.label ?? "Status tidak diketahui",
            done: bpjsStatus !== "not_reported",
        },
    ];

    return (
        <ol className="space-y-4">
            {steps.map((step, index) => (
                <li key={step.title} className="flex gap-3">
                    <div className="flex flex-col items-center">
                        {step.rejected ? (
                            <AlertCircle className="h-5 w-5 text-rose-600" />
                        ) : step.done ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : (
                            <Circle className="h-5 w-5 text-slate-300" />
                        )}

                        {index < steps.length - 1 && (
                            <div className="mt-1 min-h-5 w-px flex-1 bg-slate-200" />
                        )}
                    </div>

                    <div className="pb-2">
                        <p className="text-sm font-semibold text-slate-800">
                            {step.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            {step.description}
                        </p>
                    </div>
                </li>
            ))}
        </ol>
    );
}

function ReportSummary({ report }) {
    const verification = VERIFICATION_UI[verificationKey(report)] ?? {
        label: "Status tidak diketahui",
        tone: "neutral",
    };

    const bpjs = BPJS_UI[bpjsKey(report)] ?? {
        label: "Status tidak diketahui",
        tone: "neutral",
    };

    return (
        <section className={CARD}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Laporan perubahan status anggota
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-slate-900">
                        {memberName(report)}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Tanggal peristiwa:{" "}
                        {eventDate(report)
                            ? formatDate(eventDate(report))
                            : "Belum dicantumkan"}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Pill tone={verification.tone}>{verification.label}</Pill>
                    <Pill tone={bpjs.tone}>{bpjs.label}</Pill>
                </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Fact label="Pelapor" value={report?.reporter?.name} />
                <Fact
                    label="Tanggal laporan"
                    value={
                        report?.created_at ? formatDate(report.created_at) : "—"
                    }
                />
                <Fact
                    label="Catatan laporan"
                    value={report?.report_note || "Tidak ada catatan."}
                />
                <Fact
                    label="Catatan verifikasi"
                    value={report?.verification_note || "Belum ada catatan."}
                />
                <Fact label="Bukti pendukung">
                    {report?.has_evidence ? (
                        <span className="text-emerald-700">
                            Bukti tersedia untuk pengguna berwenang
                        </span>
                    ) : (
                        "Tidak dilampirkan"
                    )}
                </Fact>
            </div>
        </section>
    );
}

function FollowUpList({ items = [], busyId = null, onComplete }) {
    if (!items.length) {
        return (
            <div className={`${CARD} text-sm text-slate-500`}>
                Belum ada tindak lanjut.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {items.map((item) => {
                const completed = item.status === "completed";

                return (
                    <article key={item.id} className={CARD}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-semibold text-slate-900">
                                        {item.title}
                                    </h3>
                                    <Pill
                                        tone={completed ? "success" : "warning"}
                                    >
                                        {completed ? "Selesai" : "Menunggu"}
                                    </Pill>
                                </div>

                                {item.description && (
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        {item.description}
                                    </p>
                                )}

                                {item.completion_note && (
                                    <p className="mt-2 text-sm text-slate-500">
                                        Catatan: {item.completion_note}
                                    </p>
                                )}
                            </div>

                            {!completed && onComplete && (
                                <ActionButton
                                    variant="secondary"
                                    disabled={busyId === item.id}
                                    processing={busyId === item.id}
                                    onClick={() => onComplete(item)}
                                    className="shrink-0"
                                >
                                    Tandai selesai
                                </ActionButton>
                            )}
                        </div>
                    </article>
                );
            })}
        </div>
    );
}

function BillList({ bills = [], onResolve, busyId = null }) {
    if (!bills.length) {
        return (
            <div className={`${CARD} text-sm text-slate-500`}>
                Tidak ada tagihan terkait anggota ini.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {bills.map((bill) => (
                <article key={bill.id} className={CARD}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <h3 className="font-semibold text-slate-900">
                                {bill.name}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                {bill.category || "Tagihan"} ·{" "}
                                {bill.frequency || "Frekuensi tidak tersedia"}
                            </p>
                            <p className="mt-2 text-lg font-bold text-slate-900">
                                {formatRupiah(bill.amount)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                Jatuh tempo:{" "}
                                {bill.next_due_date
                                    ? formatDate(bill.next_due_date)
                                    : "—"}
                            </p>
                            <div className="mt-2">
                                <Pill
                                    tone={
                                        bill.schedule_status === "dihentikan"
                                            ? "danger"
                                            : bill.schedule_status ===
                                                "perlu_ditinjau"
                                              ? "warning"
                                              : "neutral"
                                    }
                                >
                                    {bill.schedule_status === "dihentikan"
                                        ? "Dihentikan"
                                        : bill.schedule_status ===
                                            "perlu_ditinjau"
                                          ? "Perlu ditinjau"
                                          : "Normal"}
                                </Pill>
                            </div>
                        </div>

                        {onResolve &&
                            bill.schedule_status === "perlu_ditinjau" && (
                                <div className="flex shrink-0 flex-wrap gap-2">
                                    <ActionButton
                                        variant="danger"
                                        disabled={busyId === bill.id}
                                        processing={busyId === bill.id}
                                        onClick={() =>
                                            onResolve(bill, "dihentikan")
                                        }
                                    >
                                        Hentikan
                                    </ActionButton>
                                    <ActionButton
                                        variant="secondary"
                                        disabled={busyId === bill.id}
                                        onClick={() =>
                                            onResolve(bill, "lanjut")
                                        }
                                    >
                                        Lanjutkan
                                    </ActionButton>
                                </div>
                            )}
                    </div>
                </article>
            ))}
        </div>
    );
}

function PendingTransactionList({ transactions = [] }) {
    if (!transactions.length) {
        return (
            <div className={`${CARD} text-sm text-slate-500`}>
                Tidak ada transaksi tertunda.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {transactions.map((transaction) => (
                <article
                    key={transaction.id}
                    className="rounded-xl border border-amber-200 bg-amber-50/70 p-4"
                >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="font-semibold text-slate-900">
                                {transaction.description ||
                                    `Transaksi #${transaction.id}`}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                {transaction.created_at
                                    ? formatDate(transaction.created_at)
                                    : "Tanggal tidak tersedia"}
                            </p>
                        </div>
                        <p className="font-bold text-slate-900">
                            {formatRupiah(transaction.amount)}
                        </p>
                    </div>
                </article>
            ))}
        </div>
    );
}

export {
    verificationKey,
    bpjsKey,
    VERIFICATION_UI,
    BPJS_UI,
    memberName,
    eventDate,
    Pill,
    Fact,
    ErrorList,
    ActionButton,
    OfficialChannelCard,
    Timeline,
    ReportSummary,
    FollowUpList,
    BillList,
    PendingTransactionList,
};
