// resources/js/Pages/Auth/Register.jsx

import { Head, Link, useForm } from "@inertiajs/react";

import GuestLayout, {
    Field,
    PasswordInput,
    SubmitButton,
    inputClass,
} from "@/Layouts/GuestLayout";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <GuestLayout
            title="Buat akun keluarga"
            subtitle="Anda mendaftar sebagai orang tua. Akun lansia dan remaja ditambahkan setelah Anda masuk."
        >
            <Head title="Daftar" />

            <form onSubmit={submit} className="space-y-5">
                <Field id="name" label="Nama lengkap" error={errors.name}>
                    <input
                        id="name"
                        name="name"
                        value={data.name}
                        className={inputClass(!!errors.name)}
                        placeholder="Contoh: Rina Wulandari"
                        autoComplete="name"
                        autoFocus
                        required
                        onChange={(e) => setData("name", e.target.value)}
                    />
                </Field>

                <Field id="email" label="Email" error={errors.email}>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className={inputClass(!!errors.email)}
                        placeholder="nama@email.com"
                        autoComplete="username"
                        required
                        onChange={(e) => setData("email", e.target.value)}
                    />
                </Field>

                <Field id="phone" label="Nomor HP" error={errors.phone}>
                    <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={data.phone}
                        className={inputClass(!!errors.phone)}
                        placeholder="Contoh: 081234567890"
                        autoComplete="tel"
                        inputMode="tel"
                        required
                        onChange={(e) => setData("phone", e.target.value)}
                    />
                </Field>

                <Field id="password" label="Kata sandi" error={errors.password}>
                    <PasswordInput
                        id="password"
                        name="password"
                        value={data.password}
                        error={errors.password}
                        placeholder="Minimal 8 karakter"
                        autoComplete="new-password"
                        required
                        onChange={(e) => setData("password", e.target.value)}
                    />
                </Field>

                <Field
                    id="password_confirmation"
                    label="Ulangi kata sandi"
                    error={errors.password_confirmation}
                >
                    <PasswordInput
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        error={errors.password_confirmation}
                        placeholder="Ketik ulang kata sandi"
                        autoComplete="new-password"
                        required
                        onChange={(e) =>
                            setData("password_confirmation", e.target.value)
                        }
                    />
                </Field>

                <SubmitButton disabled={processing}>
                    {processing ? "Memproses..." : "Buat akun"}
                </SubmitButton>
            </form>

            <p className="mt-8 text-center text-sm text-[var(--ayom-muted)]">
                Sudah punya akun?{" "}
                <Link
                    href={route("login")}
                    className="font-semibold text-[var(--ayom-primary)] hover:underline"
                >
                    Masuk
                </Link>
            </p>
        </GuestLayout>
    );
}
