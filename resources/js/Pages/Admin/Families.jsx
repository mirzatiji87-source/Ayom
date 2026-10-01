import { useEffect, useRef, useState } from "react";
import { Link, router } from "@inertiajs/react";

import AdminLayout from "@/Layouts/AdminLayout";

import { Card, CardContent } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";

import EmptyState from "@/Components/Admin/EmptyState";

import {
    formatRupiah,
    formatDate,
} from "@/lib/ayom-theme";

import {
    Search,
    Building2,
    Users,
    ArrowRight,
} from "lucide-react";

export default function Families({
    families,
    filters = {},
}) {
    const [search, setSearch] = useState(
        filters.search ?? "",
    );

    const firstRun = useRef(true);

    useEffect(() => {
        if (firstRun.current) {
            firstRun.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                route("admin.families.index"),
                search ? { search } : {},
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                },
            );
        }, 400);

        return () => clearTimeout(timeout);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const rows = families?.data ?? [];
    const links = families?.links ?? [];

    return (
        <AdminLayout
            title="Kelola Keluarga"
            subtitle={`${families?.total ?? rows.length} keluarga terdaftar`}
            actions={
                <div className="hidden w-72 sm:block">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ayom-muted)]" />

                        <Input
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Cari keluarga atau pemilik…"
                            className="h-10 rounded-2xl border-[var(--ayom-border)] bg-[var(--ayom-surface)] pl-9 shadow-none"
                        />
                    </div>
                </div>
            }
        >
            {/* MOBILE SEARCH */}
            <div className="mb-5 sm:hidden">
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ayom-muted)]" />

                    <Input
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder="Cari nama keluarga atau pemilik…"
                        className="h-11 rounded-2xl border-[var(--ayom-border)] bg-[var(--ayom-surface)] pl-9 shadow-none"
                    />
                </div>
            </div>

            <Card className="overflow-hidden rounded-bl-3xl rounded-br-[3rem] rounded-tl-[3rem] rounded-tr-3xl border-[var(--ayom-border)] bg-[var(--ayom-surface)] shadow-none">
                <CardContent className="p-0">
                    {/* TABLE HEADER */}
                    <div className="flex items-center justify-between gap-4 border-b border-[var(--ayom-border)] px-5 py-4">
                        <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--ayom-primary)]/[0.07] text-[var(--ayom-primary)]">
                                <Building2 className="h-4 w-4" />
                            </span>

                            <div>
                                <h2 className="text-sm font-bold text-[var(--ayom-ink)]">
                                    Daftar Keluarga
                                </h2>

                                <p className="mt-0.5 text-xs text-[var(--ayom-muted)]">
                                    Kelola keluarga yang terdaftar di Ayom
                                </p>
                            </div>
                        </div>

                        <span className="hidden rounded-full bg-[var(--ayom-primary)]/[0.06] px-3 py-1.5 text-xs font-semibold text-[var(--ayom-primary)] sm:inline-flex">
                            {families?.total ?? rows.length} keluarga
                        </span>
                    </div>

                    {rows.length === 0 ? (
                        <div className="p-5">
                            <EmptyState
                                title={
                                    search
                                        ? `Tidak ada hasil untuk "${search}"`
                                        : "Belum ada keluarga terdaftar"
                                }
                                description={
                                    search
                                        ? "Coba kata kunci lain atau hapus pencarian."
                                        : "Keluarga akan muncul di sini begitu ada orang tua yang mendaftar."
                                }
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[780px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-[var(--ayom-border)] bg-black/[0.015] text-[11px] uppercase tracking-[0.08em] text-[var(--ayom-muted)]">
                                        <th className="px-5 py-3.5 font-semibold">
                                            Nama Keluarga
                                        </th>

                                        <th className="px-5 py-3.5 font-semibold">
                                            Pemilik
                                        </th>

                                        <th className="px-5 py-3.5 font-semibold">
                                            Anggota
                                        </th>

                                        <th className="px-5 py-3.5 font-semibold">
                                            Saldo
                                        </th>

                                        <th className="px-5 py-3.5 font-semibold">
                                            Terdaftar
                                        </th>

                                        <th className="px-5 py-3.5 text-right font-semibold">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[var(--ayom-border)]">
                                    {rows.map((family) => (
                                        <tr
                                            key={family.id}
                                            className="group transition-colors hover:bg-[var(--ayom-primary)]/[0.025]"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--ayom-primary)]/[0.06] text-[var(--ayom-primary)]">
                                                        <Building2 className="h-4 w-4" />
                                                    </span>

                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold text-[var(--ayom-ink)]">
                                                            {family.name}
                                                        </p>

                                                        <p className="mt-0.5 text-xs text-[var(--ayom-muted)]">
                                                            ID keluarga #
                                                            {family.id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-[var(--ayom-muted)]">
                                                {family.owner?.name ?? "—"}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center gap-1.5 text-[var(--ayom-muted)]">
                                                    <Users className="h-3.5 w-3.5" />
                                                    <span className="tabular-nums">
                                                        {family.members_count}
                                                    </span>
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 font-bold tabular-nums text-[var(--ayom-ink)]">
                                                {formatRupiah(
                                                    family.balance,
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-[var(--ayom-muted)]">
                                                {formatDate(
                                                    family.created_at,
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-2xl border-[var(--ayom-border)] bg-white shadow-none transition-colors group-hover:border-[var(--ayom-primary)] group-hover:text-[var(--ayom-primary)]"
                                                >
                                                    <Link
                                                        href={route(
                                                            "admin.families.show",
                                                            family.id,
                                                        )}
                                                    >
                                                        <span className="hidden sm:inline">
                                                            Lihat Detail
                                                        </span>

                                                        <ArrowRight className="h-4 w-4 sm:ml-1" />
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* PAGINATION */}
            {links.length > 3 && (
                <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
                    {links.map((link, idx) => (
                        <button
                            key={idx}
                            type="button"
                            disabled={!link.url}
                            onClick={() =>
                                link.url &&
                                router.get(
                                    link.url,
                                    {},
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                )
                            }
                            className={`min-w-[38px] rounded-2xl px-3 py-2 text-sm font-medium transition-colors ${
                                link.active
                                    ? "bg-[var(--ayom-primary)] text-[var(--ayom-primary-foreground)] shadow-sm"
                                    : link.url
                                      ? "text-[var(--ayom-muted)] hover:bg-[var(--ayom-primary)]/[0.06] hover:text-[var(--ayom-primary)]"
                                      : "cursor-not-allowed text-[var(--ayom-muted)]/35"
                            }`}
                            dangerouslySetInnerHTML={{
                                __html: link.label,
                            }}
                        />
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}