import { useEffect, useState } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Separator } from "@/Components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/Components/ui/sheet";
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
 * Signature mark for Ayom: two overlapping rounded shapes forming a
 * roof-over-a-shield silhouette — "keluarga yang terlindungi" (family,
 * sheltered). Pure SVG, no external assets, reused as EmptyState icon too.
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
const NAV_ITEMS = [
    {
        label: "Dashboard",
        routeName: "admin.dashboard",
        icon: (active) => (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect
                    x="3"
                    y="3"
                    width="8"
                    height="8"
                    rx="2"
                    fill={active ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
                <rect
                    x="13"
                    y="3"
                    width="8"
                    height="5"
                    rx="2"
                    fill={active ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
                <rect
                    x="13"
                    y="10"
                    width="8"
                    height="11"
                    rx="2"
                    fill={active ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
                <rect
                    x="3"
                    y="13"
                    width="8"
                    height="8"
                    rx="2"
                    fill={active ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
            </svg>
        ),
    },
    {
        label: "Kelola Keluarga",
        routeName: "admin.families.index",
        icon: (active) => (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle
                    cx="8"
                    cy="8"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
                <circle
                    cx="17"
                    cy="9"
                    r="2.4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
                <path
                    d="M2.5 20c.6-3.6 3-5.6 5.5-5.6s4.9 2 5.5 5.6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
                <path
                    d="M13.7 15.2c2 .2 3.7 1.9 4.1 4.8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
                {active && (
                    <path
                        d="M2.5 20c.6-3.6 3-5.6 5.5-5.6s4.9 2 5.5 5.6"
                        fill="currentColor"
                        opacity="0.12"
                    />
                )}
            </svg>
        ),
    },
    {
        label: "Buat Akun Dependent",
        routeName: "dependents.create",
        icon: () => (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle
                    cx="12"
                    cy="8"
                    r="3.4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
                <path
                    d="M4.5 20c.9-4.4 3.8-6.8 7.5-6.8s6.6 2.4 7.5 6.8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
                <path
                    d="M18.5 5.5v5M16 8h5"
                    stroke="var(--ayom-accent)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
        ),
    },
];

function isActiveRoute(name) {
    try {
        return route().current(name) || route().current(`${name}.*`);
    } catch {
        return false;
    }
}

function SidebarNav({ onNavigate }) {
    return (
        <nav className="flex flex-1 flex-col gap-1 px-3">
            {NAV_ITEMS.map((item) => {
                const active = isActiveRoute(item.routeName);
                return (
                    <Link
                        key={item.routeName}
                        href={route(item.routeName)}
                        onClick={onNavigate}
                        className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            active
                                ? "bg-[var(--ayom-primary)] text-[var(--ayom-primary-foreground)]"
                                : "text-[var(--ayom-muted)] hover:bg-black/[0.04] hover:text-[var(--ayom-ink)]"
                        }`}
                    >
                        <span
                            className={
                                active
                                    ? "text-[var(--ayom-primary-foreground)]"
                                    : "text-[var(--ayom-muted)] group-hover:text-[var(--ayom-ink)]"
                            }
                        >
                            {item.icon(active)}
                        </span>
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}

function SidebarBody({ onNavigate }) {
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
            <SidebarNav onNavigate={onNavigate} />
            <div className="mt-auto px-4 pt-4">
                <Separator className="mb-4 bg-[var(--ayom-border)]" />
                <p className="text-[11px] leading-relaxed text-[var(--ayom-muted)]">
                    Semua tindakan admin dicatat di log aktivitas keluarga.
                </p>
            </div>
        </div>
    );
}

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
                        className={`flex items-start justify-between gap-4 rounded-lg border px-4 py-3 text-sm ${
                            m.tone === "success"
                                ? "border-[var(--ayom-primary)]/20 bg-[var(--ayom-primary)]/[0.06] text-[var(--ayom-primary-dark)]"
                                : "border-[var(--ayom-danger)]/20 bg-[var(--ayom-danger-soft)] text-[var(--ayom-danger)]"
                        }`}
                    >
                        <span>{m.text}</span>
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

export default function AdminLayout({
    children,
    title,
    subtitle,
    actions = null,
}) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div
            style={themeVars}
            className="min-h-screen bg-[var(--ayom-bg)] text-[var(--ayom-ink)]"
        >
            <Head title={title ?? "Admin"} />

            <div className="mx-auto flex min-h-screen max-w-[1400px]">
                {/* Sidebar — desktop */}
                <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-[var(--ayom-border)] bg-[var(--ayom-surface)] lg:block">
                    <SidebarBody />
                </aside>

                {/* Sidebar — mobile drawer */}
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetContent
                        side="left"
                        className="w-64 border-[var(--ayom-border)] bg-[var(--ayom-surface)] p-0"
                    >
                        <SidebarBody onNavigate={() => setMobileOpen(false)} />
                    </SheetContent>
                </Sheet>

                {/* Main column */}
                <div className="flex min-h-screen flex-1 flex-col">
                    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[var(--ayom-border)] bg-[var(--ayom-surface)]/90 px-5 py-3.5 backdrop-blur">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden"
                                onClick={() => setMobileOpen(true)}
                                aria-label="Buka menu"
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <path
                                        d="M4 6h16M4 12h16M4 18h16"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </Button>
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

                        <div className="flex items-center gap-3">
                            {actions}
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-black/[0.04] focus:outline-none">
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
                                    <span className="hidden text-sm font-medium sm:inline">
                                        {user?.name}
                                    </span>
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

                                            <span className="text-xs text-[var(--ayom-muted)]">
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

                    <main className="flex-1 px-5 py-6">
                        <FlashBanner />
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
