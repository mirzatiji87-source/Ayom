// resources/js/Layouts/LansiaLayout.jsx
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { AnimatePresence, motion } from "framer-motion";
import {
    LogOut,
    Home,
    ReceiptText,
    History,
    ChevronDown,
    Menu,
    X,
} from "lucide-react";
import { AyomMark } from "@/Layouts/AdminLayout";
import { useRoleTheme } from "@/lib/ayom-theme";

const NAV_ITEMS = [
    { label: "Beranda", routeName: "lansia.dashboard", icon: Home },
    {
        label: "Tagihan Saya",
        routeName: "lansia.bills.index",
        icon: ReceiptText,
    },
    { label: "Riwayat", routeName: "transactions.index", icon: History },
];

function isActiveRoute(name) {
    try {
        return route().current(name) || route().current(`${name}.*`);
    } catch {
        return false;
    }
}

function getInitials(name = "") {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Menu profil desktop: avatar → dropdown berisi info singkat + tombol keluar */
function ProfileMenu({ user }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        function handleEscape(e) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    const name = user?.name ?? "Pengguna";

    return (
        <div className="relative hidden lg:block" ref={menuRef}>
            <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={open}
                aria-label="Buka menu profil"
                className={`flex items-center gap-2 rounded-full border-2 py-1.5 pl-1.5 pr-3 transition-all duration-200 ${
                    open
                        ? "border-emerald-300 bg-emerald-50 shadow-sm"
                        : "border-emerald-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/60"
                }`}
            >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-inner">
                    {getInitials(name)}
                </span>
                <span className="max-w-[8rem] truncate text-base font-semibold text-slate-800">
                    {name.split(" ")[0]}
                </span>
                <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </motion.button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                        }}
                        className="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-64 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-xl shadow-emerald-900/10"
                    >
                        <div className="flex items-center gap-3 border-b border-emerald-50 bg-emerald-50/60 px-4 py-4">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-base font-bold text-white">
                                {getInitials(name)}
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-base font-bold text-slate-900">
                                    {name}
                                </p>
                                {user?.email && (
                                    <p className="truncate text-sm text-slate-500">
                                        {user.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="p-2">
                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-semibold text-rose-600 transition-colors duration-150 hover:bg-rose-50"
                            >
                                <LogOut className="h-5 w-5" />
                                Keluar
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/** Menu hamburger untuk HP: tombol di header → drawer slide-in dari kanan
 *  berisi navigasi + profil + tombol keluar. */
function MobileMenu({ user }) {
    const [open, setOpen] = useState(false);
    const name = user?.name ?? "Pengguna";

    // Kunci scroll body saat drawer terbuka, tutup otomatis dengan tombol Escape
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        function handleEscape(e) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.body.style.overflow = "";
            document.removeEventListener("keydown", handleEscape);
        };
    }, [open]);

    return (
        <div className="lg:hidden">
            <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setOpen(true)}
                aria-haspopup="true"
                aria-expanded={open}
                aria-label="Buka menu"
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-emerald-100 bg-white text-emerald-700 shadow-sm transition-colors duration-200 hover:border-emerald-200 hover:bg-emerald-50/60"
            >
                <Menu className="h-6 w-6" />
            </motion.button>

            {createPortal(
                <AnimatePresence>
                    {open && (
                        <>
                            {/* Overlay gelap */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => setOpen(false)}
                                className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px]"
                            />

                            {/* Drawer */}
                            <motion.div
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{
                                    type: "spring",
                                    stiffness: 320,
                                    damping: 34,
                                }}
                                className="fixed inset-y-0 right-0 z-50 flex w-[85%] max-w-sm flex-col bg-white shadow-2xl"
                            >
                                {/* Header drawer: profil + tombol tutup */}
                                <div className="flex items-center gap-3 border-b border-emerald-100 bg-emerald-50/60 px-5 pb-5 pt-[calc(env(safe-area-inset-top)+1.25rem)]">
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-base font-bold text-white shadow-inner">
                                        {getInitials(name)}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-lg font-bold text-slate-900">
                                            {name}
                                        </p>
                                        {user?.email && (
                                            <p className="truncate text-sm text-slate-500">
                                                {user.email}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setOpen(false)}
                                        aria-label="Tutup menu"
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors duration-150 hover:bg-white hover:text-slate-700"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Daftar navigasi */}
                                <nav className="flex-1 overflow-y-auto px-3 py-4">
                                    {NAV_ITEMS.map((item) => {
                                        const Icon = item.icon;
                                        const active = isActiveRoute(
                                            item.routeName,
                                        );
                                        return (
                                            <Link
                                                key={item.routeName}
                                                href={route(item.routeName)}
                                                onClick={() => setOpen(false)}
                                                className={`mb-1.5 flex items-center gap-3 rounded-2xl px-4 py-3.5 text-lg font-semibold transition-colors duration-150 ${
                                                    active
                                                        ? "bg-emerald-600 text-white shadow-sm shadow-emerald-300"
                                                        : "text-slate-700 hover:bg-emerald-50"
                                                }`}
                                            >
                                                <Icon className="h-6 w-6" />
                                                {item.label}
                                            </Link>
                                        );
                                    })}
                                </nav>

                                {/* Tombol keluar */}
                                <div className="border-t border-emerald-100 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
                                    <Link
                                        href={route("logout")}
                                        method="post"
                                        as="button"
                                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-lg font-semibold text-rose-600 transition-colors duration-150 hover:bg-rose-50"
                                    >
                                        <LogOut className="h-6 w-6" />
                                        Keluar
                                    </Link>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body,
            )}
        </div>
    );
}

export default function LansiaLayout({ children, user }) {
    useRoleTheme("lansia");

    // Ambil data user dari prop, atau fallback ke shared props Inertia (auth.user)
    const page = usePage();
    const resolvedUser = user ?? page?.props?.auth?.user ?? null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-white text-slate-900">
            {/* ===== Header ===== */}
            <header className="sticky top-0 z-20 border-b border-emerald-100/80 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-xl items-center justify-between px-5 py-4 lg:max-w-6xl lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <AyomMark
                            size={48}
                            className="rounded-2xl shadow-md shadow-emerald-200"
                        />
                        <span className="text-2xl font-extrabold tracking-tight text-slate-900 lg:text-3xl">
                            Ayom
                        </span>
                    </motion.div>

                    {/* Nav horizontal — pill dengan indikator aktif yang meluncur (layoutId), desktop saja */}
                    <nav className="hidden items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50/60 p-1 lg:flex">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const active = isActiveRoute(item.routeName);
                            return (
                                <Link
                                    key={item.routeName}
                                    href={route(item.routeName)}
                                    className="relative flex items-center gap-2 rounded-full px-4 py-2.5 text-base font-semibold"
                                >
                                    {active && (
                                        <motion.span
                                            layoutId="nav-pill"
                                            transition={{
                                                type: "spring",
                                                stiffness: 350,
                                                damping: 30,
                                            }}
                                            className="absolute inset-0 rounded-full bg-emerald-600 shadow-sm shadow-emerald-300"
                                        />
                                    )}
                                    <span
                                        className={`relative z-10 flex items-center gap-2 transition-colors duration-200 ${
                                            active
                                                ? "text-white"
                                                : "text-emerald-800 hover:text-emerald-900"
                                        }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Profil desktop (dropdown) & hamburger mobile (drawer) */}
                    <div className="flex items-center gap-2">
                        <ProfileMenu user={resolvedUser} />
                        <MobileMenu user={resolvedUser} />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-xl px-4 py-6 lg:max-w-6xl lg:px-8">
                {children}
            </main>
        </div>
    );
}
