import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';

import OrangTuaLayout from '@/Layouts/OrangTuaLayout';
import CreateBillDialog from '@/Components/OrangTua/CreateBillDialog';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { formatDate, formatRupiah } from '@/lib/ayom-theme';
import { AlertTriangle, Loader2, Receipt } from 'lucide-react';

const CATEGORY_LABEL = {
    listrik: 'Listrik',
    air: 'Air',
    bpjs: 'BPJS Kesehatan',
    obat: 'Obat',
    internet: 'Internet',
    lainnya: 'Lainnya',
};

function statusJatuhTempo(tanggal) {
    const sekarang = new Date();
    sekarang.setHours(0, 0, 0, 0);
    const jatuhTempo = new Date(tanggal);
    jatuhTempo.setHours(0, 0, 0, 0);
    const selisih = Math.round((jatuhTempo - sekarang) / (1000 * 60 * 60 * 24));

    if (selisih < 0) return { teks: `Terlambat ${Math.abs(selisih)} hari`, className: 'bg-rose-50 text-rose-700', mendesak: true };
    if (selisih === 0) return { teks: 'Jatuh tempo hari ini', className: 'bg-rose-50 text-rose-700', mendesak: true };
    if (selisih <= 3) return { teks: `${selisih} hari lagi`, className: 'bg-amber-50 text-amber-700', mendesak: true };
    return { teks: `${selisih} hari lagi`, className: 'bg-emerald-50 text-emerald-700', mendesak: false };
}

export default function MyBills({ bills = [] }) {
    const { flash } = usePage().props;
    const [payingId, setPayingId] = useState(null);

    const bayarSekarang = (bill) => {
        setPayingId(bill.id);
        router.post(route('orang-tua.bills.pay-now', bill.id), {}, {
            preserveScroll: true,
            onFinish: () => setPayingId(null),
        });
    };

    const sorted = [...bills].sort(
        (a, b) => new Date(a.next_due_date) - new Date(b.next_due_date),
    );

    return (
        <OrangTuaLayout title="Tagihan Saya" subtitle="Tagihan rutin milikmu sendiri">
            <Head title="Tagihan Saya" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                        {flash.success}
                    </div>
                )}

                <div className="flex items-center justify-end">
                    <CreateBillDialog userId={usePage().props.auth.user.id} />
                </div>

                {sorted.length === 0 ? (
                    <Card className="rounded-3xl border-dashed border-slate-200 bg-slate-50/40">
                        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
                            <Receipt className="h-8 w-8 text-slate-300" />
                            <p className="text-sm text-slate-500">Belum ada tagihan pribadi. Tambahkan yang pertama.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {sorted.map((bill) => {
                            const status = statusJatuhTempo(bill.next_due_date);
                            const paying = payingId === bill.id;

                            return (
                                <Card
                                    key={bill.id}
                                    className={`rounded-3xl ${status.mendesak ? 'border-rose-200' : 'border-slate-200'}`}
                                >
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-900">{bill.name}</p>
                                                <p className="text-sm text-slate-500">{CATEGORY_LABEL[bill.category] ?? bill.category}</p>
                                            </div>
                                            <Badge className={`shrink-0 rounded-full ${status.className}`}>{status.teks}</Badge>
                                        </div>

                                        <p className="mt-3 text-xl font-bold tabular-nums text-slate-900">
                                            {formatRupiah(bill.amount)}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Jatuh tempo {formatDate(bill.next_due_date)}
                                        </p>

                                        <button
                                            type="button"
                                            disabled={paying}
                                            onClick={() => bayarSekarang(bill)}
                                            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                                        >
                                            {paying ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Memproses...
                                                </>
                                            ) : (
                                                'Bayar Sekarang'
                                            )}
                                        </button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </OrangTuaLayout>
    );
}