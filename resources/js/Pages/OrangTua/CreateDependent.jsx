
// resources/js/Pages/OrangTua/CreateDependent.jsx

import { useEffect, useState } from "react";
import { useForm, usePage, router } from "@inertiajs/react";
import { createPortal } from "react-dom";
import { CheckCircle2 } from "lucide-react";

import AdminLayout from "@/Layouts/AdminLayout";
import OrangTuaLayout from "@/Layouts/OrangTuaLayout";
import { Input } from "@/Components/ui/input";
import { DatePicker } from "@/Components/ui/date-picker";
import CurrencyInput from "@/Components/ui/currency-input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    Field,
    SHAPE_CARD,
    SHAPE_CARD_ALT,
    btnOutline,
    btnPrimary,
    inputCls,
    currencyInputCls,
} from "@/Components/OrangTua/ui";

function SuccessModal({ name, onClose, onCreateAnother }) {
    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-title"
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
        >
            <div className="w-full max-w-md rounded-bl-3xl rounded-br-3xl rounded-tl-3xl rounded-tr-[3rem] bg-white p-6 text-center shadow-xl sm:p-8">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="h-9 w-9 text-emerald-700" />
                </span>

                <h2
                    id="success-title"
                    className="mt-5 font-serif text-2xl leading-snug text-slate-900"
                >
                    Akun dengan nama "{name}" sudah selesai kamu buat
                </h2>

                <p className="mt-2 text-base text-slate-600">
                    Akun sudah aktif dan bisa langsung dipakai untuk login.
                </p>

                <div className="mt-6 flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className={`${btnPrimary} w-full`}
                    >
                        Selesai
                    </button>

                    <button
                        type="button"
                        onClick={onCreateAnother}
                        className={`${btnOutline} w-full`}
                    >
                        Buat Akun Lain
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}

