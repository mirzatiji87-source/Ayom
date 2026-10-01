import { Link } from "@inertiajs/react";

import AdminLayout from "@/Layouts/AdminLayout";

import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";

import RolePill from "@/Components/Admin/RolePill";
import EmptyState from "@/Components/Admin/EmptyState";

import {
    formatRupiah,
    formatDate,
    initials,
} from "@/lib/ayom-theme";

import {
    Building2,
    Users,
    WalletCards,
    ArrowLeft,
} from "lucide-react";

export default function FamilyDetail({
    family,
}) {
    const members = family?.members ?? [];

    return (
        <AdminLayout
            title={family.name}
            subtitle="Detail keluarga dan anggota"
            actions={
                <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-2xl border-[var(--ayom-border)] bg-[var(--ayom-surface)] shadow-none"
                >
                    <Link href={route("admin.families.index")}>
                        <ArrowLeft className="mr-1.5 h-4 w-4" />
                        Daftar Keluarga
                    </Link>
                </Button>
            }
        >
            {/* RINGKASAN KELUARGA */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <Card className="relative overflow-hidden rounded-bl-3xl rounded-br-[3.5rem] rounded-tl-[3.5rem] rounded-tr-3xl border-0 bg-[var(--ayom-primary)] text-[var(--ayom-primary-foreground)] shadow-none lg:col-span-2">
                    <div className="pointer-events-none absolute -right-12 -top-12 opacity-[0.12]">
                        <Building2 className="h-52 w-52" />
                    </div>

                    <CardContent className="relative p-6 sm:p-7">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85">
                                    <WalletCards className="h-3.5 w-3.5" />
                                    Saldo Keluarga
                                </div>

                                <p className="mt-5 text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">
                                    {formatRupiah(
                                        family.balance,
                                    )}
                                </p>

                                <p className="mt-2 text-sm text-white/65">
                                    Saldo terpusat keluarga saat ini
                                </p>
                            </div>

                            <span className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-white/10 sm:flex">
                                <WalletCards className="h-5 w-5" />
                            </span>
                        </div>

                        <div className="mt-7 grid grid-cols-2 gap-5 border-t border-white/10 pt-5 sm:grid-cols-3">
                            <div>
                                <p className="text-xs text-white/55">
                                    Pemilik
                                </p>

                                <p className="mt-1 text-sm font-semibold text-white">
                                    {family.owner?.name ?? "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-white/55">
                                    Jumlah Anggota
                                </p>

                                <p className="mt-1 text-sm font-semibold text-white">
                                    {members.length}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-white/55">
                                    Terdaftar Sejak
                                </p>

                                <p className="mt-1 text-sm font-semibold text-white">
                                    {formatDate(
                                        family.created_at,
                                    )}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* KOMPOSISI ROLE */}
                <Card className="rounded-3xl border-[var(--ayom-border)] bg-[var(--ayom-surface)] shadow-none">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--ayom-primary)]/[0.07] text-[var(--ayom-primary)]">
                                <Users className="h-5 w-5" />
                            </span>

                            <div>
                                <h2 className="text-sm font-bold text-[var(--ayom-ink)]">
                                    Komposisi Peran
                                </h2>

                                <p className="text-xs text-[var(--ayom-muted)]">
                                    Anggota berdasarkan role
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            {[
                                "orang_tua",
                                "lansia",
                                "remaja",
                            ].map((role) => {
                                const count = members.filter(
                                    (member) =>
                                        member.role === role,
                                ).length;

                                return (
                                    <div
                                        key={role}
                                        className="flex items-center justify-between rounded-2xl border border-[var(--ayom-border)] px-3 py-2.5"
                                    >
                                        <RolePill role={role} />

                                        <span className="text-sm font-bold tabular-nums text-[var(--ayom-ink)]">
                                            {count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ANGGOTA KELUARGA */}
            <Card className="mt-5 overflow-hidden rounded-bl-3xl rounded-br-[3rem] rounded-tl-[3rem] rounded-tr-3xl border-[var(--ayom-border)] bg-[var(--ayom-surface)] shadow-none">
                <CardContent className="p-0">
                    <div className="flex items-center justify-between gap-4 border-b border-[var(--ayom-border)] px-5 py-4">
                        <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--ayom-primary)]/[0.07] text-[var(--ayom-primary)]">
                                <Users className="h-4 w-4" />
                            </span>

                            <div>
                                <h2 className="text-sm font-bold text-[var(--ayom-ink)]">
                                    Anggota Keluarga
                                </h2>

                                <p className="mt-0.5 text-xs text-[var(--ayom-muted)]">
                                    Daftar pengguna dalam keluarga ini
                                </p>
                            </div>
                        </div>

                        <span className="hidden rounded-full bg-[var(--ayom-primary)]/[0.06] px-3 py-1.5 text-xs font-semibold text-[var(--ayom-primary)] sm:inline-flex">
                            {members.length} anggota
                        </span>
                    </div>

                    {members.length === 0 ? (
                        <div className="p-5">
                            <EmptyState
                                title="Belum ada anggota"
                                description="Anggota akan tampil setelah dibuat oleh orang tua atau admin."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[820px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-[var(--ayom-border)] bg-black/[0.015] text-[11px] uppercase tracking-[0.08em] text-[var(--ayom-muted)]">
                                        <th className="px-5 py-3.5 font-semibold">
                                            Nama
                                        </th>

                                        <th className="px-5 py-3.5 font-semibold">
                                            Role
                                        </th>

                                        <th className="px-5 py-3.5 font-semibold">
                                            Saldo Wallet
                                        </th>

                                        <th className="px-5 py-3.5 font-semibold">
                                            Limit Harian
                                        </th>

                                        <th className="px-5 py-3.5 font-semibold">
                                            Limit Bulanan
                                        </th>

                                        <th className="px-5 py-3.5 font-semibold">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[var(--ayom-border)]">
                                    {members.map((member) => (
                                        <tr
                                            key={member.id}
                                            className="transition-colors hover:bg-[var(--ayom-primary)]/[0.025]"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 shrink-0">
                                                        <AvatarFallback className="bg-[var(--ayom-primary)]/[0.07] text-xs font-bold text-[var(--ayom-primary)]">
                                                            {initials(
                                                                member.name,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold text-[var(--ayom-ink)]">
                                                            {member.name}
                                                        </p>

                                                        <p className="mt-0.5 truncate text-xs text-[var(--ayom-muted)]">
                                                            {member.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <RolePill
                                                    role={member.role}
                                                />
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 font-semibold tabular-nums text-[var(--ayom-ink)]">
                                                    <WalletCards className="h-3.5 w-3.5 text-[var(--ayom-muted)]" />

                                                    {member.wallet
                                                        ? formatRupiah(
                                                              member
                                                                  .wallet
                                                                  .balance,
                                                          )
                                                        : "—"}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 tabular-nums text-[var(--ayom-muted)]">
                                                {member.wallet
                                                    ?.daily_limit
                                                    ? formatRupiah(
                                                          member
                                                              .wallet
                                                              .daily_limit,
                                                      )
                                                    : "—"}
                                            </td>

                                            <td className="px-5 py-4 tabular-nums text-[var(--ayom-muted)]">
                                                {member.wallet
                                                    ?.monthly_limit
                                                    ? formatRupiah(
                                                          member
                                                              .wallet
                                                              .monthly_limit,
                                                      )
                                                    : "—"}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                        member.is_active
                                                            ? "bg-[var(--ayom-primary)]/[0.08] text-[var(--ayom-primary-dark)]"
                                                            : "bg-[var(--ayom-danger-soft)] text-[var(--ayom-danger)]"
                                                    }`}
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${
                                                            member.is_active
                                                                ? "bg-[var(--ayom-primary)]"
                                                                : "bg-[var(--ayom-danger)]"
                                                        }`}
                                                    />

                                                    {member.is_active
                                                        ? "Aktif"
                                                        : "Nonaktif"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminLayout>
    );
}