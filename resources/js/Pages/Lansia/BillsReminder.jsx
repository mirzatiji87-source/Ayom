import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import LansiaLayout from '@/Layouts/LansiaLayout';
import { Button } from '@/Components/ui/button';

import {
    Zap,
    Droplets,
    HeartPulse,
    Pill,
    Wifi,
    FileText,
    CreditCard,
    Volume2,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';

// ================= LABEL & FORMAT HELPERS =================

const KATEGORI_LABEL = {
    listrik: 'Listrik',
    air: 'Air',
    bpjs: 'BPJS Kesehatan',
    obat: 'Obat',
    internet: 'Internet',
    lainnya: 'Lainnya',
};

const KATEGORI_IKON = {
    listrik: Zap,
    air: Droplets,
    bpjs: HeartPulse,
    obat: Pill,
    internet: Wifi,
    lainnya: FileText,
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
    }).format(amount ?? 0);
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
            pil: 'bg-red-100 text-red-800 ring-red-300',
            ikon: 'bg-red-100 text-red-700',
            kartu: 'bg-red-50 ring-red-200',
            mendesak: true,
        };
    }
    if (selisih === 0) {
        return {
            teks: 'Jatuh tempo hari ini',
            pil: 'bg-red-100 text-red-800 ring-red-300',
            ikon: 'bg-red-100 text-red-700',
            kartu: 'bg-red-50 ring-red-200',
            mendesak: true,
        };
    }
    if (selisih <= 3) {
        return {
            teks: `${selisih} hari lagi`,
            pil: 'bg-amber-100 text-amber-900 ring-amber-300',
            ikon: 'bg-amber-100 text-amber-800',
            kartu: 'bg-amber-50 ring-amber-200',
            mendesak: true,
        };
    }
    return {
        teks: `${selisih} hari lagi`,
        pil: 'bg-emerald-100 text-emerald-900 ring-emerald-300',
        ikon: 'bg-emerald-100 text-emerald-800',
        kartu: 'bg-white ring-emerald-900/15',
        mendesak: false,
    };
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

