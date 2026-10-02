// resources/js/Pages/Welcome.jsx

import { useEffect, useRef, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import { motion, useReducedMotion } from "framer-motion";
import "@fontsource-variable/plus-jakarta-sans";
import {
    ShieldCheck,
    Mic,
    ArrowRight,
    Eye,
    GraduationCap,
    Bell,
    Check,
    X,
    RotateCcw,
    Volume2,
} from "lucide-react";

import { themeVars, roleMeta } from "@/lib/ayom-theme";

/*
|--------------------------------------------------------------------------
| Partner logos
|--------------------------------------------------------------------------
| File ada di public/images. Nama file sudah di-rename tanpa spasi.
| dark: true -> logo punya teks putih (Jagoan Hosting), jadi butuh latar gelap.
| Kalau ada logo lain yang tidak kelihatan di latar putih, tambahkan dark: true.
*/
const PARTNERS = [
    { name: "JHIC 2.0", src: "/images/jhic.png" },
    { name: "Jagoan Hosting", src: "/images/jagoan-hosting.png" },
    { name: "KOMDIGI", src: "/images/komdigi.png" },
    { name: "Garuda Spark", src: "/images/garuda-spark.png" },
    { name: "NGALUP", src: "/images/ngalup.png" },
];

const FONT =
    '"Plus Jakarta Sans Variable", "Noto Sans Variable", system-ui, sans-serif';

const ROLES = [
    {
        icon: ShieldCheck,
        role: "lansia",
        title: "Lansia",
        lead: "Dilindungi, tanpa harus rumit.",
        points: [
            "Navigasi suara Bahasa Indonesia",
            "Auto-pilot tagihan rutin dan pengingat",
            "Checkout belanja pakai suara",
            "Transaksi besar menunggu persetujuan keluarga",
        ],
    },
    {
        icon: Eye,
        role: "orang_tua",
        title: "Orang Tua",
        lead: "Mengawasi dengan transparan.",
        points: [
            "Guardian View untuk memantau arus kas",
            "Limit harian dan bulanan tiap anggota",
            "Approval Center untuk transaksi mencurigakan",
            "Top-up saldo keluarga terpusat",
        ],
    },
    {
        icon: GraduationCap,
        role: "remaja",
        title: "Remaja",
        lead: "Belajar mengatur uang sendiri.",
        points: [
            "Uang saku cair setelah misi selesai",
            "Pencatatan otomatis per kategori",
            "Grafik pengeluaran yang mudah dibaca",
            "Latihan budgeting tanpa risiko besar",
        ],
    },
];

/* -------------------------------------------------------------------------- */

const DEMO_STEPS = ["Eyang meminta", "Orang tua memutuskan", "Selesai"];

const DEFAULT_TEXT = "Bayar obat tujuh ratus lima puluh ribu rupiah";
const REPLY = "Baik, kami proses di mode approval center";

const INTENT =
    /bayar|beli|belanja|transfer|kirim|obat|apotek|tagihan|listrik|air|pulsa|sayur|pasar/i;

const UNKNOWN = "Maaf, perintah tidak dikenali. Tidak ada uang yang keluar.";

function InteractiveDemo() {
    // start | listening | processing | decide | approved | rejected | unknown
    const [step, setStep] = useState("start");
    const [heard, setHeard] = useState("");
    const recRef = useRef(null);
    const doneRef = useRef(false);
    const heardRef = useRef("");

    // bersihkan saat komponen unmount
    useEffect(() => {
        return () => {
            recRef.current?.abort?.();
            window.speechSynthesis?.cancel();
        };
    }, []);

    const speak = (text, onDone) => {
        let called = false;

        const once = () => {
            if (called) return;
            called = true;
            onDone();
        };

        const synth = window.speechSynthesis;

        if (!synth || typeof SpeechSynthesisUtterance === "undefined") {
            setTimeout(once, 2200);
            return;
        }

        synth.cancel();

        const u = new SpeechSynthesisUtterance(text);
        u.lang = "id-ID";
        u.rate = 0.95;
        u.onend = once;
        u.onerror = once;

        synth.speak(u);

        setTimeout(once, 6000); // pengaman kalau onend tidak terpanggil
    };

    const goProcessing = (text) => {
        setHeard(text);
        setStep("processing");
        speak(REPLY, () => setStep("decide"));
    };

    const finish = (text) => {
        if (doneRef.current) return;

        doneRef.current = true;
        const clean = text?.trim();

        if (!clean) return goProcessing(DEFAULT_TEXT);

        if (INTENT.test(clean)) return goProcessing(clean);

        // ucapan di luar skenario
        setHeard(clean);
        setStep("unknown");
        speak(UNKNOWN, () => {});
    };

    // tombol contoh perintah
    const useExample = () => {
        doneRef.current = true;
        window.speechSynthesis?.cancel();
        goProcessing("Bayar obat di apotek");
    };

    const startListening = () => {
        doneRef.current = false;
        heardRef.current = "";
        setHeard("");
        setStep("listening");

        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SR) {
            setTimeout(() => finish(""), 1500); // browser tidak support
            return;
        }

        const rec = new SR();
        recRef.current = rec;

        rec.lang = "id-ID";
        rec.interimResults = true;
        rec.continuous = false;

        rec.onresult = (e) => {
            const text = Array.from(e.results)
                .map((r) => r[0].transcript)
                .join(" ");

            heardRef.current = text;
            setHeard(text);

            if (e.results[e.results.length - 1].isFinal) {
                finish(text);
            }
        };

        rec.onerror = () => finish(heardRef.current);
        rec.onend = () => finish(heardRef.current);

        try {
            rec.start();
            setTimeout(() => rec.stop(), 7000);
        } catch {
            finish("");
        }
    };

    const viewer = step === "decide" ? "orang_tua" : "lansia";
    const meta = roleMeta(viewer);
    const activeIdx =
        step === "decide"
            ? 1
            : step === "approved" || step === "rejected"
              ? 2
              : 0;

    return (
        <div className="relative mx-auto w-full max-w-md">
            <div
                aria-hidden
                className="absolute inset-0 translate-x-3 translate-y-4 rotate-[2.5deg] rounded-[2rem] bg-[var(--ayom-primary)]/10"
            />

            <div className="relative overflow-hidden rounded-[2rem] bg-[var(--ayom-primary)] p-6 text-[var(--ayom-primary-foreground)] shadow-[0_30px_60px_-30px_rgba(10,59,55,0.7)]">
                <img
                    src="/images/logoAyom.png"
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 object-contain opacity-[0.08]"
                />

                {/* langkah */}
                <ol
                    className="relative flex items-start gap-2"
                    aria-label="Langkah demo"
                >
                    {DEMO_STEPS.map((label, i) => (
                        <li
                            key={label}
                            aria-current={i === activeIdx ? "step" : undefined}
                            className="flex-1"
                        >
                            <div
                                className={`h-1 rounded-full transition-colors duration-500 ${
                                    i <= activeIdx ? "bg-white" : "bg-white/20"
                                }`}
                            />
                            <p
                                className={`mt-2 min-h-[2.1rem] text-xs leading-snug ${
                                    i === activeIdx
                                        ? "font-semibold text-white"
                                        : "text-white/70"
                                }`}
                            >
                                {label}
                            </p>
                        </li>
                    ))}
                </ol>

                {/* siapa yang melihat */}
                <div className="relative mt-5 flex items-center gap-3">
                    <span
                        className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
                        style={{ backgroundColor: meta.bg, color: meta.text }}
                    >
                        {viewer === "lansia" ? "E" : "B"}
                    </span>

                    <p className="text-sm">
                        <span className="text-white/70">Tampilan </span>
                        <span className="font-semibold">
                            {viewer === "lansia" ? "Eyang Sri" : "Bu Rina"}
                        </span>
                        <span className="text-white/70"> ({meta.label})</span>
                    </p>
                </div>

                {/* isi */}
                <div className="relative mt-5 flex min-h-[250px] flex-col justify-center rounded-3xl bg-white/[0.08] p-5 ring-1 ring-white/10">
                    {step === "start" && (
                        <div className="text-center">
                            <p className="text-sm text-white/75">
                                Eyang Sri ingin membayar obat di apotek.
                            </p>

                            <button
                                type="button"
                                onClick={startListening}
                                className="relative mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-white text-[var(--ayom-primary)] transition active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                                aria-label="Ucapkan perintah pembayaran"
                            >
                                <span className="absolute inset-0 animate-ping rounded-full bg-white/40 motion-reduce:animate-none" />
                                <Mic className="relative h-8 w-8" />
                            </button>

                            <p className="mt-5 text-sm font-semibold">
                                Tekan, lalu ucapkan perintah
                            </p>

                            <p className="mt-1 text-xs text-white/70">
                                Contoh: "Bayar obat di apotek". Tidak memakai
                                uang sungguhan
                            </p>
                        </div>
                    )}

                    {step === "listening" && (
                        <div className="text-center">
                            <span className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-[var(--ayom-primary)]">
                                <span className="absolute inset-0 animate-ping rounded-full bg-white/40 motion-reduce:animate-none" />
                                <Mic className="relative h-8 w-8" />
                            </span>

                            <p className="mt-5 text-sm font-semibold">
                                Mendengarkan...
                            </p>

                            <p className="mx-auto mt-2 min-h-[2.5rem] max-w-xs text-sm text-white/80">
                                {heard ? `"${heard}"` : "Silakan bicara"}
                            </p>
                        </div>
                    )}

                    {step === "processing" && (
                        <div className="text-center">
                            <p className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-[var(--ayom-ink)]">
                                "{heard}"
                            </p>

                            <div className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold">
                                <Volume2 className="h-4 w-4 animate-pulse motion-reduce:animate-none" />
                                {REPLY}
                            </div>

                            <div
                                className="mt-3 flex justify-center gap-1.5"
                                aria-hidden
                            >
                                {[0, 1, 2].map((d) => (
                                    <span
                                        key={d}
                                        className="h-2 w-2 animate-bounce rounded-full bg-white/70 motion-reduce:animate-none"
                                        style={{
                                            animationDelay: `${d * 150}ms`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {step === "unknown" && (
                        <div className="text-center">
                            <p className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/80 ring-1 ring-white/15">
                                "{heard}"
                            </p>

                            <span
                                className="mx-auto mt-5 flex h-12 w-12 items-center justify-center rounded-full"
                                style={{
                                    backgroundColor: "var(--ayom-danger-soft)",
                                    color: "var(--ayom-danger)",
                                }}
                            >
                                <X className="h-6 w-6" />
                            </span>

                            <p className="mt-3 text-sm font-semibold">
                                Perintah tidak dikenali
                            </p>

                            <p className="mt-1 text-xs text-white/70">
                                Tidak ada uang yang keluar. Itulah cara Ayom
                                menjaga Eyang.
                            </p>

                            <div className="mt-5 flex flex-col items-center gap-2.5">
                                <button
                                    type="button"
                                    onClick={startListening}
                                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[var(--ayom-primary)] transition hover:bg-[var(--ayom-primary-soft)] active:scale-[0.98]"
                                >
                                    <Mic className="h-4 w-4" />
                                    Coba lagi
                                </button>

                                <button
                                    type="button"
                                    onClick={useExample}
                                    className="px-4 py-2 text-xs text-white/75 transition-colors hover:text-white"
                                >
                                    Atau pakai contoh: "Bayar obat di apotek"
                                </button>
                            </div>
                        </div>
                    )}

                    {step === "decide" && (
                        <div>
                            <div className="flex items-start gap-3">
                                <span
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                                    style={{
                                        backgroundColor:
                                            "var(--ayom-accent-soft)",
                                        color: "var(--ayom-accent)",
                                    }}
                                >
                                    <Bell className="h-4 w-4" />
                                </span>

                                <div>
                                    <p className="text-sm font-semibold">
                                        Eyang Sri ingin membayar Rp 750.000
                                    </p>

                                    <p className="mt-0.5 text-xs text-white/70">
                                        Apotek Sehat, obat rutin bulanan
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep("rejected")}
                                    className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold ring-1 ring-white/15 transition hover:bg-white/15 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                                >
                                    Tolak
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep("approved")}
                                    className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[var(--ayom-primary)] transition hover:bg-[var(--ayom-primary-soft)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                >
                                    Setujui
                                </button>
                            </div>
                        </div>
                    )}

                    {(step === "approved" || step === "rejected") && (
                        <div className="text-center">
                            <span
                                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
                                style={{
                                    backgroundColor:
                                        step === "approved"
                                            ? "#d9f5e2"
                                            : "var(--ayom-danger-soft)",
                                    color:
                                        step === "approved"
                                            ? "#01571b"
                                            : "var(--ayom-danger)",
                                }}
                            >
                                {step === "approved" ? (
                                    <Check className="h-7 w-7" />
                                ) : (
                                    <X className="h-7 w-7" />
                                )}
                            </span>

                            <p className="mt-4 text-base font-semibold">
                                {step === "approved"
                                    ? "Pembayaran berhasil"
                                    : "Pembayaran dibatalkan"}
                            </p>

                            <p className="mx-auto mt-1.5 max-w-xs text-sm text-white/75">
                                {step === "approved"
                                    ? "Eyang tetap bisa belanja sendiri, dan Anda yang memegang keputusan."
                                    : "Eyang diberi tahu dan saldo keluarga tetap aman."}
                            </p>

                            <div className="mt-5 flex flex-col items-center gap-2.5">
                                <Link
                                    href={route("register")}
                                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[var(--ayom-primary)] transition hover:bg-[var(--ayom-primary-soft)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                >
                                    Pakai untuk keluarga saya
                                    <ArrowRight className="h-4 w-4" />
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => setStep("start")}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs text-white/75 transition-colors duration-200 hover:text-white"
                                >
                                    <RotateCcw className="h-3 w-3" />
                                    Ulangi demo
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function PartnerCard({ partner }) {
    return (
        <div
            className={`flex h-24 items-center justify-center rounded-2xl border px-6 transition-colors duration-300 sm:h-28 ${
                partner.dark
                    ? "border-slate-800 bg-slate-900"
                    : "border-[var(--ayom-border)] bg-white hover:border-[var(--ayom-primary-line)]"
            }`}
        >
            <img
                src={partner.src}
                alt={partner.name}
                loading="lazy"
                className="max-h-12 w-full object-contain sm:max-h-14"
            />
        </div>
    );
}

function RoleColumn({ item }) {
    const meta = roleMeta(item.role);
    const Icon = item.icon;

    return (
        <div className="flex flex-col px-0 py-8 first:pt-0 last:pb-0 md:px-8 md:py-0 md:first:pl-0 md:last:pr-0">
            <span
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: meta.bg, color: meta.text }}
            >
                <Icon className="h-6 w-6" strokeWidth={1.75} />
            </span>

            <h3 className="mt-5 text-xl font-semibold text-[var(--ayom-ink)]">
                {item.title}
            </h3>

            <p
                className="mt-1 text-sm font-medium"
                style={{ color: meta.text }}
            >
                {item.lead}
            </p>

            <ul className="mt-5 space-y-2.5">
                {item.points.map((p) => (
                    <li
                        key={p}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-[var(--ayom-muted)]"
                    >
                        <span
                            className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: meta.dot }}
                        />
                        {p}
                    </li>
                ))}
            </ul>
        </div>
    );
}

/* -------------------------------------------------------------------------- */

export default function Welcome() {
    const reduce = useReducedMotion();

    const heroMotion = (delay = 0) =>
        reduce
            ? {}
            : {
                  initial: { opacity: 0, y: 14 },
                  animate: { opacity: 1, y: 0 },
                  transition: {
                      delay,
                      duration: 0.55,
                      ease: "easeOut",
                  },
              };

    return (
        <>
            <Head title="Ayom - Ekosistem Finansial Keluarga" />

            <div
                style={{ ...themeVars, fontFamily: FONT }}
                className="min-h-screen overflow-x-clip bg-[var(--ayom-bg)] text-[var(--ayom-ink)]"
            >
                {/* NAVBAR */}
                <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
                    <div className="flex items-center gap-2.5">
                        <img
                            src="/images/logoAyom.png"
                            alt="Ayom"
                            className="h-11 w-11 object-contain"
                        />
                        <p className="text-lg font-semibold leading-none">
                            Ayom
                        </p>
                    </div>

                    <nav className="flex items-center gap-2">
                        <Link
                            href={route("login")}
                            className="rounded-full px-4 py-2 text-sm font-medium text-[var(--ayom-muted)] transition hover:bg-black/[0.04] hover:text-[var(--ayom-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ayom-primary)]"
                        >
                            Masuk
                        </Link>

                        <Link
                            href={route("register")}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ayom-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--ayom-primary-foreground)] transition hover:bg-[var(--ayom-primary-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ayom-primary)]"
                        >
                            Daftar gratis
                        </Link>
                    </nav>
                </header>

                {/* HERO */}
                <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-24 pt-10 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
                    <div>
                        <motion.h1
                            {...heroMotion(0)}
                            className="text-4xl leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.25rem]"
                            style={{
                                fontFamily: FONT,
                                fontWeight: 800,
                            }}
                        >
                            Eyang belanja sendiri, Anda tetap tenang.
                        </motion.h1>

                        <motion.p
                            {...heroMotion(0.1)}
                            className="mt-6 max-w-lg text-base leading-relaxed text-[var(--ayom-muted)] sm:text-lg"
                        >
                            Ayom adalah wallet keluarga. Lansia belanja dengan
                            suara, orang tua yang menyetujui, remaja belajar
                            mengatur uang lewat misi. Coba sendiri di kartu
                            sebelah, hanya 10 detik.
                        </motion.p>

                        <motion.div
                            {...heroMotion(0.2)}
                            className="mt-9 flex flex-col gap-3 sm:flex-row"
                        >
                            <Link
                                href={route("register")}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ayom-primary)] px-7 py-3.5 text-sm font-semibold text-[var(--ayom-primary-foreground)] shadow-[0_14px_30px_-14px_rgba(14,79,74,0.8)] transition hover:bg-[var(--ayom-primary-dark)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ayom-primary)]"
                            >
                                Buat akun keluarga
                                <ArrowRight className="h-4 w-4" />
                            </Link>

                            <Link
                                href={route("login")}
                                className="inline-flex items-center justify-center rounded-full border border-[var(--ayom-border)] bg-white px-7 py-3.5 text-sm font-semibold text-[var(--ayom-ink)] transition hover:border-[var(--ayom-primary-line)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ayom-primary)]"
                            >
                                Saya sudah punya akun
                            </Link>
                        </motion.div>
                    </div>

                    <motion.div {...heroMotion(0.25)} className="pb-6 lg:pl-6">
                        <InteractiveDemo />
                    </motion.div>
                </section>

                {/* PARTNER */}
                <section className="border-y border-[var(--ayom-border)] bg-[var(--ayom-surface)]/60">
                    <div className="mx-auto max-w-6xl px-6 py-14">
                        <h2 className="text-center text-lg font-semibold sm:text-xl">
                            Didukung oleh
                        </h2>

                        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
                            {PARTNERS.map((p, i) => (
                                <div
                                    key={p.name}
                                    className={
                                        i === PARTNERS.length - 1
                                            ? "col-span-2 md:col-span-1"
                                            : ""
                                    }
                                >
                                    <PartnerCard partner={p} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* PERAN */}
                <section className="mx-auto max-w-6xl px-6 py-24">
                    <div className="max-w-xl">
                        <h2
                            className="text-3xl tracking-tight sm:text-4xl"
                            style={{
                                fontFamily: FONT,
                                fontWeight: 800,
                            }}
                        >
                            Tiga peran, tiga pengalaman
                        </h2>

                        <p className="mt-3 text-base text-[var(--ayom-muted)]">
                            Setiap anggota keluarga mendapat tampilan yang
                            dirancang untuk kebutuhannya.
                        </p>
                    </div>

                    <div className="mt-14 grid divide-y divide-[var(--ayom-border)] md:grid-cols-3 md:divide-x md:divide-y-0">
                        {ROLES.map((item) => (
                            <RoleColumn key={item.role} item={item} />
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="mx-auto max-w-6xl px-6 pb-24">
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-[var(--ayom-primary)] px-8 py-14 text-[var(--ayom-primary-foreground)] sm:px-14">
                        <img
                            src="/images/logoAyom.png"
                            alt=""
                            aria-hidden
                            className="pointer-events-none absolute -right-10 -top-12 h-72 w-72 object-contain opacity-[0.07]"
                        />

                        <div className="relative max-w-2xl">
                            <h2
                                className="text-3xl tracking-tight sm:text-4xl"
                                style={{
                                    fontFamily: FONT,
                                    fontWeight: 800,
                                }}
                            >
                                Lansia dilindungi, orang tua mengawasi, remaja
                                diedukasi.
                            </h2>

                            <p className="mt-4 max-w-lg text-base text-white/70">
                                Daftar sebagai orang tua, lalu tambahkan akun
                                untuk lansia dan remaja di keluarga Anda.
                            </p>

                            <Link
                                href={route("register")}
                                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[var(--ayom-primary)] transition hover:bg-[var(--ayom-primary-soft)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                                Daftar sekarang
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="border-t border-[var(--ayom-border)] py-8 text-center text-xs text-[var(--ayom-muted)]">
                    © {new Date().getFullYear()} Ayom. Ekosistem finansial
                    keluarga lintas generasi.
                </footer>
            </div>
        </>
    );
}
