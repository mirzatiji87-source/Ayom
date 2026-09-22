import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Eye, ShieldCheck, Wallet } from 'lucide-react';

const ITEMS = [
    { label: 'Beranda', routeName: 'orang-tua.dashboard', icon: LayoutDashboard },
    { label: 'Guardian', routeName: 'orang-tua.guardian-view', icon: Eye },
    { label: 'Approval', routeName: 'orang-tua.approval-center', icon: ShieldCheck },
    { label: 'Top-up', routeName: 'orang-tua.top-up.form', icon: Wallet },
];

function isActiveRoute(name) {
    try {
        return route().current(name) || route().current(`${name}.*`);
    } catch {
        return false;
    }
}

export default function BottomNav() {
    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"
            style={{ boxShadow: '0 -4px 16px rgba(15, 23, 42, 0.06)' }}
        >
            <div className="grid grid-cols-4">
                {ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = isActiveRoute(item.routeName);

                    return (
                        <Link
                            key={item.routeName}
                            href={route(item.routeName)}
                            className="relative flex flex-col items-center justify-center gap-1 py-2.5 active:scale-90 transition-transform duration-150"
                        >
                            {active && (
                                <motion.span
                                    layoutId="bottom-nav-dot"
                                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                                    className="absolute top-1 h-1 w-1 rounded-full bg-emerald-600"
                                />
                            )}

                            <Icon
                                className={`h-5 w-5 transition-colors duration-150 ${
                                    active ? 'text-emerald-600' : 'text-slate-400'
                                }`}
                                strokeWidth={active ? 2.4 : 2}
                            />

                            <span
                                className={`text-[11px] font-medium transition-colors duration-150 ${
                                    active ? 'text-emerald-700' : 'text-slate-400'
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