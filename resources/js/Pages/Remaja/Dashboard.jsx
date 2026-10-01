// resources/js/Pages/Remaja/Dashboard.jsx
import { useEffect, useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import RemajaLayout from "@/Layouts/RemajaLayout";

import {
    Target,
    Trophy,
    Clock3,
    ListChecks,
    ChevronRight,
    ArrowDownLeft,
    ArrowUpRight,
    Inbox,
} from "lucide-react";

const rupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));

const formatTanggal = () =>
    new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date());

function useSapaan() {
    const jam = new Date().getHours();
    if (jam < 11) return "Selamat pagi";
    if (jam < 15) return "Selamat siang";
    if (jam < 19) return "Selamat sore";
    return "Selamat malam";
}

const statusLabel = {
    completed: "Selesai",
    pending: "Menunggu",
    approved: "Disetujui",
    rejected: "Ditolak",
};

const statusClass = {
    completed: "bg-emerald-100 text-emerald-800",
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-blue-100 text-blue-700",
    rejected: "bg-rose-100 text-rose-700",
};

const CHART_COLORS = ["#059669", "#0d9488", "#f59e0b", "#3b82f6", "#8b5cf6", "#ef4444"];

const LG_COLS = {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
};

function LimitBar({ label, spent, limit }) {
    if (limit === null || limit === undefined || Number(limit) <= 0) return null;

    const spentNumber = Number(spent ?? 0);
    const limitNumber = Number(limit);
    const raw = (spentNumber / limitNumber) * 100;
    const pct = Math.min(100, Math.max(0, raw));
    const isOver = raw > 100;
    const isNear = raw >= 80 && raw <= 100;

    const track = isOver ? "bg-rose-100" : "bg-emerald-100";
    const bar = isOver ? "bg-rose-500" : isNear ? "bg-amber-500" : "bg-emerald-700";

    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="text-base text-slate-600">{label}</span>
                <span
                    className={`text-base font-semibold tabular-nums ${
                        isOver ? "text-rose-600" : "text-slate-800"
                    }`}
                >
                    {rupiah(spentNumber)}
                    <span className="font-normal text-slate-400"> / {rupiah(limitNumber)}</span>
                </span>
            </div>

            <div className={`h-3 overflow-hidden rounded-full ${track}`}>
                <div
                    className={`h-full rounded-full transition-all duration-500 ${bar}`}
                    style={{ width: `${pct}%` }}
                />
            </div>

            {isOver && <p className="mt-1 text-sm font-medium text-rose-600">Melebihi limit</p>}
            {!isOver && isNear && (
                <p className="mt-1 text-sm font-medium text-amber-700">Mendekati limit</p>
            )}
        </div>
    );
}

