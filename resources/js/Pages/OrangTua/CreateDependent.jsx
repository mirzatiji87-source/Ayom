import { useEffect, useState } from "react";
import { useForm, usePage, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import OrangTuaLayout from "@/Layouts/OrangTuaLayout";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { DatePicker } from "@/Components/ui/date-picker";
import CurrencyInput from "@/Components/ui/currency-input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { createPortal } from "react-dom";
import { CheckCircle2, X } from "lucide-react";

function Field({ label, error, children, hint }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[var(--ayom-ink)]">
                {label}
            </Label>
            {children}
            {hint && !error ? (
                <p className="text-xs text-[var(--ayom-muted)]">{hint}</p>
            ) : null}
            {error ? (
                <p className="text-xs text-[var(--ayom-danger)]">{error}</p>
            ) : null}
        </div>
    );
}

/** Modal sukses - muncul begitu akun berhasil dibuat, biar gak ada keraguan "udah kebuat belum ya". */
function SuccessModal({ name, onClose, onCreateAnother }) {
    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
        >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>

                <h2 className="mt-4 text-lg font-bold text-[var(--ayom-ink)]">
                    Akun dengan nama "{name}" sudah selesai kamu buat
                </h2>
                <p className="mt-1.5 text-sm text-[var(--ayom-muted)]">
                    Akun sudah aktif dan bisa langsung dipakai untuk login.
                </p>

                <div className="mt-6 flex flex-col gap-2">
                    <Button
                        onClick={onClose}
                        className="bg-[var(--ayom-primary)] hover:bg-[var(--ayom-primary-dark)]"
                    >
                        Selesai
                    </Button>
                    <Button variant="outline" onClick={onCreateAnother}>
                        Buat Akun Lain
                    </Button>
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

    // Kalau backend ngirim flash.success dan itu untuk pembuatan akun (bukan aksi lain),
    // tetap dijaga di sini sebagai fallback, tapi jalur utama pakai onSuccess di bawah.
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
        <div className="mx-auto max-w-2xl">
            {successName && (
                <SuccessModal
                    name={successName}
                    onClose={handleCloseSuccess}
                    onCreateAnother={handleCreateAnother}
                />
            )}

            <Card className="border-[var(--ayom-border)] shadow-none">
                <CardContent className="p-6">
                    <p className="text-sm text-[var(--ayom-muted)]">
                        Buat akun untuk anggota keluarga yang tidak bisa
                        mendaftar sendiri — orang tua kedua, lansia, atau
                        remaja. Wallet dengan limit default otomatis dibuat
                        untuk lansia dan remaja.
                    </p>

                    <form onSubmit={submit} className="mt-6 space-y-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field label="Nama Lengkap" error={errors.name}>
                                <Input
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    className="border-[var(--ayom-border)]"
                                />
                            </Field>
                            <Field label="Peran" error={errors.role}>
                                <Select
                                    value={data.role}
                                    onValueChange={(v) => setData("role", v)}
                                >
                                    <SelectTrigger className="border-[var(--ayom-border)]">
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

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field label="Email" error={errors.email}>
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    className="border-[var(--ayom-border)]"
                                />
                            </Field>
                            <Field
                                label="Nomor Telepon"
                                error={errors.phone}
                                hint="Opsional"
                            >
                                <Input
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData("phone", e.target.value)
                                    }
                                    className="border-[var(--ayom-border)]"
                                />
                            </Field>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field label="Kata Sandi" error={errors.password}>
                                <Input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    className="border-[var(--ayom-border)]"
                                />
                            </Field>
                            <Field
                                label="Konfirmasi Kata Sandi"
                                error={errors.password_confirmation}
                            >
                                <Input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value,
                                        )
                                    }
                                    className="border-[var(--ayom-border)]"
                                />
                            </Field>
                        </div>

                        {isAdmin && (
                            <Field
                                label="Keluarga"
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
                                    <SelectTrigger className="border-[var(--ayom-border)]">
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
                                className="sm:w-56"
                            />
                        </Field>

                        {data.role !== "orang_tua" && (
                            <div className="rounded-lg border border-[var(--ayom-border)] bg-black/[0.015] p-4">
                                <p className="text-sm font-medium text-[var(--ayom-ink)]">
                                    Pengaturan Wallet Awal
                                </p>
                                <p className="mt-0.5 text-xs text-[var(--ayom-muted)]">
                                    Kosongkan untuk memakai nilai default (limit
                                    harian Rp 50.000, bulanan Rp 1.000.000,
                                    ambang approval Rp 100.000).
                                </p>
                                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <Field
                                        label="Limit Harian"
                                        error={errors.daily_limit}
                                    >
                                        <CurrencyInput
                                            value={data.daily_limit}
                                            onChange={(v) =>
                                                setData("daily_limit", v)
                                            }
                                            className="border-[var(--ayom-border)]"
                                        />
                                    </Field>
                                    <Field
                                        label="Limit Bulanan"
                                        error={errors.monthly_limit}
                                    >
                                        <CurrencyInput
                                            value={data.monthly_limit}
                                            onChange={(v) =>
                                                setData("monthly_limit", v)
                                            }
                                            className="border-[var(--ayom-border)]"
                                        />
                                    </Field>
                                    <Field
                                        label="Ambang Approval"
                                        error={errors.approval_threshold}
                                    >
                                        <CurrencyInput
                                            value={data.approval_threshold}
                                            onChange={(v) =>
                                                setData("approval_threshold", v)
                                            }
                                            className="border-[var(--ayom-border)]"
                                        />
                                    </Field>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-[var(--ayom-primary)] hover:bg-[var(--ayom-primary-dark)]"
                            >
                                {processing ? "Menyimpan…" : "Buat Akun"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
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
