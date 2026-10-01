import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';

import OrangTuaLayout from '@/Layouts/OrangTuaLayout';
import CreateBillDialog from '@/Components/OrangTua/CreateBillDialog';
import { formatDate, formatRupiah } from '@/lib/ayom-theme';

import {
    Zap,
    Droplets,
    HeartPulse,
    Pill,
    Wifi,
    FileText,
    CreditCard,
    CheckCircle2,
    Loader2,
} from 'lucide-react';

const CATEGORY_LABEL = {
    listrik: 'Listrik',
    air: 'Air',
    bpjs: 'BPJS Kesehatan',
    obat: 'Obat',
    internet: 'Internet',
    lainnya: 'Lainnya',
};

const CATEGORY_ICON = {
    listrik: Zap,
    air: Droplets,
    bpjs: HeartPulse,
    obat: Pill,
    internet: Wifi,
    lainnya: FileText,
};

const FREQUENCY_LABEL = {
    daily: 'Harian',
    weekly: 'Mingguan',
    monthly: 'Bulanan',
};

/** Selisih hari (bulat) ke tanggal jatuh tempo. Negatif = sudah lewat. */
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
        kartu: 'bg-white ring-slate-200',
        mendesak: false,
    };
}

function Info({ label, children, className = '' }) {
    return (
        <div className={className}>
            <dt className="text-sm text-slate-600">{label}</dt>
            <dd className="text-base font-semibold text-slate-800">{children}</dd>
        </div>
    );
}

