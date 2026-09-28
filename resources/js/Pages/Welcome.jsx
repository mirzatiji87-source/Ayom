// resources/js/Pages/Welcome.jsx

import { Head, Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    ShieldCheck,
    Mic,
    Wallet,
    ListChecks,
    ArrowRight,
    Users,
    Sparkles,
    Eye,
    GraduationCap,
} from "lucide-react";

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
    }),
};

function Feature({ icon: Icon, title, points, accent, index }) {
    return (
        <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            custom={index}
            className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
            <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md"
                style={{ background: accent }}
            >
                <Icon className="h-6 w-6" />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>

            <ul className="mt-3 flex-1 space-y-2">
                {points.map((point) => (
                    <li
                        key={point}
                        className="flex items-start gap-2 text-sm leading-relaxed text-slate-500"
                    >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                        {point}
                    </li>
                ))}
            </ul>
        </motion.div>
    );
}

/*
|--------------------------------------------------------------------------
| Slogan badge - "Lansia dilindungi, Orang Tua mengawasi, Remaja diedukasi"
|--------------------------------------------------------------------------
*/

function SloganBadge({ icon: Icon, label }) {
    return (
        <div className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
            <Icon className="h-4 w-4" />
            {label}
        </div>
    );
}

export default function Welcome() {
    return (
        <>
            <Head title="Ayom - Ekosistem Finansial Keluarga" />

            <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-white to-white">
                {/* NAVBAR */}
                <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
                    <div className="flex items-center gap-2.5">
                        <img
                            src="/images/logoAyom.png"
                            alt="Ayom"
                            className="h-14 w-14 object-contain"
                        />
                        <div>
                            <p className="text-lg font-bold leading-none text-slate-900">
                                Ayom
                            </p>
                        </div>
                    </div>

                    <nav className="flex items-center gap-3">
                        <Link
                            href={route("login")}
                            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-emerald-700"
                        >
                            Masuk
                        </Link>
                        <Link
                            href={route("register")}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.97]"
                        >
                            Daftar Gratis
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </nav>
                </header>

                {/* HERO */}
                <section className="mx-auto max-w-4xl px-6 pb-16 pt-10 text-center sm:pt-16">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-semibold text-emerald-700"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        Ekosistem finansial lintas generasi
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: 0.1,
                            duration: 0.5,
                            ease: "easeOut",
                        }}
                        className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl"
                    >
                        Menjaga keuangan keluarga,{" "}
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            dari Lansia sampai Remaja
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: 0.2,
                            duration: 0.5,
                            ease: "easeOut",
                        }}
                        className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg"
                    >
                        Ayom menghubungkan orang tua, lansia, dan remaja dalam
                        satu wallet keluarga — navigasi suara untuk lansia,
                        kontrol penuh untuk orang tua, dan uang saku berbasis
                        misi untuk remaja.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: 0.3,
                            duration: 0.5,
                            ease: "easeOut",
                        }}
                        className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
                    >
                        <Link
                            href={route("register")}
                            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 active:scale-[0.98]"
                        >
                            Mulai Sekarang
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href={route("login")}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                        >
                            Saya sudah punya akun
                        </Link>
                    </motion.div>
                </section>

                {/* FEATURES */}
                <section className="mx-auto max-w-6xl px-6 pb-24">
                    <div className="mb-10 text-center">
                        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                            Satu aplikasi, tiga peran
                        </h2>
                        <p className="mt-2 text-sm text-slate-500 sm:text-base">
                            Setiap anggota keluarga dapat pengalaman yang
                            dirancang khusus untuk kebutuhannya.
                        </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-3">
                        <Feature
                            index={0}
                            icon={Mic}
                            title="Lansia"
                            accent="linear-gradient(135deg, #10b981, #0d9488)"
                            points={[
                                "Navigasi suara Bahasa Indonesia",
                                "Auto-pilot tagihan rutin & pengingat",
                                "Checkout belanja pakai suara",
                                "Approval keluarga untuk transaksi besar",
                            ]}
                        />
                        <Feature
                            index={1}
                            icon={Wallet}
                            title="Orang Tua"
                            accent="linear-gradient(135deg, #059669, #0f766e)"
                            points={[
                                "Guardian View — pantau arus kas transparan",
                                "Atur limit harian & bulanan tiap anggota",
                                "Approval Center untuk transaksi mencurigakan",
                                "Top-up saldo keluarga terpusat",
                            ]}
                        />
                        <Feature
                            index={2}
                            icon={ListChecks}
                            title="Remaja"
                            accent="linear-gradient(135deg, #0d9488, #0891b2)"
                            points={[
                                "Uang saku berbasis penyelesaian misi",
                                "Pencatatan keuangan otomatis per kategori",
                                "Grafik pengeluaran sederhana",
                                "Belajar budgeting tanpa risiko riil",
                            ]}
                        />
                    </div>
                </section>

                {/* CTA - slogan diletakkan tepat sebelum tombol daftar */}
                <section className="mx-auto max-w-4xl px-6 pb-24">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 px-8 py-12 text-center text-white shadow-xl shadow-emerald-200/50 sm:px-12">
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10"
                        />
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-white/10"
                        />

                        <div className="relative z-10">
                            <Users className="mx-auto h-8 w-8" />
                            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
                                Ajak seluruh keluarga bergabung
                            </h2>
                            <p className="mx-auto mt-2 max-w-md text-sm text-emerald-50 sm:text-base">
                                Daftar sebagai Orang Tua, lalu tambahkan akun
                                untuk Lansia dan Remaja di keluarga Anda.
                            </p>

                            {/* SLOGAN - 3 badge, satu kalimat inti Ayom */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-2.5"
                            >
                                <SloganBadge
                                    icon={ShieldCheck}
                                    label="Lansia dilindungi"
                                />
                                <SloganBadge
                                    icon={Eye}
                                    label="Orang Tua mengawasi"
                                />
                                <SloganBadge
                                    icon={GraduationCap}
                                    label="Remaja diedukasi"
                                />
                            </motion.div>

                            <Link
                                href={route("register")}
                                className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-50 active:scale-[0.98]"
                            >
                                Daftar Sekarang
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="border-t border-slate-100 py-8 text-center text-xs text-slate-400">
                    © {new Date().getFullYear()} Ayom — Ekosistem Finansial
                    Keluarga Lintas Generasi
                </footer>
            </div>
        </>
    );
}
