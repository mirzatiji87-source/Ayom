// resources/js/Pages/OrangTua/GuardianMemberDetail.jsx

import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';

import OrangTuaLayout from '@/Layouts/OrangTuaLayout';

import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';

import { initials } from '@/lib/ayom-theme';

import { ArrowLeft, ArrowRight, Wallet, Settings, ArrowUpRight } from 'lucide-react';

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

function LimitBar({ label, spent, limit, trackClassName = 'bg-emerald-100', barClassName = 'bg-emerald-600' }) {
    if (limit === null || limit === undefined || Number(limit) <= 0) {
        return <p className="text-sm text-slate-400">{label}: belum diatur.</p>;
    }

    const rawPct = (Number(spent ?? 0) / Number(limit)) * 100;
    const pct = Math.min(100, rawPct);
    const isOver = rawPct > 100;
    const isNear = rawPct >= 80 && rawPct <= 100;

    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-500">{label}</span>
                <span className={`font-medium tabular-nums ${isOver ? 'text-rose-600' : 'text-slate-700'}`}>
                    {rupiah(spent)}
                    <span className="text-slate-400"> / {rupiah(limit)}</span>
                </span>
            </div>

            <Progress
                value={pct}
                className={`h-2.5 rounded-full ${isOver ? 'bg-rose-100' : trackClassName} [&>div]:rounded-full ${
                    isOver ? '[&>div]:bg-rose-500' : isNear ? '[&>div]:bg-amber-500' : `[&>div]:${barClassName}`
                }`}
            />

            {isOver && <p className="mt-1 text-xs font-medium text-rose-600">Melebihi limit</p>}
        </div>
    );
}

export default function GuardianMemberDetail() {
    const { member, transactions } = usePage().props;
    const wallet = member?.wallet;

    const rows = transactions?.data ?? [];
    const prevUrl = transactions?.prev_page_url ?? null;
    const nextUrl = transactions?.next_page_url ?? null;

    return (
        <OrangTuaLayout title={member?.name ?? 'Detail Anggota'} subtitle="Detail saldo, limit, dan riwayat transaksi">
            <Head title={member?.name ?? 'Detail Anggota'} />

            <div className="space-y-6">
                <Link
                    href={route('orang-tua.guardian-view')}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Guardian View
                </Link>

                {/* PROFIL + SALDO */}
                <motion.section
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 p-6 text-white shadow-xl shadow-emerald-200/50 sm:p-8"
                >
                    <div aria-hidden className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10" />

                    <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold text-white backdrop-blur">
                                {initials(member?.name)}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold sm:text-2xl">{member?.name}</h1>
                                <Badge variant="outline" className="mt-1.5 rounded-full border-white/30 bg-white/10 text-white">
                                    {roleLabel[member?.role] ?? member?.role}
                                </Badge>
                            </div>
                        </div>

                        <div className="text-left sm:text-right">
                            <p className="text-sm text-emerald-50">Saldo saat ini</p>
                            <p className="text-2xl font-bold sm:text-3xl">{rupiah(wallet?.balance)}</p>
                        </div>
                    </div>
                </motion.section>

                {/* LIMIT + ACTION */}
                <section className="grid gap-4 sm:grid-cols-2">
                    <Card className="rounded-3xl border-slate-200 shadow-sm">
                        <CardContent className="p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-emerald-600" />
                                <h2 className="text-base font-bold text-slate-900">Limit Wallet</h2>
                            </div>

                            <div className="space-y-4">
                                <LimitBar label="Limit harian" spent={wallet?.daily_spent} limit={wallet?.daily_limit} />
                                <LimitBar
                                    label="Limit bulanan"
                                    spent={wallet?.monthly_spent}
                                    limit={wallet?.monthly_limit}
                                    trackClassName="bg-teal-100"
                                    barClassName="bg-teal-600"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col justify-between rounded-3xl border-slate-200 shadow-sm">
                        <CardContent className="p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <Settings className="h-5 w-5 text-emerald-600" />
                                <h2 className="text-base font-bold text-slate-900">Pengaturan</h2>
                            </div>

                            <p className="text-sm text-slate-500">
                                Ambang approval saat ini:{' '}
                                <span className="font-semibold text-slate-900">{rupiah(wallet?.approval_threshold)}</span>
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                Transaksi di atas jumlah ini wajib disetujui sebelum diproses.
                            </p>

                            <Link
                                href={route('wallet.limit.edit', member?.id)}
                                className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
                            >
                                Atur Limit
                            </Link>
                        </CardContent>
                    </Card>
                </section>

                {/* TRANSAKSI */}
                <section>
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-slate-900">Riwayat Transaksi</h2>
                        <p className="mt-1 text-sm text-slate-500">Seluruh transaksi {member?.name}.</p>
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
                                    <div key={trx.id} className="flex items-center justify-between gap-4 p-5 transition hover:bg-emerald-50/40">
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-slate-900">
                                                {typeLabel[trx.type] ?? trx.type}
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
                                <Link href={prevUrl} className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                                    <ArrowLeft className="h-4 w-4" /> Sebelumnya
                                </Link>
                            ) : <span />}

                            {nextUrl ? (
                                <Link href={nextUrl} className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800">
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