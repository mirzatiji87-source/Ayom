import { Head, Link, usePage } from "@inertiajs/react";

import RemajaLayout from "@/Layouts/RemajaLayout";
import LansiaLayout from "@/Layouts/LansiaLayout";
import {
    ArrowDownLeft,
    Bus,
    Clapperboard,
    GraduationCap,
    HeartPulse,
    Package,
    Plus,
    Receipt,
    Shirt,
    ShoppingBag,
    ShoppingBasket,
    UtensilsCrossed,
    Wallet,
} from "lucide-react";

// Halaman ini dipakai bersama oleh role lansia dan remaja
// melalui route transactions.index.
// Keduanya memakai daftar transaksi yang sama (TransactionList),
// bedanya lansia memakai ukuran huruf & tap target lebih besar (prop `large`).

function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));
}

const CATEGORY_OPTIONS = [
    { value: "makanan", label: "Makanan" },
    { value: "transportasi", label: "Transportasi" },
    { value: "hiburan", label: "Hiburan" },
    { value: "tagihan", label: "Tagihan" },
    { value: "kesehatan", label: "Kesehatan" },
    { value: "pendidikan", label: "Pendidikan" },
    { value: "pakaian", label: "Pakaian" },
    { value: "belanja", label: "Belanja harian" },
    { value: "lainnya", label: "Lainnya" },
];

const CATEGORY_ICON = {
    makanan: UtensilsCrossed,
    transportasi: Bus,
    hiburan: Clapperboard,
    tagihan: Receipt,
    pakaian: Shirt,
    belanja: ShoppingBasket,
    pendidikan: GraduationCap,
    kesehatan: HeartPulse,
    lainnya: Package,
};

const TYPE_META = {
    topup: { label: "Top-up", sign: "+" },
    expense: { label: "Pengeluaran", sign: "-" },
    transfer: { label: "Transfer", sign: "-" },
    bill_payment: { label: "Tagihan", sign: "-" },
    allowance: { label: "Uang Saku", sign: "+" },
};

const STATUS_META = {
    completed: {
        label: "Selesai",
        className: "bg-green-100 text-green-700",
    },
    pending: {
        label: "Menunggu",
        className: "bg-amber-100 text-amber-700",
    },
    approved: {
        label: "Disetujui",
        className: "bg-green-100 text-green-700",
    },
    rejected: {
        label: "Ditolak",
        className: "bg-red-100 text-red-700",
    },
};

/* ---------- Helper tanggal ---------- */

function dayLabel(iso) {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Hari ini";
    if (d.toDateString() === yesterday.toDateString()) return "Kemarin";

    return d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });
}

function timeLabel(iso) {
    return new Date(iso)
        .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        .replace(".", ":");
}

// Kelompokkan per hari, urutan dari server dipertahankan.
function groupByDay(rows) {
    const map = new Map();

    rows.forEach((trx) => {
        const key = new Date(trx.created_at).toDateString();
        if (!map.has(key)) {
            map.set(key, { label: dayLabel(trx.created_at), items: [] });
        }
        map.get(key).items.push(trx);
    });

    return [...map.values()];
}

/* ---------- Pagination (dipakai dua role) ---------- */

function Pagination({ links, large }) {
    if (links.length <= 3) return null;

    return (
        <div className="mt-4 flex flex-wrap justify-center gap-1">
            {links.map((link, index) => (
                <Link
                    key={index}
                    href={link.url ?? "#"}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    preserveScroll
                    className={`rounded-md px-3 py-1 ${
                        large ? "min-h-11 text-lg" : "text-sm"
                    } ${
                        link.active
                            ? "bg-primary text-primary-foreground"
                            : "text-slate-500 hover:bg-slate-100"
                    } ${!link.url ? "pointer-events-none opacity-40" : ""}`}
                />
            ))}
        </div>
    );
}

/* ---------- Daftar transaksi per hari (dipakai lansia & remaja) ---------- */

