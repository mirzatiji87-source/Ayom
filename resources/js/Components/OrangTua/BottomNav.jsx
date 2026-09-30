import { Link, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Eye,
    ShieldCheck,
    ListChecks,
    Wallet,
    Receipt,
} from "lucide-react";

const ITEMS = [
    {
        label: "Beranda",
        routeName: "orang-tua.dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Guardian",
        routeName: "orang-tua.guardian-view",
        icon: Eye,
    },
    {
        label: "Approval",
        routeName: "orang-tua.approval-center",
        icon: ShieldCheck,
    },
    {
        label: "Misi",
        routeName: "orang-tua.tasks.index",
        icon: ListChecks,
        badgeKey: "pendingTasks",
    },
    { label: "Tagihan", routeName: "orang-tua.bills.mine", icon: Receipt },
    {
        label: "Top-up",
        routeName: "orang-tua.top-up.form",
        icon: Wallet,
    },
];

function isActiveRoute(name) {
    try {
        return route().current(name) || route().current(`${name}.*`);
    } catch {
        return false;
    }
}

export default function BottomNav() {
    const props = usePage().props;

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"
            style={{
                boxShadow: "0 -4px 16px rgba(15, 23, 42, 0.06)",
            }}
        >
            <div className="grid grid-cols-6">
                {ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = isActiveRoute(item.routeName);
                    const badge = item.badgeKey
                        ? Number(props[item.badgeKey] ?? 0)
                        : 0;

                    return (
                        <Link
                            key={item.routeName}
                            href={route(item.routeName)}
                            className="relative flex cursor-pointer flex-col items-center justify-center gap-1 py-2.5 transition-transform duration-150 active:scale-90"
                        >
                            {active && (
                                <motion.span
                                    layoutId="bottom-nav-dot"
                                    transition={{
                                        type: "spring",
                                        stiffness: 420,
                                        damping: 30,
                                    }}
                                    className="absolute top-1 h-1 w-1 rounded-full bg-emerald-600"
                                />
                            )}

                            {badge > 0 && (
                                <span className="absolute right-[24%] top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                                    {badge > 9 ? "9+" : badge}
                                </span>
                            )}

                            <Icon
                                className={`h-5 w-5 transition-colors duration-150 ${
                                    active
                                        ? "text-emerald-600"
                                        : "text-slate-500"
                                }`}
                                strokeWidth={active ? 2.4 : 2}
                            />

                            <span
                                className={`text-[11px] font-medium transition-colors duration-150 ${
                                    active
                                        ? "text-emerald-700"
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
