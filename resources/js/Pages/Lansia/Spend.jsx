// resources/js/Pages/Lansia/Spend.jsx
import { useEffect, useRef } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import {
    AlertCircle,
    Bus,
    CheckCircle2,
    Clock3,
    HeartPulse,
    Loader2,
    Package,
    Shirt,
    ShoppingBag,
    ShoppingBasket,
    UtensilsCrossed,
} from "lucide-react";

import LansiaLayout from "@/Layouts/LansiaLayout";
import CurrencyInput from "@/Components/ui/currency-input";
import QrisScanButton from "@/Components/QrisScanButton";

const rupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));

// Kategori belanja lansia: sengaja sedikit dan jelas, ikon besar.
const CATEGORIES = [
    { value: "makanan", label: "Makanan", icon: UtensilsCrossed },
    { value: "pakaian", label: "Pakaian", icon: Shirt },
    { value: "belanja", label: "Belanja harian", icon: ShoppingBasket },
    { value: "kesehatan", label: "Kesehatan", icon: HeartPulse },
    { value: "transportasi", label: "Transportasi", icon: Bus },
    { value: "lainnya", label: "Lainnya", icon: Package },
];

const TONE = {
    red: {
        cls: "bg-rose-50 text-rose-900 ring-rose-300",
        icon: AlertCircle,
    },
    amber: {
        cls: "bg-amber-50 text-amber-900 ring-amber-300",
        icon: Clock3,
    },
    green: {
        cls: "bg-emerald-50 text-emerald-900 ring-emerald-300",
        icon: CheckCircle2,
    },
};

const inputCls =
    "h-16 w-full rounded-2xl border border-slate-300 bg-white px-4 text-xl placeholder:text-slate-500 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200";