export default function MyBills({ bills = [] }) {
    const { flash, auth } = usePage().props;
    const [payingId, setPayingId] = useState(null);

    const bayarSekarang = (bill) => {
        setPayingId(bill.id);
        router.post(route('orang-tua.bills.pay-now', bill.id), {}, {
            preserveScroll: true,
            onFinish: () => setPayingId(null),
        });
    };

    // Yang paling mendesak / sudah lewat tampil duluan
    const sorted = [...bills].sort(
        (a, b) => selisihHari(a.next_due_date) - selisihHari(b.next_due_date),
    );

    const totalTagihan = sorted.reduce((sum, b) => sum + Number(b.amount ?? 0), 0);
    const jumlahMendesak = sorted.filter((b) => statusJatuhTempo(b.next_due_date).mendesak).length;

    return (
        <OrangTuaLayout title="Tagihan Saya" subtitle="Tagihan rutin milikmu sendiri">
            <Head title="Tagihan Saya" />

            <div className="space-y-6 sm:space-y-8">
                {/* RINGKASAN */}
                {sorted.length > 0 && (
                    <section className="relative overflow-hidden rounded-bl-3xl rounded-br-[3.5rem] rounded-tl-[3.5rem] rounded-tr-3xl bg-[var(--ayom-primary)] px-6 py-8 text-white sm:px-10 sm:py-10">
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 400 400"
                            className="pointer-events-none absolute -bottom-28 -right-28 h-[24rem] w-[24rem] text-white/15"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <circle cx="200" cy="200" r="60" />
                            <circle cx="200" cy="200" r="110" />
                            <circle cx="200" cy="200" r="160" />
                            <circle cx="200" cy="200" r="195" />
                        </svg>

                        <dl className="relative grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
                            <div className="col-span-2 sm:col-span-1">
                                <dt className="text-lg text-white/85">Total harus dibayar</dt>
                                <dd className="break-words text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl">
                                    {formatRupiah(totalTagihan)}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-lg text-white/85">Jumlah tagihan</dt>
                                <dd className="text-4xl font-extrabold sm:text-5xl">{sorted.length}</dd>
                            </div>

                            <div>
                                <dt className="text-lg text-white/85">Perlu segera</dt>
                                <dd
                                    className={`text-4xl font-extrabold sm:text-5xl ${
                                        jumlahMendesak > 0 ? 'text-amber-300' : ''
                                    }`}
                                >
                                    {jumlahMendesak}
                                </dd>
                            </div>
                        </dl>
                    </section>
                )}

                {flash?.success && (
                    <div
                        role="status"
                        className="flex items-center gap-3 rounded-3xl bg-emerald-100 px-5 py-4 text-base font-semibold text-emerald-900 ring-1 ring-emerald-300"
                    >
                        <CheckCircle2 className="h-6 w-6 shrink-0" />
                        {flash.success}
                    </div>
                )}

                <div className="flex items-center justify-end">
                    <CreateBillDialog userId={auth.user.id} />
                </div>

                {/* KOSONG */}
                {sorted.length === 0 ? (
                    <section className="flex flex-col items-center gap-3 rounded-3xl bg-slate-50 px-6 py-14 text-center ring-1 ring-slate-200">
                        <CheckCircle2 className="h-14 w-14 text-[var(--ayom-primary)]" />
                        <p className="font-serif text-2xl text-slate-900">Belum ada tagihan</p>
                        <p className="text-base text-slate-600">
                            Tambahkan tagihan pribadi pertama Anda.
                        </p>
                    </section>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2">
                        {sorted.map((bill, i) => {
                            const status = statusJatuhTempo(bill.next_due_date);
                            const paying = payingId === bill.id;
                            const Icon = CATEGORY_ICON[bill.category] ?? FileText;
                            const labelKategori = CATEGORY_LABEL[bill.category] ?? bill.category;
                            const frekuensi = FREQUENCY_LABEL[bill.frequency] ?? '';
                            const kategoriSama = String(bill.name ?? '')
                                .toLowerCase()
                                .includes(String(labelKategori).toLowerCase());
                            const subjudul = kategoriSama
                                ? frekuensi
                                : [labelKategori, frekuensi.toLowerCase()].filter(Boolean).join(', ');
                            // kartu terakhir melebar kalau jumlahnya ganjil, supaya tidak ada sel kosong
                            const lebar = sorted.length % 2 === 1 && i === sorted.length - 1;

                            return (
                                <article
                                    key={bill.id}
                                    className={`flex flex-col rounded-bl-3xl rounded-br-3xl rounded-tl-3xl rounded-tr-[3rem] p-5 ring-1 transition-shadow duration-200 hover:shadow-md sm:p-7 ${status.kartu} ${
                                        lebar ? 'lg:col-span-2' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span
                                            aria-hidden="true"
                                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${status.ikon}`}
                                        >
                                            <Icon className="h-7 w-7" />
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <h2 className="break-words font-serif text-2xl leading-snug text-slate-900 sm:text-3xl">
                                                {bill.name}
                                            </h2>
                                            {subjudul && (
                                                <p className="text-base text-slate-600">{subjudul}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                                        <p className="text-3xl font-extrabold tracking-tight tabular-nums text-slate-900 sm:text-4xl">
                                            {formatRupiah(bill.amount)}
                                        </p>

                                        <span
                                            className={`rounded-full px-4 py-1.5 text-base font-semibold ring-1 ${status.pil}`}
                                        >
                                            {status.teks}
                                        </span>
                                    </div>

                                    <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-slate-900/10 pt-5">
                                        <Info label="Jatuh tempo" className="col-span-2">
                                            {formatDate(bill.next_due_date)}
                                        </Info>
                                        {bill.last_paid_at !== undefined && (
                                            <Info label="Terakhir dibayar" className="col-span-2">
                                                {bill.last_paid_at ? formatDate(bill.last_paid_at) : 'Belum pernah'}
                                            </Info>
                                        )}
                                    </dl>

                                    <button
                                        type="button"
                                        disabled={paying}
                                        onClick={() => bayarSekarang(bill)}
                                        className="mt-6 inline-flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--ayom-primary)] px-6 text-lg font-bold text-white transition-colors duration-200 hover:bg-[var(--ayom-primary-dark)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {paying ? (
                                            <>
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="h-6 w-6" />
                                                Bayar Sekarang
                                            </>
                                        )}
                                    </button>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </OrangTuaLayout>
    );
}