import { useCallback, useRef, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import LansiaLayout from '@/Layouts/LansiaLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';

// ================= KAMUS KATEGORI (untuk deteksi dari ucapan) =================

const KATEGORI_KEYWORDS = [
    { category: 'makanan', label: 'Makanan', emoji: '🍽️', kata: ['makan', 'makanan', 'jajan', 'warung', 'sarapan'] },
    { category: 'transportasi', label: 'Transportasi', emoji: '🚕', kata: ['transport', 'ojek', 'angkot', 'bensin', 'grab', 'gojek'] },
    { category: 'hiburan', label: 'Hiburan', emoji: '🎬', kata: ['hiburan', 'nonton', 'bioskop', 'main'] },
    { category: 'tagihan', label: 'Tagihan', emoji: '🧾', kata: ['tagihan', 'listrik', 'air', 'internet', 'bayar'] },
    { category: 'kesehatan', label: 'Kesehatan', emoji: '💊', kata: ['obat', 'dokter', 'kesehatan', 'apotek', 'bpjs'] },
    { category: 'pendidikan', label: 'Pendidikan', emoji: '📚', kata: ['sekolah', 'buku', 'pendidikan', 'kursus'] },
];

const KATEGORI_INFO = Object.fromEntries(
    [...KATEGORI_KEYWORDS, { category: 'lainnya', label: 'Lainnya', emoji: '📦' }].map((k) => [k.category, k])
);

// ================= PARSING UCAPAN =================

function deteksiKategori(teks) {
    const lower = teks.toLowerCase();
    const cocok = KATEGORI_KEYWORDS.find((k) => k.kata.some((kata) => lower.includes(kata)));
    return cocok?.category ?? 'lainnya';
}

/**
 * Ubah kata angka Bahasa Indonesia jadi nominal, mis. "lima puluh ribu" -> 50000,
 * "dua ratus lima puluh ribu" -> 250000, "satu juta dua ratus ribu" -> 1200000.
 * Ini dibutuhkan karena Web Speech API kadang mentranskrip angka sebagai KATA,
 * bukan digit, terutama untuk kalimat yang diucapkan pelan/terputus oleh lansia.
 */
function kataKeAngka(teks) {
    const SATUAN = {
        kosong: 0, nol: 0, satu: 1, dua: 2, tiga: 3, empat: 4,
        lima: 5, enam: 6, tujuh: 7, delapan: 8, sembilan: 9,
    };

    const tokenMentah = teks.toLowerCase().replace(/[.,]/g, '').split(/\s+/);

    // Pecah kata berimbuhan "se-" jadi dua token agar mudah diproses
    const tokens = [];
    for (const t of tokenMentah) {
        if (t === 'seribu') tokens.push('satu', 'ribu');
        else if (t === 'seratus') tokens.push('satu', 'ratus');
        else if (t === 'sepuluh') tokens.push('satu', 'puluh');
        else if (t === 'sebelas') tokens.push('satu', 'belas');
        else tokens.push(t);
    }

    let total = 0;
    let current = 0;
    let i = 0;
    let adaAngka = false;

    while (i < tokens.length) {
        const w = tokens[i];

        if (w in SATUAN) {
            adaAngka = true;
            const nilai = SATUAN[w];
            const next = tokens[i + 1];

            if (next === 'belas') { current += 10 + nilai; i += 2; continue; }
            if (next === 'puluh') { current += nilai * 10; i += 2; continue; }
            if (next === 'ratus') { current += nilai * 100; i += 2; continue; }
            if (next === 'ribu') { total += (current + nilai) * 1_000; current = 0; i += 2; continue; }
            if (next === 'juta') { total += (current + nilai) * 1_000_000; current = 0; i += 2; continue; }

            current += nilai;
            i += 1;
            continue;
        }

        if (w === 'ribu') { total += current * 1_000; current = 0; adaAngka = true; i += 1; continue; }
        if (w === 'juta') { total += current * 1_000_000; current = 0; adaAngka = true; i += 1; continue; }

        i += 1; // lewati kata yang bukan bagian dari angka
    }

    total += current;
    return adaAngka && total > 0 ? total : null;
}

/** Ambil nominal dari ucapan: coba format digit dulu ("50000", "50.000", "50 ribu"), lalu fallback ke kata angka. */
function deteksiNominal(teks) {
    const lower = teks.toLowerCase();
    const matchDigit = lower.match(/(\d[\d.,]*)\s*(ribu|rb|juta|jt)?/);

    if (matchDigit) {
        const angkaMentah = matchDigit[1].replace(/[.,]/g, '');
        let nominal = parseInt(angkaMentah, 10);
        if (!Number.isNaN(nominal)) {
            if (matchDigit[2] === 'ribu' || matchDigit[2] === 'rb') nominal *= 1000;
            if (matchDigit[2] === 'juta' || matchDigit[2] === 'jt') nominal *= 1_000_000;
            return nominal;
        }
    }

    return kataKeAngka(teks);
}

function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount || 0);
}