export default function Spend({ wallet, pendingExpenses = [], prefill = {} }) {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        amount: prefill.amount ?? "",
        category: prefill.category ?? "makanan",
        description: prefill.description ?? "",
    });

    // Perintah suara "buka QRIS": gulung ke tombol Scan QRIS dan sorot.
    const qrisRef = useRef(null);

    useEffect(() => {
        if (prefill.qris) {
            qrisRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [prefill.qris]);

    const amount = Number(data.amount || 0);
    const balance = Number(wallet?.balance ?? 0);
    const threshold = Number(wallet?.approval_threshold ?? 0);
    const dailyLimit = Number(wallet?.daily_limit ?? 0);
    const monthlyLimit = Number(wallet?.monthly_limit ?? 0);

    const sisaHarian =
        dailyLimit > 0
            ? Math.max(0, dailyLimit - Number(wallet?.daily_spent ?? 0))
            : null;

    const sisaBulanan =
        monthlyLimit > 0
            ? Math.max(0, monthlyLimit - Number(wallet?.monthly_spent ?? 0))
            : null;

    let status = null;

    if (amount > 0) {
        if (amount > balance) {
            status = {
                tone: "red",
                blocked: true,
                text: "Saldo Anda tidak cukup untuk belanja ini.",
            };
        } else if (sisaHarian !== null && amount > sisaHarian) {
            status = {
                tone: "red",
                blocked: true,
                text: `Melebihi sisa batas harian Anda (${rupiah(sisaHarian)}).`,
            };
        } else if (sisaBulanan !== null && amount > sisaBulanan) {
            status = {
                tone: "red",
                blocked: true,
                text: `Melebihi sisa batas bulanan Anda (${rupiah(sisaBulanan)}).`,
            };
        } else if (amount > threshold) {
            status = {
                tone: "amber",
                blocked: false,
                text: `Nominal ini di atas ${rupiah(threshold)}. Belanja Anda menunggu persetujuan keluarga dulu, saldo belum terpotong.`,
            };
        } else {
            status = {
                tone: "green",
                blocked: false,
                text: "Langsung tercatat dan saldo terpotong.",
            };
        }
    }

    const butuhApproval = status?.tone === "amber";

    // QRIS: isi nama toko dan nominal ke form belanja.
    function handleQris({ merchant, amount }) {
        setData((prev) => ({
            ...prev,
            description: merchant,
            amount: amount ? String(amount) : prev.amount,
        }));
    }

    function submit(e) {
        e.preventDefault();

        post(route("transactions.store"), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    }

    return (
        <LansiaLayout>
            <Head title="Belanja" />

            <div className="mx-auto w-full max-w-3xl space-y-5 sm:space-y-6">
                {/* NOTIFIKASI SUKSES */}
                {flash?.success && (
                    <div
                        role="status"
                        className="flex items-start gap-3 rounded-3xl bg-emerald-100 px-5 py-4 text-lg font-semibold text-emerald-900 ring-1 ring-emerald-300"
                    >
                        <CheckCircle2 className="mt-0.5 h-7 w-7 shrink-0" />
                        <span className="min-w-0 break-words">
                            {flash.success}
                        </span>
                    </div>
                )}

                {/* SALDO */}
                <section className="relative overflow-hidden rounded-bl-3xl rounded-br-[3.5rem] rounded-tl-[3.5rem] rounded-tr-3xl bg-emerald-800 px-6 py-8 text-white sm:px-10">
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

                    <div className="relative">
                        <p className="text-lg text-emerald-200">Saldo Anda</p>

                        <p className="break-words text-5xl font-extrabold tracking-tight">
                            {rupiah(balance)}
                        </p>

                        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3">
                            <div>
                                <dt className="text-base text-emerald-200">
                                    Boleh dipakai hari ini
                                </dt>
                                <dd className="text-xl font-bold">
                                    {sisaHarian === null
                                        ? "Tanpa batas"
                                        : rupiah(sisaHarian)}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-base text-emerald-200">
                                    Perlu izin keluarga jika di atas
                                </dt>
                                <dd className="text-xl font-bold">
                                    {rupiah(threshold)}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </section>

                {/* FORM BELANJA */}
                {!wallet ? (
                    <section className="rounded-3xl bg-emerald-50 px-6 py-10 text-center text-xl text-slate-600">
                        Dompet Anda belum diatur. Hubungi keluarga Anda untuk
                        mengaturnya.
                    </section>
                ) : (
                    <form
                        onSubmit={submit}
                        className="space-y-7 rounded-bl-3xl rounded-br-3xl rounded-tl-3xl rounded-tr-[3rem] bg-white p-5 ring-1 ring-emerald-900/15 sm:p-8"
                    >
                        <h1 className="font-heading text-3xl text-slate-900 sm:text-4xl">
                            Catat belanja
                        </h1>

                        {/* SCAN QRIS */}
                        <div
                            ref={qrisRef}
                            className={
                                prefill.qris
                                    ? "rounded-3xl ring-4 ring-amber-400 ring-offset-4"
                                    : ""
                            }
                        >
                            <QrisScanButton onResult={handleQris} />
                        </div>

                        {/* NOMINAL */}
                        <div className="space-y-2">
                            <label
                                htmlFor="amount"
                                className="text-lg font-semibold text-slate-800"
                            >
                                Berapa harganya?
                            </label>

                            <CurrencyInput
                                id="amount"
                                value={data.amount}
                                onChange={(v) => setData("amount", v)}
                                placeholder="25.000"
                                className="h-16 rounded-2xl border-slate-300 pl-12 text-xl"
                            />

                            {errors.amount && (
                                <p
                                    role="alert"
                                    className="text-base font-medium text-rose-700"
                                >
                                    {errors.amount}
                                </p>
                            )}
                        </div>

                        {/* KATEGORI */}
                        <fieldset className="space-y-2">
                            <legend className="text-lg font-semibold text-slate-800">
                                Beli untuk apa?
                            </legend>

                            <div className="grid grid-cols-2 gap-3">
                                {CATEGORIES.map((cat) => {
                                    const Icon = cat.icon;
                                    const active = data.category === cat.value;

                                    return (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            aria-pressed={active}
                                            onClick={() =>
                                                setData("category", cat.value)
                                            }
                                            className={`flex min-h-[4.5rem] cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-left text-lg font-semibold leading-tight ring-1 transition-colors duration-200 active:scale-[0.98] ${
                                                active
                                                    ? "bg-emerald-800 text-white ring-emerald-800"
                                                    : "bg-white text-slate-700 ring-slate-300 hover:ring-emerald-700"
                                            }`}
                                        >
                                            <Icon className="h-7 w-7 shrink-0" />
                                            {cat.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {errors.category && (
                                <p
                                    role="alert"
                                    className="text-base font-medium text-rose-700"
                                >
                                    {errors.category}
                                </p>
                            )}
                        </fieldset>

                        {/* NAMA BARANG / TOKO */}
                        <div className="space-y-2">
                            <label
                                htmlFor="description"
                                className="text-lg font-semibold text-slate-800"
                            >
                                Beli apa?{" "}
                                <span className="font-normal text-slate-600">
                                    (boleh dikosongkan)
                                </span>
                            </label>

                            <input
                                id="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                                maxLength={255}
                                placeholder="Contoh: Baju batik di pasar"
                                className={inputCls}
                            />

                            {errors.description && (
                                <p
                                    role="alert"
                                    className="text-base font-medium text-rose-700"
                                >
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* INFORMASI SALDO DAN APPROVAL */}
                        {status && (
                            <div
                                role="status"
                                className={`flex items-start gap-3 rounded-2xl px-4 py-4 text-lg font-medium ring-1 ${TONE[status.tone].cls}`}
                            >
                                {(() => {
                                    const ToneIcon = TONE[status.tone].icon;

                                    return (
                                        <ToneIcon className="mt-0.5 h-6 w-6 shrink-0" />
                                    );
                                })()}

                                <span className="min-w-0 break-words">
                                    {status.text}
                                </span>
                            </div>
                        )}

                        {/* TOMBOL */}
                        <div>
                            <button
                                type="submit"
                                disabled={
                                    processing || amount <= 0 || status?.blocked
                                }
                                className="inline-flex h-16 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-800 px-7 text-xl font-bold text-white transition-colors duration-200 hover:bg-emerald-700 active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag className="h-6 w-6" />
                                        {butuhApproval
                                            ? "Ajukan ke keluarga"
                                            : "Catat belanja"}
                                    </>
                                )}
                            </button>

                            <p className="mt-3 text-center text-base text-slate-600">
                                Ini mencatat belanja Anda di Ayom, bukan
                                membayar ke toko.
                            </p>
                        </div>
                    </form>
                )}

                {/* MENUNGGU PERSETUJUAN */}
                {pendingExpenses.length > 0 && (
                    <section className="rounded-bl-3xl rounded-br-3xl rounded-tl-3xl rounded-tr-[3rem] bg-amber-50 px-5 py-6 ring-1 ring-amber-200 sm:px-8">
                        <h2 className="font-heading text-2xl text-slate-900 sm:text-3xl">
                            Menunggu persetujuan
                        </h2>

                        <ul className="mt-2">
                            {pendingExpenses.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex items-center justify-between gap-3 border-b border-amber-900/10 py-4 last:border-b-0"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-xl font-semibold text-slate-800">
                                            {item.description ||
                                                CATEGORIES.find(
                                                    (c) =>
                                                        c.value ===
                                                        item.category,
                                                )?.label ||
                                                item.category}
                                        </p>

                                        <p className="text-base text-slate-600">
                                            {new Date(
                                                item.created_at,
                                            ).toLocaleString("id-ID")}
                                        </p>
                                    </div>

                                    <span className="shrink-0 text-xl font-bold tabular-nums text-amber-900">
                                        {rupiah(item.amount)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </LansiaLayout>
    );
}
