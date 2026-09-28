/**
 * Ayom — shared design tokens.
 *
 * Kenapa file ini ada: supaya AdminLayout, OrangTuaLayout, dan semua halaman
 * yang menampilkan role/uang punya satu sumber warna & format yang sama.
 * Dipakai lewat inline CSS variables (lihat `themeVars`) supaya tidak perlu
 * mengubah tailwind.config — cukup `style={themeVars}` di elemen pembungkus,
 * lalu pakai className seperti `bg-[var(--ayom-primary)]`.
 */

import { useLayoutEffect } from "react";

export const themeVars = {
    "--ayom-bg": "#F5F7F6",
    "--ayom-surface": "#FFFFFF",
    "--ayom-ink": "#10231F",
    "--ayom-muted": "#5B6E68",
    "--ayom-border": "#E1E7E4",
    "--ayom-primary": "#0E4F4A",
    "--ayom-primary-dark": "#0A3B37",
    "--ayom-primary-foreground": "#F3FBF9",
    "--ayom-accent": "#C77A2B",
    "--ayom-accent-soft": "#FBEEDD",
    "--ayom-danger": "#B3261E",
    "--ayom-danger-soft": "#FBEAE8",
};

// Metadata visual per role — dipakai di RolePill, chart distribusi, dsb.
export const ROLE_META = {
    admin: {
        label: "Admin",
        dot: "#0E4F4A",
        text: "#0E4F4A",
        bg: "#E4F0EE",
    },
    orang_tua: {
        label: "Orang Tua",
        dot: "#0248ab",
        text: "#012e6d",
        bg: "#e0e8f5",
    },
    lansia: {
        label: "Lansia",
        dot: "#bd7702",
        text: "#694301",
        bg: "#f5ebd9",
    },
    remaja: {
        label: "Remaja",
        dot: "#02bf3b",
        text: "#01571b",
        bg: "#d9f5e2",
    },
};

export function roleMeta(role) {
    return (
        ROLE_META[role] ?? {
            label: role ?? "—",
            dot: "#5B6E68",
            text: "#5B6E68",
            bg: "#EEF1F0",
        }
    );
}

// Pasang tema per peran di <html> supaya dialog/popup
// (yang dirender di luar layout) ikut berwarna sama.
export function useRoleTheme(theme) {
    useLayoutEffect(() => {
        const el = document.documentElement;
        const prev = el.dataset.theme;

        el.dataset.theme = theme;

        return () => {
            if (prev) {
                el.dataset.theme = prev;
            } else {
                delete el.dataset.theme;
            }
        };
    }, [theme]);
}

export function formatRupiah(value) {
    const n = Number(value ?? 0);

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(n);
}

export function formatDate(value, opts = {}) {
    if (!value) return "—";

    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        ...opts,
    }).format(new Date(value));
}

export function formatDateTime(value) {
    if (!value) return "—";

    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

export function initials(name = "") {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");
}