// resources/js/Pages/Lansia/Dashboard.jsx

import { useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import LansiaLayout from '@/Layouts/LansiaLayout';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';

import {
    Mic,
    MicOff,
    ReceiptText,
    History,
    PhoneCall,
    AlertTriangle,
    Clock3,
    ArrowDownLeft,
    ArrowUpRight,
    ChevronRight,
    ShoppingBag,
    Inbox,
} from 'lucide-react';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value ?? 0);

const formatTanggal = () =>
    new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

function useSapaan() {
    const jam = new Date().getHours();

    if (jam < 11) return 'Selamat pagi';
    if (jam < 15) return 'Selamat siang';
    if (jam < 19) return 'Selamat sore';

    return 'Selamat malam';
}

// route() milik Ziggy melempar error kalau nama route tidak ada,
// dan error saat render bikin halaman kosong. Helper ini mencegahnya.
const safeRoute = (name, params) => {
    try {
        return route(name, params);
    } catch {
        return null;
    }
};

function ucapkan(teks) {
    if (!('speechSynthesis' in window)) return;
    const ucapan = new SpeechSynthesisUtterance(teks);
    ucapan.lang = 'id-ID';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(ucapan);
}

function useVoiceCommand(onCommand) {
    const [isListening, setIsListening] = useState(false);
    const [heard, setHeard] = useState('');

    const startListening = () => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

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
            const text = event.results[0][0].transcript.toLowerCase();
            setHeard(text);
            onCommand(text);
        };

        recognition.onerror = (event) => {
            setIsListening(false);

            const pesan =
                {
                    'no-speech': 'Tidak ada suara terdengar. Coba lagi ya.',
                    'audio-capture': 'Mikrofon tidak ditemukan. Periksa perangkat Anda.',
                    'not-allowed': 'Izin mikrofon ditolak. Aktifkan izin mikrofon di browser.',
                }[event.error] || 'Tidak terdengar jelas, coba lagi ya.';

            setHeard(pesan);
            ucapkan(pesan);
        };

        recognition.onend = () => setIsListening(false);

        recognition.start();
    };

    return { startListening, isListening, heard };
}

const LG_COLS = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
};

