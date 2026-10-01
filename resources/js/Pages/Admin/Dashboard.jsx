import { Link } from "@inertiajs/react";

import AdminLayout, { AyomMark } from "@/Layouts/AdminLayout";

import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";

import RolePill from "@/Components/Admin/RolePill";
import EmptyState from "@/Components/Admin/EmptyState";

import {
    formatRupiah,
    formatDateTime,
    roleMeta,
} from "@/lib/ayom-theme";

import {
    Users,
    WalletCards,
    ShieldCheck,
    ReceiptText,
    ArrowUpRight,
    ArrowRight,
    Activity,
    Building2,
} from "lucide-react";

const ROLE_ORDER = [
    "admin",
    "orang_tua",
    "lansia",
    "remaja",
];

function StatTile({ label, value, hint, icon: Icon }) {
    return (
        <Card className="group relative h-full overflow-hidden rounded-[28px] border border-black/[0.04] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(0,0,0,0.04),0_20px_40px_-16px_rgba(0,0,0,0.18)]">
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[var(--ayom-primary)]/[0.06] blur-2xl" />

            <CardContent className="relative p-5">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-medium text-[var(--ayom-muted)]">
                        {label}
                    </p>

                    {Icon ? (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--ayom-primary)]/[0.08] text-[var(--ayom-primary)] transition-transform duration-300 group-hover:scale-110">
                            <Icon
                                className="h-4 w-4"
                                strokeWidth={1.75}
                            />
                        </span>
                    ) : null}
                </div>

                <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-[var(--ayom-ink)]">
                    {value}
                </p>

                {hint ? (
                    <p className="mt-1 text-xs text-[var(--ayom-muted)]">
                        {hint}
                    </p>
                ) : null}
            </CardContent>
        </Card>
    );
}

// warna khusus di atas background hijau gelap
// admin dibuat terang agar tetap terbaca
const BAR_COLOR = {
    admin: "#E2E8F0",
};