export default function Dashboard({
    wallet,
    taskStats,
    upcomingTasks = [],
    recentTransactions = [],
}) {
    const { auth } = usePage().props;
    const sapaan = useSapaan();

    const [expenseSummary, setExpenseSummary] = useState([]);
    const [loadingChart, setLoadingChart] = useState(true);

    useEffect(() => {
        axios
            .get(route("remaja.expense-summary"))
            .then((res) => setExpenseSummary(res.data ?? []))
            .catch(() => setExpenseSummary([]))
            .finally(() => setLoadingChart(false));
    }, []);

    const adaLimit = wallet?.daily_limit || wallet?.monthly_limit;

    const menu = [
        { key: "terbuka", label: "Misi Terbuka", value: taskStats?.open ?? 0, icon: Target, href: route("remaja.tasks.index") },
        { key: "review", label: "Menunggu Review", value: taskStats?.submitted ?? 0, icon: Clock3, href: route("remaja.tasks.index") },
        { key: "setuju", label: "Misi Disetujui", value: taskStats?.approved ?? 0, icon: ListChecks, href: route("remaja.tasks.index") },
    ];

    const transaksi = recentTransactions.slice(0, 6);

    return (
        <RemajaLayout>
            <Head title="Dashboard" />

            <div className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6">
                {/* BARIS 1: SALDO + LIMIT */}
                <div className="grid gap-5 sm:gap-6 lg:grid-cols-12">
                    <section className="relative flex flex-col justify-center overflow-hidden rounded-bl-3xl rounded-br-[3.5rem] rounded-tl-[3.5rem] rounded-tr-3xl bg-emerald-800 px-6 py-8 text-white sm:px-10 sm:py-10 lg:col-span-7">
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

                        <div className="relative min-w-0">
                            <p className="text-base text-emerald-200">{formatTanggal()}</p>

                            <h1 className="mt-1 font-heading text-2xl leading-snug sm:text-3xl">
                                {sapaan}, {auth?.user?.name?.split(" ")[0] ?? "Remaja"}
                            </h1>

                            <p className="mt-6 text-lg text-emerald-200">Saldo saku kamu</p>

                            <p className="break-words text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-5xl xl:text-6xl">
                                {rupiah(wallet?.balance)}
                            </p>

                            <Link
                                href={route("remaja.tasks.index")}
                                className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-900/50 px-5 py-2.5 text-base text-emerald-100 transition hover:bg-emerald-900/70 sm:text-lg"
                            >
                                Cari misi untuk tambah saldo
                                <ChevronRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </section>

                    <section className="rounded-bl-[3.5rem] rounded-br-3xl rounded-tl-3xl rounded-tr-[3.5rem] bg-emerald-50 px-6 py-7 ring-1 ring-emerald-900/15 sm:px-10 lg:col-span-5">
                        <h2 className="font-heading text-2xl text-slate-900">Limit belanja</h2>

                        <div className="mt-5 space-y-5">
                            <LimitBar label="Limit harian" spent={wallet?.daily_spent} limit={wallet?.daily_limit} />
                            <LimitBar label="Limit bulanan" spent={wallet?.monthly_spent} limit={wallet?.monthly_limit} />

                            {!adaLimit && (
                                <p className="text-base text-slate-500">
                                    Belum ada limit yang diatur orang tua.
                                </p>
                            )}
                        </div>
                    </section>
                </div>

                {/* BARIS 2: RINGKASAN MISI (gaya menu pil) */}
                <nav
                    aria-label="Ringkasan misi"
                    className={`grid gap-3 sm:grid-cols-2 ${LG_COLS[menu.length]}`}
                >
                    {menu.map((item, i) => {
                        const Icon = item.icon;
                        const ganjilTerakhir = menu.length % 2 === 1 && i === menu.length - 1;

                        return (
                            <Link
                                key={item.key}
                                href={item.href}
                                className={`group flex min-h-[4.75rem] items-center gap-4 rounded-full bg-white py-2.5 pl-2.5 pr-6 ring-1 ring-emerald-900/15 transition hover:ring-emerald-700 active:scale-[0.98] ${
                                    ganjilTerakhir ? "sm:col-span-2 lg:col-span-1" : ""
                                }`}
                            >
                                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-white transition group-hover:bg-emerald-700">
                                    <Icon className="h-7 w-7" />
                                </span>
                                <span className="flex-1 text-lg font-bold leading-tight text-slate-800">
                                    {item.label}
                                </span>
                                <span className="text-3xl font-extrabold tabular-nums text-emerald-800">
                                    {item.value}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* BARIS 3: GRAFIK + MISI MENDATANG */}
                <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
                    <section className="rounded-bl-3xl rounded-br-3xl rounded-tl-3xl rounded-tr-[3.5rem] bg-emerald-50 px-5 py-6 sm:px-10 sm:py-8">
                        <h2 className="font-heading text-2xl text-slate-900 sm:text-3xl">
                            Pengeluaran per kategori
                        </h2>

                        <div className="mt-4">
                            {loadingChart ? (
                                <p className="py-10 text-center text-base text-slate-500">Memuat grafik...</p>
                            ) : expenseSummary.length ? (
                                <>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={expenseSummary}
                                                dataKey="total"
                                                nameKey="category"
                                                innerRadius={45}
                                                outerRadius={80}
                                                paddingAngle={2}
                                            >
                                                {expenseSummary.map((_, index) => (
                                                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => rupiah(value)} />
                                        </PieChart>
                                    </ResponsiveContainer>

                                    <ul className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1.5">
                                        {expenseSummary.map((item, index) => (
                                            <li key={index} className="flex items-center gap-2 text-base text-slate-700">
                                                <span
                                                    className="h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                                />
                                                {item.category}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-2 py-10 text-center">
                                    <Inbox className="h-10 w-10 text-emerald-600" />
                                    <p className="text-lg font-semibold text-slate-700">Belum ada pengeluaran</p>
                                    <p className="text-base text-slate-500">Grafik muncul setelah kamu belanja.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="rounded-bl-[3.5rem] rounded-br-3xl rounded-tl-3xl rounded-tr-3xl bg-white px-5 py-6 ring-1 ring-emerald-900/15 sm:px-10 sm:py-8">
                        <div className="mb-2 flex items-end justify-between gap-3">
                            <h2 className="font-heading text-2xl text-slate-900 sm:text-3xl">Misi mendatang</h2>
                            <Link
                                href={route("remaja.tasks.index")}
                                className="shrink-0 pb-1 text-base font-semibold text-emerald-800 underline underline-offset-4 hover:text-emerald-900"
                            >
                                Lihat semua
                            </Link>
                        </div>

                        {upcomingTasks.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-10 text-center">
                                <Target className="h-10 w-10 text-emerald-600" />
                                <p className="text-lg font-semibold text-slate-700">Belum ada misi terbuka</p>
                                <p className="text-base text-slate-500">Misi baru dari orang tua muncul di sini.</p>
                            </div>
                        ) : (
                            <ul>
                                {upcomingTasks.map((task) => (
                                    <li
                                        key={task.id}
                                        className="flex items-center justify-between gap-3 border-b border-emerald-900/10 py-4 last:border-b-0"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                                                <Trophy className="h-6 w-6" />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-lg font-semibold text-slate-800">{task.title}</p>
                                                {task.due_date && (
                                                    <p className="text-sm text-slate-500">Tenggat {task.due_date}</p>
                                                )}
                                            </div>
                                        </div>
                                        <span className="shrink-0 text-base font-bold text-emerald-800 sm:text-lg">
                                            {rupiah(task.reward_amount)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>

                {/* BARIS 4: TRANSAKSI */}
                <section className="rounded-bl-3xl rounded-br-3xl rounded-tl-3xl rounded-tr-[3.5rem] bg-emerald-50 px-5 py-6 sm:px-10 sm:py-8">
                    <div className="mb-2 flex items-end justify-between gap-3">
                        <h2 className="font-heading text-2xl text-slate-900 sm:text-3xl">Transaksi terakhir</h2>
                        <Link
                            href={route("transactions.index")}
                            className="shrink-0 pb-1 text-base font-semibold text-emerald-800 underline underline-offset-4 hover:text-emerald-900"
                        >
                            Lihat semua
                        </Link>
                    </div>

                    {transaksi.length > 0 ? (
                        <ul className="lg:columns-2 lg:gap-14">
                            {transaksi.map((trx) => {
                                const masuk = ["topup", "allowance"].includes(trx.type);

                                return (
                                    <li
                                        key={trx.id}
                                        className="flex break-inside-avoid items-center justify-between gap-3 border-b border-emerald-900/10 py-4"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span
                                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                                                    masuk ? "bg-emerald-200 text-emerald-900" : "bg-rose-100 text-rose-700"
                                                }`}
                                            >
                                                {masuk ? <ArrowDownLeft className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                                            </span>

                                            <div className="min-w-0">
                                                <p className="truncate text-lg font-semibold text-slate-800">
                                                    {trx.description || trx.category}
                                                </p>
                                                <span
                                                    className={`mt-0.5 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                        statusClass[trx.status] ?? "bg-slate-100 text-slate-600"
                                                    }`}
                                                >
                                                    {statusLabel[trx.status] ?? trx.status}
                                                </span>
                                            </div>
                                        </div>

                                        <span
                                            className={`shrink-0 text-base font-bold sm:text-lg ${
                                                masuk ? "text-emerald-800" : "text-rose-700"
                                            }`}
                                        >
                                            {masuk ? "+" : "-"}
                                            {rupiah(trx.amount)}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center gap-2 py-10 text-center">
                            <Inbox className="h-10 w-10 text-emerald-600" />
                            <p className="text-lg font-semibold text-slate-700">Belum ada transaksi</p>
                            <p className="text-base text-slate-500">Transaksimu akan muncul di sini.</p>
                        </div>
                    )}
                </section>
            </div>
        </RemajaLayout>
    );
}