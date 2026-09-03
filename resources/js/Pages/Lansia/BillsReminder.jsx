import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import LansiaLayout from '@/Layouts/LansiaLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';

// ================= LABEL & FORMAT HELPERS =================

const KATEGORI_LABEL = {
    listrik: 'Listrik',
    air: 'Air',
    bpjs: 'BPJS Kesehatan',
    obat: 'Obat',
    internet: 'Internet',
    lainnya: 'Lainnya',
};

const KATEGORI_EMOJI = {
    listrik: '⚡',
    air: '💧',
    bpjs: '🏥',
    obat: '💊',
    internet: '🌐',
    lainnya: '📄',
};

const FREKUENSI_LABEL = {
    daily: 'Harian',
    weekly: 'Mingguan',
    monthly: 'Bulanan',
};

function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatTanggal(tanggal) {
    return new Date(tanggal).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

/** Selisih hari (bulat) dari hari ini ke tanggal jatuh tempo. Negatif = sudah lewat. */
function selisihHari(tanggal) {
    const sekarang = new Date();
    sekarang.setHours(0, 0, 0, 0);
    const jatuhTempo = new Date(tanggal);
    jatuhTempo.setHours(0, 0, 0, 0);
    return Math.round((jatuhTempo - sekarang) / (1000 * 60 * 60 * 24));
}

function statusJatuhTempo(tanggal) {
    const selisih = selisihHari(tanggal);
    if (selisih < 0) {
        return {
            teks: `Terlambat ${Math.abs(selisih)} hari`,
            warna: 'bg-red-100 text-red-800 border-red-300',
            mendesak: true,
        };
    }
    if (selisih === 0) {
        return { teks: 'Jatuh tempo hari ini', warna: 'bg-red-100 text-red-800 border-red-300', mendesak: true };
    }
    if (selisih <= 3) {
        return {
            teks: `${selisih} hari lagi`,
            warna: 'bg-amber-100 text-amber-800 border-amber-300',
            mendesak: true,
        };
    }
    return { teks: `${selisih} hari lagi`, warna: 'bg-emerald-100 text-emerald-800 border-emerald-300', mendesak: false };
}

/** Baca tagihan dengan suara (Web Speech API), sesuai gaya voice-first halaman Lansia. */
function bacakanTagihan(bill, status) {
    if (!('speechSynthesis' in window)) return;

    const kalimat = `Tagihan ${bill.name}, kategori ${KATEGORI_LABEL[bill.category]}, sebesar ${formatRupiah(
        bill.amount
    )}. ${status.teks}.`;

    const ucapan = new SpeechSynthesisUtterance(kalimat);
    ucapan.lang = 'id-ID';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(ucapan);
}

// ================= KOMPONEN UTAMA =================

export default function BillsReminder({ bills }) {
    const { errors, flash } = usePage().props;
    const [memprosesId, setMemprosesId] = useState(null);

    const bayarSekarang = (bill) => {
        setMemprosesId(bill.id);

        router.post(
            route('lansia.bills.pay-now', bill.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setMemprosesId(null),
            }
        );
    };

    // Tagihan yang sudah lewat/mendesak ditampilkan lebih dulu
    const bilsUrut = [...bills].sort((a, b) => selisihHari(a.next_due_date) - selisihHari(b.next_due_date));

    return (
        <LansiaLayout>
            <Head title="Pengingat Tagihan" />

            <div className="mx-auto max-w-3xl space-y-6 lg:max-w-none">
                <h1 className="text-4xl font-bold text-gray-900">Tagihan Saya</h1>

                {flash?.success && (
                    <div className="rounded-xl border-4 border-emerald-400 bg-emerald-50 p-5 text-2xl font-semibold text-emerald-800">
                        {flash.success}
                    </div>
                )}

                {errors?.amount && (
                    <div className="rounded-xl border-4 border-red-400 bg-red-50 p-5 text-2xl font-semibold text-red-800">
                        {errors.amount}
                    </div>
                )}

                {bilsUrut.length === 0 && (
                    <Card className="border-4 border-emerald-100">
                        <CardContent className="p-8 text-center text-2xl text-gray-600">
                            Tidak ada tagihan aktif saat ini. 🎉
                        </CardContent>
                    </Card>
                )}

                {/* Grid 2 kolom di layar lebar, tetap 1 kolom di HP */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {bilsUrut.map((bill) => {
                        const status = statusJatuhTempo(bill.next_due_date);
                        const sedangMemproses = memprosesId === bill.id;

                        return (
                            <Card
                                key={bill.id}
                                className={`border-4 ${status.mendesak ? 'border-red-300' : 'border-emerald-100'}`}
                            >
                                <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                                    <CardTitle className="flex items-center gap-3 text-3xl">
                                        <span aria-hidden="true">{KATEGORI_EMOJI[bill.category]}</span>
                                        {bill.name}
                                    </CardTitle>
                                    <Badge variant="outline" className={`px-3 py-1 text-lg ${status.warna}`}>
                                        {status.teks}
                                    </Badge>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <p className="text-3xl font-bold text-gray-900">{formatRupiah(bill.amount)}</p>

                                    <div className="space-y-1 text-xl text-gray-700">
                                        <p>Kategori: {KATEGORI_LABEL[bill.category]}</p>
                                        <p>Jatuh tempo: {formatTanggal(bill.next_due_date)}</p>
                                        <p>Frekuensi: {FREKUENSI_LABEL[bill.frequency]}</p>
                                        <p>
                                            Bayar otomatis:{' '}
                                            <span className={bill.auto_pay ? 'font-semibold text-emerald-700' : 'font-semibold text-gray-500'}>
                                                {bill.auto_pay ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </p>
                                        {bill.last_paid_at && (
                                            <p className="text-base text-gray-500">
                                                Terakhir dibayar: {formatTanggal(bill.last_paid_at)}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <Button
                                            size="lg"
                                            className="h-16 flex-1 bg-emerald-600 text-2xl hover:bg-emerald-700"
                                            disabled={sedangMemproses}
                                            onClick={() => bayarSekarang(bill)}
                                        >
                                            {sedangMemproses ? 'Memproses...' : '💳 Bayar Sekarang'}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="lg"
                                            className="h-16 border-emerald-300 text-2xl text-emerald-800 hover:bg-emerald-50"
                                            onClick={() => bacakanTagihan(bill, status)}
                                        >
                                            🔊 Bacakan
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </LansiaLayout>
    );
}