function Info({ label, children, className = '' }) {
    return (
        <div className={className}>
            <dt className="text-base text-slate-500">{label}</dt>
            <dd className="text-lg font-semibold text-slate-800">{children}</dd>
        </div>
    );
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
    const bilsUrut = [...(bills ?? [])].sort(
        (a, b) => selisihHari(a.next_due_date) - selisihHari(b.next_due_date)
    );

    const totalTagihan = bilsUrut.reduce((jumlah, b) => jumlah + Number(b.amount ?? 0), 0);
    const jumlahMendesak = bilsUrut.filter((b) => statusJatuhTempo(b.next_due_date).mendesak).length;

    return (
        <LansiaLayout>
            <Head title="Pengingat Tagihan" />

            <div className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6">
                {/* RINGKASAN */}
                <section className="relative overflow-hidden rounded-bl-3xl rounded-br-[3.5rem] rounded-tl-[3.5rem] rounded-tr-3xl bg-emerald-800 px-6 py-8 text-white sm:px-10 sm:py-10">
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

                    <h1 className="relative font-serif text-3xl sm:text-4xl">Tagihan Saya</h1>

                    {bilsUrut.length > 0 && (
                        <dl className="relative mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
                            <div className="col-span-2 sm:col-span-1">
                                <dt className="text-lg text-emerald-200">Total harus dibayar</dt>
                                <dd className="break-words text-4xl font-extrabold tracking-tight sm:text-5xl">
                                    {formatRupiah(totalTagihan)}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-lg text-emerald-200">Jumlah tagihan</dt>
                                <dd className="text-4xl font-extrabold sm:text-5xl">{bilsUrut.length}</dd>
                            </div>

                            <div>
                                <dt className="text-lg text-emerald-200">Perlu segera</dt>
                                <dd
                                    className={`text-4xl font-extrabold sm:text-5xl ${
                                        jumlahMendesak > 0 ? 'text-amber-300' : ''
                                    }`}
                                >
                                    {jumlahMendesak}
                                </dd>
                            </div>
                        </dl>
                    )}
                </section>

                {/* PESAN */}
                {flash?.success && (
                    <div
                        role="status"
                        className="flex items-center gap-3 rounded-3xl bg-emerald-100 px-5 py-4 text-lg font-semibold text-emerald-900 ring-1 ring-emerald-300"
                    >
                        <CheckCircle2 className="h-7 w-7 shrink-0" />
                        {flash.success}
                    </div>
                )}

                {errors?.amount && (
                    <div
                        role="alert"
                        className="flex items-center gap-3 rounded-3xl bg-red-50 px-5 py-4 text-lg font-semibold text-red-900 ring-1 ring-red-300"
                    >
                        <AlertCircle className="h-7 w-7 shrink-0" />
                        {errors.amount}
                    </div>
                )}

                {/* KOSONG */}
                {bilsUrut.length === 0 && (
                    <section className="flex flex-col items-center gap-3 rounded-3xl bg-emerald-50 px-6 py-14 text-center">
                        <CheckCircle2 className="h-14 w-14 text-emerald-600" />
                        <p className="font-serif text-2xl text-slate-900">Semua beres</p>
                        <p className="text-lg text-slate-600">Tidak ada tagihan aktif saat ini.</p>
                    </section>
                )}

                {/* DAFTAR TAGIHAN: 1 kolom di HP, 2 kolom di layar lebar */}
                <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2">
                    {bilsUrut.map((bill, i) => {
                        const status = statusJatuhTempo(bill.next_due_date);
                        const sedangMemproses = memprosesId === bill.id;
                        const Ikon = KATEGORI_IKON[bill.category] ?? FileText;
                        // Kartu terakhir melebar penuh kalau jumlahnya ganjil, supaya tidak ada sel kosong
                        const lebar = bilsUrut.length % 2 === 1 && i === bilsUrut.length - 1;
                        const labelKategori = KATEGORI_LABEL[bill.category] ?? 'Lainnya';
                        const frekuensi = FREKUENSI_LABEL[bill.frequency] ?? '';
                        const kategoriSama = String(bill.name ?? '').toLowerCase().includes(labelKategori.toLowerCase());
                        const subjudul = kategoriSama
                            ? frekuensi
                            : [labelKategori, frekuensi.toLowerCase()].filter(Boolean).join(', ');

                        return (
                            <article
                                key={bill.id}
                                className={`rounded-bl-3xl rounded-br-3xl rounded-tl-3xl rounded-tr-[3rem] p-5 ring-1 sm:p-7 ${status.kartu} ${
                                    lebar
                                        ? 'flex flex-col lg:col-span-2 lg:flex-row lg:items-stretch lg:gap-12'
                                        : 'flex flex-col'
                                }`}
                            >
                                <div className={lebar ? 'lg:flex lg:w-2/5 lg:flex-col lg:justify-center' : ''}>
                                    <div className="flex items-center gap-4">
                                        <span
                                            aria-hidden="true"
                                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${status.ikon}`}
                                        >
                                            <Ikon className="h-7 w-7" />
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <h2 className="break-words font-serif text-2xl leading-snug text-slate-900 sm:text-3xl">
                                                {bill.name}
                                            </h2>
                                            {subjudul && <p className="text-base text-slate-500">{subjudul}</p>}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                                        <p className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                            {formatRupiah(bill.amount)}
                                        </p>

                                        <span
                                            className={`rounded-full px-4 py-1.5 text-base font-semibold ring-1 ${status.pil}`}
                                        >
                                            {status.teks}
                                        </span>
                                    </div>
                                </div>

                                <div className={`mt-5 ${lebar ? 'lg:mt-0 lg:flex-1' : ''}`}>
                                    <dl
                                        className={`grid grid-cols-2 gap-x-6 gap-y-3 border-t border-slate-900/10 pt-5 ${
                                            lebar ? 'lg:border-t-0 lg:pt-0' : ''
                                        }`}
                                    >
                                        <Info label="Jatuh tempo" className="col-span-2">
                                            {formatTanggal(bill.next_due_date)}
                                        </Info>
                                        <Info label="Bayar otomatis">
                                            <span className={bill.auto_pay ? 'text-emerald-700' : 'text-slate-500'}>
                                                {bill.auto_pay ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </Info>
                                        <Info label="Terakhir dibayar">
                                            {bill.last_paid_at ? formatTanggal(bill.last_paid_at) : 'Belum pernah'}
                                        </Info>
                                    </dl>

                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <Button
                                            size="lg"
                                            className="h-14 min-w-[12rem] flex-1 whitespace-nowrap rounded-full bg-emerald-800 text-lg font-bold normal-case tracking-normal hover:bg-emerald-700"
                                            disabled={sedangMemproses}
                                            onClick={() => bayarSekarang(bill)}
                                        >
                                            <CreditCard className="mr-2 h-6 w-6" />
                                            {sedangMemproses ? 'Memproses...' : 'Bayar Sekarang'}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="lg"
                                            className="h-14 flex-1 whitespace-nowrap rounded-full border-emerald-800 bg-white px-6 text-lg font-bold normal-case tracking-normal text-emerald-900 hover:bg-emerald-50 sm:flex-none"
                                            onClick={() => bacakanTagihan(bill, status)}
                                        >
                                            <Volume2 className="mr-2 h-6 w-6" />
                                            Bacakan
                                        </Button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </LansiaLayout>
    );
}