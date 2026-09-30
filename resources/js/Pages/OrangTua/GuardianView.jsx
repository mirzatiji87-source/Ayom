// resources/js/Pages/OrangTua/GuardianView.jsx

import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';

import OrangTuaLayout from '@/Layouts/OrangTuaLayout';

import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';

import { initials } from '@/lib/ayom-theme';

import {
    Eye,
    Wallet,
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
} from 'lucide-react';

/*
|--------------------------------------------------------------------------
| Helpers (konsisten dengan OrangTua/Dashboard.jsx)
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

const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: (index = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: index * 0.06, duration: 0.4, ease: 'easeOut' },
    }),
};

/*
|--------------------------------------------------------------------------
| Limit Bar (disalin dari Dashboard.jsx biar konsisten)
|--------------------------------------------------------------------------
*/

function LimitBar({ label, spent, limit, trackClassName = 'bg-slate-100', barClassName = 'bg-[var(--ayom-primary)]' }) {
    if (limit === null || limit === undefined || Number(limit) <= 0) {
        return null;
    }

    const rawPct = (Number(spent ?? 0) / Number(limit)) * 100;
    const pct = Math.min(100, rawPct);
    const isOver = rawPct > 100;
    const isNear = rawPct >= 80 && rawPct <= 100;

    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-500">{label}</span>
                <span className={`font-medium tabular-nums ${isOver ? 'text-rose-600' : 'text-slate-700'}`}>
                    {rupiah(spent)}
                    <span className="text-slate-400"> / {rupiah(limit)}</span>
                </span>
            </div>

            <Progress
                value={pct}
                className={`h-2 rounded-full ${isOver ? 'bg-rose-100' : trackClassName} [&>div]:rounded-full ${
                    isOver ? '[&>div]:bg-rose-500' : isNear ? '[&>div]:bg-amber-500' : `[&>div]:${barClassName}`
                }`}
            />

            {isOver && <p className="mt-1 text-xs font-medium text-rose-600">Melebihi limit</p>}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Member Row
|--------------------------------------------------------------------------
*/

function MemberRow({ member, index }) {
    const wallet = member.wallet;

    return (
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={index}>
            <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
                <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-700 text-sm font-bold text-white shadow-sm shadow-slate-200">
                            {initials(member.name)}
                        </div>

                        <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">{member.name}</p>
                            <Badge variant="outline" className="mt-1.5 rounded-full border-[var(--ayom-primary)]/25 bg-[var(--ayom-primary)]/10 text-[var(--ayom-primary)]">
                                {roleLabel[member.role] ?? member.role}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid flex-1 gap-4 sm:max-w-md sm:grid-cols-2">
                        <LimitBar label="Limit harian" spent={wallet?.daily_spent} limit={wallet?.daily_limit} />
                        <LimitBar
                            label="Limit bulanan"
                            spent={wallet?.monthly_spent}
                            limit={wallet?.monthly_limit}
                            trackClassName="bg-slate-100"
                            barClassName="bg-slate-500"
                        />
                    </div>

                    <div className="flex shrink-0 items-center gap-4">
                        <p className="text-right text-lg font-bold tabular-nums text-slate-900">{rupiah(wallet?.balance)}</p>

                        <Link
                            href={route('orang-tua.guardian-view.show', member.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--ayom-primary)] px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--ayom-primary-dark)] active:scale-[0.98]"
                        >
                            <Eye className="h-4 w-4" />
                            Detail
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function GuardianView() {
    const { members = [], transactions, flash } = usePage().props;

    const rows = transactions?.data ?? [];
    const prevUrl = transactions?.prev_page_url ?? null;
    const nextUrl = transactions?.next_page_url ?? null;

    return (
        <OrangTuaLayout title="Guardian View" subtitle="Pantau arus kas belanja lansia dan remaja secara transparan">
            <Head title="Guardian View" />

            <div className="space-y-8">
                {flash?.success && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                        {flash.success}
                    </div>
                )}

                {/* ANGGOTA */}
                <section>
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-slate-900">Anggota Keluarga</h2>
                        <p className="mt-1 text-sm text-slate-500">Saldo dan pemakaian limit tiap anggota.</p>
                    </div>

                    {members.length === 0 ? (
                        <Card className="rounded-3xl border-dashed border-slate-300 bg-slate-50/60">
                            <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
                                <Wallet className="h-8 w-8 text-slate-400" />
                                <p className="text-sm text-slate-500">Belum ada anggota lansia/remaja untuk dipantau.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {members.map((member, index) => (
                                <MemberRow key={member.id} member={member} index={index} />
                            ))}
                        </div>
                    )}
                </section>

                {/* TRANSAKSI */}
                <section>
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-slate-900">Riwayat Transaksi</h2>
                        <p className="mt-1 text-sm text-slate-500">Seluruh transaksi anggota keluarga.</p>
                    </div>

                    <Card className="overflow-hidden rounded-3xl border-slate-200">
                        <CardContent className="divide-y divide-slate-100 p-0">
                            {rows.length === 0 ? (
                                <div className="p-8 text-center">
                                    <ArrowUpRight className="mx-auto h-8 w-8 text-slate-300" />
                                    <p className="mt-3 text-sm text-slate-500">Belum ada transaksi.</p>
                                </div>
                            ) : (
                                rows.map((trx) => (
                                    <div key={trx.id} className="flex items-center justify-between gap-4 p-5 transition hover:bg-slate-50">
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-slate-900">
                                                {trx.user?.name}
                                                <span className="ml-2 font-normal text-slate-400">{typeLabel[trx.type] ?? trx.type}</span>
                                            </p>
                                            <p className="mt-1 truncate text-sm text-slate-500">{trx.description ?? '-'}</p>
                                        </div>

                                        <div className="shrink-0 text-right">
                                            <p className="font-bold tabular-nums text-slate-900">{rupiah(trx.amount)}</p>
                                            <Badge variant={statusVariant[trx.status] ?? 'outline'} className="mt-1 rounded-full">
                                                {trx.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {(prevUrl || nextUrl) && (
                        <div className="mt-4 flex items-center justify-between">
                            {prevUrl ? (
                                <Link href={prevUrl} className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--ayom-primary)] hover:opacity-80">
                                    <ArrowLeft className="h-4 w-4" /> Sebelumnya
                                </Link>
                            ) : <span />}

                            {nextUrl ? (
                                <Link href={nextUrl} className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--ayom-primary)] hover:opacity-80">
                                    Selanjutnya <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : <span />}
                        </div>
                    )}
                </section>
            </div>
        </OrangTuaLayout>
    );
}