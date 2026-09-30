// resources/js/Pages/OrangTua/TopUpLimit.jsx

import { useState } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import axios from "axios";

import OrangTuaLayout from "@/Layouts/OrangTuaLayout";
import { Card, CardContent } from "@/Components/ui/card";
import CurrencyInput from "@/Components/ui/currency-input";
import { Wallet, ArrowUpRight, ArrowRightLeft, Users, Loader2 } from "lucide-react";

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
                router.reload({ only: ['family', 'recipient'] });
                return;
            }

            if (data.status === "rejected") {
                setErrorMsg("Pembayaran gagal atau dibatalkan.");
                return;
            }

            // Masih pending di sisi Midtrans - coba lagi beberapa kali (kadang butuh
            // beberapa detik walau popup sudah bilang sukses).
            if (attempt < 5) {
                setTimeout(() => verifyAndRefresh(orderId, attempt + 1), 1500);
            } else {
                setStatusMsg(
                    "Pembayaran sedang diproses, silakan cek lagi sebentar.",
                );
            }
        } catch (err) {
            if (attempt < 5) {
                setTimeout(() => verifyAndRefresh(orderId, attempt + 1), 1500);
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
            const { data } = await axios.post(route("orang-tua.top-up.store"), {
                amount: Number(amount),
                recipient_id: null,
            });

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

    return (
        <OrangTuaLayout
            title={isTransfer ? "Isi Saldo Anggota" : "Top-up Saldo"}
            subtitle={
                isTransfer
                    ? `Transfer dari saldo keluarga ke ${recipient.name}`
                    : "Isi ulang saldo keluarga secara terpusat"
            }
        >
            <Head title={isTransfer ? "Isi Saldo Anggota" : "Top-up Saldo"} />

            <div className="mx-auto max-w-xl space-y-6">
                {flash?.success && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                        {flash.success}
                    </div>
                )}

                {statusMsg && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                        {statusMsg}
                    </div>
                )}

                {errorMsg && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                        {errorMsg}
                    </div>
                )}

                <motion.section
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--ayom-primary)] via-[var(--ayom-primary)] to-[var(--ayom-primary-dark)] p-6 text-white shadow-xl shadow-slate-200/50 sm:p-8"
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10"
                    />

                    <div className="relative z-10">
                        <p className="flex items-center gap-1.5 text-sm font-medium text-white/80">
                            <Wallet className="h-4 w-4" />
                            {recipient
                                ? `Saldo ${recipient.name}`
                                : "Saldo Keluarga"}
                        </p>

                        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                            {rupiah(
                                recipient
                                    ? recipient.wallet_balance
                                    : family?.balance,
                            )}
                        </h1>

                        <p className="mt-3 flex items-center gap-1.5 text-sm text-white/80">
                            <Users className="h-4 w-4" />
                            {family?.name ?? "Keluarga"} ·{" "}
                            {family?.members_count ?? 0} anggota
                        </p>

                        {isTransfer && (
                            <p className="mt-3 border-t border-white/20 pt-3 text-sm text-white/80">
                                Sisa saldo keluarga:{" "}
                                <span className="font-bold text-white">
                                    {rupiah(family?.balance)}
                                </span>
                            </p>
                        )}
                    </div>
                </motion.section>

                <Card className="rounded-3xl border-slate-200 shadow-sm">
                    <CardContent className="p-6">
                        <h2 className="text-lg font-bold text-slate-900">
                            {isTransfer ? "Transfer Saldo" : "Isi Ulang Saldo"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {isTransfer
                                ? `Nominal ini langsung dipotong dari saldo keluarga dan masuk ke wallet ${recipient.name}. Tidak ada pembayaran dari luar.`
                                : "Masukkan nominal top-up. Kamu akan diarahkan ke halaman pembayaran (VA, e-wallet, atau QRIS)."}
                        </p>

                        <form onSubmit={submit} className="mt-5 space-y-4">
                            <div>
                                <label
                                    htmlFor="amount"
                                    className="mb-1.5 block text-sm font-medium text-slate-700"
                                >
                                    Nominal
                                </label>
                                <CurrencyInput
                                    id="amount"
                                    value={amount}
                                    onChange={setAmount}
                                    placeholder="Contoh: 200.000"
                                    className="border-slate-200"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {QUICK_AMOUNTS.map((amt) => (
                                    <button
                                        key={amt}
                                        type="button"
                                        onClick={() => setAmount(String(amt))}
                                        className="rounded-full border border-[var(--ayom-primary)]/20 bg-[var(--ayom-primary)]/10 px-3.5 py-1.5 text-xs font-semibold text-[var(--ayom-primary)] transition hover:bg-[var(--ayom-primary)]/15"
                                    >
                                        {rupiah(amt)}
                                    </button>
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={processing || !amount}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--ayom-primary)] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--ayom-primary-dark)] active:scale-[0.98] disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {isTransfer
                                            ? "Mentransfer..."
                                            : "Menyiapkan pembayaran..."}
                                    </>
                                ) : isTransfer ? (
                                    <>
                                        <ArrowRightLeft className="h-4 w-4" />
                                        Transfer ke {recipient.name}
                                    </>
                                ) : (
                                    <>
                                        <ArrowUpRight className="h-4 w-4" />
                                        Top-up Sekarang
                                    </>
                                )}
                            </button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </OrangTuaLayout>
    );
}