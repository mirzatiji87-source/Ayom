// resources/js/Pages/Auth/Login.jsx

import { Head, Link, useForm } from "@inertiajs/react";

import GuestLayout, {
    Field,
    PasswordInput,
    SubmitButton,
    inputClass,
} from "@/Layouts/GuestLayout";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout
            title="Selamat datang kembali"
            subtitle="Masuk untuk mengelola keuangan keluarga Anda."
        >
            <Head title="Masuk" />

            {status && (
                <div className="mb-5 rounded-2xl bg-[var(--ayom-primary-soft)] px-4 py-3 text-sm font-medium text-[var(--ayom-primary-dark)]">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <Field id="email" label="Email" error={errors.email}>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className={inputClass(!!errors.email)}
                        placeholder="nama@email.com"
                        autoComplete="username"
                        autoFocus
                        required
                        onChange={(e) => setData("email", e.target.value)}
                    />
                </Field>

                <Field id="password" label="Kata sandi" error={errors.password}>
                    <PasswordInput
                        id="password"
                        name="password"
                        value={data.password}
                        error={errors.password}
                        placeholder="Masukkan kata sandi"
                        autoComplete="current-password"
                        required
                        onChange={(e) => setData("password", e.target.value)}
                    />
                </Field>

                <div className="flex items-center justify-between gap-4">
                    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--ayom-muted)]">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData("remember", e.target.checked)}
                            className="h-4 w-4 rounded border-[var(--ayom-border)] accent-[var(--ayom-primary)]"
                        />
                        Ingat saya
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route("password.request")}
                            className="text-sm font-medium text-[var(--ayom-primary)] hover:underline"
                        >
                            Lupa kata sandi?
                        </Link>
                    )}
                </div>

                <SubmitButton disabled={processing}>
                    {processing ? "Memproses..." : "Masuk"}
                </SubmitButton>
            </form>

            <p className="mt-8 text-center text-sm text-[var(--ayom-muted)]">
                Belum punya akun?{" "}
                <Link
                    href={route("register")}
                    className="font-semibold text-[var(--ayom-primary)] hover:underline"
                >
                    Daftar gratis
                </Link>
            </p>
        </GuestLayout>
    );
}