export default function Dashboard({
    lansia,
    wallet,
    upcomingBill,
    pendingApprovals,
    recentTransactions,
}) {
    const sapaan = useSapaan();
    const saldoRef = useRef(null);

    const buka = (nama, pesan) => {
        const url = safeRoute(nama);
        if (url) {
            ucapkan(pesan);
            router.visit(url);
        } else {
            ucapkan('Maaf, halaman itu belum tersedia.');
        }
    };

    const handleCommand = (text) => {
        if (text.includes('saldo')) {
            ucapkan(`Saldo Anda saat ini ${formatRupiah(wallet?.balance)}.`);
            saldoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (text.includes('tagihan') || text.includes('bayar')) {
            buka('lansia.bills.index', 'Membuka halaman tagihan Anda.');
        } else if (
            text.includes('riwayat') ||
            text.includes('transaksi') ||
            text.includes('mutasi')
        ) {
            buka('transactions.index', 'Membuka riwayat transaksi Anda.');
        } else if (text.includes('belanja') || text.includes('checkout')) {
            buka('lansia.voice-checkout', 'Membuka halaman belanja suara.');
        } else if (
            text.includes('keluarga') ||
            text.includes('telepon') ||
            text.includes('hubungi') ||
            text.includes('anak')
        ) {
            if (lansia?.family_phone) {
                ucapkan('Menghubungi keluarga Anda.');
                window.location.href = `tel:${lansia.family_phone}`;
            } else {
                ucapkan('Maaf, nomor keluarga belum terdaftar.');
            }
        } else {
            ucapkan(
                'Maaf, saya tidak mengerti. Coba ucapkan: lihat saldo, bayar tagihan, lihat riwayat, atau hubungi keluarga.'
            );
        }
    };

    const { startListening, isListening, heard } = useVoiceCommand(handleCommand);

    const menu = [
        { key: 'tagihan', label: 'Tagihan Saya', icon: ReceiptText, href: safeRoute('lansia.bills.index') },
        { key: 'riwayat', label: 'Riwayat', icon: History, href: safeRoute('transactions.index') },
        { key: 'belanja', label: 'Belanja Suara', icon: ShoppingBag, href: safeRoute('lansia.voice-checkout') },
        ...(lansia?.family_phone
            ? [{ key: 'keluarga', label: 'Hubungi Keluarga', icon: PhoneCall, href: `tel:${lansia.family_phone}`, external: true }]
            : []),
    ].filter((item) => item.href);

    const transaksi = (recentTransactions ?? []).slice(0, 6);
    const urlRiwayat = safeRoute('transactions.index');

    return (
        <LansiaLayout user={lansia}>
            <Head title="Beranda" />

            <div className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6">
                {/* PERINGATAN */}
                {(upcomingBill?.is_due || pendingApprovals > 0) && (
                    <div className="space-y-3">
                        {upcomingBill?.is_due && (
                            <div className="flex flex-col gap-3 rounded-3xl bg-amber-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="h-7 w-7 shrink-0 text-amber-700" />
                                    <p className="text-lg font-bold text-amber-950">
                                        Tagihan {upcomingBill.name} jatuh tempo,{' '}
                                        {formatRupiah(upcomingBill.amount)}
                                    </p>
                                </div>

                                <Button
                                    size="lg"
                                    className="h-12 rounded-full bg-amber-700 px-8 text-lg font-bold hover:bg-amber-800"
                                    onClick={() => {
                                        const url = safeRoute('lansia.bills.pay-now', upcomingBill.id);
                                        if (url) router.post(url);
                                    }}
                                >
                                    Bayar Sekarang
                                </Button>
                            </div>
                        )}

                        {pendingApprovals > 0 && (
                            <div className="flex items-center gap-3 rounded-3xl bg-amber-50 px-5 py-4 ring-1 ring-amber-200">
                                <Clock3 className="h-7 w-7 shrink-0 text-amber-700" />
                                <p className="text-lg font-semibold text-amber-950">
                                    {pendingApprovals} transaksi menunggu persetujuan keluarga
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* BARIS 1: SALDO + MIC (tinggi sama, tidak ada ruang kosong) */}
                <div className="grid gap-5 sm:gap-6 lg:grid-cols-12">
                    <section
                        ref={saldoRef}
                        className="relative flex flex-col justify-center overflow-hidden rounded-bl-3xl rounded-br-[3.5rem] rounded-tl-[3.5rem] rounded-tr-3xl bg-emerald-800 px-6 py-8 text-white sm:px-10 sm:py-10 lg:col-span-7"
                    >
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

                        <div className="relative min-w-0">
                            <p className="text-base text-emerald-200">{formatTanggal()}</p>

                            <h1 className="mt-1 font-serif text-2xl leading-snug sm:text-3xl">
                                {sapaan}, {lansia?.name?.split(' ')[0]}
                            </h1>

                            {lansia?.family_name && (
                                <p className="text-base text-emerald-200">{lansia.family_name}</p>
                            )}

                            <p className="mt-6 text-lg text-emerald-200">Saldo Anda</p>

                            <p className="break-words text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-5xl xl:text-6xl">
                                {formatRupiah(wallet?.balance)}
                            </p>

                            {wallet?.daily_remaining !== null &&
                                wallet?.daily_remaining !== undefined && (
                                    <p className="mt-5 inline-flex flex-wrap items-center gap-x-2 rounded-full bg-emerald-900/50 px-5 py-2.5 text-base text-emerald-100 sm:text-lg">
                                        Boleh dipakai hari ini
                                        <span className="font-bold text-white">
                                            {formatRupiah(wallet.daily_remaining)}
                                        </span>
                                    </p>
                                )}
                        </div>
                    </section>

                    <section className="flex items-center gap-5 rounded-bl-[3.5rem] rounded-br-3xl rounded-tl-3xl rounded-tr-[3.5rem] bg-amber-50 px-6 py-6 ring-1 ring-amber-200 sm:px-10 lg:col-span-5 lg:flex-col lg:justify-center lg:gap-0 lg:text-center">
                        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center sm:h-28 sm:w-28 lg:h-32 lg:w-32">
                            {isListening && (
                                <>
                                    <span className="ayom-ping absolute inset-0 rounded-full bg-rose-400/50" />
                                    <span className="ayom-ping ayom-ping-delay absolute inset-0 rounded-full bg-rose-400/30" />
                                </>
                            )}

                            <button
                                type="button"
                                onClick={startListening}
                                aria-pressed={isListening}
                                aria-label={isListening ? 'Sedang mendengarkan' : 'Tekan untuk berbicara'}
                                className={`relative flex h-full w-full items-center justify-center rounded-full shadow-lg transition-transform duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400 active:scale-95 ${
                                    isListening
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-amber-400 text-emerald-900 hover:bg-amber-300'
                                }`}
                            >
                                {isListening ? (
                                    <MicOff className="h-11 w-11 lg:h-12 lg:w-12" />
                                ) : (
                                    <Mic className="h-11 w-11 lg:h-12 lg:w-12" />
                                )}
                            </button>
                        </div>

                        <div className="min-w-0 lg:mt-4">
                            <p className="text-xl font-bold text-slate-900">
                                {isListening ? 'Mendengarkan...' : 'Tekan, lalu bicara'}
                            </p>

                            {heard ? (
                                <p className="mt-1 text-base italic text-slate-600">"{heard}"</p>
                            ) : (
                                <p className="mt-1 text-base text-slate-600">
                                    Coba ucapkan "lihat saldo", "bayar tagihan", atau "hubungi keluarga".
                                </p>
                            )}
                        </div>
                    </section>
                </div>

                {/* BARIS 2: MENU, satu baris penuh, kolom menyesuaikan jumlah menu */}
                <nav
                    aria-label="Menu utama"
                    className={`grid gap-3 sm:grid-cols-2 ${LG_COLS[menu.length] ?? 'lg:grid-cols-1'}`}
                >
                    {menu.map((item, i) => {
                        const Icon = item.icon;
                        const ganjilTerakhir = menu.length % 2 === 1 && i === menu.length - 1;

                        const cls = `group flex min-h-[4.75rem] items-center gap-4 rounded-full bg-white py-2.5 pl-2.5 pr-5 ring-1 ring-emerald-900/15 transition hover:ring-emerald-700 active:scale-[0.98] ${
                            ganjilTerakhir ? 'sm:col-span-2 lg:col-span-1' : ''
                        }`;

                        const isi = (
                            <>
                                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-white transition group-hover:bg-emerald-700">
                                    <Icon className="h-7 w-7" />
                                </span>
                                <span className="flex-1 text-lg font-bold leading-tight text-slate-800">
                                    {item.label}
                                </span>
                                <ChevronRight className="h-6 w-6 shrink-0 text-emerald-700 transition group-hover:translate-x-0.5 lg:hidden" />
                            </>
                        );

                        return item.external ? (
                            <a key={item.key} href={item.href} className={cls}>
                                {isi}
                            </a>
                        ) : (
                            <Link key={item.key} href={item.href} className={cls}>
                                {isi}
                            </Link>
                        );
                    })}
                </nav>

                {/* BARIS 3: TRANSAKSI, lebar penuh, dua kolom di desktop */}
                <section className="rounded-bl-3xl rounded-br-3xl rounded-tl-3xl rounded-tr-[3.5rem] bg-emerald-50 px-5 py-6 sm:px-10 sm:py-8">
                    <div className="mb-2 flex items-end justify-between gap-3">
                        <h2 className="font-serif text-2xl text-slate-900 sm:text-3xl">
                            Transaksi terakhir
                        </h2>

                        {urlRiwayat && (
                            <Link
                                href={urlRiwayat}
                                className="shrink-0 pb-1 text-base font-semibold text-emerald-800 underline underline-offset-4 hover:text-emerald-900"
                            >
                                Lihat semua
                            </Link>
                        )}
                    </div>

                    {transaksi.length > 0 ? (
                        <ul className="lg:columns-2 lg:gap-14">
                            {transaksi.map((trx) => {
                                const masuk = ['topup', 'allowance'].includes(trx.type);

                                return (
                                    <li
                                        key={trx.id}
                                        className="flex break-inside-avoid items-center justify-between gap-3 border-b border-emerald-900/10 py-4"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span
                                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                                                    masuk
                                                        ? 'bg-emerald-200 text-emerald-900'
                                                        : 'bg-rose-100 text-rose-700'
                                                }`}
                                            >
                                                {masuk ? (
                                                    <ArrowDownLeft className="h-6 w-6" />
                                                ) : (
                                                    <ArrowUpRight className="h-6 w-6" />
                                                )}
                                            </span>

                                            <div className="min-w-0">
                                                <p className="truncate text-lg font-semibold text-slate-800">
                                                    {trx.description || trx.category}
                                                </p>

                                                {trx.status === 'pending' && (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-amber-300 bg-amber-50 text-amber-800"
                                                    >
                                                        Menunggu persetujuan
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <span
                                            className={`shrink-0 text-base font-bold sm:text-lg ${
                                                masuk ? 'text-emerald-800' : 'text-rose-700'
                                            }`}
                                        >
                                            {masuk ? '+' : '-'}
                                            {formatRupiah(trx.amount)}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center gap-2 py-10 text-center">
                            <Inbox className="h-10 w-10 text-emerald-600" />
                            <p className="text-lg font-semibold text-slate-700">Belum ada transaksi</p>
                            <p className="text-base text-slate-500">
                                Transaksi Anda akan muncul di sini.
                            </p>
                        </div>
                    )}
                </section>
            </div>

            <style>{`
                @keyframes ayom-ping-soft {
                    0% { transform: scale(0.9); opacity: 0.8; }
                    100% { transform: scale(1.7); opacity: 0; }
                }

                .ayom-ping { animation: ayom-ping-soft 1.6s cubic-bezier(0, 0, 0.2, 1) infinite; }
                .ayom-ping-delay { animation-delay: 0.5s; }

                @media (prefers-reduced-motion: reduce) {
                    .ayom-ping { animation: none; }
                }
            `}</style>
        </LansiaLayout>
    );
}