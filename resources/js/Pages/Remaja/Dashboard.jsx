import { useEffect, useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import RemajaLayout from "@/Layouts/RemajaLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
    Wallet,
    Target,
    Trophy,
    TrendingDown,
    ArrowRight,
    ArrowUpRight,
    Sparkles,
    ListChecks,
    Activity,
    Clock3,
    PieChart as PieChartIcon,
} from "lucide-react";

/* =========================================================
 | HELPERS
 ========================================================= */

const rupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));

const statusLabel = {
    completed: "Selesai",
    pending: "Menunggu",
    approved: "Disetujui",
    rejected: "Ditolak",
};

const statusClass = {
    completed: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-blue-100 text-blue-700",
    rejected: "bg-rose-100 text-rose-700",
};

const CHART_COLORS = [
    "#059669",
    "#0d9488",
    "#f59e0b",
    "#3b82f6",
    "#8b5cf6",
    "#ef4444",
];

/* =========================================================
 | ANIMATION
 ========================================================= */

const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: (index = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: index * 0.05, duration: 0.35, ease: "easeOut" },
    }),
};

/* =========================================================
 | BUTTON LINK
 ========================================================= */

function LinkButton({ href, children, className = "", variant = "primary" }) {
    const variants = {
        primary: "bg-emerald-600 text-white hover:bg-emerald-700",
        secondary: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        outline:
            "border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50",
        white: "bg-white text-emerald-700 hover:bg-emerald-50",
    };

    return (
        <Link
            href={href}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${variants[variant]} ${className}`}
        >
            {children}
        </Link>
    );
}

/* =========================================================
 | STAT CARD
 ========================================================= */

function StatCard({ icon: Icon, label, value, hint, action, index = 0 }) {
    return (
        <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={index}
            className="h-full"
        >
            <Card className="relative h-full overflow-hidden rounded-2xl border-emerald-100/80 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-100">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 opacity-70"
                />

                <CardContent className="relative flex h-full flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-500">
                                {label}
                            </p>
                            <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
                                {value}
                            </p>
                        </div>

                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm shadow-emerald-200">
                            <Icon className="h-5 w-5 text-white" />
                        </span>
                    </div>

                    <div className="mt-auto pt-3">
                        {action ? (
                            <Link
                                href={action.href}
                                className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                            >
                                {action.label}
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        ) : (
                            <p className="text-xs text-slate-500">{hint}</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

/* =========================================================
 | LIMIT BAR
 ========================================================= */

function LimitBar({ label, spent, limit, type = "daily" }) {
    if (limit === null || limit === undefined || Number(limit) <= 0)
        return null;

    const spentNumber = Number(spent ?? 0);
    const limitNumber = Number(limit);
    const rawPercentage = (spentNumber / limitNumber) * 100;
    const percentage = Math.min(100, Math.max(0, rawPercentage));
    const isOver = rawPercentage > 100;
    const isNear = rawPercentage >= 80 && rawPercentage <= 100;

    let trackClass = type === "monthly" ? "bg-teal-100" : "bg-emerald-100";
    let barClass = type === "monthly" ? "bg-teal-600" : "bg-emerald-600";

    if (isNear) barClass = "bg-amber-500";
    if (isOver) {
        trackClass = "bg-rose-100";
        barClass = "bg-rose-500";
    }

    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-slate-500">
                    {label}
                </span>
                <span
                    className={`text-xs font-semibold tabular-nums ${isOver ? "text-rose-600" : "text-slate-700"}`}
                >
                    {rupiah(spentNumber)}
                    <span className="font-normal text-slate-400">
                        {" "}
                        / {rupiah(limitNumber)}
                    </span>
                </span>
            </div>

            <div className={`h-2 overflow-hidden rounded-full ${trackClass}`}>
                <div
                    className={`h-full rounded-full transition-all duration-500 ${barClass}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {isOver && (
                <p className="mt-1 text-xs font-medium text-rose-600">
                    Melebihi limit
                </p>
            )}
            {!isOver && isNear && (
                <p className="mt-1 text-xs font-medium text-amber-600">
                    Mendekati limit
                </p>
            )}
        </div>
    );
}

/* =========================================================
 | TASK CARD
 ========================================================= */

