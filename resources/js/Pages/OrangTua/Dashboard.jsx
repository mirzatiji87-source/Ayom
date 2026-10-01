import { Head, Link, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";

import OrangTuaLayout from "@/Layouts/OrangTuaLayout";

import { Badge } from "@/Components/ui/badge";

import {
    EmptyState,
    LimitBar,
    SHAPE_HERO,
    SHAPE_CARD,
    SHAPE_CARD_ALT,
    SectionHead,
    roleLabel,
    typeLabel,
} from "@/Components/OrangTua/ui";

import { formatDate, initials } from "@/lib/ayom-theme";

import CreateTaskDialog from "@/Components/OrangTua/CreateTaskDialog";

import {
    Wallet,
    ShieldCheck,
    ListChecks,
    TrendingDown,
    Plus,
    ArrowRight,
    ArrowUpRight,
} from "lucide-react";

/* ---------- Helpers ---------- */

const rupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));

const statusVariant = {
    completed: "default",
    pending: "secondary",
    approved: "default",
    rejected: "destructive",
};

const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: (index = 0) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: index * 0.06,
            duration: 0.4,
            ease: "easeOut",
        },
    }),
};

/* ---------- Komponen kecil ---------- */

function CardCta({ href, children }) {
    return (
        <Link
            href={href}
            className="inline-flex w-fit max-w-full cursor-pointer items-center gap-1.5 rounded-full bg-[var(--ayom-primary-soft)] px-4 py-2 text-sm font-semibold text-[var(--ayom-primary)] transition-colors duration-200 hover:bg-[var(--ayom-primary-line)] active:scale-[0.97]"
        >
            {children}
            <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
    );
}

