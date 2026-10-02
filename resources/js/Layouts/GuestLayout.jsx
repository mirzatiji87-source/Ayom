// resources/js/Layouts/GuestLayout.jsx

import { useState } from "react";
import { Link } from "@inertiajs/react";
import { ArrowLeft, Eye, EyeOff, GraduationCap, ShieldCheck } from "lucide-react";
import "@fontsource-variable/plus-jakarta-sans";

import { themeVars } from "@/lib/ayom-theme";

const FONT =
    '"Plus Jakarta Sans Variable", "Noto Sans Variable", system-ui, sans-serif';

const PILLARS = [
    { icon: ShieldCheck, text: "Lansia dilindungi" },
    { icon: Eye, text: "Orang tua mengawasi" },
    { icon: GraduationCap, text: "Remaja diedukasi" },
];

/* ---------- Komponen form yang dipakai Login & Register ---------- */

export const inputClass = (hasError) =>
    `block w-full rounded-2xl border bg-white px-4 py-3 text-sm text-[var(--ayom-ink)] placeholder:text-[var(--ayom-muted)]/60 transition focus:outline-none focus:ring-4 ${
        hasError
            ? "border-[var(--ayom-danger)] focus:ring-[var(--ayom-danger)]/10"
            : "border-[var(--ayom-border)] focus:border-[var(--ayom-primary)] focus:ring-[var(--ayom-primary)]/10"
    }`;

export function Field({ id, label, error, hint, children }) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-1.5 block text-sm font-medium text-[var(--ayom-ink)]"
            >
                {label}
            </label>

            {children}

            {error ? (
                <p role="alert" className="mt-1.5 text-xs text-[var(--ayom-danger)]">
                    {error}
                </p>
            ) : hint ? (
                <p className="mt-1.5 text-xs text-[var(--ayom-muted)]">{hint}</p>
            ) : null}
        </div>
    );
}

export function PasswordInput({ id, error, ...props }) {
    const [show, setShow] = useState(false);

    return (
        <div className="relative">
            <input
                id={id}
                type={show ? "text" : "password"}
                className={`${inputClass(!!error)} pr-12`}
                {...props}
            />
            <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[var(--ayom-muted)] transition hover:bg-black/[0.04] hover:text-[var(--ayom-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ayom-primary)]"
            >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
        </div>
    );
}

export function SubmitButton({ children, ...props }) {
    return (
        <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-full bg-[var(--ayom-primary)] px-6 py-3.5 text-sm font-semibold text-[var(--ayom-primary-foreground)] shadow-[0_14px_30px_-14px_rgba(14,79,74,0.8)] transition hover:bg-[var(--ayom-primary-dark)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ayom-primary)]"
            {...props}
        >
            {children}
        </button>
    );
}

/* ---------- Layout ---------- */

export default function GuestLayout({ children, title, subtitle }) {
    return (
        <div
            style={{ ...themeVars, fontFamily: FONT }}
            className="grid min-h-screen bg-[var(--ayom-bg)] text-[var(--ayom-ink)] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
        >
            {/* PANEL KIRI (desktop) */}
            <aside className="relative hidden overflow-hidden bg-[var(--ayom-primary)] p-12 text-[var(--ayom-primary-foreground)] lg:flex lg:flex-col lg:justify-between">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,0.14),transparent_55%)]"
                />
                <img
                    src="/images/logoAyom.png"
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute -bottom-16 -right-16 h-96 w-96 object-contain opacity-[0.07]"
                />

                <Link href="/" className="relative flex items-center gap-3">
                    <img
                        src="/images/logoAyom.png"
                        alt=""
                        className="h-11 w-11 object-contain"
                    />
                    <span className="text-lg font-semibold">Ayom</span>
                </Link>

                <div className="relative max-w-md">
                    <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
                        Eyang belanja sendiri, Anda tetap tenang.
                    </h2>

                    <ul className="mt-8 space-y-3">
                        {PILLARS.map(({ icon: Icon, text }) => (
                            <li key={text} className="flex items-center gap-3 text-sm">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10">
                                    <Icon className="h-4 w-4" />
                                </span>
                                {text}
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="relative text-xs text-white/50">
                    © {new Date().getFullYear()} Ayom. Ekosistem finansial keluarga
                    lintas generasi.
                </p>
            </aside>

            {/* PANEL KANAN */}
            <main className="flex flex-col px-6 py-8 sm:px-12">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 lg:hidden">
                        <img
                            src="/images/logoAyom.png"
                            alt=""
                            className="h-10 w-10 object-contain"
                        />
                        <span className="text-base font-semibold">Ayom</span>
                    </Link>

                    <Link
                        href="/"
                        className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-[var(--ayom-muted)] transition hover:bg-black/[0.04] hover:text-[var(--ayom-ink)]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Beranda
                    </Link>
                </div>

                <div className="flex flex-1 items-center justify-center py-10">
                    <div className="w-full max-w-sm">
                        {title ? (
                            <h1 className="text-3xl font-extrabold tracking-tight">
                                {title}
                            </h1>
                        ) : null}
                        {subtitle ? (
                            <p className="mt-2 text-sm leading-relaxed text-[var(--ayom-muted)]">
                                {subtitle}
                            </p>
                        ) : null}

                        <div className={title ? "mt-8" : ""}>{children}</div>
                    </div>
                </div>
            </main>
        </div>
    );
}