export default function CreateDependent({ families = [] }) {
    const { auth, flash } = usePage().props;
    const isAdmin = auth.user.role === "admin";

    const [successName, setSuccessName] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "remaja",
        phone: "",
        date_of_birth: "",
        family_id: "",
        daily_limit: "",
        monthly_limit: "",
        approval_threshold: "",
    });

    // Kalau backend ngirim flash.success dan itu untuk pembuatan akun
    // (bukan aksi lain), tetap dijaga di sini sebagai fallback,
    // tapi jalur utama pakai onSuccess di bawah.
    useEffect(() => {
        if (flash?.success && flash?.createdName) {
            setSuccessName(flash.createdName);
        }
    }, [flash]);

    function submit(e) {
        e.preventDefault();

        const submittedName = data.name;

        post(route("dependents.store"), {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessName(submittedName);
            },
        });
    }

    function handleCloseSuccess() {
        setSuccessName(null);
        router.visit(route("dashboard"));
    }

    function handleCreateAnother() {
        setSuccessName(null);
        reset();
    }

    return (
        <div className="mx-auto w-full max-w-3xl">
            {successName && (
                <SuccessModal
                    name={successName}
                    onClose={handleCloseSuccess}
                    onCreateAnother={handleCreateAnother}
                />
            )}

            <div
                className={`bg-white p-6 ring-1 ring-slate-200 sm:p-8 ${SHAPE_CARD}`}
            >
                <p className="text-base leading-relaxed text-slate-600">
                    Buat akun untuk anggota keluarga yang tidak bisa mendaftar
                    sendiri — orang tua kedua, lansia, atau remaja. Wallet
                    dengan limit default otomatis dibuat untuk lansia dan
                    remaja.
                </p>

                <form onSubmit={submit} className="mt-8 space-y-6">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <Field
                            label="Nama Lengkap"
                            htmlFor="name"
                            error={errors.name}
                        >
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                className={inputCls}
                            />
                        </Field>

                        <Field
                            label="Peran"
                            htmlFor="role"
                            error={errors.role}
                        >
                            <Select
                                value={data.role}
                                onValueChange={(v) => setData("role", v)}
                            >
                                <SelectTrigger
                                    id="role"
                                    className={inputCls}
                                >
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="orang_tua">
                                        Orang Tua
                                    </SelectItem>
                                    <SelectItem value="remaja">
                                        Remaja
                                    </SelectItem>
                                    <SelectItem value="lansia">
                                        Lansia
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <Field
                            label="Email"
                            htmlFor="email"
                            error={errors.email}
                        >
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                className={inputCls}
                            />
                        </Field>

                        <Field
                            label="Nomor Telepon"
                            htmlFor="phone"
                            error={errors.phone}
                            hint="Opsional"
                        >
                            <Input
                                id="phone"
                                type="tel"
                                value={data.phone}
                                onChange={(e) =>
                                    setData("phone", e.target.value)
                                }
                                className={inputCls}
                            />
                        </Field>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <Field
                            label="Kata Sandi"
                            htmlFor="password"
                            error={errors.password}
                        >
                            <Input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                className={inputCls}
                            />
                        </Field>

                        <Field
                            label="Konfirmasi Kata Sandi"
                            htmlFor="password_confirmation"
                            error={errors.password_confirmation}
                        >
                            <Input
                                id="password_confirmation"
                                type="password"
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        "password_confirmation",
                                        e.target.value,
                                    )
                                }
                                className={inputCls}
                            />
                        </Field>
                    </div>

                    {isAdmin && (
                        <Field
                            label="Keluarga"
                            htmlFor="family_id"
                            error={errors.family_id}
                            hint="Admin memilih keluarga tujuan akun ini"
                        >
                            <Select
                                value={
                                    data.family_id
                                        ? String(data.family_id)
                                        : ""
                                }
                                onValueChange={(v) =>
                                    setData("family_id", v)
                                }
                            >
                                <SelectTrigger
                                    id="family_id"
                                    className={inputCls}
                                >
                                    <SelectValue placeholder="Pilih keluarga…" />
                                </SelectTrigger>

                                <SelectContent>
                                    {families.map((f) => (
                                        <SelectItem
                                            key={f.id}
                                            value={String(f.id)}
                                        >
                                            {f.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                    )}

                    <Field
                        label="Tanggal Lahir"
                        error={errors.date_of_birth}
                        hint="Opsional — pilih dari kalender"
                    >
                        <DatePicker
                            value={data.date_of_birth}
                            onChange={(val) =>
                                setData("date_of_birth", val)
                            }
                            className="sm:w-64"
                        />
                    </Field>

                    {data.role !== "orang_tua" && (
                        <div
                            className={`bg-slate-50 p-5 ring-1 ring-slate-200 sm:p-6 ${SHAPE_CARD_ALT}`}
                        >
                            <p className="font-serif text-xl text-slate-900">
                                Pengaturan Wallet Awal
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                                Kosongkan untuk memakai nilai default (limit
                                harian Rp 50.000, bulanan Rp 1.000.000, ambang
                                approval Rp 100.000).
                            </p>

                            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                                <Field
                                    label="Limit Harian"
                                    htmlFor="daily_limit"
                                    error={errors.daily_limit}
                                >
                                    <CurrencyInput
                                        id="daily_limit"
                                        value={data.daily_limit}
                                        onChange={(v) =>
                                            setData("daily_limit", v)
                                        }
                                        className={currencyInputCls}
                                    />
                                </Field>

                                <Field
                                    label="Limit Bulanan"
                                    htmlFor="monthly_limit"
                                    error={errors.monthly_limit}
                                >
                                    <CurrencyInput
                                        id="monthly_limit"
                                        value={data.monthly_limit}
                                        onChange={(v) =>
                                            setData("monthly_limit", v)
                                        }
                                        className={currencyInputCls}
                                    />
                                </Field>

                                <Field
                                    label="Ambang Approval"
                                    htmlFor="approval_threshold"
                                    error={errors.approval_threshold}
                                >
                                    <CurrencyInput
                                        id="approval_threshold"
                                        value={data.approval_threshold}
                                        onChange={(v) =>
                                            setData("approval_threshold", v)
                                        }
                                        className={currencyInputCls}
                                    />
                                </Field>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className={`${btnPrimary} w-full sm:w-auto`}
                        >
                            {processing ? "Menyimpan…" : "Buat Akun"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

CreateDependent.layout = (page) => {
    const isAdmin = page.props.auth.user.role === "admin";
    const Layout = isAdmin ? AdminLayout : OrangTuaLayout;

    return (
        <Layout
            title="Buat Akun Dependent"
            subtitle="Tambah akun lansia atau remaja"
        >
            {page}
        </Layout>
    );
};