function RoleDistributionBar({ byRole, total }) {
    if (!total) return null;

    const colorOf = (role) =>
        BAR_COLOR[role] ?? roleMeta(role).dot;

    return (
        <div className="flex h-full w-full flex-col rounded-3xl bg-white/[0.07] p-5 ring-1 ring-white/10 backdrop-blur-md">
            {/* HEADER */}
            <div className="flex items-end justify-between">
                <p className="text-xs font-medium text-white/60">
                    Distribusi pengguna
                </p>

                <p className="text-xs text-white/60">
                    <span className="text-2xl font-semibold text-white">
                        {total}
                    </span>{" "}
                    total
                </p>
            </div>

            {/* BAR GABUNGAN */}
            <div className="mt-4 flex h-2.5 w-full gap-1 overflow-hidden rounded-full">
                {ROLE_ORDER.map((role) => {
                    const count = byRole[role] ?? 0;

                    if (!count) return null;

                    return (
                        <div
                            key={role}
                            className="h-full rounded-full"
                            style={{
                                width: `${(count / total) * 100}%`,
                                minWidth: 8,
                                backgroundColor: colorOf(role),
                            }}
                        />
                    );
                })}
            </div>

            {/* BARIS PER ROLE */}
            <div className="mt-5 flex flex-1 flex-col gap-2">
                {ROLE_ORDER.map((role) => {
                    const count = byRole[role] ?? 0;
                    const pct = Math.round(
                        (count / total) * 100,
                    );

                    return (
                        <div
                            key={role}
                            className="flex flex-1 flex-col justify-center rounded-2xl bg-white/[0.06] px-4 py-2.5"
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className="h-2 w-2 shrink-0 rounded-full"
                                    style={{
                                        backgroundColor:
                                            colorOf(role),
                                    }}
                                />

                                <span className="truncate text-sm text-white/80">
                                    {roleMeta(role).label}
                                </span>

                                <span className="ml-auto flex items-baseline gap-1.5">
                                    <span className="text-base font-semibold text-white">
                                        {count}
                                    </span>

                                    <span className="text-[11px] text-white/40">
                                        {pct}%
                                    </span>
                                </span>
                            </div>

                            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${pct}%`,
                                        backgroundColor:
                                            colorOf(role),
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function Dashboard({
    stats,
    recentFamilies = [],
    recentActivity = [],
}) {
    const s = {
        total_families: 0,
        total_users: 0,
        total_balance: 0,
        pending_approvals: 0,
        active_bills: 0,
        users_by_role: {},
        ...stats,
    };

    return (
        <AdminLayout
            title="Dashboard"
            subtitle="Ringkasan seluruh platform Ayom"
        >
            {/* HERO + STATISTIK */}
            <div className="space-y-5">
                {/* HERO */}
                <Card className="relative overflow-hidden rounded-[2.5rem] border-0 bg-gradient-to-br from-[var(--ayom-primary)] via-[var(--ayom-primary)] to-[var(--ayom-primary-dark,var(--ayom-primary))] text-[var(--ayom-primary-foreground)] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)]">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,0.14),transparent_55%)]" />

                    <div className="pointer-events-none absolute -right-10 -top-14 opacity-[0.07]">
                        <AyomMark size={320} />
                    </div>

                    <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full border border-white/10" />

                    <div className="pointer-events-none absolute -bottom-16 -left-12 h-40 w-40 rounded-full border border-white/10" />

                    <CardContent className="relative grid gap-5 p-7 sm:p-9 lg:grid-cols-12 lg:items-stretch">
                        {/* KIRI: SALDO */}
                        <div className="flex flex-col justify-between gap-8 lg:col-span-7">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/85 ring-1 ring-white/10 backdrop-blur">
                                    <WalletCards className="h-3.5 w-3.5" />
                                    Ringkasan Keuangan
                                </div>

                                <p className="mt-6 text-sm font-medium text-white/60">
                                    Total saldo keluarga se-platform
                                </p>

                                <p className="mt-2 break-words text-5xl font-semibold tabular-nums tracking-tight sm:text-6xl">
                                    {formatRupiah(
                                        s.total_balance,
                                    )}
                                </p>

                                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
                                    Akumulasi saldo dari seluruh
                                    keluarga terdaftar, termasuk
                                    yang belum pernah melakukan
                                    top-up.
                                </p>
                            </div>

                            {/* MINI METRIK */}
                            <div className="grid grid-cols-3 divide-x divide-white/10 rounded-3xl bg-white/[0.07] ring-1 ring-white/10 backdrop-blur-md">
                                {[
                                    {
                                        label: "Rata-rata / keluarga",
                                        value: formatRupiah(
                                            s.total_families
                                                ? Math.round(
                                                      s.total_balance /
                                                          s.total_families,
                                                  )
                                                : 0,
                                        ),
                                    },
                                    {
                                        label: "Keluarga",
                                        value: s.total_families,
                                    },
                                    {
                                        label: "Tagihan aktif",
                                        value: s.active_bills,
                                    },
                                ].map((m) => (
                                    <div
                                        key={m.label}
                                        className="min-w-0 px-5 py-4"
                                    >
                                        <p className="truncate text-[11px] font-medium text-white/50">
                                            {m.label}
                                        </p>

                                        <p className="mt-1 truncate text-lg font-semibold tabular-nums text-white">
                                            {m.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* KANAN: DISTRIBUSI */}
                        <div className="flex lg:col-span-5">
                            <RoleDistributionBar
                                byRole={s.users_by_role}
                                total={s.total_users}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* STATISTIK */}
                <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
                    <StatTile
                        icon={Building2}
                        label="Total Keluarga"
                        value={s.total_families}
                        hint="Terdaftar di platform"
                    />

                    <StatTile
                        icon={Users}
                        label="Total Pengguna"
                        value={s.total_users}
                        hint="Seluruh role"
                    />

                    <StatTile
                        icon={ShieldCheck}
                        label="Approval Tertunda"
                        value={s.pending_approvals}
                        hint={
                            s.pending_approvals > 0
                                ? "Menunggu tindakan orang tua"
                                : "Tidak ada yang tertunda"
                        }
                    />

                    <StatTile
                        icon={ReceiptText}
                        label="Tagihan Aktif"
                        value={s.active_bills}
                        hint="Auto-pilot bills berjalan"
                    />
                </div>
            </div>

            {/* KELUARGA + AKTIVITAS */}
            <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-5">
                {/* KELUARGA TERBARU */}
                <Card className="overflow-hidden rounded-3xl border-[var(--ayom-border)] bg-[var(--ayom-surface)] shadow-none xl:col-span-3">
                    <CardContent className="p-0">
                        <div className="flex items-center justify-between gap-4 border-b border-[var(--ayom-border)] px-5 py-4">
                            <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--ayom-primary)]/[0.07] text-[var(--ayom-primary)]">
                                    <Building2 className="h-4 w-4" />
                                </span>

                                <div>
                                    <h2 className="text-sm font-bold text-[var(--ayom-ink)]">
                                        Keluarga Terbaru
                                    </h2>

                                    <p className="mt-0.5 text-xs text-[var(--ayom-muted)]">
                                        Pendaftaran keluarga terbaru
                                    </p>
                                </div>
                            </div>

                            <Link
                                href={route(
                                    "admin.families.index",
                                )}
                                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--ayom-primary)] transition-colors hover:bg-[var(--ayom-primary)]/[0.07]"
                            >
                                Lihat semua
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>

                        {recentFamilies.length === 0 ? (
                            <div className="p-5">
                                <EmptyState
                                    title="Belum ada keluarga terdaftar"
                                    description="Keluarga baru akan muncul di sini begitu orang tua mendaftar."
                                />
                            </div>
                        ) : (
                            <ul className="divide-y divide-[var(--ayom-border)]">
                                {recentFamilies.map(
                                    (family) => (
                                        <li key={family.id}>
                                            <Link
                                                href={route(
                                                    "admin.families.show",
                                                    family.id,
                                                )}
                                                className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-black/[0.02]"
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--ayom-primary)]/[0.06] text-[var(--ayom-primary)]">
                                                        <Building2 className="h-4 w-4" />
                                                    </span>

                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-[var(--ayom-ink)]">
                                                            {family.name}
                                                        </p>

                                                        <p className="mt-0.5 truncate text-xs text-[var(--ayom-muted)]">
                                                            Pemilik:{" "}
                                                            {family
                                                                .owner
                                                                ?.name ??
                                                                "—"}{" "}
                                                            ·{" "}
                                                            {
                                                                family.members_count
                                                            }{" "}
                                                            anggota
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex shrink-0 items-center gap-2">
                                                    <p className="text-sm font-bold tabular-nums text-[var(--ayom-ink)]">
                                                        {formatRupiah(
                                                            family.balance,
                                                        )}
                                                    </p>

                                                    <ArrowUpRight className="hidden h-4 w-4 text-[var(--ayom-muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:block" />
                                                </div>
                                            </Link>
                                        </li>
                                    ),
                                )}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                {/* AKTIVITAS */}
                <Card className="overflow-hidden rounded-3xl border-[var(--ayom-border)] bg-[var(--ayom-surface)] shadow-none xl:col-span-2">
                    <CardContent className="p-0">
                        <div className="flex items-center gap-3 border-b border-[var(--ayom-border)] px-5 py-4">
                            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--ayom-primary)]/[0.07] text-[var(--ayom-primary)]">
                                <Activity className="h-4 w-4" />
                            </span>

                            <div>
                                <h2 className="text-sm font-bold text-[var(--ayom-ink)]">
                                    Aktivitas Terbaru
                                </h2>

                                <p className="mt-0.5 text-xs text-[var(--ayom-muted)]">
                                    Log aktivitas platform
                                </p>
                            </div>
                        </div>

                        {recentActivity.length === 0 ? (
                            <div className="p-5">
                                <EmptyState
                                    title="Belum ada aktivitas"
                                    description="Log aktivitas akan tampil di sini."
                                />
                            </div>
                        ) : (
                            <ul className="max-h-[420px] overflow-y-auto px-5 py-5">
                                {recentActivity.map(
                                    (log, idx) => (
                                        <li
                                            key={log.id}
                                            className="relative flex gap-3 pb-5 last:pb-0"
                                        >
                                            {idx !==
                                                recentActivity.length -
                                                    1 && (
                                                <span className="absolute left-[7px] top-4 h-full w-px bg-[var(--ayom-border)]" />
                                            )}

                                            <span
                                                className="relative mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[var(--ayom-surface)] shadow-sm"
                                                style={{
                                                    backgroundColor:
                                                        roleMeta(
                                                            log
                                                                .user
                                                                ?.role,
                                                        ).dot,
                                                }}
                                            />

                                            <div className="min-w-0">
                                                <p className="text-sm leading-relaxed text-[var(--ayom-ink)]">
                                                    <span className="font-semibold">
                                                        {log
                                                            .user
                                                            ?.name ??
                                                            "Sistem"}
                                                    </span>{" "}
                                                    <span className="text-[var(--ayom-muted)]">
                                                        {log.action_label ??
                                                            log.action}
                                                    </span>
                                                </p>

                                                <p className="mt-1 text-xs text-[var(--ayom-muted)]">
                                                    {formatDateTime(
                                                        log.created_at,
                                                    )}
                                                </p>
                                            </div>
                                        </li>
                                    ),
                                )}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}