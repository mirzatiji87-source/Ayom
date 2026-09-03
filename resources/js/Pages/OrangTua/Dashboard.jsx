// resources/js/Pages/OrangTua/Dashboard.jsx

import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';

import OrangTuaLayout from '@/Layouts/OrangTuaLayout';

import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';

import { initials } from '@/lib/ayom-theme';

import {
    Wallet,
    ShieldCheck,
    ListChecks,
    TrendingDown,
    Plus,
    ArrowRight,
    ArrowUpRight,
    Sparkles,
} from 'lucide-react';

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const rupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));

const roleLabel = {
    lansia: 'Lansia',
    remaja: 'Remaja',
};

const typeLabel = {
    topup: 'Top-up',
    expense: 'Pengeluaran',
    transfer: 'Transfer',
    bill_payment: 'Bayar Tagihan',
    allowance: 'Uang Saku',
};

const statusVariant = {
    completed: 'default',
    pending: 'secondary',
    approved: 'default',
    rejected: 'destructive',
};

/*
|--------------------------------------------------------------------------
| Animation
|--------------------------------------------------------------------------
*/

const fadeUp = {
    hidden: {
        opacity: 0,
        y: 14,
    },

    show: (index = 0) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: index * 0.06,
            duration: 0.4,
            ease: 'easeOut',
        },
    }),
};

/*
|--------------------------------------------------------------------------
| CTA kecil untuk kartu
|--------------------------------------------------------------------------
|
| Sengaja menggunakan Link langsung.
| Jangan gunakan <Button asChild> karena Button kamu berbasis Base UI
| dan menyebabkan warning "asChild prop".
|
*/

function CardCta({ href, children }) {
    return (
        <Link
            href={href}
            className="
                inline-flex
                w-fit
                items-center
                gap-1.5
                rounded-full
                bg-emerald-50
                px-3.5
                py-2
                text-xs
                font-semibold
                text-emerald-700
                transition-all
                duration-200
                hover:bg-emerald-100
                hover:text-emerald-800
                active:scale-[0.97]
            "
        >
            {children}

            <ArrowRight className="h-3.5 w-3.5" />
        </Link>
    );
}

/*
|--------------------------------------------------------------------------
| Stat Card
|--------------------------------------------------------------------------
*/

