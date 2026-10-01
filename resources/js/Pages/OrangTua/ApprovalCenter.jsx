// resources/js/Pages/OrangTua/ApprovalCenter.jsx

import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ShieldCheck, Check, X } from 'lucide-react';

import OrangTuaLayout from '@/Layouts/OrangTuaLayout';
import {
    EmptyState,
    FlashMessage,
    Hero,
    Panel,
    SHAPE_CARD,
    SHAPE_CARD_ALT,
    btnDanger,
    btnDangerOutline,
    btnOutline,
    btnPrimary,
    roleLabel,
} from '@/Components/OrangTua/ui';
import { formatRupiah, initials } from '@/lib/ayom-theme';

const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: (index = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: index * 0.06, duration: 0.4, ease: 'easeOut' },
    }),
};

/* Palet amber sengaja dipertahankan: kartu ini = "butuh perhatian", bukan warna tema. */
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
            <article
                className={`bg-amber-50 p-5 ring-1 ring-amber-200 sm:p-7 ${
                    index % 2 === 0 ? SHAPE_CARD : SHAPE_CARD_ALT
                }`}
            >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                        <span
                            aria-hidden="true"
                            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-200 text-base font-bold text-amber-950"
                        >
                            {initials(requester?.name)}
                        </span>

                        <div className="min-w-0">
                            <p className="truncate text-lg font-semibold text-slate-900">
                                {requester?.name}
                            </p>
                            <span className="mt-1 inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900 ring-1 ring-amber-300">
                                {roleLabel[requester?.role] ?? requester?.role}
                            </span>
                            <p className="mt-3 break-words text-base text-slate-700">
                                {trx?.description ?? 'Tanpa keterangan'}
                            </p>
                        </div>
                    </div>

                    <p className="shrink-0 text-3xl font-extrabold tracking-tight tabular-nums text-slate-900">
                        {formatRupiah(trx?.amount)}
                    </p>
                </div>

                {showReasonBox && (
                    <div className="mt-5">
                        <label htmlFor={`reason-${request.id}`} className="sr-only">
                            Alasan menolak
                        </label>
                        <textarea
                            id={`reason-${request.id}`}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Alasan menolak (opsional)"
                            rows={2}
                            className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-base placeholder:text-slate-500 focus:border-[var(--ayom-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--ayom-primary-line)]"
                        />
                    </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={approve}
                        disabled={busy}
                        className={`${btnPrimary} flex-1`}
                    >
                        <Check className="h-5 w-5" /> Setujui
                    </button>

                    <button
                        type="button"
                        onClick={() => (showReasonBox ? reject() : setShowReasonBox(true))}
                        disabled={busy}
                        className={`${showReasonBox ? btnDanger : btnDangerOutline} flex-1`}
                    >
                        <X className="h-5 w-5" /> {showReasonBox ? 'Konfirmasi Tolak' : 'Tolak'}
                    </button>

                    {showReasonBox && (
                        <button
                            type="button"
                            onClick={() => {
                                setShowReasonBox(false);
                                setReason('');
                            }}
                            disabled={busy}
                            className={btnOutline}
                        >
                            Batal
                        </button>
                    )}
                </div>
            </article>
        </motion.div>
    );
}

export default function ApprovalCenter() {
    const { requests = [], flash } = usePage().props;

    const totalNilai = requests.reduce(
        (sum, r) => sum + Number(r.transaction?.amount ?? 0),
        0
    );

    return (
        <OrangTuaLayout
            title="Approval Center"
            subtitle="Setujui atau tolak transaksi yang menunggu persetujuan"
        >
            <Head title="Approval Center" />

            <div className="mx-auto w-full max-w-6xl space-y-6 sm:space-y-8">
                {requests.length > 0 && (
                    <Hero>
                        <p className="text-lg text-white/85">Menunggu keputusan Anda</p>
                        <p className="mt-1 text-5xl font-extrabold tracking-tight sm:text-6xl">
                            {requests.length}
                            <span className="ml-3 text-2xl font-semibold text-white/85 sm:text-3xl">
                                transaksi
                            </span>
                        </p>
                        <p className="mt-4 text-base text-white/85">
                            Total nilai {formatRupiah(totalNilai)}
                        </p>
                    </Hero>
                )}

                <FlashMessage type="success">{flash?.success}</FlashMessage>

                {requests.length === 0 ? (
                    <Panel className="py-6">
                        <EmptyState icon={ShieldCheck}>
                            Tidak ada transaksi yang menunggu persetujuan saat ini.
                        </EmptyState>
                    </Panel>
                ) : (
                    <div className="grid items-start gap-5 sm:gap-6 lg:grid-cols-2">
                        {requests.map((request, index) => (
                            <RequestCard key={request.id} request={request} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </OrangTuaLayout>
    );
}