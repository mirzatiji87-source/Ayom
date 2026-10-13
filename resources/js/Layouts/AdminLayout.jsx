import { useEffect, useState } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import {
    ChevronDown,
    ClipboardList,
    LayoutDashboard,
    UserPlus,
    Users,
} from "lucide-react";
import { Separator } from "@/Components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuGroup,
} from "@/Components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import { themeVars, initials } from "@/lib/ayom-theme";
import RolePill from "@/Components/Admin/RolePill";

/**
 * Logo Ayom. Di-export karena dipakai juga oleh LansiaLayout & RemajaLayout.
 */
export function AyomMark({ size = 40, className = "" }) {
    return (
        <img
            src="/images/logoAyom.png"
            alt="Ayom"
            width={size}
            height={size}
            className={`shrink-0 object-contain ${className}`}
        />
    );
}

// label = teks di sidebar desktop, short = teks di bottom nav HP
const NAV_ITEMS = [
    {
        label: "Dashboard",
        short: "Dashboard",
        routeName: "admin.dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Kelola Keluarga",
        short: "Keluarga",
        routeName: "admin.families.index",
        icon: Users,
    },
    {
        label: "Laporan Status",
        short: "Laporan",
        routeName: "admin.status-reports.index",
        icon: ClipboardList,
        badgeKey: "pendingStatusReportsCount",
    },
    {
        label: "Buat Akun Dependent",
        short: "Buat Akun",
        routeName: "dependents.create",
        icon: UserPlus,
    },
];

function isActiveRoute(name) {
    try {
        return route().current(name) || route().current(`${name}.*`);
    } catch {
        return false;
    }
}

function usePendingCount() {
    const { pendingStatusReportsCount = 0 } = usePage().props;
    return Math.max(0, Number(pendingStatusReportsCount) || 0);
}

/* ---------- Sidebar (desktop) ---------- */

