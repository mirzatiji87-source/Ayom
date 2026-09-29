// resources/js/Pages/OrangTua/ApprovalCenter.jsx

import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';

import OrangTuaLayout from '@/Layouts/OrangTuaLayout';

import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';

import { initials } from '@/lib/ayom-theme';

import { ShieldCheck, Check, X } from 'lucide-react';

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

const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: (index = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: index * 0.06, duration: 0.4, ease: 'easeOut' },
    }),
};

function RequestCard({ request, index }) {
    const [reason, setReason] = useState('');
    const [showReasonBox, setShowReasonBox] = useState(false);
    const [busy, setBusy] = useState(false);

    const trx = request.transaction;
    const requester = request.requester;

    const approve = () => {
        setBusy(true);
        router.put(
            route('orang-tua.approval-center.approve', request.id),
            {},
            { preserveScroll: true, onFinish: () => setBusy(false) }
        );
    };

    const reject = () => {
        setBusy(true);
        router.put(
            route('orang-tua.approval-center.reject', request.id),
            { reason: reason || null },
            { preserveScroll: true, onFinish: () => setBusy(false) }
        );
    };

    return (
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={index}>
            {/* Amber tetap dipakai: penanda "menunggu keputusan" */}
            <Card className="overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-sm">
                <CardContent className="p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-700">
                                {initials(requester?.name)}
                            </div>

                            <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-900">{requester?.name}</p>
                                <Badge variant="outline" className="mt-1.5 rounded-full border-slate-200 bg-slate-50 text-slate-600">
                                    {roleLabel[requester?.role] ?? requester?.role}
                                </Badge>
                                <p className="mt-2 text-sm text-slate-500">{trx?.description ?? 'Tanpa keterangan'}</p>
                            </div>
                        </div>

                        <p className="shrink-0 text-right text-xl font-bold tabular-nums text-slate-900">{rupiah(trx?.amount)}</p>
                    </div>

                    {showReasonBox && (
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Alasan menolak (opsional)"
                            rows={2}
                            className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        />
                    )}

                    <div className="mt-5 flex gap-2">
                        <button
                            onClick={approve}
                            disabled={busy}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50"
                        >
                            <Check className="h-4 w-4" /> Setujui
                        </button>

                        <button
                            onClick={() => (showReasonBox ? reject() : setShowReasonBox(true))}
                            disabled={busy}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 active:scale-[0.98] disabled:opacity-50"
                        >
                            <X className="h-4 w-4" /> {showReasonBox ? 'Konfirmasi Tolak' : 'Tolak'}
                        </button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default function ApprovalCenter() {
    const { requests = [], flash } = usePage().props;

    return (
        <OrangTuaLayout title="Approval Center" subtitle="Setujui atau tolak transaksi yang menunggu persetujuan">
            <Head title="Approval Center" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
                        {flash.success}
                    </div>
                )}

                {requests.length === 0 ? (
                    <Card className="rounded-3xl border-dashed border-slate-300 bg-slate-50/60">
                        <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
                            <ShieldCheck className="h-10 w-10 text-slate-300" />
                            <p className="text-sm text-slate-500">Tidak ada transaksi yang menunggu persetujuan saat ini.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {requests.map((request, index) => (
                            <RequestCard key={request.id} request={request} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </OrangTuaLayout>
    );
}