import { useEffect, useRef, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { AnimatePresence, motion } from "framer-motion";
import {
    LogOut,
    Home,
    ListChecks,
    History,
    ChevronDown,
    ShoppingBag,
} from "lucide-react";

import PageTransition from "@/Components/PageTransition";
import { AyomMark } from "@/Layouts/AdminLayout";
import { useRoleTheme } from "@/lib/ayom-theme";

const NAV_ITEMS = [
    {
        label: "Dashboard",
        routeName: "remaja.dashboard",
        icon: Home,
    },
    {
        label: "Jajan",
        routeName: "remaja.spend",
        icon: ShoppingBag,
    },
    {
        label: "Misi Saya",
        routeName: "remaja.tasks.index",
        icon: ListChecks,
    },
    {
        label: "Riwayat",
        routeName: "transactions.index",
        icon: History,
    },
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

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return (
        parts[0][0] + parts[parts.length - 1][0]
    ).toUpperCase();
}

/* ---------- Menu profil ---------- */

function ProfileMenu({ user }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        }

        function handleEscape(e) {
            if (e.key === "Escape") {
                setOpen(false);
            }
        }

        document.addEventListener(
            "mousedown",
            handleClickOutside,
        );

        document.addEventListener(
            "keydown",
            handleEscape,
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside,
            );

            document.removeEventListener(
                "keydown",
                handleEscape,
            );
        };
    }, []);

    const name = user?.name ?? "Pengguna";

    return (
        <div className="relative" ref={menuRef}>
            <motion.button
                type="button"
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

                <span className="hidden max-w-[8rem] truncate text-sm font-semibold text-slate-800 sm:inline">
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
                        initial={{
                            opacity: 0,
                            y: -6,
                            scale: 0.97,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: -6,
                            scale: 0.97,
                        }}
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
                                onClick={() => setOpen(false)}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-rose-600 transition-colors duration-150 hover:bg-rose-50"
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

/* ---------- Navigasi bawah HP ---------- */

function BottomNav() {
    return (
        <nav
            aria-label="Navigasi utama"
            className="fixed inset-x-0 bottom-0 z-30 border-t border-emerald-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
            style={{
                boxShadow: "0 -4px 16px rgba(15, 23, 42, 0.06)",
            }}
        >
            <div className="grid grid-cols-4">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = isActiveRoute(item.routeName);

                    return (
                        <Link
                            key={item.routeName}
                            href={route(item.routeName)}
                            aria-current={
                                active ? "page" : undefined
                            }
                            className="relative flex cursor-pointer flex-col items-center justify-center gap-1 py-2.5 transition-transform duration-150 active:scale-90"
                        >
                            {active && (
                                <motion.span
                                    layoutId="remaja-bottom-active"
                                    transition={{
                                        type: "spring",
                                        stiffness: 420,
                                        damping: 30,
                                    }}
                                    className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-emerald-700"
                                />
                            )}

                            <Icon
                                className={`h-5 w-5 transition-colors duration-150 ${
                                    active
                                        ? "text-emerald-800"
                                        : "text-slate-500"
                                }`}
                                strokeWidth={active ? 2.4 : 2}
                            />

                            <span
                                className={`text-xs font-medium transition-colors duration-150 ${
                                    active
                                        ? "text-emerald-800"
                                        : "text-slate-500"
                                }`}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

/* ---------- Layout utama remaja ---------- */

export default function RemajaLayout({ children }) {
    useRoleTheme("remaja");

    const page = usePage();
    const user = page?.props?.auth?.user ?? null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-white text-slate-900">
            {/* HEADER */}
            <header className="sticky top-0 z-20 border-b border-emerald-100/80 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-xl items-center justify-between px-5 py-4 lg:max-w-6xl lg:px-8">
                    <motion.div
                        initial={{
                            opacity: 0,
                            x: -12,
                        }}
                        animate={{
                            opacity: 1,
                            x: 0,
                        }}
                        className="flex items-center gap-3"
                    >
                        <AyomMark
                            size={44}
                            className="rounded-2xl shadow-md shadow-emerald-200"
                        />

                        <span className="text-xl font-extrabold tracking-tight text-slate-900 lg:text-2xl">
                            Ayom
                        </span>
                    </motion.div>

                    {/* NAVIGASI DESKTOP */}
                    <nav className="hidden items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50/60 p-1 md:flex">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const active = isActiveRoute(
                                item.routeName,
                            );

                            return (
                                <Link
                                    key={item.routeName}
                                    href={route(item.routeName)}
                                    aria-current={
                                        active ? "page" : undefined
                                    }
                                    className="relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                                >
                                    {active && (
                                        <motion.span
                                            layoutId="remaja-nav-pill"
                                            transition={{
                                                type: "spring",
                                                stiffness: 350,
                                                damping: 30,
                                            }}
                                            className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 shadow-sm shadow-emerald-300"
                                        />
                                    )}

                                    <span
                                        className={`relative z-10 flex items-center gap-2 transition-colors duration-200 ${
                                            active
                                                ? "text-white"
                                                : "text-emerald-800 hover:text-emerald-900"
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* PROFIL: TERSEDIA DI DESKTOP DAN HP */}
                    <div className="flex items-center gap-2">
                        <ProfileMenu user={user} />
                    </div>
                </div>
            </header>

            {/* KONTEN HALAMAN */}
            <main className="mx-auto max-w-xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] pt-6 md:pb-8 lg:max-w-6xl lg:px-8">
                <PageTransition>
                    {children}
                </PageTransition>
            </main>

            {/* NAVIGASI BAWAH HP */}
            <BottomNav />
        </div>
    );
}