function TaskCard({ task, index = 0 }) {
    return (
        <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={index}
            className="h-full"
        >
            <Card className="flex h-full flex-col overflow-hidden rounded-2xl border-emerald-100/80 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-100">
                <CardContent className="flex flex-1 flex-col p-5">
                    <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50">
                            <Trophy className="h-5 w-5 text-amber-500" />
                        </span>

                        <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">
                                {task.title}
                            </p>
                            {task.due_date && (
                                <p className="mt-1 text-xs text-slate-400">
                                    Tenggat {task.due_date}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-5">
                        <span className="text-sm font-bold tabular-nums text-emerald-700">
                            {rupiah(task.reward_amount)}
                        </span>

                        <Badge
                            variant="outline"
                            className="rounded-full border-emerald-200 text-emerald-700"
                        >
                            Terbuka
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

/* =========================================================
 | TRANSACTION ITEM
 ========================================================= */

function TransactionItem({ transaction }) {
    const isIncome = ["topup", "allowance"].includes(transaction.type);

    return (
        <div className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-emerald-50/40">
            <div className="flex min-w-0 items-center gap-3">
                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isIncome ? "bg-emerald-100" : "bg-rose-100"
                    }`}
                >
                    {isIncome ? (
                        <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                    ) : (
                        <TrendingDown className="h-5 w-5 text-rose-600" />
                    )}
                </div>

                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                        {transaction.description || transaction.category}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                        {new Date(transaction.created_at).toLocaleString(
                            "id-ID",
                        )}
                    </p>
                </div>
            </div>

            <div className="shrink-0 text-right">
                <p
                    className={`text-sm font-bold tabular-nums ${isIncome ? "text-emerald-700" : "text-rose-600"}`}
                >
                    {isIncome ? "+" : "-"}
                    {rupiah(transaction.amount)}
                </p>

                <span
                    className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        statusClass[transaction.status] ??
                        "bg-slate-100 text-slate-600"
                    }`}
                >
                    {statusLabel[transaction.status] ?? transaction.status}
                </span>
            </div>
        </div>
    );
}

/* =========================================================
 | DASHBOARD
 ========================================================= */

export default function Dashboard({
    wallet,
    taskStats,
    upcomingTasks = [],
    recentTransactions = [],
}) {
    const { auth } = usePage().props;
    const [expenseSummary, setExpenseSummary] = useState([]);
    const [loadingChart, setLoadingChart] = useState(true);

    useEffect(() => {
        axios
            .get(route("remaja.expense-summary"))
            .then((res) => setExpenseSummary(res.data ?? []))
            .catch(() => setExpenseSummary([]))
            .finally(() => setLoadingChart(false));
    }, []);

    return (
        <RemajaLayout>
            <Head title="Dashboard" />

            <div className="mx-auto w-full max-w-7xl space-y-6">
                {/* HERO */}
                <motion.section
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 p-6 text-white shadow-lg shadow-emerald-200 sm:p-8"
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-white/10"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-white/10"
                    />

                    <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                            <p className="flex items-center gap-2 text-sm font-medium text-emerald-50">
                                <Sparkles className="h-4 w-4" />
                                Ringkasan hari ini
                            </p>

                            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                                Halo,{" "}
                                {auth?.user?.name?.split(" ")[0] ?? "Remaja"}
                            </h1>

                            <p className="mt-2 text-sm text-emerald-50 sm:text-base">
                                Saldo saku kamu saat ini{" "}
                                <span className="font-bold text-white">
                                    {rupiah(wallet?.balance)}
                                </span>
                            </p>
                        </div>

                        <LinkButton
                            href={route("remaja.tasks.index")}
                            variant="white"
                            className="w-full sm:w-fit"
                        >
                            <Target className="h-4 w-4" />
                            Lihat Semua Misi
                        </LinkButton>
                    </div>
                </motion.section>

                {/* STATISTICS */}
                <section>
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-slate-900">
                            Ringkasan
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Saldo, misi, dan limit belanjamu
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            index={0}
                            icon={Wallet}
                            label="Saldo Saku"
                            value={rupiah(wallet?.balance)}
                            hint="Saldo yang bisa kamu gunakan"
                        />

                        <StatCard
                            index={1}
                            icon={Target}
                            label="Misi Terbuka"
                            value={taskStats?.open ?? 0}
                            action={{
                                href: route("remaja.tasks.index"),
                                label: "Kerjakan misi",
                            }}
                        />

                        <StatCard
                            index={2}
                            icon={Clock3}
                            label="Menunggu Review"
                            value={taskStats?.submitted ?? 0}
                            hint="Misi yang sudah kamu kirim"
                        />

                        <StatCard
                            index={3}
                            icon={ListChecks}
                            label="Misi Disetujui"
                            value={taskStats?.approved ?? 0}
                            hint="Total misi yang berhasil"
                        />
                    </div>
                </section>

                {/* LIMIT + CHART */}
                <section className="grid gap-6 xl:grid-cols-2">
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        custom={0}
                    >
                        <Card className="h-full overflow-hidden rounded-2xl border-emerald-100/80 bg-white">
                            <CardContent className="p-5">
                                <div className="mb-4 flex items-center gap-2">
                                    <Wallet className="h-5 w-5 text-emerald-600" />
                                    <h2 className="text-base font-bold text-slate-900">
                                        Limit Belanja
                                    </h2>
                                </div>

                                <div className="space-y-5">
                                    <LimitBar
                                        label="Limit harian"
                                        spent={wallet?.daily_spent}
                                        limit={wallet?.daily_limit}
                                        type="daily"
                                    />
                                    <LimitBar
                                        label="Limit bulanan"
                                        spent={wallet?.monthly_spent}
                                        limit={wallet?.monthly_limit}
                                        type="monthly"
                                    />

                                    {!wallet?.daily_limit &&
                                        !wallet?.monthly_limit && (
                                            <p className="text-sm text-slate-400">
                                                Belum ada limit yang diatur
                                                orang tua.
                                            </p>
                                        )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        custom={1}
                    >
                        <Card className="h-full overflow-hidden rounded-2xl border-emerald-100/80 bg-white">
                            <CardContent className="p-5">
                                <div className="mb-4 flex items-center gap-2">
                                    <PieChartIcon className="h-5 w-5 text-teal-600" />
                                    <h2 className="text-base font-bold text-slate-900">
                                        Pengeluaran per Kategori
                                    </h2>
                                </div>

                                {loadingChart ? (
                                    <p className="text-sm text-slate-400">
                                        Memuat grafik...
                                    </p>
                                ) : expenseSummary.length ? (
                                    <ResponsiveContainer
                                        width="100%"
                                        height={200}
                                    >
                                        <PieChart>
                                            <Pie
                                                data={expenseSummary}
                                                dataKey="total"
                                                nameKey="category"
                                                innerRadius={40}
                                                outerRadius={70}
                                                paddingAngle={2}
                                            >
                                                {expenseSummary.map(
                                                    (_, index) => (
                                                        <Cell
                                                            key={index}
                                                            fill={
                                                                CHART_COLORS[
                                                                    index %
                                                                        CHART_COLORS.length
                                                                ]
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) =>
                                                    rupiah(value)
                                                }
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-sm text-slate-400">
                                        Belum ada pengeluaran tercatat.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </section>

                {/* UPCOMING TASKS */}
                <section>
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-amber-500" />
                                <h2 className="text-lg font-bold text-slate-900">
                                    Misi Mendatang
                                </h2>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">
                                Kerjakan misi untuk dapat reward.
                            </p>
                        </div>

                        <Link
                            href={route("remaja.tasks.index")}
                            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                        >
                            Lihat semua misi
                        </Link>
                    </div>

                    {upcomingTasks.length === 0 ? (
                        <Card className="rounded-2xl border-dashed border-emerald-200 bg-emerald-50/40">
                            <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
                                    <Target className="h-7 w-7 text-emerald-600" />
                                </div>
                                <h3 className="mt-4 font-semibold text-slate-900">
                                    Belum ada misi terbuka
                                </h3>
                                <p className="mt-1 max-w-md text-sm text-slate-500">
                                    Misi baru dari orang tua akan muncul di
                                    sini.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {upcomingTasks.map((task, index) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* TRANSACTIONS */}
                <section>
                    <div className="mb-4 flex items-end justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-emerald-600" />
                                <h2 className="text-lg font-bold text-slate-900">
                                    Transaksi Terbaru
                                </h2>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">
                                Riwayat aktivitas saldomu.
                            </p>
                        </div>

                        <Link
                            href={route("transactions.index")}
                            className="shrink-0 text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                        >
                            Lihat semua
                        </Link>
                    </div>

                    <Card className="overflow-hidden rounded-2xl border-emerald-100/80 bg-white">
                        <CardContent className="divide-y divide-emerald-100/70 p-0">
                            {recentTransactions.length === 0 ? (
                                <div className="p-6 text-center text-sm text-slate-400">
                                    Belum ada riwayat transaksi.
                                </div>
                            ) : (
                                recentTransactions.map((tx) => (
                                    <TransactionItem
                                        key={tx.id}
                                        transaction={tx}
                                    />
                                ))
                            )}
                        </CardContent>
                    </Card>
                </section>
            </div>
        </RemajaLayout>
    );
}