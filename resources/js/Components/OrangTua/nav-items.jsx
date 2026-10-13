import {
    LayoutDashboard,
    Eye,
    ShieldCheck,
    ListChecks,
    Receipt,
    HeartPulse,
    ClipboardList,
    Wallet,
    UserPlus,
} from "lucide-react";

/**
 * Satu sumber navigasi untuk desktop dan mobile.
 */
export const NAV_ITEMS = [
    {
        label: "Dashboard",
        mobileLabel: "Beranda",
        routeName: "orang-tua.dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Guardian View",
        mobileLabel: "Guardian",
        routeName: "orang-tua.guardian-view",
        icon: Eye,
    },
    {
        label: "Approval Center",
        mobileLabel: "Approval",
        routeName: "orang-tua.approval-center",
        icon: ShieldCheck,
        notifKey: "approval",
    },
    {
        label: "Misi",
        mobileLabel: "Misi",
        routeName: "orang-tua.tasks.index",
        icon: ListChecks,
        notifKey: "tasks",
    },
    {
        label: "Tagihan Saya",
        mobileLabel: "Tagihan",
        routeName: "orang-tua.bills.mine",
        icon: Receipt,
    },
    {
        label: "BPJS Keluarga",
        mobileLabel: "BPJS",
        routeName: "orang-tua.bpjs.index",
        icon: HeartPulse,
    },
    {
        label: "Laporan Status",
        mobileLabel: "Laporan",
        routeName: "orang-tua.status-reports.index",
        icon: ClipboardList,
    },
    {
        label: "Top-up Saldo",
        mobileLabel: "Top-up",
        routeName: "orang-tua.top-up.form",
        icon: Wallet,
    },
    {
        label: "Buat Akun Dependent",
        mobileLabel: "Buat Akun",
        routeName: "dependents.create",
        icon: UserPlus,
    },
];

export const MOBILE_PRIMARY_ROUTE_NAMES = [
    "orang-tua.dashboard",
    "orang-tua.guardian-view",
    "orang-tua.approval-center",
    "orang-tua.tasks.index",
];