function StatCard({
    icon: Icon,
    label,
    value,
    hint,
    action,
    index,
}) {
    return (
        <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={index}
            className="h-full"
        >
            <Card
                className="
                    group
                    relative
                    h-full
                    overflow-hidden
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-emerald-200
                    hover:shadow-lg
                    hover:shadow-emerald-100/60
                "
            >
                {/* Decorative circle */}
                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none
                        absolute
                        -right-8
                        -top-8
                        h-28
                        w-28
                        rounded-full
                        bg-emerald-50
                        transition-transform
                        duration-500
                        group-hover:scale-110
                    "
                />

                <CardContent className="relative flex h-full flex-col p-5 sm:p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-500">
                                {label}
                            </p>

                            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                {value}
                            </p>
                        </div>

                        {/* Icon */}
                        <div
                            className="
                                flex
                                h-12
                                w-12
                                shrink-0
                                items-center
                                justify-center
                                rounded-2xl
                                bg-gradient-to-br
                                from-emerald-500
                                to-teal-600
                                shadow-md
                                shadow-emerald-200/60
                            "
                        >
                            <Icon className="h-5 w-5 text-white" />
                        </div>
                    </div>

                    {/* Bottom */}
                    <div className="mt-auto pt-5">
                        {action ? (
                            <CardCta href={action.href}>
                                {action.label}
                            </CardCta>
                        ) : (
                            <p className="text-xs leading-relaxed text-slate-500 sm:text-sm">
                                {hint}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

/*
|--------------------------------------------------------------------------
| Limit Bar
|--------------------------------------------------------------------------
*/

function LimitBar({
    label,
    spent,
    limit,
    trackClassName = 'bg-emerald-100',
    barClassName = 'bg-emerald-600',
}) {
    if (
        limit === null ||
        limit === undefined ||
        Number(limit) <= 0
    ) {
        return null;
    }

    const rawPct =
        (Number(spent ?? 0) / Number(limit)) * 100;

    const pct = Math.min(100, rawPct);

    const isOver = rawPct > 100;
    const isNear = rawPct >= 80 && rawPct <= 100;

    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-500">
                    {label}
                </span>

                <span
                    className={`font-medium tabular-nums ${
                        isOver
                            ? 'text-rose-600'
                            : 'text-slate-700'
                    }`}
                >
                    {rupiah(spent)}

                    <span className="text-slate-400">
                        {' '}
                        / {rupiah(limit)}
                    </span>
                </span>
            </div>

            <Progress
                value={pct}
                className={`
                    h-2
                    rounded-full
                    ${isOver ? 'bg-rose-100' : trackClassName}
                    [&>div]:rounded-full
                    ${
                        isOver
                            ? '[&>div]:bg-rose-500'
                            : isNear
                              ? '[&>div]:bg-amber-500'
                              : `[&>div]:${barClassName}`
                    }
                `}
            />

            {isOver && (
                <p className="mt-1 text-xs font-medium text-rose-600">
                    Melebihi limit
                </p>
            )}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Member Card
|--------------------------------------------------------------------------
*/

function MemberCard({ member, index }) {
    const wallet = member.wallet;

    return (
        <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={index}
            className="h-full"
        >
            <Card
                className="
                    flex
                    h-full
                    flex-col
                    overflow-hidden
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-emerald-200
                    hover:shadow-lg
                    hover:shadow-emerald-100/50
                "
            >
                <CardContent className="flex flex-1 flex-col p-5 sm:p-6">
                    {/* Member header */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <div
                                className="
                                    flex
                                    h-12
                                    w-12
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-gradient-to-br
                                    from-emerald-500
                                    to-teal-600
                                    text-sm
                                    font-bold
                                    text-white
                                    shadow-sm
                                    shadow-emerald-200
                                "
                            >
                                {initials(member.name)}
                            </div>

                            <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-900">
                                    {member.name}
                                </p>

                                <Badge
                                    variant="outline"
                                    className="
                                        mt-1.5
                                        rounded-full
                                        border-emerald-200
                                        bg-emerald-50
                                        text-emerald-700
                                    "
                                >
                                    {roleLabel[member.role] ??
                                        member.role}
                                </Badge>
                            </div>
                        </div>

                        <p className="shrink-0 text-right text-lg font-bold tabular-nums text-slate-900">
                            {rupiah(wallet?.balance)}
                        </p>
                    </div>

                    {/* Wallet */}
                    {wallet ? (
                        <div className="mt-5 space-y-4">
                            <LimitBar
                                label="Limit harian"
                                spent={wallet.daily_spent}
                                limit={wallet.daily_limit}
                                trackClassName="bg-emerald-100"
                                barClassName="bg-emerald-600"
                            />

                            <LimitBar
                                label="Limit bulanan"
                                spent={wallet.monthly_spent}
                                limit={wallet.monthly_limit}
                                trackClassName="bg-teal-100"
                                barClassName="bg-teal-600"
                            />
                        </div>
                    ) : (
                        <p className="mt-5 text-sm text-slate-500">
                            Belum punya wallet.
                        </p>
                    )}

                    {/* Buttons */}
                    <div className="mt-auto flex gap-2 pt-6">
                        <Link
                            href={route(
                                'orang-tua.guardian-view.show',
                                member.id
                            )}
                            className="
                                flex
                                flex-1
                                items-center
                                justify-center
                                rounded-xl
                                bg-emerald-600
                                px-3
                                py-2.5
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-emerald-700
                                active:scale-[0.98]
                            "
                        >
                            Lihat Detail
                        </Link>

                        <Link
                            href={route(
                                'wallet.limit.edit',
                                member.id
                            )}
                            className="
                                flex
                                flex-1
                                items-center
                                justify-center
                                rounded-xl
                                border
                                border-emerald-200
                                bg-white
                                px-3
                                py-2.5
                                text-sm
                                font-semibold
                                text-emerald-700
                                transition
                                hover:bg-emerald-50
                                active:scale-[0.98]
                            "
                        >
                            Atur Limit
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

export default function Dashboard() {
    const { auth } = usePage().props;

    const {
        family,
        members = [],
        pendingApprovals = [],
        pendingApprovalsCount = 0,
        pendingTasksCount = 0,
        recentTransactions = [],
        monthlyExpense = 0,
    } = usePage().props;

    return (
        <OrangTuaLayout
            title="Dashboard"
            subtitle="Ringkasan keuangan dan aktivitas keluarga"
        >
            <Head title="Dashboard" />

            <div className="space-y-8">
                {/* ======================================================
                    HERO
                ====================================================== */}

                <motion.section
                    initial={{
                        opacity: 0,
                        y: -10,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.45,
                        ease: 'easeOut',
                    }}
                    className="
                        relative
                        overflow-hidden
                        rounded-3xl
                        bg-gradient-to-br
                        from-emerald-600
                        via-emerald-600
                        to-teal-600
                        p-6
                        text-white
                        shadow-xl
                        shadow-emerald-200/50
                        sm:p-8
                    "
                >
                    {/* Decoration */}
                    <div
                        aria-hidden="true"
                        className="
                            pointer-events-none
                            absolute
                            -right-10
                            -top-16
                            h-48
                            w-48
                            rounded-full
                            bg-white/10
                        "
                    />

                    <div
                        aria-hidden="true"
                        className="
                            pointer-events-none
                            absolute
                            -bottom-20
                            -left-10
                            h-40
                            w-40
                            rounded-full
                            bg-white/10
                        "
                    />

                    <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-50">
                                <Sparkles className="h-4 w-4" />

                                Ringkasan hari ini
                            </p>

                            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                                Halo,{' '}
                                {auth?.user?.name?.split(' ')[0] ??
                                    'Orang Tua'}
                            </h1>

                            <p className="mt-2 text-sm text-emerald-50 sm:text-base">
                                {family?.name ?? 'Keluarga'}{' '}
                                ·{' '}
                                {family?.members_count ?? 0}{' '}
                                anggota keluarga
                            </p>
                        </div>

                        <Link
                            href={route(
                                'orang-tua.top-up.form'
                            )}
                            className="
                                inline-flex
                                w-fit
                                items-center
                                gap-2
                                rounded-xl
                                bg-white
                                px-4
                                py-2.5
                                text-sm
                                font-bold
                                text-emerald-700
                                shadow-sm
                                transition
                                hover:bg-emerald-50
                                active:scale-[0.97]
                            "
                        >
                            <ArrowUpRight className="h-4 w-4" />

                            Top-up Saldo
                        </Link>
                    </div>
                </motion.section>

                {/* ======================================================
                    APPROVAL ALERT
                ====================================================== */}

                {pendingApprovalsCount > 0 && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 8,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            delay: 0.1,
                            duration: 0.35,
                        }}
                    >
                        <Alert
                            className="
                                overflow-hidden
                                rounded-3xl
                                border
                                border-amber-200
                                bg-gradient-to-br
                                from-amber-50
                                to-orange-50
                                px-5
                                py-5
                                shadow-sm
                            "
                        >
                            <ShieldCheck className="mt-0.5 h-5 w-5 text-amber-600" />

                            <div className="ml-1 flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <AlertTitle className="text-base font-bold text-amber-900 sm:text-lg">
                                        Ada transaksi menunggu
                                        persetujuan
                                    </AlertTitle>

                                    <AlertDescription className="mt-1 text-sm text-amber-800">
                                        {pendingApprovalsCount}{' '}
                                        transaksi menunggu
                                        keputusan Anda.
                                    </AlertDescription>
                                </div>

                                <Link
                                    href={route(
                                        'orang-tua.approval-center'
                                    )}
                                    className="
                                        inline-flex
                                        w-fit
                                        shrink-0
                                        items-center
                                        gap-2
                                        rounded-xl
                                        bg-emerald-600
                                        px-4
                                        py-2.5
                                        text-sm
                                        font-bold
                                        text-white
                                        shadow-sm
                                        transition
                                        hover:bg-emerald-700
                                        active:scale-[0.97]
                                    "
                                >
                                    Tinjau Sekarang

                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </Alert>
                    </motion.div>
                )}

                {/* ======================================================
                    RINGKASAN
                ====================================================== */}

                <section>
                    <div className="mb-5">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Ringkasan
                        </h2>

                        <p className="mt-1.5 text-sm text-slate-500 sm:text-base">
                            Kondisi keuangan dan aktivitas keluarga
                        </p>
                    </div>

                    {/* Cards */}
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            index={0}
                            icon={Wallet}
                            label="Saldo Keluarga"
                            value={rupiah(family?.balance)}
                            action={{
                                href: route(
                                    'orang-tua.top-up.form'
                                ),
                                label: 'Top-up saldo',
                            }}
                        />

                        <StatCard
                            index={1}
                            icon={TrendingDown}
                            label="Pengeluaran Bulan Ini"
                            value={rupiah(monthlyExpense)}
                            hint="Total pengeluaran seluruh anggota"
                        />

                        <StatCard
                            index={2}
                            icon={ShieldCheck}
                            label="Menunggu Persetujuan"
                            value={pendingApprovalsCount}
                            action={{
                                href: route(
                                    'orang-tua.approval-center'
                                ),
                                label: 'Buka approval center',
                            }}
                        />

                        <StatCard
                            index={3}
                            icon={ListChecks}
                            label="Misi Menunggu Review"
                            value={pendingTasksCount}
                            hint="Misi remaja yang sudah disubmit"
                        />
                    </div>
                </section>

                {/* ======================================================
                    ANGGOTA KELUARGA
                ====================================================== */}

                <section>
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                Anggota Keluarga
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Pantau saldo dan batas pengeluaran anggota.
                            </p>
                        </div>

                        <Link
                            href={route('dependents.create')}
                            className="
                                inline-flex
                                w-fit
                                items-center
                                gap-1.5
                                rounded-xl
                                bg-emerald-600
                                px-4
                                py-2.5
                                text-sm
                                font-semibold
                                text-white
                                shadow-sm
                                transition
                                hover:bg-emerald-700
                                active:scale-[0.97]
                            "
                        >
                            <Plus className="h-4 w-4" />

                            Tambah Akun
                        </Link>
                    </div>

                    {members.length === 0 ? (
                        <Card className="rounded-3xl border-dashed border-emerald-200 bg-emerald-50/40">
                            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
                                    <Plus className="h-7 w-7 text-emerald-600" />
                                </div>

                                <p className="max-w-md text-sm leading-relaxed text-slate-500">
                                    Belum ada akun lansia atau remaja.
                                    Tambahkan anggota keluarga untuk
                                    mulai mengatur wallet dan limit.
                                </p>

                                <Link
                                    href={route(
                                        'dependents.create'
                                    )}
                                    className="
                                        rounded-xl
                                        bg-emerald-600
                                        px-4
                                        py-2.5
                                        text-sm
                                        font-semibold
                                        text-white
                                        transition
                                        hover:bg-emerald-700
                                    "
                                >
                                    Tambah Akun Sekarang
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

                {/* ======================================================
                    AKTIVITAS
                ====================================================== */}

                <div className="grid gap-6 xl:grid-cols-2">
                    {/* Approval */}
                    <section>
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    Menunggu Persetujuan
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Transaksi yang perlu Anda tinjau.
                                </p>
                            </div>

                            <Link
                                href={route(
                                    'orang-tua.approval-center'
                                )}
                                className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                            >
                                Lihat semua

                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <Card className="overflow-hidden rounded-3xl border-slate-200">
                            <CardContent className="divide-y divide-slate-100 p-0">
                                {pendingApprovals.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <ShieldCheck className="mx-auto h-8 w-8 text-emerald-500" />

                                        <p className="mt-3 text-sm text-slate-500">
                                            Tidak ada transaksi yang
                                            menunggu persetujuan.
                                        </p>
                                    </div>
                                ) : (
                                    pendingApprovals.map((approval) => (
                                        <div
                                            key={approval.id}
                                            className="
                                                flex
                                                items-center
                                                justify-between
                                                gap-4
                                                p-5
                                                transition
                                                hover:bg-emerald-50/40
                                            "
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-slate-900">
                                                    {approval.requester?.name}
                                                </p>

                                                <p className="mt-1 truncate text-sm text-slate-500">
                                                    {approval.transaction?.description ??
                                                        'Tanpa keterangan'}
                                                </p>
                                            </div>

                                            <div className="shrink-0 text-right">
                                                <p className="font-bold tabular-nums text-slate-900">
                                                    {rupiah(
                                                        approval
                                                            .transaction
                                                            ?.amount
                                                    )}
                                                </p>

                                                <Badge
                                                    variant="secondary"
                                                    className="mt-1 rounded-full bg-amber-100 text-amber-800"
                                                >
                                                    Pending
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </section>

                    {/* Transactions */}
                    <section>
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    Aktivitas Terbaru
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Transaksi terakhir keluarga.
                                </p>
                            </div>

                            <Link
                                href={route(
                                    'orang-tua.guardian-view'
                                )}
                                className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                            >
                                Guardian View

                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <Card className="overflow-hidden rounded-3xl border-slate-200">
                            <CardContent className="divide-y divide-slate-100 p-0">
                                {recentTransactions.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Wallet className="mx-auto h-8 w-8 text-slate-300" />

                                        <p className="mt-3 text-sm text-slate-500">
                                            Belum ada transaksi.
                                        </p>
                                    </div>
                                ) : (
                                    recentTransactions.map((trx) => (
                                        <div
                                            key={trx.id}
                                            className="
                                                flex
                                                items-center
                                                justify-between
                                                gap-4
                                                p-5
                                                transition
                                                hover:bg-emerald-50/40
                                            "
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-slate-900">
                                                    {trx.user?.name}

                                                    <span className="ml-2 font-normal text-slate-400">
                                                        {typeLabel[
                                                            trx.type
                                                        ] ??
                                                            trx.type}
                                                    </span>
                                                </p>

                                                <p className="mt-1 truncate text-sm text-slate-500">
                                                    {trx.description ??
                                                        '-'}
                                                </p>
                                            </div>

                                            <div className="shrink-0 text-right">
                                                <p className="font-bold tabular-nums text-slate-900">
                                                    {rupiah(
                                                        trx.amount
                                                    )}
                                                </p>

                                                <Badge
                                                    variant={
                                                        statusVariant[
                                                            trx.status
                                                        ] ??
                                                        'outline'
                                                    }
                                                    className="mt-1 rounded-full"
                                                >
                                                    {trx.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>
        </OrangTuaLayout>
    );
}