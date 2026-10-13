import { Head, useForm, usePage } from "@inertiajs/react";
import {
    AlertCircle,
    Bus,
    CheckCircle2,
    Clapperboard,
    Clock3,
    GraduationCap,
    HeartPulse,
    Loader2,
    Package,
    ShoppingBag,
    UtensilsCrossed,
} from "lucide-react";

import RemajaLayout from "@/Layouts/RemajaLayout";
import CurrencyInput from "@/Components/ui/currency-input";
import QrisScanButton from "@/Components/QrisScanButton";

const rupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));

const CATEGORIES = [
    { value: "makanan", label: "Makanan", icon: UtensilsCrossed },
    { value: "transportasi", label: "Transportasi", icon: Bus },
    { value: "hiburan", label: "Hiburan", icon: Clapperboard },
    { value: "pendidikan", label: "Pendidikan", icon: GraduationCap },
    { value: "kesehatan", label: "Kesehatan", icon: HeartPulse },
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
    "h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-lg placeholder:text-slate-500 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200";

export default function Spend({ wallet, pendingExpenses = [] }) {
    const { flash } = usePage().props;

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        amount: "",
        category: "makanan",
        description: "",
    });

    const amount = Number(data.amount || 0);
    const balance = Number(wallet?.balance ?? 0);
    const threshold = Number(wallet?.approval_threshold ?? 0);
    const dailyLimit = Number(wallet?.daily_limit ?? 0);
    const monthlyLimit = Number(wallet?.monthly_limit ?? 0);

    const sisaHarian =
        dailyLimit > 0
            ? Math.max(
                  0,
                  dailyLimit - Number(wallet?.daily_spent ?? 0),
              )
            : null;

    const sisaBulanan =
        monthlyLimit > 0
            ? Math.max(
                  0,
                  monthlyLimit - Number(wallet?.monthly_spent ?? 0),
              )
            : null;

    let status = null;

    if (amount > 0) {
        if (amount > balance) {
            status = {
                tone: "red",
                blocked: true,
                text: "Saldo kamu tidak cukup untuk jajan ini.",
            };
        } else if (
            sisaHarian !== null &&
            amount > sisaHarian
        ) {
            status = {
                tone: "red",
                blocked: true,
                text: `Melebihi sisa limit harian kamu (${rupiah(sisaHarian)}).`,
            };
        } else if (
            sisaBulanan !== null &&
            amount > sisaBulanan
        ) {
            status = {
                tone: "red",
                blocked: true,
                text: `Melebihi sisa limit bulanan kamu (${rupiah(sisaBulanan)}).`,
            };
        } else if (amount > threshold) {
            status = {
                tone: "amber",
                blocked: false,
                text: `Nominal ini di atas ${rupiah(threshold)}. Jajanmu menunggu persetujuan orang tua dulu, saldo belum terpotong.`,
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

    // QRIS: isi nama merchant dan nominal ke form jajan.
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
        <RemajaLayout>
            <Head title="Jajan" />

            <div className="mx-auto w-full max-w-3xl space-y-5 sm:space-y-6">
                {/* NOTIFIKASI SUKSES */}
                {flash?.success && (
                    <div
                        role="status"
                        className="flex items-start gap-3 rounded-3xl bg-emerald-100 px-5 py-4 text-base font-semibold text-emerald-900 ring-1 ring-emerald-300"
                    >
                        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" />

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
                        <p className="text-lg text-emerald-200">
                            Saldo saku kamu
                        </p>

                        <p className="break-words text-5xl font-extrabold tracking-tight">
                            {rupiah(balance)}
                        </p>

                        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3">
                            <div>
                                <dt className="text-sm text-emerald-200">
                                    Sisa limit harian
                                </dt>

                                <dd className="text-lg font-bold">
                                    {sisaHarian === null
                                        ? "Tanpa limit"
                                        : rupiah(sisaHarian)}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm text-emerald-200">
                                    Perlu izin orang tua jika di atas
                                </dt>

                                <dd className="text-lg font-bold">
                                    {rupiah(threshold)}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </section>

                {/* FORM JAJAN */}
                {!wallet ? (
                    <section className="rounded-3xl bg-emerald-50 px-6 py-10 text-center text-lg text-slate-600">
                        Dompetmu belum diatur. Minta orang tua untuk
                        mengaturnya dulu.
                    </section>
                ) : (
                    <form
                        onSubmit={submit}
                        className="space-y-6 rounded-bl-3xl rounded-br-3xl rounded-tl-3xl rounded-tr-[3rem] bg-white p-5 ring-1 ring-emerald-900/15 sm:p-8"
                    >
                        <h2 className="font-heading text-2xl text-slate-900 sm:text-3xl">
                            Catat jajan
                        </h2>

                        {/* SCAN QRIS */}
                        <QrisScanButton onResult={handleQris} />

                        {/* NOMINAL */}
                        <div className="space-y-2">
                            <label
                                htmlFor="amount"
                                className="text-base font-semibold text-slate-800"
                            >
                                Nominal
                            </label>

                            <CurrencyInput
                                id="amount"
                                value={data.amount}
                                onChange={(v) =>
                                    setData("amount", v)
                                }
                                placeholder="15.000"
                                className="h-14 rounded-2xl border-slate-300 pl-12 text-lg"
                            />

                            {errors.amount && (
                                <p
                                    role="alert"
                                    className="text-sm font-medium text-rose-700"
                                >
                                    {errors.amount}
                                </p>
                            )}
                        </div>

                        {/* KATEGORI */}
                        <fieldset className="space-y-2">
                            <legend className="text-base font-semibold text-slate-800">
                                Kategori
                            </legend>

                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {CATEGORIES.map((cat) => {
                                    const Icon = cat.icon;
                                    const active =
                                        data.category === cat.value;

                                    return (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            aria-pressed={active}
                                            onClick={() =>
                                                setData(
                                                    "category",
                                                    cat.value,
                                                )
                                            }
                                            className={`flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-base font-semibold ring-1 transition-colors duration-200 ${
                                                active
                                                    ? "bg-emerald-800 text-white ring-emerald-800"
                                                    : "bg-white text-slate-700 ring-slate-300 hover:ring-emerald-700"
                                            }`}
                                        >
                                            <Icon className="h-5 w-5 shrink-0" />
                                            {cat.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {errors.category && (
                                <p
                                    role="alert"
                                    className="text-sm font-medium text-rose-700"
                                >
                                    {errors.category}
                                </p>
                            )}
                        </fieldset>

                        {/* NAMA BARANG / MERCHANT */}
                        <div className="space-y-2">
                            <label
                                htmlFor="description"
                                className="text-base font-semibold text-slate-800"
                            >
                                Beli apa?{" "}
                                <span className="font-normal text-slate-600">
                                    (opsional)
                                </span>
                            </label>

                            <input
                                id="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData(
                                        "description",
                                        e.target.value,
                                    )
                                }
                                maxLength={255}
                                placeholder="Contoh: Bakso di kantin"
                                className={inputCls}
                            />

                            {errors.description && (
                                <p
                                    role="alert"
                                    className="text-sm font-medium text-rose-700"
                                >
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* INFORMASI SALDO DAN APPROVAL */}
                        {status && (
                            <div
                                role="status"
                                className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-base font-medium ring-1 ${TONE[status.tone].cls}`}
                            >
                                {(() => {
                                    const ToneIcon =
                                        TONE[status.tone].icon;

                                    return (
                                        <ToneIcon className="mt-0.5 h-5 w-5 shrink-0" />
                                    );
                                })()}

                                <span className="min-w-0 break-words">
                                    {status.text}
                                </span>
                            </div>
                        )}

                        {/* TOMBOL CATAT JAJAN */}
                        <div>
                            <button
                                type="submit"
                                disabled={
                                    processing ||
                                    amount <= 0 ||
                                    status?.blocked
                                }
                                className="inline-flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-800 px-7 text-lg font-bold text-white transition-colors duration-200 hover:bg-emerald-700 active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag className="h-5 w-5" />
                                        {butuhApproval
                                            ? "Ajukan ke orang tua"
                                            : "Catat jajan"}
                                    </>
                                )}
                            </button>

                            <p className="mt-3 text-center text-sm text-slate-600">
                                Ini mencatat jajanmu di Ayom, bukan
                                membayar ke toko.
                            </p>
                        </div>
                    </form>
                )}

                {/* MENUNGGU PERSETUJUAN */}
                {pendingExpenses.length > 0 && (
                    <section className="rounded-bl-3xl rounded-br-3xl rounded-tl-3xl rounded-tr-[3rem] bg-amber-50 px-5 py-6 ring-1 ring-amber-200 sm:px-8">
                        <h2 className="font-heading text-2xl text-slate-900">
                            Menunggu persetujuan
                        </h2>

                        <ul className="mt-2">
                            {pendingExpenses.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex items-center justify-between gap-3 border-b border-amber-900/10 py-3 last:border-b-0"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-lg font-semibold text-slate-800">
                                            {item.description ||
                                                CATEGORIES.find(
                                                    (c) =>
                                                        c.value ===
                                                        item.category,
                                                )?.label ||
                                                item.category}
                                        </p>

                                        <p className="text-sm text-slate-600">
                                            {new Date(
                                                item.created_at,
                                            ).toLocaleString("id-ID")}
                                        </p>
                                    </div>

                                    <span className="shrink-0 text-lg font-bold tabular-nums text-amber-900">
                                        {rupiah(item.amount)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </RemajaLayout>
    );
}