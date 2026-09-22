// resources/js/Pages/Lansia/Dashboard.jsx

import { useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import LansiaLayout from '@/Layouts/LansiaLayout';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';

import {
    Mic,
    MicOff,
    Wallet,
    ReceiptText,
    History,
    PhoneCall,
    AlertTriangle,
    Clock3,
    ArrowDownCircle,
    ArrowUpCircle,
    ChevronRight,
    Sparkles,
} from 'lucide-react';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value ?? 0);

function useSapaan() {
    const jam = new Date().getHours();

    if (jam < 11) return 'Selamat pagi';
    if (jam < 15) return 'Selamat siang';
    if (jam < 19) return 'Selamat sore';

    return 'Selamat malam';
}

/**
 * Text-to-speech sederhana - dipakai untuk kasih feedback suara
 * setiap kali perintah dikenali ATAU tidak dikenali, biar lansia
 * gak ngerasa sistemnya "diem aja" pas ngomong sesuatu yang di luar dugaan.
 */
function ucapkan(teks) {
    if (!('speechSynthesis' in window)) return;
    const ucapan = new SpeechSynthesisUtterance(teks);
    ucapan.lang = 'id-ID';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(ucapan);
}

/**
 * Voice command sederhana menggunakan Web Speech API
 */
function useVoiceCommand(onCommand) {
    const [isListening, setIsListening] = useState(false);
    const [heard, setHeard] = useState('');

    const startListening = () => {
        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            const pesan = 'Maaf, perangkat ini tidak mendukung perintah suara.';
            setHeard(pesan);
            ucapkan(pesan);
            return;
        }

        const recognition = new SpeechRecognition();

        recognition.lang = 'id-ID';
        recognition.interimResults = false;
        recognition.continuous = false;

        recognition.onstart = () => {
            setIsListening(true);
            setHeard('');
        };

        recognition.onresult = (event) => {
            const text =
                event.results[0][0].transcript.toLowerCase();

            setHeard(text);

            onCommand(text);
        };

        recognition.onerror = (event) => {
            setIsListening(false);

            const pesan = {
                'no-speech': 'Tidak ada suara terdengar. Coba lagi ya.',
                'audio-capture': 'Mikrofon tidak ditemukan. Periksa perangkat Anda.',
                'not-allowed': 'Izin mikrofon ditolak. Aktifkan izin mikrofon di browser.',
            }[event.error] || 'Tidak terdengar jelas, coba lagi ya.';

            setHeard(pesan);
            ucapkan(pesan);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    return {
        startListening,
        isListening,
        heard,
    };
}

export default function Dashboard({
    lansia,
    wallet,
    upcomingBill,
    pendingApprovals,
    recentTransactions,
}) {
    const sapaan = useSapaan();

    const saldoRef = useRef(null);

    /**
     * Perintah suara.
     * Setiap cabang ngasih feedback suara (ucapkan) biar lansia tau
     * perintahnya kedengeran dan dimengerti. Kalau gak ada yang cocok,
     * fallback di paling bawah kasih tau daftar perintah yang dikenali -
     * jadi sistem gak pernah "diem" walau perintahnya di luar dugaan.
     */
    const handleCommand = (text) => {
        if (text.includes('saldo')) {
            ucapkan(`Saldo Anda saat ini ${formatRupiah(wallet?.balance)}.`);
            saldoRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        } else if (
            text.includes('tagihan') ||
            text.includes('bayar')
        ) {
            ucapkan('Membuka halaman tagihan Anda.');
            router.visit(
                route('lansia.bills.index')
            );
        } else if (
            text.includes('riwayat') ||
            text.includes('transaksi') ||
            text.includes('mutasi')
        ) {
            ucapkan('Membuka riwayat transaksi Anda.');
            router.visit(
                route('transactions.index')
            );
        } else if (
            text.includes('belanja') ||
            text.includes('checkout')
        ) {
            ucapkan('Membuka halaman belanja suara.');
            router.visit(route('lansia.voice-checkout'));
        } else if (
            text.includes('keluarga') ||
            text.includes('telepon') ||
            text.includes('hubungi') ||
            text.includes('anak')
        ) {
            if (lansia?.family_phone) {
                ucapkan('Menghubungi keluarga Anda.');
                window.location.href =
                    `tel:${lansia.family_phone}`;
            } else {
                ucapkan('Maaf, nomor keluarga belum terdaftar.');
            }
        } else {
            // Fallback: perintah tidak dikenali - JANGAN diam, kasih tau + arahkan.
            ucapkan(
                'Maaf, saya tidak mengerti. Coba ucapkan: lihat saldo, bayar tagihan, lihat riwayat, atau hubungi keluarga.'
            );
        }
    };

    const {
        startListening,
        isListening,
        heard,
    } = useVoiceCommand(handleCommand);

    return (
        <LansiaLayout user={lansia}>
            <Head title="Beranda" />

            {/* =====================================================
                BACKGROUND DECORATION
            ====================================================== */}

            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-96 overflow-hidden"
            >
                <div className="ayom-blob absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />

                <div className="ayom-blob ayom-blob-delay absolute -right-16 top-10 h-64 w-64 rounded-full bg-teal-200/40 blur-3xl" />
            </div>

            {/* =====================================================
                SAPAAN
            ====================================================== */}

            <div className="mb-6 flex items-center gap-2">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 lg:text-4xl">
                        {sapaan},{' '}

                        <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            {lansia?.name?.split(' ')[0]}
                        </span>
                    </h1>

                    {lansia?.family_name && (
                        <p className="mt-1 text-lg text-slate-500 lg:text-xl">
                            {lansia.family_name}
                        </p>
                    )}
                </div>
            </div>

            {/* =====================================================
                MAIN GRID
            ====================================================== */}

            <div className="lg:grid lg:grid-cols-3 lg:gap-8">

                {/* =================================================
                    MAIN CONTENT
                ================================================== */}

                <div className="lg:col-span-2">

                    {/* =============================================
                        UPCOMING BILL
                    ============================================== */}

                    {upcomingBill?.is_due && (
                        <Card className="mb-5 overflow-hidden border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm">
                            <div className="flex items-start gap-3">

                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100">
                                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                                </span>

                                <div className="flex-1">
                                    <p className="text-xl font-bold text-amber-900">
                                        Tagihan{' '}
                                        {upcomingBill.name}{' '}
                                        sudah jatuh tempo
                                    </p>

                                    <p className="text-lg text-amber-800">
                                        {formatRupiah(
                                            upcomingBill.amount
                                        )}
                                    </p>
                                </div>
                            </div>

                            <Button
                                size="lg"
                                className="mt-4 h-14 w-full bg-amber-600 text-lg font-bold shadow-sm transition-all hover:bg-amber-700 hover:shadow-md active:scale-[0.98] lg:w-auto lg:px-10"
                                onClick={() =>
                                    router.post(
                                        route(
                                            'lansia.bills.pay-now',
                                            upcomingBill.id
                                        )
                                    )
                                }
                            >
                                Bayar Sekarang
                            </Button>
                        </Card>
                    )}

                    {/* =============================================
                        PENDING APPROVAL
                    ============================================== */}

                    {pendingApprovals > 0 && (
                        <Card className="mb-5 flex items-center gap-3 border-2 border-amber-200 bg-amber-50 p-4">
                            <Clock3 className="h-6 w-6 shrink-0 text-amber-600" />

                            <p className="text-lg font-semibold text-amber-900">
                                {pendingApprovals} transaksi sedang
                                menunggu persetujuan keluarga
                            </p>
                        </Card>
                    )}

                    {/* =============================================
                        SALDO + VOICE COMMAND
                    ============================================== */}

                    <div className="lg:grid lg:grid-cols-2 lg:gap-6">

                        {/* SALDO */}

                        <div
                            ref={saldoRef}
                            className="mb-6"
                        >
                            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 p-6 text-white shadow-lg shadow-emerald-200">

                                <div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
                                />

                                <div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute -bottom-14 -left-8 h-32 w-32 rounded-full bg-white/10"
                                />

                                <div className="relative mb-2 flex items-center gap-2 text-emerald-50">

                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                                        <Wallet className="h-5 w-5 text-white" />
                                    </span>

                                    <span className="text-lg">
                                        Saldo Anda
                                    </span>
                                </div>

                                <p className="relative text-5xl font-extrabold tracking-tight text-white">
                                    {formatRupiah(
                                        wallet?.balance
                                    )}
                                </p>

                                {wallet?.daily_remaining !== null &&
                                    wallet?.daily_remaining !== undefined && (
                                        <p className="relative mt-3 text-lg text-emerald-50">
                                            Sisa boleh belanja hari ini:{' '}

                                            <span className="font-bold text-white">
                                                {formatRupiah(
                                                    wallet.daily_remaining
                                                )}
                                            </span>
                                        </p>
                                    )}
                            </Card>
                        </div>

                        {/* VOICE COMMAND */}

                        <Card className="mb-6 flex flex-col items-center justify-center border-2 border-emerald-100 bg-white p-6 shadow-sm">

                            <div className="relative flex h-28 w-28 items-center justify-center">

                                {isListening && (
                                    <>
                                        <span className="ayom-ping absolute inset-0 rounded-full bg-rose-400/40" />

                                        <span className="ayom-ping ayom-ping-delay absolute inset-0 rounded-full bg-rose-400/30" />
                                    </>
                                )}

                                <button
                                    type="button"
                                    onClick={startListening}
                                    aria-pressed={isListening}
                                    aria-label={
                                        isListening
                                            ? 'Berhenti mendengarkan'
                                            : 'Tekan untuk berbicara'
                                    }
                                    className={`relative flex h-28 w-28 items-center justify-center rounded-full shadow-lg transition-all duration-300 active:scale-95 ${
                                        isListening
                                            ? 'bg-rose-600'
                                            : 'bg-gradient-to-br from-emerald-500 to-emerald-700 hover:shadow-emerald-200 hover:brightness-105'
                                    }`}
                                >
                                    {isListening ? (
                                        <MicOff className="h-12 w-12 text-white" />
                                    ) : (
                                        <Mic className="h-12 w-12 text-white" />
                                    )}
                                </button>
                            </div>

                            <p className="mt-3 flex items-center gap-1.5 text-center text-lg font-semibold text-slate-700">

                                {!isListening && (
                                    <Sparkles className="h-4 w-4 text-emerald-500" />
                                )}

                                {isListening
                                    ? 'Mendengarkan...'
                                    : 'Tekan lalu ucapkan perintah'}
                            </p>

                            {heard && (
                                <p className="mt-1 text-center text-base italic text-slate-500">
                                    "{heard}"
                                </p>
                            )}

                            <p className="mt-3 text-center text-sm text-slate-400">
                                Contoh: "lihat saldo", "bayar tagihan", "lihat riwayat", "hubungi keluarga"
                            </p>
                        </Card>
                    </div>

                    {/* =================================================
                        MENU UTAMA
                    ================================================== */}

                    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">

                        {/* TAGIHAN */}

                        <Link
                            href={route(
                                'lansia.bills.index'
                            )}
                            className="group flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-emerald-100 bg-white p-6 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
                        >
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 transition-colors duration-200 group-hover:bg-emerald-100">
                                <ReceiptText className="h-8 w-8 text-emerald-700" />
                            </span>

                            <span className="text-lg font-bold text-slate-800">
                                Tagihan Saya
                            </span>
                        </Link>

                        {/* RIWAYAT */}

                        <Link
                            href={route(
                                'transactions.index'
                            )}
                            className="group flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-emerald-100 bg-white p-6 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
                        >
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 transition-colors duration-200 group-hover:bg-emerald-100">
                                <History className="h-8 w-8 text-emerald-700" />
                            </span>

                            <span className="text-lg font-bold text-slate-800">
                                Riwayat
                            </span>
                        </Link>

                        {/* HUBUNGI KELUARGA */}

                        {lansia?.family_phone && (
                            <a
                                href={`tel:${lansia.family_phone}`}
                                className="group col-span-2 flex items-center justify-center gap-3 rounded-2xl border-2 border-emerald-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md active:translate-y-0 active:scale-[0.98] lg:col-span-1"
                            >
                                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 transition-colors duration-200 group-hover:bg-emerald-100">
                                    <PhoneCall className="h-6 w-6 text-emerald-700" />
                                </span>

                                <span className="text-lg font-bold text-slate-800">
                                    Hubungi Keluarga
                                </span>
                            </a>
                        )}
                    </div>
                </div>

                {/* =================================================
                    RECENT TRANSACTIONS
                ================================================== */}

                {recentTransactions?.length > 0 && (
                    <div className="lg:col-span-1">

                        <div className="mb-3 flex items-center justify-between">

                            <h2 className="text-xl font-bold text-slate-900">
                                Transaksi Terakhir
                            </h2>

                            <Link
                                href={route(
                                    'transactions.index'
                                )}
                                className="flex items-center gap-0.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                            >
                                Lihat semua

                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="space-y-3">

                            {recentTransactions.map((trx) => {

                                const isMasuk = [
                                    'topup',
                                    'allowance',
                                ].includes(trx.type);

                                return (
                                    <Card
                                        key={trx.id}
                                        className="flex items-center justify-between overflow-hidden border border-emerald-100 bg-white p-4 shadow-sm transition-all duration-200 hover:border-emerald-200 hover:shadow-md"
                                    >

                                        <div className="flex items-center gap-3">

                                            <span
                                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                                                    isMasuk
                                                        ? 'bg-emerald-50'
                                                        : 'bg-rose-50'
                                                }`}
                                            >
                                                {isMasuk ? (
                                                    <ArrowDownCircle className="h-6 w-6 text-emerald-600" />
                                                ) : (
                                                    <ArrowUpCircle className="h-6 w-6 text-rose-500" />
                                                )}
                                            </span>

                                            <div>

                                                <p className="text-lg font-semibold text-slate-800">
                                                    {trx.description ||
                                                        trx.category}
                                                </p>

                                                {trx.status ===
                                                    'pending' && (
                                                    <Badge
                                                        variant="outline"
                                                        className="mt-1 border-amber-300 bg-amber-50 text-amber-800"
                                                    >
                                                        Menunggu persetujuan
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <span
                                            className={`shrink-0 text-lg font-bold ${
                                                isMasuk
                                                    ? 'text-emerald-700'
                                                    : 'text-rose-600'
                                            }`}
                                        >
                                            {isMasuk
                                                ? '+'
                                                : '-'}

                                            {formatRupiah(
                                                trx.amount
                                            )}
                                        </span>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* =====================================================
                ANIMATIONS
            ====================================================== */}

            <style>{`
                @keyframes ayom-float {
                    0%, 100% {
                        transform: translate(0, 0);
                    }

                    50% {
                        transform: translate(12px, 16px);
                    }
                }

                @keyframes ayom-ping-soft {
                    0% {
                        transform: scale(0.9);
                        opacity: 0.8;
                    }

                    100% {
                        transform: scale(1.7);
                        opacity: 0;
                    }
                }

                .ayom-blob {
                    animation: ayom-float 9s ease-in-out infinite;
                }

                .ayom-blob-delay {
                    animation-delay: 2.5s;
                }

                .ayom-ping {
                    animation: ayom-ping-soft 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
                }

                .ayom-ping-delay {
                    animation-delay: 0.5s;
                }

                @media (prefers-reduced-motion: reduce) {
                    .ayom-blob,
                    .ayom-ping {
                        animation: none;
                    }
                }
            `}</style>
        </LansiaLayout>
    );
}