// ================= HOOK PERINTAH SUARA =================

function useVoiceCommand(onResult) {
    const [mendengarkan, setMendengarkan] = useState(false);
    const [pesanError, setPesanError] = useState('');
    const [didukung] = useState(
        () => typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    );
    const recognitionRef = useRef(null);

    const mulaiDengar = useCallback(() => {
        if (!didukung) return;
        setPesanError('');

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setMendengarkan(true);
        recognition.onerror = (event) => {
            setMendengarkan(false);
            const pesan = {
                'no-speech': 'Tidak ada suara terdengar. Coba lagi ya.',
                'audio-capture': 'Mikrofon tidak ditemukan. Periksa perangkat Anda.',
                'not-allowed': 'Izin mikrofon ditolak. Aktifkan izin mikrofon di browser.',
            }[event.error] || 'Terjadi kesalahan saat mendengarkan. Coba lagi.';
            setPesanError(pesan);
        };
        recognition.onend = () => setMendengarkan(false);
        recognition.onresult = (event) => {
            const teks = event.results[0][0].transcript;
            onResult(teks);
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [didukung, onResult]);

    const berhentiDengar = useCallback(() => {
        recognitionRef.current?.stop();
        setMendengarkan(false);
    }, []);

    return { mulaiDengar, berhentiDengar, mendengarkan, didukung, pesanError };
}

function ucapkan(teks) {
    if (!('speechSynthesis' in window)) return;
    const ucapan = new SpeechSynthesisUtterance(teks);
    ucapan.lang = 'id-ID';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(ucapan);
}

// ================= KOMPONEN UTAMA =================

export default function VoiceCheckout() {
    const { errors, flash } = usePage().props;

    // tahap: 'siap' -> 'meninjau' (hasil suara siap dikonfirmasi) -> setelah submit form akan reset sendiri
    const [tahap, setTahap] = useState('siap');
    const [transkrip, setTranskrip] = useState('');
    const [nominalTerdeteksi, setNominalTerdeteksi] = useState(true);

    const { data, setData, post, processing, reset } = useForm({
        amount: '',
        category: 'lainnya',
        description: '',
    });

    const handleHasilSuara = useCallback((teks) => {
        setTranskrip(teks);

        const nominal = deteksiNominal(teks);
        const kategori = deteksiKategori(teks);

        setData({
            amount: nominal ? String(nominal) : '',
            category: kategori,
            description: teks.charAt(0).toUpperCase() + teks.slice(1),
        });
        setTahap('meninjau');
        setNominalTerdeteksi(!!nominal);

        if (nominal) {
            ucapkan(`Belanja ${KATEGORI_INFO[kategori].label} sebesar ${formatRupiah(nominal)}. Konfirmasi untuk lanjut.`);
        } else {
            ucapkan('Maaf, nominal tidak terdengar jelas. Silakan isi nominal secara manual.');
        }
    }, [setData]);

    const { mulaiDengar, berhentiDengar, mendengarkan, didukung, pesanError } = useVoiceCommand(handleHasilSuara);

    const batalkan = () => {
        reset();
        setTranskrip('');
        setTahap('siap');
    };

    const konfirmasi = (e) => {
        e.preventDefault();
        post(route('transactions.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setTranskrip('');
                setTahap('siap');
            },
        });
    };

    const nominalValid = Number(data.amount) > 0;

    return (
        <LansiaLayout>
            <Head title="Belanja dengan Suara" />

            <div className="mx-auto max-w-2xl space-y-6 lg:max-w-3xl">
                <h1 className="text-4xl font-bold text-gray-900">Belanja dengan Suara</h1>

                {flash?.success && (
                    <div className="rounded-xl border-4 border-emerald-400 bg-emerald-50 p-5 text-2xl font-semibold text-emerald-800">
                        {flash.success}
                    </div>
                )}

                {(errors?.amount || errors?.category) && (
                    <div className="rounded-xl border-4 border-red-400 bg-red-50 p-5 text-2xl font-semibold text-red-800">
                        {errors.amount || errors.category}
                    </div>
                )}

                {pesanError && (
                    <div className="rounded-xl border-4 border-amber-300 bg-amber-50 p-5 text-xl text-amber-800">
                        {pesanError}
                    </div>
                )}

                {!didukung && (
                    <div className="rounded-xl border-4 border-amber-300 bg-amber-50 p-5 text-xl text-amber-800">
                        Perintah suara tidak didukung di browser ini. Silakan isi form belanja secara manual di bawah.
                    </div>
                )}

                {/* ---------- TAHAP: SIAP MENDENGARKAN ---------- */}
                {tahap === 'siap' && (
                    <Card className="border-4 border-emerald-100">
                        <CardContent className="flex flex-col items-center gap-6 p-8 text-center lg:p-12">
                            <button
                                type="button"
                                onClick={mendengarkan ? berhentiDengar : mulaiDengar}
                                disabled={!didukung}
                                className={`flex h-40 w-40 items-center justify-center rounded-full text-6xl shadow-lg transition disabled:opacity-40 lg:h-48 lg:w-48 ${
                                    mendengarkan ? 'animate-pulse bg-red-500' : 'bg-emerald-600 hover:bg-emerald-700'
                                }`}
                                aria-label="Mulai bicara"
                            >
                                🎤
                            </button>

                            <p className="text-2xl font-semibold text-gray-800">
                                {mendengarkan ? 'Mendengarkan...' : 'Tekan tombol, lalu ucapkan belanja Anda'}
                            </p>

                            <p className="text-lg text-gray-500">
                                Contoh: <em>&quot;Belanja makanan lima puluh ribu&quot;</em> atau{' '}
                                <em>&quot;Bayar obat 20 ribu&quot;</em>
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* ---------- TAHAP: TINJAU & KONFIRMASI ---------- */}
                {tahap === 'meninjau' && (
                    <Card className="border-4 border-emerald-300">
                        <CardHeader>
                            <CardTitle className="text-2xl">Konfirmasi Belanja</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {transkrip && (
                                <p className="text-lg italic text-gray-500">Terdengar: &quot;{transkrip}&quot;</p>
                            )}

                            {!nominalTerdeteksi && (
                                <p className="rounded-lg bg-amber-50 p-3 text-lg font-semibold text-amber-800">
                                    Nominal tidak terdeteksi otomatis — mohon isi manual di bawah.
                                </p>
                            )}

                            <form onSubmit={konfirmasi} className="space-y-5">
                                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-xl font-semibold text-gray-800">Nominal</label>
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            min="1"
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                            className="h-16 w-full rounded-lg border-2 border-emerald-200 px-4 text-3xl font-bold focus:border-emerald-500 focus:outline-none"
                                            placeholder="0"
                                        />
                                        {nominalValid && (
                                            <p className="text-2xl text-gray-600">{formatRupiah(Number(data.amount))}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xl font-semibold text-gray-800">Keterangan</label>
                                        <input
                                            type="text"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="h-16 w-full rounded-lg border-2 border-emerald-200 px-4 text-xl focus:border-emerald-500 focus:outline-none"
                                            placeholder="Keterangan belanja (opsional)"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xl font-semibold text-gray-800">Kategori</label>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(KATEGORI_INFO).map(([value, info]) => (
                                            <Badge
                                                key={value}
                                                onClick={() => setData('category', value)}
                                                className={`cursor-pointer px-4 py-2 text-lg ${
                                                    data.category === value
                                                        ? 'bg-emerald-600 text-white hover:bg-emerald-600'
                                                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                                }`}
                                            >
                                                {info.emoji} {info.label}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="h-16 flex-1 bg-emerald-600 text-2xl hover:bg-emerald-700"
                                        disabled={processing || !nominalValid}
                                    >
                                        {processing ? 'Mengirim...' : '✅ Konfirmasi Belanja'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="lg"
                                        className="h-16 border-emerald-300 text-2xl text-emerald-800 hover:bg-emerald-50"
                                        onClick={batalkan}
                                        disabled={processing}
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </LansiaLayout>
    );
}