import BottomNav from "@/Components/OrangTua/BottomNav";
import RouteLoadingBar from "@/Components/RouteLoadingBar";
import PageTransition from "@/Components/PageTransition";
import { useEffect, useState } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import axios from "axios";
import { Button } from "@/Components/ui/button";
import { Sheet, SheetContent } from "@/Components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import { themeVars, initials, useRoleTheme } from "@/lib/ayom-theme";
import { AyomMark } from "@/Layouts/AdminLayout";
import RolePill from "@/Components/Admin/RolePill";
import {
    LayoutDashboard,
    Eye,
    ShieldCheck,
    Wallet,
    UserPlus,
    Menu,
    ChevronDown,
    LogOut,
    Settings,
    ListChecks,
} from "lucide-react";

const NAV_ITEMS = [
    {
        label: "Dashboard",
        routeName: "orang-tua.dashboard",
        icon: LayoutDashboard,
    },
    { label: "Guardian View", routeName: "orang-tua.guardian-view", icon: Eye },
    {
        label: "Approval Center",
        routeName: "orang-tua.approval-center",
        icon: ShieldCheck,
        notifKey: "approval",
    },
    {
        label: "Misi",
        routeName: "orang-tua.tasks.index",
        icon: ListChecks,
        notifKey: "tasks",
    },
    { label: "Top-up Saldo", routeName: "orang-tua.top-up.form", icon: Wallet },
    {
        label: "Buat Akun Dependent",
        routeName: "dependents.create",
        icon: UserPlus,
    },
];

const NOTIF_POLL_INTERVAL = 15000;

function isActiveRoute(name) {
    try {
        return route().current(name) || route().current(`${name}.*`);
    } catch {
        return false;
    }
}

function usePendingApprovalCount() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let active = true;

        async function fetchCount() {
            try {
                const { data } = await axios.get(
                    route("orang-tua.approval-center.pending-count"),
                );
                if (active) setCount(data.count ?? 0);
            } catch {
                // Diamkan saja jika ada galat koneksi
            }
        }

        fetchCount();
        const interval = setInterval(fetchCount, NOTIF_POLL_INTERVAL);

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, []);

    return count;
}

function NavBadge({ count }) {
    if (!count || count <= 0) return null;

    return (
        <span className="relative z-10 ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white shadow-sm">
            {count > 9 ? "9+" : count}
        </span>
    );
}

function SidebarBody({ onNavigate }) {
    const pendingApprovalCount = usePendingApprovalCount();
    const { pendingTasks = 0 } = usePage().props;

    const badgeCounts = {
        approval: pendingApprovalCount,
        tasks: pendingTasks,
    };

    return (
        <div className="flex h-full flex-col py-5">
            <div className="flex items-center gap-2.5 px-4 pb-6">
                <AyomMark size={40} />
                <div className="leading-tight">
                    <p className="text-[15px] font-semibold text-[var(--ayom-ink)]">
                        Ayom
                    </p>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-600">
                        Orang Tua
                    </p>
                </div>
            </div>

            <nav className="relative flex flex-1 flex-col gap-1 px-3">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = isActiveRoute(item.routeName);
                    const badgeCount = item.notifKey
                        ? badgeCounts[item.notifKey]
                        : 0;

                    return (
                        <Link
                            key={item.routeName}
                            href={route(item.routeName)}
                            onClick={onNavigate}
                            className="relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
                        >
                            {active && (
                                <motion.span
                                    layoutId="ortu-nav-pill"
                                    transition={{
                                        type: "spring",
                                        stiffness: 380,
                                        damping: 32,
                                    }}
                                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 shadow-sm shadow-emerald-300/50"
                                />
                            )}
                            <Icon
                                className={`relative z-10 h-4.5 w-4.5 shrink-0 ${
                                    active
                                        ? "text-white"
                                        : "text-[var(--ayom-muted)]"
                                }`}
                            />
                            <span
                                className={`relative z-10 ${
                                    active
                                        ? "text-white"
                                        : "text-[var(--ayom-muted)] group-hover:text-[var(--ayom-ink)]"
                                }`}
                            >
                                {item.label}
                            </span>
                            {badgeCount > 0 && <NavBadge count={badgeCount} />}
                        </Link>
                    );
                })}
            </nav>

            <div className="mx-3 mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5">
                <p className="text-xs font-semibold text-emerald-800">
                    Butuh bantuan?
                </p>
                <p className="mt-1 text-xs leading-relaxed text-emerald-700/80">
                    Pantau limit &amp; setujui transaksi keluarga kapan saja
                    dari sini.
                </p>
            </div>
        </div>
    );
}

function ProfileMenu() {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger
                className={`flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 transition-colors ${
                    open ? "bg-emerald-50" : "hover:bg-black/[0.04]"
                }`}
            >
                <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-semibold text-white">
                        {initials(user?.name)}
                    </AvatarFallback>
                </Avatar>

                <span className="hidden text-sm font-medium sm:inline">
                    {user?.name}
                </span>

                <ChevronDown
                    className={`hidden h-3.5 w-3.5 text-[var(--ayom-muted)] transition-transform sm:inline ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="flex items-center gap-3 py-2 font-normal">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-semibold text-white">
                            {initials(user?.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold leading-none text-[var(--ayom-ink)]">
                            {user?.name}
                        </span>
                        <span className="text-xs text-[var(--ayom-muted)]">
                            {user?.email}
                        </span>
                        <RolePill role={user?.role} className="mt-1 w-fit" />
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer gap-2">
                    <Settings className="h-4 w-4" />
                    Pengaturan Akun
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => router.post(route("logout"))}
                    className="cursor-pointer gap-2 text-[var(--ayom-danger)] focus:text-[var(--ayom-danger)]"
                >
                    <LogOut className="h-4 w-4" />
                    Keluar
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default function OrangTuaLayout({ children, title, subtitle }) {
    useRoleTheme("orang-tua");

    useEffect(() => {
        // Reset residual body lock yang ditinggalkan Midtrans Snap setelah popup ditutup
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, 0);
    }, []);

    return (
        <div
            style={themeVars}
            className="min-h-screen bg-[var(--ayom-bg)] text-[var(--ayom-ink)]"
        >
            <RouteLoadingBar />
            <Head title={title ?? "Orang Tua"} />

            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-72 overflow-hidden"
            >
                <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />
                <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-teal-200/25 blur-3xl" />
            </div>

            <div className="mx-auto flex min-h-screen max-w-[1400px]">
                <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-[var(--ayom-border)] bg-[var(--ayom-surface)] lg:block">
                    <SidebarBody />
                </aside>

                <div className="flex min-h-screen flex-1 flex-col">
                    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-[var(--ayom-border)] bg-[var(--ayom-surface)] px-5 py-3.5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div>
                                <h1 className="text-[17px] font-semibold leading-tight text-[var(--ayom-ink)]">
                                    {title}
                                </h1>
                                {subtitle ? (
                                    <p className="text-sm text-[var(--ayom-muted)]">
                                        {subtitle}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <ProfileMenu />
                    </header>

                    <main className="flex-1 px-5 py-6 pb-20 lg:pb-6">
                        <PageTransition>{children}</PageTransition>
                    </main>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
