// resources/js/Components/OrangTua/ui.jsx
import { Link } from "@inertiajs/react";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    CheckCircle2,
} from "lucide-react";

import { Badge } from "@/Components/ui/badge";
import { Label } from "@/Components/ui/label";
import { Progress } from "@/Components/ui/progress";
import { formatRupiah, initials } from "@/lib/ayom-theme";

/* ---------- Bentuk kartu (class ditulis utuh supaya terbaca Tailwind) ---------- */

export const SHAPE_HERO =
    "rounded-bl-3xl rounded-br-[3.5rem] rounded-tl-[3.5rem] rounded-tr-3xl";
export const SHAPE_CARD =
    "rounded-bl-3xl rounded-br-3xl rounded-tl-3xl rounded-tr-[3rem]";
export const SHAPE_CARD_ALT =
    "rounded-bl-[3rem] rounded-br-3xl rounded-tl-3xl rounded-tr-3xl";

/* ---------- Tombol & input ---------- */

const BTN =
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition-colors duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ayom-primary-line)] disabled:cursor-not-allowed disabled:opacity-60";

export const btnPrimary = `${BTN} bg-[var(--ayom-primary)] text-white hover:bg-[var(--ayom-primary-dark)]`;
export const btnOutline = `${BTN} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`;
export const btnDanger = `${BTN} bg-rose-700 text-white hover:bg-rose-800`;
export const btnDangerOutline = `${BTN} border border-rose-300 bg-white text-rose-700 hover:bg-rose-50`;

// Dipasang di <Input>/<SelectTrigger> shadcn: tinggi 48px, teks 16px (tidak memicu zoom di iOS)
export const inputCls = "h-12 rounded-2xl border-slate-300 px-4 text-base";

/* ---------- Label data ---------- */

export const roleLabel = {
    orang_tua: "Orang Tua",
    lansia: "Lansia",
    remaja: "Remaja",
};

export const typeLabel = {
    topup: "Top-up",
    expense: "Pengeluaran",
    transfer: "Transfer",
    bill_payment: "Bayar Tagihan",
    allowance: "Uang Saku",
};

const STATUS = {
    completed: { label: "Selesai", cls: "bg-emerald-100 text-emerald-900" },
    approved: { label: "Disetujui", cls: "bg-emerald-100 text-emerald-900" },
    pending: { label: "Menunggu", cls: "bg-amber-100 text-amber-900" },
    rejected: { label: "Ditolak", cls: "bg-red-100 text-red-800" },
};