function StatCard({ icon: Icon, label, value, hint, action, index }) {
    return (
        <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={index}
            className="h-full min-w-0"
        >
            <div
                className={`flex h-full min-w-0 flex-col bg-white p-6 ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:ring-[var(--ayom-primary)] sm:p-7 ${SHAPE_CARD}`}
            >
                <div className="flex min-w-0 items-center gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--ayom-primary)] text-white">
                        <Icon className="h-7 w-7" />
                    </span>

                    <p className="min-w-0 text-base font-medium leading-snug text-slate-600">
                        {label}
                    </p>
                </div>

                <p className="mt-5 break-words text-3xl font-extrabold tracking-tight tabular-nums text-slate-900 sm:text-4xl">
                    {value}
                </p>

                <div className="mt-auto min-w-0 pt-5">
                    {action ? (
                        <CardCta href={action.href}>
                            {action.label}
                        </CardCta>
                    ) : (
                        <p className="text-sm leading-relaxed text-slate-600">
                            {hint}
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function MemberCard({ member, index }) {
    const wallet = member.wallet;

    return (
        <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={index}
            className="h-full min-w-0"
        >
            <div
                className={`flex h-full min-w-0 flex-col bg-white p-6 ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:ring-[var(--ayom-primary)] sm:p-7 ${
                    index % 2 === 0 ? SHAPE_CARD : SHAPE_CARD_ALT
                }`}
            >
                <div className="flex min-w-0 items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--ayom-primary)] text-base font-bold text-white">
                            {initials(member.name)}
                        </span>

                        <div className="min-w-0">
                            <p className="truncate text-lg font-semibold text-slate-900">
                                {member.name}
                            </p>

                            <Badge
                                variant="outline"
                                className="mt-1 max-w-full rounded-full border-[var(--ayom-primary-line)] bg-[var(--ayom-primary-soft)] text-[var(--ayom-primary)]"
                            >
                                {roleLabel[member.role] ?? member.role}
                            </Badge>
                        </div>
                    </div>

                    <div className="min-w-0 shrink-0 text-right">
                        <p className="break-words text-xl font-extrabold tabular-nums text-slate-900">
                            {rupiah(wallet?.balance)}
                        </p>

                        <Link
                            href={route("orang-tua.top-up.form", {
                                recipient_id: member.id,
                            })}
                            className="mt-1 inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-[var(--ayom-primary)] transition-opacity duration-200 hover:underline"
                        >
                            <Plus className="h-4 w-4 shrink-0" />
                            Isi saldo
                        </Link>
                    </div>
                </div>

                {wallet ? (
                    <div className="mt-6 min-w-0 space-y-5">
                        <LimitBar
                            label="Limit harian"
                            spent={wallet.daily_spent}
                            limit={wallet.daily_limit}
                            barClassName="[&>div]:bg-[var(--ayom-primary)]"
                        />

                        <LimitBar
                            label="Limit bulanan"
                            spent={wallet.monthly_spent}
                            limit={wallet.monthly_limit}
                            barClassName="[&>div]:bg-slate-500"
                        />
                    </div>
                ) : (
                    <p className="mt-6 text-base text-slate-600">
                        Belum punya wallet.
                    </p>
                )}

                <div className="mt-auto flex min-w-0 gap-3 pt-7">
                    <Link
                        href={route(
                            "orang-tua.guardian-view.show",
                            member.id,
                        )}
                        className="flex min-w-0 flex-1 cursor-pointer items-center justify-center rounded-full bg-[var(--ayom-primary)] px-4 py-3 text-base font-semibold text-white transition-colors duration-200 hover:bg-[var(--ayom-primary-dark)] active:scale-[0.98]"
                    >
                        Lihat Detail
                    </Link>

                    <Link
                        href={route("wallet.limit.edit", member.id)}
                        className="flex min-w-0 flex-1 cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-50 active:scale-[0.98]"
                    >
                        Atur Limit
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

/* ---------- Dashboard ---------- */

export default function Dashboard() {
    const { auth } = usePage().props;

    const {
        family,
        members = [],
        dependents = [],
        pendingApprovals = [],
        pendingApprovalsCount = 0,
        pendingTasksCount = 0,
        submittedTasks = [],
        recentTransactions = [],
        monthlyExpense = 0,
    } = usePage().props;

    return (
        <OrangTuaLayout
            title="Dashboard"
            subtitle="Ringkasan keuangan dan aktivitas keluarga"
        >
            <Head title="Dashboard" />

            <div className="w-full min-w-0 max-w-full space-y-8 overflow-x-hidden sm:space-y-10">
                {/* HERO: saldo keluarga + top-up */}
                <motion.section
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.45,
                        ease: "easeOut",
                    }}
                    className={`relative w-full min-w-0 max-w-full overflow-hidden bg-[var(--ayom-primary)] px-6 py-8 text-white sm:px-10 sm:py-10 ${SHAPE_HERO}`}
                >
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 400 400"
                        className="pointer-events-none absolute -bottom-28 -right-28 h-[24rem] w-[24rem] max-w-none text-white/15"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="200" cy="200" r="60" />
                        <circle cx="200" cy="200" r="110" />
                        <circle cx="200" cy="200" r="160" />
                        <circle cx="200" cy="200" r="195" />
                    </svg>

                    <div className="relative flex min-w-0 max-w-full flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                        <div className="min-w-0 max-w-full">
                            <p className="break-words text-base text-white/85">
                                {family?.name ?? "Keluarga"} ·{" "}
                                {family?.members_count ?? 0} anggota
                            </p>

                            <h1 className="mt-1 font-serif text-3xl leading-snug sm:text-4xl">
                                Halo,{" "}
                                {auth?.user?.name?.split(" ")[0] ??
                                    "Orang Tua"}
                            </h1>

                            <p className="mt-6 text-lg text-white/85">
                                Saldo keluarga
                            </p>

                            <p className="max-w-full break-words text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl">
                                {rupiah(family?.balance)}
                            </p>
                        </div>

                        <Link
                            href={route("orang-tua.top-up.form")}
                            className="inline-flex w-fit max-w-full shrink-0 cursor-pointer items-center gap-2 rounded-full bg-white px-6 py-3.5 text-base font-bold text-[var(--ayom-primary)] shadow-sm transition-colors duration-200 hover:bg-white/90 active:scale-[0.97]"
                        >
                            <ArrowUpRight className="h-5 w-5 shrink-0" />
                            Top-up Saldo
                        </Link>
                    </div>
                </motion.section>

                {/* PERINGATAN APPROVAL */}
                {pendingApprovalsCount > 0 && (
                    <motion.div
                        role="status"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: 0.1,
                            duration: 0.35,
                        }}
                        className="flex min-w-0 flex-col gap-4 overflow-hidden rounded-3xl bg-amber-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7"
                    >
                        <div className="flex min-w-0 items-center gap-4">
                            <ShieldCheck className="h-8 w-8 shrink-0 text-amber-700" />

                            <div className="min-w-0">
                                <p className="break-words text-lg font-bold text-amber-950">
                                    Ada transaksi menunggu persetujuan
                                </p>

                                <p className="break-words text-base text-amber-900">
                                    {pendingApprovalsCount} transaksi menunggu
                                    keputusan Anda.
                                </p>
                            </div>
                        </div>

                        <Link
                            href={route("orang-tua.approval-center")}
                            className="inline-flex w-fit shrink-0 cursor-pointer items-center gap-2 rounded-full bg-amber-700 px-6 py-3 text-base font-bold text-white transition-colors duration-200 hover:bg-amber-800 active:scale-[0.97]"
                        >
                            Tinjau Sekarang
                            <ArrowRight className="h-5 w-5 shrink-0" />
                        </Link>
                    </motion.div>
                )}

                {/* RINGKASAN */}
                <section className="min-w-0">
                    <SectionHead
                        title="Ringkasan"
                        desc="Kondisi keuangan dan aktivitas keluarga"
                    />

                    <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard
                            index={0}
                            icon={TrendingDown}
                            label="Pengeluaran Bulan Ini"
                            value={rupiah(monthlyExpense)}
                            hint="Total pengeluaran seluruh anggota"
                        />

                        <StatCard
                            index={1}
                            icon={ShieldCheck}
                            label="Menunggu Persetujuan"
                            value={pendingApprovalsCount}
                            action={{
                                href: route("orang-tua.approval-center"),
                                label: "Buka approval center",
                            }}
                        />

                        <StatCard
                            index={2}
                            icon={ListChecks}
                            label="Misi Menunggu Review"
                            value={pendingTasksCount}
                            action={{
                                href: route("orang-tua.tasks.index"),
                                label: "Tinjau misi",
                            }}
                        />
                    </div>
                </section>

                {/* ANGGOTA KELUARGA */}
                <section className="min-w-0">
                    <div className="mb-4 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="min-w-0">
                            <h2 className="font-serif text-2xl text-slate-900 sm:text-3xl">
                                Anggota Keluarga
                            </h2>

                            <p className="mt-1 text-sm text-slate-600 sm:text-base">
                                Pantau saldo dan batas pengeluaran anggota.
                            </p>
                        </div>

                        <div className="flex min-w-0 flex-wrap gap-3">
                            <CreateTaskDialog dependents={dependents} />

                            <Link
                                href={route("dependents.create")}
                                className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full bg-[var(--ayom-primary)] px-5 py-2.5 text-base font-semibold text-white transition-colors duration-200 hover:bg-[var(--ayom-primary-dark)] active:scale-[0.97]"
                            >
                                <Plus className="h-5 w-5 shrink-0" />
                                Tambah Akun
                            </Link>
                        </div>
                    </div>

                    {members.length === 0 ? (
                        <div
                            className={`min-w-0 overflow-hidden bg-slate-50 px-6 py-6 ring-1 ring-slate-200 ${SHAPE_CARD}`}
                        >
                            <EmptyState icon={Plus}>
                                Belum ada akun lansia atau remaja. Tambahkan
                                anggota keluarga untuk mulai mengatur wallet
                                dan limit.
                            </EmptyState>

                            <div className="flex justify-center pb-4">
                                <Link
                                    href={route("dependents.create")}
                                    className="cursor-pointer rounded-full bg-[var(--ayom-primary)] px-6 py-3 text-base font-semibold text-white transition-colors duration-200 hover:bg-[var(--ayom-primary-dark)]"
                                >
                                    Tambah Akun Sekarang
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {members.map((member, index) => (
                                <MemberCard
                                    key={member.id}
                                    member={member}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* MISI MENUNGGU REVIEW */}
                {submittedTasks.length > 0 && (
                    <section className="min-w-0">
                        <SectionHead
                            title="Misi Menunggu Review"
                            desc="Misi yang sudah dikirim anak dan menunggu keputusanmu."
                            href={route("orang-tua.tasks.index")}
                        />

                        <ul
                            className={`min-w-0 overflow-hidden bg-slate-50 px-5 ring-1 ring-slate-200 sm:px-8 ${SHAPE_CARD}`}
                        >
                            {submittedTasks.map((task) => (
                                <li
                                    key={task.id}
                                    className="min-w-0 border-b border-slate-200 last:border-b-0"
                                >
                                    <Link
                                        href={route(
                                            "orang-tua.tasks.index",
                                        )}
                                        className="flex min-w-0 cursor-pointer items-center justify-between gap-4 py-4 transition-opacity duration-200 hover:opacity-70"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-lg font-semibold text-slate-900">
                                                {task.title}
                                            </p>

                                            <p className="mt-0.5 truncate text-base text-slate-600">
                                                {task.assignee?.name}
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-3">
                                            <span className="text-lg font-bold tabular-nums text-slate-900">
                                                {rupiah(task.reward_amount)}
                                            </span>

                                            <ArrowRight className="h-5 w-5 shrink-0 text-[var(--ayom-primary)]" />
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* APPROVAL + AKTIVITAS */}
                <div className="grid min-w-0 gap-8 xl:grid-cols-2">
                    <section className="min-w-0">
                        <SectionHead
                            title="Menunggu Persetujuan"
                            desc="Transaksi yang perlu Anda tinjau."
                            href={route("orang-tua.approval-center")}
                        />

                        <div
                            className={`min-w-0 overflow-hidden bg-slate-50 px-5 ring-1 ring-slate-200 sm:px-8 ${SHAPE_CARD}`}
                        >
                            {pendingApprovals.length === 0 ? (
                                <EmptyState icon={ShieldCheck}>
                                    Tidak ada transaksi yang menunggu
                                    persetujuan.
                                </EmptyState>
                            ) : (
                                <ul className="min-w-0">
                                    {pendingApprovals.map((approval) => (
                                        <li
                                            key={approval.id}
                                            className="flex min-w-0 items-center justify-between gap-4 border-b border-slate-200 py-4 last:border-b-0"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-lg font-semibold text-slate-900">
                                                    {approval.requester?.name}
                                                </p>

                                                <p className="mt-0.5 truncate text-base text-slate-600">
                                                    {approval.transaction
                                                        ?.description ??
                                                        "Tanpa keterangan"}
                                                </p>
                                            </div>

                                            <div className="shrink-0 text-right">
                                                <p className="text-lg font-bold tabular-nums text-slate-900">
                                                    {rupiah(
                                                        approval.transaction
                                                            ?.amount,
                                                    )}
                                                </p>

                                                <Badge
                                                    variant="secondary"
                                                    className="mt-1 rounded-full bg-amber-100 text-amber-900"
                                                >
                                                    Pending
                                                </Badge>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </section>

                    <section className="min-w-0">
                        <SectionHead
                            title="Aktivitas Terbaru"
                            desc="Transaksi terakhir keluarga."
                            href={route("orang-tua.guardian-view")}
                            linkLabel="Guardian View"
                        />

                        <div
                            className={`min-w-0 overflow-hidden bg-slate-50 px-5 ring-1 ring-slate-200 sm:px-8 ${SHAPE_CARD_ALT}`}
                        >
                            {recentTransactions.length === 0 ? (
                                <EmptyState icon={Wallet}>
                                    Belum ada aktivitas transaksi.
                                </EmptyState>
                            ) : (
                                <ul className="min-w-0">
                                    {recentTransactions.map((tx) => (
                                        <li
                                            key={tx.id}
                                            className="flex min-w-0 items-center justify-between gap-4 border-b border-slate-200 py-4 last:border-b-0"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-lg font-semibold text-slate-900">
                                                    {tx.user?.name ??
                                                        tx.description}
                                                </p>

                                                <p className="mt-0.5 truncate text-sm text-slate-600">
                                                    {typeLabel[tx.type] ??
                                                        tx.type}{" "}
                                                    ·{" "}
                                                    {formatDate(
                                                        tx.created_at,
                                                    )}
                                                </p>
                                            </div>

                                            <div className="shrink-0 text-right">
                                                <p className="text-lg font-bold tabular-nums text-slate-900">
                                                    {rupiah(tx.amount)}
                                                </p>

                                                <Badge
                                                    variant={
                                                        statusVariant[
                                                            tx.status
                                                        ] ?? "secondary"
                                                    }
                                                    className="mt-1 rounded-full text-xs"
                                                >
                                                    {tx.status}
                                                </Badge>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </OrangTuaLayout>
    );
}