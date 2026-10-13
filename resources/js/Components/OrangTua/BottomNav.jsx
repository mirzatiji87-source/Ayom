import { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";

import { Sheet, SheetContent, SheetTitle } from "@/Components/ui/sheet";

import {
    NAV_ITEMS,
    MOBILE_PRIMARY_ROUTE_NAMES,
} from "@/Components/OrangTua/nav-items";

function isActiveRoute(name) {
    try {
        return route().current(name) || route().current(`${name}.*`);
    } catch {
        return false;
    }
}

function BadgeCount({ count }) {
    if (count === null || count === undefined || Number(count) <= 0) {
        return null;
    }

    const number = Number(count);

    return (
        <span className="absolute right-[18%] top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {number > 9 ? "9+" : number}
        </span>
    );
}

export default function BottomNav({ pendingApprovalCount = null }) {
    const { pendingTasks = 0 } = usePage().props;
    const [moreOpen, setMoreOpen] = useState(false);

    const primaryItems = NAV_ITEMS.filter((item) =>
        MOBILE_PRIMARY_ROUTE_NAMES.includes(item.routeName),
    );

    const moreItems = NAV_ITEMS.filter(
        (item) => !MOBILE_PRIMARY_ROUTE_NAMES.includes(item.routeName),
    );

    const moreIsActive = moreItems.some((item) =>
        isActiveRoute(item.routeName),
    );

    function badgeFor(item) {
        if (item.notifKey === "approval") {
            return pendingApprovalCount;
        }

        if (item.notifKey === "tasks") {
            return pendingTasks;
        }

        return 0;
    }

    return (
        <>
            <nav
                aria-label="Navigasi utama"
                className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--ayom-border)] bg-[var(--ayom-surface)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"
                style={{
                    boxShadow: "0 -4px 16px rgba(15, 23, 42, 0.06)",
                }}
            >
                <div className="grid grid-cols-5">
                    {primaryItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActiveRoute(item.routeName);
                        const badge = badgeFor(item);

                        return (
                            <Link
                                key={item.routeName}
                                href={route(item.routeName)}
                                aria-current={active ? "page" : undefined}
                                className="relative flex cursor-pointer flex-col items-center justify-center gap-1 py-2.5 transition-transform duration-150 active:scale-90"
                            >
                                {active && (
                                    <motion.span
                                        layoutId="bottom-nav-active"
                                        transition={{
                                            type: "spring",
                                            stiffness: 420,
                                            damping: 30,
                                        }}
                                        className="absolute inset-x-2 top-0 h-0.5 rounded-full bg-[var(--ayom-primary)]"
                                    />
                                )}

                                <BadgeCount count={badge} />

                                <Icon
                                    className={`h-5 w-5 transition-colors duration-150 ${
                                        active
                                            ? "text-[var(--ayom-primary)]"
                                            : "text-[var(--ayom-muted)]"
                                    }`}
                                    strokeWidth={active ? 2.4 : 2}
                                />

                                <span
                                    className={`text-[11px] font-medium transition-colors duration-150 ${
                                        active
                                            ? "text-[var(--ayom-primary)]"
                                            : "text-[var(--ayom-muted)]"
                                    }`}
                                >
                                    {item.mobileLabel ?? item.label}
                                </span>
                            </Link>
                        );
                    })}

                    <button
                        type="button"
                        aria-label="Buka menu lainnya"
                        aria-expanded={moreOpen}
                        onClick={() => setMoreOpen(true)}
                        className="relative flex cursor-pointer flex-col items-center justify-center gap-1 py-2.5 transition-transform duration-150 active:scale-90"
                    >
                        {moreIsActive && (
                            <motion.span
                                layoutId="bottom-nav-active"
                                transition={{
                                    type: "spring",
                                    stiffness: 420,
                                    damping: 30,
                                }}
                                className="absolute inset-x-2 top-0 h-0.5 rounded-full bg-[var(--ayom-primary)]"
                            />
                        )}

                        <MoreHorizontal
                            className={`h-5 w-5 ${
                                moreIsActive
                                    ? "text-[var(--ayom-primary)]"
                                    : "text-[var(--ayom-muted)]"
                            }`}
                        />

                        <span
                            className={`text-[11px] font-medium ${
                                moreIsActive
                                    ? "text-[var(--ayom-primary)]"
                                    : "text-[var(--ayom-muted)]"
                            }`}
                        >
                            Lainnya
                        </span>
                    </button>
                </div>
            </nav>

            <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
                <SheetContent
                    side="bottom"
                    className="rounded-t-3xl border-[var(--ayom-border)] bg-[var(--ayom-surface)] px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-6"
                >
                    <SheetTitle className="mb-4 font-serif text-xl text-[var(--ayom-ink)]">
                        Menu lainnya
                    </SheetTitle>

                    <nav aria-label="Menu lainnya" className="space-y-1">
                        {moreItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActiveRoute(item.routeName);
                            const badge = badgeFor(item);

                            return (
                                <Link
                                    key={item.routeName}
                                    href={route(item.routeName)}
                                    onClick={() => setMoreOpen(false)}
                                    aria-current={active ? "page" : undefined}
                                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                                        active
                                            ? "bg-[var(--ayom-primary)] text-white"
                                            : "text-[var(--ayom-ink)] hover:bg-[var(--ayom-primary-soft)]"
                                    }`}
                                >
                                    <Icon className="h-5 w-5 shrink-0" />

                                    <span className="min-w-0 flex-1">
                                        {item.label}
                                    </span>

                                    {badge > 0 && (
                                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">
                                            {badge > 9 ? "9+" : badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </SheetContent>
            </Sheet>
        </>
    );
}