export function StatusPill({ status, className = "" }) {
    const meta = STATUS[status] ?? {
        label: status,
        cls: "bg-slate-200 text-slate-800",
    };

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${meta.cls} ${className}`}
        >
            {meta.label}
        </span>
    );
}

/* ---------- Blok tampilan ---------- */

export function Hero({ children, className = "" }) {
    return (
        <section
            className={`relative overflow-hidden bg-[var(--ayom-primary)] px-6 py-8 text-white sm:px-10 sm:py-10 ${SHAPE_HERO} ${className}`}
        >
            <svg
                aria-hidden="true"
                viewBox="0 0 400 400"
                className="pointer-events-none absolute -bottom-28 -right-28 h-[24rem] w-[24rem] text-white/15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            >
                <circle cx="200" cy="200" r="60" />
                <circle cx="200" cy="200" r="110" />
                <circle cx="200" cy="200" r="160" />
                <circle cx="200" cy="200" r="195" />
            </svg>

            <div className="relative">{children}</div>
        </section>
    );
}

/** Wadah daftar/list. Beri `className="py-6"` kalau isinya bukan list. */
export function Panel({ alt = false, className = "", children }) {
    return (
        <div
            className={`bg-slate-50 px-5 ring-1 ring-slate-200 sm:px-8 ${
                alt ? SHAPE_CARD_ALT : SHAPE_CARD
            } ${className}`}
        >
            {children}
        </div>
    );
}

export function SectionHead({ title, desc, href, linkLabel, action }) {
    return (
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
                <h2 className="font-serif text-2xl text-slate-900 sm:text-3xl">
                    {title}
                </h2>
                {desc && (
                    <p className="mt-1 text-sm text-slate-600 sm:text-base">
                        {desc}
                    </p>
                )}
            </div>

            {action ??
                (href && (
                    <Link
                        href={href}
                        className="inline-flex shrink-0 cursor-pointer items-center gap-1 pb-1 text-sm font-semibold text-[var(--ayom-primary)] underline-offset-4 transition-colors duration-200 hover:underline sm:text-base"
                    >
                        {linkLabel ?? "Lihat semua"}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                ))}
        </div>
    );
}

export function EmptyState({ icon: Icon, children }) {
    return (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Icon className="h-10 w-10 text-[var(--ayom-primary)] opacity-60" />
            <p className="max-w-sm text-base text-slate-600">{children}</p>
        </div>
    );
}

const FLASH = {
    success: {
        cls: "bg-emerald-100 text-emerald-900 ring-emerald-300",
        icon: CheckCircle2,
        role: "status",
    },
    error: {
        cls: "bg-red-50 text-red-900 ring-red-300",
        icon: AlertCircle,
        role: "alert",
    },
};

export function FlashMessage({ type = "success", children }) {
    if (!children) return null;

    const { cls, icon: Icon, role } = FLASH[type];

    return (
        <div
            role={role}
            className={`flex items-center gap-3 rounded-3xl px-5 py-4 text-base font-semibold ring-1 ${cls}`}
        >
            <Icon className="h-6 w-6 shrink-0" />
            <span className="min-w-0 break-words">{children}</span>
        </div>
    );
}

export function InitialsAvatar({ name, className = "h-14 w-14 text-base" }) {
    return (
        <span
            aria-hidden="true"
            className={`flex shrink-0 items-center justify-center rounded-full bg-[var(--ayom-primary)] font-bold text-white ${className}`}
        >
            {initials(name)}
        </span>
    );
}

export function RoleBadge({ role, className = "" }) {
    return (
        <Badge
            variant="outline"
            className={`rounded-full border-[var(--ayom-primary-line)] bg-[var(--ayom-primary-soft)] text-[var(--ayom-primary)] ${className}`}
        >
            {roleLabel[role] ?? role}
        </Badge>
    );
}

export function BackLink({ href, children }) {
    return (
        <Link
            href={href}
            className="inline-flex cursor-pointer items-center gap-2 text-base font-semibold text-[var(--ayom-primary)] underline-offset-4 transition-colors duration-200 hover:underline"
        >
            <ArrowLeft className="h-5 w-5" />
            {children}
        </Link>
    );
}

/* barClassName ditulis utuh dengan prefix [&>div]: supaya Tailwind meng-generate class-nya */
export function LimitBar({
    label,
    spent,
    limit,
    barClassName = "[&>div]:bg-[var(--ayom-primary)]",
    showEmpty = false,
}) {
    if (limit === null || limit === undefined || Number(limit) <= 0) {
        return showEmpty ? (
            <p className="text-base text-slate-600">{label}: belum diatur.</p>
        ) : null;
    }

    const rawPct = (Number(spent ?? 0) / Number(limit)) * 100;
    const pct = Math.min(100, rawPct);
    const isOver = rawPct > 100;
    const isNear = rawPct >= 80 && rawPct <= 100;

    return (
        <div>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-600">{label}</span>
                <span
                    className={`font-semibold tabular-nums ${
                        isOver ? "text-rose-700" : "text-slate-800"
                    }`}
                >
                    {formatRupiah(spent)}
                    <span className="font-normal text-slate-500">
                        {" "}
                        / {formatRupiah(limit)}
                    </span>
                </span>
            </div>

            <Progress
                value={pct}
                className={`h-2.5 rounded-full [&>div]:rounded-full ${
                    isOver ? "bg-rose-100" : "bg-slate-100"
                } ${
                    isOver
                        ? "[&>div]:bg-rose-500"
                        : isNear
                          ? "[&>div]:bg-amber-500"
                          : barClassName
                }`}
            />

            {isOver && (
                <p className="mt-1.5 text-sm font-medium text-rose-700">
                    Melebihi limit
                </p>
            )}
        </div>
    );
}

/** Daftar transaksi. showUser=true: nama anggota jadi judul (Guardian View). */
export function TrxList({
    rows = [],
    showUser = false,
    alt = false,
    emptyText = "Belum ada transaksi.",
}) {
    return (
        <Panel alt={alt}>
            {rows.length === 0 ? (
                <EmptyState icon={ArrowUpRight}>{emptyText}</EmptyState>
            ) : (
                <ul>
                    {rows.map((trx) => (
                        <li
                            key={trx.id}
                            className="flex items-center justify-between gap-4 border-b border-slate-200 py-4 last:border-b-0"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-lg font-semibold text-slate-900">
                                    {showUser
                                        ? trx.user?.name
                                        : (typeLabel[trx.type] ?? trx.type)}
                                </p>
                                <p className="mt-0.5 truncate text-base text-slate-600">
                                    {showUser
                                        ? `${typeLabel[trx.type] ?? trx.type} · `
                                        : ""}
                                    {trx.description ?? "-"}
                                </p>
                            </div>

                            <div className="shrink-0 text-right">
                                <p className="text-lg font-bold tabular-nums text-slate-900">
                                    {formatRupiah(trx.amount)}
                                </p>
                                <StatusPill status={trx.status} className="mt-1" />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </Panel>
    );
}

export function Pagination({ prevUrl, nextUrl }) {
    if (!prevUrl && !nextUrl) return null;

    return (
        <nav
            aria-label="Halaman"
            className="mt-4 flex items-center justify-between gap-3"
        >
            {prevUrl ? (
                <Link href={prevUrl} className={btnOutline}>
                    <ArrowLeft className="h-5 w-5" /> Sebelumnya
                </Link>
            ) : (
                <span />
            )}

            {nextUrl ? (
                <Link href={nextUrl} className={btnOutline}>
                    Selanjutnya <ArrowRight className="h-5 w-5" />
                </Link>
            ) : (
                <span />
            )}
        </nav>
    );
}

/** Field form: label + kontrol + hint/error. */
export function Field({ label, error, hint, htmlFor, className = "", children }) {
    return (
        <div className={`space-y-2 ${className}`}>
            <Label htmlFor={htmlFor} className="text-base font-medium text-slate-800">
                {label}
            </Label>
            {children}
            {hint && !error ? (
                <p className="text-sm text-slate-600">{hint}</p>
            ) : null}
            {error ? (
                <p role="alert" className="text-sm font-medium text-[var(--ayom-danger)]">
                    {error}
                </p>
            ) : null}
        </div>
    );
}