function SidebarNav() {
    const pendingCount = usePendingCount();

    return (
        <nav className="flex flex-1 flex-col gap-1 px-3">
            {NAV_ITEMS.map((item) => {
                const active = isActiveRoute(item.routeName);
                const Icon = item.icon;

                return (
                    <Link
                        key={item.routeName}
                        href={route(item.routeName)}
                        aria-current={active ? "page" : undefined}
                        className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            active
                                ? "bg-[var(--ayom-primary)] text-[var(--ayom-primary-foreground)]"
                                : "text-[var(--ayom-muted)] hover:bg-black/[0.04] hover:text-[var(--ayom-ink)]"
                        }`}
                    >
                        <Icon
                            className="h-[18px] w-[18px] shrink-0"
                            strokeWidth={1.8}
                        />

                        <span className="min-w-0 flex-1">{item.label}</span>

                        {item.badgeKey && pendingCount > 0 && (
                            <span
                                title={`${pendingCount} laporan menunggu verifikasi`}
                                aria-label={`${pendingCount} laporan menunggu verifikasi`}
                                className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 text-[11px] font-bold leading-none text-white shadow-sm"
                            >
                                {pendingCount > 99 ? "99+" : pendingCount}
                            </span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}

function SidebarBody() {
    return (
        <div className="flex h-full flex-col py-5">
            <div className="flex items-center gap-2.5 px-4 pb-6">
                <AyomMark size={40} />
                <div className="leading-tight">
                    <p className="text-[15px] font-semibold text-[var(--ayom-ink)]">
                        Ayom
                    </p>
                    <p className="text-[11px] uppercase tracking-wide text-[var(--ayom-muted)]">
                        Panel Admin
                    </p>
                </div>
            </div>
            <SidebarNav />
            <div className="mt-auto px-4 pt-4">
                <Separator className="mb-4 bg-[var(--ayom-border)]" />
                <p className="text-[11px] leading-relaxed text-[var(--ayom-muted)]">
                    Semua tindakan admin dicatat di log aktivitas keluarga.
                </p>
            </div>
        </div>
    );
}

/* ---------- Navigasi bawah (HP & tablet) ---------- */

function BottomNav() {
    const pendingCount = usePendingCount();

    return (
        <nav
            aria-label="Navigasi utama"
            className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--ayom-border)] bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
            style={{ boxShadow: "0 -4px 16px rgba(15, 23, 42, 0.06)" }}
        >
            <div className="mx-auto grid max-w-xl grid-cols-4">
                {NAV_ITEMS.map((item) => {
                    const active = isActiveRoute(item.routeName);
                    const Icon = item.icon;
                    const showBadge = item.badgeKey && pendingCount > 0;

                    return (
                        <Link
                            key={item.routeName}
                            href={route(item.routeName)}
                            aria-current={active ? "page" : undefined}
                            className="relative flex min-h-[3.75rem] cursor-pointer flex-col items-center justify-center gap-1 py-2 transition-transform duration-150 active:scale-95"
                        >
                            {active && (
                                <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-[var(--ayom-primary)]" />
                            )}

                            <span className="relative">
                                <Icon
                                    className={`h-6 w-6 ${
                                        active
                                            ? "text-[var(--ayom-primary)]"
                                            : "text-[var(--ayom-muted)]"
                                    }`}
                                    strokeWidth={active ? 2.3 : 1.9}
                                />
                                {showBadge && (
                                    <span
                                        aria-label={`${pendingCount} laporan menunggu verifikasi`}
                                        className="absolute -right-2.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold leading-none text-white"
                                    >
                                        {pendingCount > 99
                                            ? "99+"
                                            : pendingCount}
                                    </span>
                                )}
                            </span>

                            <span
                                className={`text-xs font-medium ${
                                    active
                                        ? "text-[var(--ayom-primary)]"
                                        : "text-[var(--ayom-muted)]"
                                }`}
                            >
                                {item.short}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

/* ---------- Banner flash ---------- */

function FlashBanner() {
    const { flash } = usePage().props;
    const [dismissed, setDismissed] = useState({});

    const messages = [
        flash?.success
            ? { key: "success", tone: "success", text: flash.success }
            : null,
        flash?.error
            ? { key: "error", tone: "error", text: flash.error }
            : null,
    ].filter(Boolean);

    useEffect(() => {
        setDismissed({});
    }, [flash?.success, flash?.error]);

    if (messages.length === 0) return null;

    return (
        <div className="mb-5 flex flex-col gap-2">
            {messages
                .filter((m) => !dismissed[m.key])
                .map((m) => (
                    <div
                        key={m.key}
                        role={m.tone === "error" ? "alert" : "status"}
                        className={`flex items-start justify-between gap-4 rounded-lg border px-4 py-3 text-sm ${
                            m.tone === "success"
                                ? "border-[var(--ayom-primary)]/20 bg-[var(--ayom-primary)]/[0.06] text-[var(--ayom-primary-dark)]"
                                : "border-[var(--ayom-danger)]/20 bg-[var(--ayom-danger-soft)] text-[var(--ayom-danger)]"
                        }`}
                    >
                        <span className="min-w-0 break-words">{m.text}</span>
                        <button
                            type="button"
                            onClick={() =>
                                setDismissed((prev) => ({
                                    ...prev,
                                    [m.key]: true,
                                }))
                            }
                            className="shrink-0 text-xs font-medium opacity-70 hover:opacity-100"
                        >
                            Tutup
                        </button>
                    </div>
                ))}
        </div>
    );
}

/* ---------- Layout utama admin ---------- */

export default function AdminLayout({
    children,
    title,
    subtitle,
    actions = null,
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <div
            style={themeVars}
            className="min-h-screen bg-[var(--ayom-bg)] text-[var(--ayom-ink)]"
        >
            <Head title={title ?? "Admin"} />

            <div className="mx-auto flex min-h-screen max-w-[1400px] xl:mx-0 xl:max-w-none">
                {/* Sidebar: desktop saja */}
                <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-[var(--ayom-border)] bg-[var(--ayom-surface)] lg:block">
                    <SidebarBody />
                </aside>

                {/* Kolom utama */}
                <div className="flex min-h-screen min-w-0 flex-1 flex-col">
                    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-[var(--ayom-border)] bg-white px-4 py-3 sm:px-5 sm:py-3.5">
                        <div className="flex min-w-0 items-center gap-3">
                            {/* Logo hanya di HP, karena sidebar disembunyikan */}
                            <AyomMark
                                size={36}
                                className="rounded-xl lg:hidden"
                            />
                            <div className="min-w-0">
                                <h1 className="truncate text-[17px] font-semibold leading-tight text-[var(--ayom-ink)]">
                                    {title}
                                </h1>
                                {subtitle ? (
                                    <p className="hidden truncate text-sm text-[var(--ayom-muted)] sm:block">
                                        {subtitle}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                            {actions}
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    aria-label="Buka menu profil"
                                    className="flex items-center gap-2 rounded-full border border-[var(--ayom-border)] bg-[var(--ayom-surface)] py-1 pl-1 pr-2.5 transition-colors hover:bg-black/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ayom-primary)]"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback
                                            className="text-xs font-semibold"
                                            style={{
                                                backgroundColor:
                                                    "var(--ayom-primary)",
                                                color: "var(--ayom-primary-foreground)",
                                            }}
                                        >
                                            {initials(user?.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden max-w-[10rem] truncate text-sm font-medium sm:inline">
                                        {user?.name}
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-[var(--ayom-muted)]" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56"
                                >
                                    <DropdownMenuGroup>
                                        <DropdownMenuLabel className="flex flex-col gap-1 font-normal">
                                            <span className="text-sm font-semibold text-[var(--ayom-ink)]">
                                                {user?.name}
                                            </span>

                                            <span className="break-all text-xs text-[var(--ayom-muted)]">
                                                {user?.email}
                                            </span>

                                            <RolePill
                                                role={user?.role}
                                                className="mt-1 w-fit"
                                            />
                                        </DropdownMenuLabel>
                                    </DropdownMenuGroup>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem
                                        onClick={() =>
                                            router.post(route("logout"))
                                        }
                                        className="cursor-pointer text-[var(--ayom-danger)] focus:text-[var(--ayom-danger)]"
                                    >
                                        Keluar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>

                    <main className="flex-1 px-4 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] pt-5 sm:px-5 lg:pb-8 lg:pt-6 xl:px-8">
                        <div className="mx-auto w-full max-w-[1800px]">
                            <FlashBanner />
                            {children}
                        </div>
                    </main>
                </div>
            </div>

            {/* Navigasi bawah HP/tablet */}
            <BottomNav />
        </div>
    );
}