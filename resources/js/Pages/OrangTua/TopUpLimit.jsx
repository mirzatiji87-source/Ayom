// resources/js/Pages/OrangTua/TopUpLimit.jsx

import { useState } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import axios from "axios";

import OrangTuaLayout from "@/Layouts/OrangTuaLayout";
import CurrencyInput from "@/Components/ui/currency-input";
import {
    FlashMessage,
    Hero,
    SHAPE_CARD_ALT,
    btnPrimary,
} from "@/Components/OrangTua/ui";
import {
    Wallet,
    ArrowUpRight,
    ArrowRightLeft,
    Users,
    Loader2,
} from "lucide-react";

const rupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));

const QUICK_AMOUNTS = [50000, 100000, 250000, 500000];

export default function TopUpLimit() {
    const { family, flash, recipient } = usePage().props;

    const [amount, setAmount] = useState("");
    const [processing, setProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [statusMsg, setStatusMsg] = useState("");

    // Cek status transaksi LANGSUNG ke backend kita (yang nanya ke API Midtrans),
    // bukan nunggu webhook - penting banget buat testing di localhost.
    const verifyAndRefresh = async (orderId, attempt = 1) => {
        try {
            const { data } = await axios.post(
                route("orang-tua.top-up.verify"),
                { order_id: orderId },
            );

            if (data.status === "completed") {
                setStatusMsg("Pembayaran berhasil! Saldo sudah ter-update.");
                router.reload({ only: ["family", "recipient"] });
                return;
            }

            if (data.status === "rejected") {
                setErrorMsg("Pembayaran gagal atau dibatalkan.");
                return;
            }

            // Masih pending di sisi Midtrans - coba lagi beberapa kali
            // (kadang butuh beberapa detik walau popup sudah bilang sukses).
            if (attempt < 5) {
                setTimeout(
                    () => verifyAndRefresh(orderId, attempt + 1),
                    1500,
                );
            } else {
                setStatusMsg(
                    "Pembayaran sedang diproses, silakan cek lagi sebentar.",
                );
            }
        } catch (err) {
            if (attempt < 5) {
                setTimeout(
                    () => verifyAndRefresh(orderId, attempt + 1),
                    1500,
                );
            }
        }
    };

    // Jalur BARU: ada recipient -> ini transfer internal dari saldo keluarga,
    // bukan pembayaran dari luar. Langsung panggil WalletController::allocate,
    // tanpa Midtrans sama sekali.
    const submitTransfer = (e) => {
        e.preventDefault();
        setErrorMsg("");
        setStatusMsg("");

        if (!amount || Number(amount) <= 0) {
            setErrorMsg("Masukkan nominal yang valid.");
            return;
        }

        setProcessing(true);

        router.post(
            route("wallet.allocate", recipient.id),
            { amount: Number(amount) },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setStatusMsg(
                        `Saldo berhasil ditransfer ke ${recipient.name}.`,
                    );
                    setAmount("");
                },
                onError: (errors) => {
                    setErrorMsg(
                        errors.amount ?? "Gagal mentransfer saldo.",
                    );
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    // Jalur LAMA: tanpa recipient -> ini isi saldo keluarga dari luar,
    // tetap lewat Midtrans seperti sebelumnya.
    const submitMidtrans = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setStatusMsg("");

        if (!amount || Number(amount) <= 0) {
            setErrorMsg("Masukkan nominal top-up yang valid.");
            return;
        }

        setProcessing(true);

        try {
            const { data } = await axios.post(
                route("orang-tua.top-up.store"),
                {
                    amount: Number(amount),
                    recipient_id: null,
                },
            );

            window.snap.pay(data.snap_token, {
                onSuccess: () => {
                    setStatusMsg("Memverifikasi pembayaran...");
                    setAmount("");
                    verifyAndRefresh(data.order_id);
                },
                onPending: () => {
                    setStatusMsg("Pembayaran sedang diproses...");
                    verifyAndRefresh(data.order_id);
                },
                onError: () => {
                    setErrorMsg("Pembayaran gagal. Silakan coba lagi.");
                },
                onClose: () => {
                    setErrorMsg(
                        "Kamu menutup popup pembayaran sebelum selesai.",
                    );
                },
            });
        } catch (err) {
            setErrorMsg(
                err.response?.data?.message ??
                    "Gagal memulai pembayaran. Coba lagi.",
            );
        } finally {
            setProcessing(false);
        }
    };

    const isTransfer = Boolean(recipient);
    const submit = isTransfer ? submitTransfer : submitMidtrans;
    const pageTitle = isTransfer ? "Isi Saldo Anggota" : "Top-up Saldo";

    return (
        <OrangTuaLayout
            title={pageTitle}
            subtitle={
                isTransfer
                    ? `Transfer dari saldo keluarga ke ${recipient.name}`
                    : "Isi ulang saldo keluarga secara terpusat"
            }
        >
            <Head title={pageTitle} />

            <div className="mx-auto w-full max-w-5xl space-y-5 sm:space-y-6">
                <FlashMessage type="success">
                    {flash?.success}
                </FlashMessage>

                <FlashMessage type="success">
                    {statusMsg}
                </FlashMessage>

                <FlashMessage type="error">
                    {errorMsg}
                </FlashMessage>

                <div className="grid gap-5 sm:gap-6 lg:grid-cols-2 lg:items-start">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.45,
                            ease: "easeOut",
                        }}
                    >
                        <Hero>
                            <p className="flex items-center gap-2 text-lg text-white/85">
                                <Wallet className="h-5 w-5" />
                                {recipient
                                    ? `Saldo ${recipient.name}`
                                    : "Saldo Keluarga"}
                            </p>

                            <p className="mt-1 break-words text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl">
                                {rupiah(
                                    recipient
                                        ? recipient.wallet_balance
                                        : family?.balance,
                                )}
                            </p>

                            <p className="mt-4 flex items-center gap-2 text-base text-white/85">
                                <Users className="h-5 w-5" />
                                {family?.name ?? "Keluarga"} ·{" "}
                                {family?.members_count ?? 0} anggota
                            </p>

                            {isTransfer && (
                                <p className="mt-4 border-t border-white/25 pt-4 text-base text-white/85">
                                    Sisa saldo keluarga:{" "}
                                    <span className="font-bold text-white">
                                        {rupiah(family?.balance)}
                                    </span>
                                </p>
                            )}
                        </Hero>
                    </motion.div>

                    <div
                        className={`bg-white p-6 ring-1 ring-slate-200 sm:p-8 ${SHAPE_CARD_ALT}`}
                    >
                        <h2 className="font-serif text-2xl text-slate-900 sm:text-3xl">
                            {isTransfer
                                ? "Transfer Saldo"
                                : "Isi Ulang Saldo"}
                        </h2>

                        <p className="mt-2 text-base text-slate-600">
                            {isTransfer
                                ? `Nominal ini langsung dipotong dari saldo keluarga dan masuk ke wallet ${recipient.name}. Tidak ada pembayaran dari luar.`
                                : "Masukkan nominal top-up. Kamu akan diarahkan ke halaman pembayaran (VA, e-wallet, atau QRIS)."}
                        </p>

                        <form
                            onSubmit={submit}
                            className="mt-6 space-y-5"
                        >
                            <div>
                                <label
                                    htmlFor="amount"
                                    className="mb-2 block text-base font-medium text-slate-800"
                                >
                                    Nominal
                                </label>

                                <CurrencyInput
                                    id="amount"
                                    value={amount}
                                    onChange={setAmount}
                                    placeholder="Contoh: 200.000"
                                    className="h-12 rounded-2xl border-slate-300 text-base"
                                />
                            </div>

                            <div
                                role="group"
                                aria-label="Nominal cepat"
                                className="flex flex-wrap gap-2"
                            >
                                {QUICK_AMOUNTS.map((amt) => (
                                    <button
                                        key={amt}
                                        type="button"
                                        onClick={() =>
                                            setAmount(String(amt))
                                        }
                                        className="cursor-pointer rounded-full border border-[var(--ayom-primary-line)] bg-[var(--ayom-primary-soft)] px-4 py-2 text-base font-semibold text-[var(--ayom-primary)] transition-colors duration-200 hover:bg-[var(--ayom-primary-line)]"
                                    >
                                        {rupiah(amt)}
                                    </button>
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={processing || !amount}
                                className={`${btnPrimary} h-14 w-full text-lg`}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        {isTransfer
                                            ? "Mentransfer..."
                                            : "Menyiapkan pembayaran..."}
                                    </>
                                ) : isTransfer ? (
                                    <>
                                        <ArrowRightLeft className="h-5 w-5" />
                                        Transfer ke {recipient.name}
                                    </>
                                ) : (
                                    <>
                                        <ArrowUpRight className="h-5 w-5" />
                                        Top-up Sekarang
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </OrangTuaLayout>
    );
}