function TransactionList({
    rows,
    links,
    large = false,
    title,
    subtitle,
    action,
}) {
    const groups = groupByDay(rows);

    return (
        <div className="mx-auto w-full max-w-3xl space-y-5 sm:space-y-6">
            {/* header */}
            <div
                className={`flex gap-3 ${
                    large
                        ? "flex-col sm:flex-row sm:items-start sm:justify-between"
                        : "items-start justify-between"
                }`}
            >
                <div className="min-w-0">
                    <h1
                        className={`font-heading text-slate-900 ${
                            large ? "text-4xl" : "text-3xl"
                        }`}
                    >
                        {title}
                    </h1>
                    <p
                        className={`mt-1 text-slate-600 ${
                            large ? "text-lg" : "text-base"
                        }`}
                    >
                        {subtitle}
                    </p>
                </div>

                {action}
            </div>

            {/* daftar per hari */}
            {groups.length === 0 ? (
                <section className="flex flex-col items-center rounded-bl-3xl rounded-br-3xl rounded-tl-3xl rounded-tr-[3rem] bg-emerald-50 px-6 py-12 text-center ring-1 ring-emerald-900/15">
                    <span
                        className={`flex items-center justify-center rounded-full bg-emerald-100 text-emerald-800 ${
                            large ? "h-16 w-16" : "h-14 w-14"
                        }`}
                    >
                        <Receipt className={large ? "h-8 w-8" : "h-7 w-7"} />
                    </span>
                    <p
                        className={`mt-4 font-heading text-slate-900 ${
                            large ? "text-3xl" : "text-2xl"
                        }`}
                    >
                        Belum ada transaksi
                    </p>
                    <p
                        className={`mt-1 text-slate-600 ${
                            large ? "text-lg" : "text-base"
                        }`}
                    >
                        {large
                            ? "Transaksi Anda akan muncul di sini."
                            : "Catat jajan pertamamu, nanti muncul di sini."}
                    </p>
                </section>
            ) : (
                groups.map((group) => (
                    <section key={group.label}>
                        <h2
                            className={`mb-2 px-2 font-semibold text-slate-600 ${
                                large ? "text-lg" : "text-base"
                            }`}
                        >
                            {group.label}
                        </h2>

                        <ul className="divide-y divide-emerald-900/10 overflow-hidden rounded-3xl bg-white ring-1 ring-emerald-900/15">
                            {group.items.map((trx) => {
                                const meta = TYPE_META[trx.type] ?? {
                                    label: trx.type,
                                    sign: "",
                                };
                                const income = meta.sign === "+";
                                const status = STATUS_META[trx.status] ?? {
                                    label: trx.status,
                                    className: "bg-slate-100 text-slate-600",
                                };
                                const rejected = trx.status === "rejected";
                                const pending = trx.status === "pending";

                                const Icon = income
                                    ? trx.type === "allowance"
                                        ? Wallet
                                        : ArrowDownLeft
                                    : (CATEGORY_ICON[trx.category] ?? Package);

                                const itemTitle =
                                    trx.description ||
                                    (CATEGORY_OPTIONS.find(
                                        (c) => c.value === trx.category,
                                    )?.label ??
                                        meta.label);

                                return (
                                    <li
                                        key={trx.id}
                                        className={`flex items-start gap-3 px-4 sm:px-5 ${
                                            large ? "py-5" : "py-4"
                                        }`}
                                    >
                                        <span
                                            className={`flex shrink-0 items-center justify-center rounded-full ${
                                                large
                                                    ? "h-14 w-14"
                                                    : "h-11 w-11"
                                            } ${
                                                income
                                                    ? "bg-emerald-100 text-emerald-800"
                                                    : "bg-slate-100 text-slate-700"
                                            }`}
                                        >
                                            <Icon
                                                className={
                                                    large
                                                        ? "h-7 w-7"
                                                        : "h-5 w-5"
                                                }
                                            />
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <p
                                                className={`truncate font-semibold capitalize text-slate-900 ${
                                                    large
                                                        ? "text-xl"
                                                        : "text-base"
                                                }`}
                                            >
                                                {itemTitle}
                                            </p>
                                            <p
                                                className={`mt-0.5 text-slate-600 ${
                                                    large
                                                        ? "text-base"
                                                        : "text-sm"
                                                }`}
                                            >
                                                {meta.label} •{" "}
                                                {timeLabel(trx.created_at)}
                                            </p>

                                            {pending && (
                                                <p
                                                    className={`mt-1 font-medium text-amber-800 ${
                                                        large
                                                            ? "text-base"
                                                            : "text-sm"
                                                    }`}
                                                >
                                                    Menunggu persetujuan orang
                                                    tua
                                                </p>
                                            )}

                                            {rejected && (
                                                <p
                                                    className={`mt-1 font-medium text-rose-700 ${
                                                        large
                                                            ? "text-base"
                                                            : "text-sm"
                                                    }`}
                                                >
                                                    Ditolak orang tua, saldo
                                                    tidak terpotong
                                                </p>
                                            )}
                                        </div>

                                        <div className="shrink-0 text-right">
                                            <p
                                                className={`font-bold tabular-nums ${
                                                    large
                                                        ? "text-xl"
                                                        : "text-base"
                                                } ${
                                                    rejected
                                                        ? "text-slate-400 line-through"
                                                        : pending
                                                          ? "text-amber-800"
                                                          : income
                                                            ? "text-emerald-700"
                                                            : "text-slate-900"
                                                }`}
                                            >
                                                {meta.sign}
                                                {formatRupiah(trx.amount)}
                                            </p>
                                            <span
                                                className={`mt-1 inline-block rounded-full font-semibold ${
                                                    large
                                                        ? "px-3 py-1 text-sm"
                                                        : "px-2.5 py-0.5 text-xs"
                                                } ${status.className}`}
                                            >
                                                {status.label}
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                ))
            )}

            <Pagination links={links} large={large} />
        </div>
    );
}

/* ---------- Tampilan LANSIA ---------- */

function LansiaTransactions({ rows, links }) {
    return (
        <TransactionList
            rows={rows}
            links={links}
            large
            title="Riwayat transaksi"
            subtitle="Semua uang masuk dan keluar Anda."
            action={
                <Link
                    href={route("lansia.spend")}
                    className="inline-flex h-14 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-800 px-6 text-lg font-semibold text-white transition-colors duration-200 hover:bg-emerald-700 active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400 sm:w-auto"
                >
                    <ShoppingBag className="h-6 w-6" />
                    Catat belanja
                </Link>
            }
        />
    );
}

/* ---------- Tampilan REMAJA ---------- */

function RemajaTransactions({ rows, links }) {
    return (
        <TransactionList
            rows={rows}
            links={links}
            title="Riwayat transaksi"
            subtitle="Semua uang masuk dan jajanmu."
            action={
                <Link
                    href={route("remaja.spend")}
                    className="inline-flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-emerald-800 px-5 text-base font-semibold text-white transition-colors duration-200 hover:bg-emerald-700 active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400"
                >
                    <Plus className="h-5 w-5" />
                    Jajan
                </Link>
            }
        />
    );
}

/* ---------- Halaman transaksi ---------- */

export default function Transactions({ transactions }) {
    const { auth } = usePage().props;
    const isLansia = auth.user.role === "lansia";

    const rows = transactions?.data ?? [];
    const links = transactions?.links ?? [];

    return (
        <>
            <Head title="Transaksi" />

            {isLansia ? (
                <LansiaTransactions rows={rows} links={links} />
            ) : (
                <RemajaTransactions rows={rows} links={links} />
            )}
        </>
    );
}

/* ---------- Pilih layout berdasarkan role ---------- */

Transactions.layout = (page) => {
    const role = page.props.auth.user.role;
    const Layout = role === "lansia" ? LansiaLayout : RemajaLayout;

    return <Layout>{page}</Layout>;
};
