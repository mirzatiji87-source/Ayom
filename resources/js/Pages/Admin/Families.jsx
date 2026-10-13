import { useEffect, useRef, useState } from "react";
import { Link, router } from "@inertiajs/react";

import AdminLayout from "@/Layouts/AdminLayout";

import { Card, CardContent } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";

import EmptyState from "@/Components/Admin/EmptyState";

import { formatRupiah, formatDate } from "@/lib/ayom-theme";

import {
    Search,
    Building2,
    Users,
    ArrowRight,
} from "lucide-react";

export default function Families({ families, filters = {} }) {
    const [search, setSearch] = useState(filters.search ?? "");
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
                            onChange={(e) => setSearch(e.target.value)}
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
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama keluarga atau pemilik…"
                        className="h-11 rounded-2xl border-[var(--ayom-border)] bg-[var(--ayom-surface)] pl-9 shadow-none"
                    />
                </div>
            </div>

            <Card className="overflow-hidden rounded-bl-3xl rounded-br-[2rem] rounded-tl-[2rem] rounded-tr-3xl border-[var(--ayom-border)] bg-[var(--ayom-surface)] shadow-none md:rounded-br-[3rem] md:rounded-tl-[3rem]">
                <CardContent className="p-0">
                    {/* TABLE HEADER */}
                    <div className="flex items-center justify-between gap-4 border-b border-[var(--ayom-border)] px-5 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--ayom-primary)]/[0.07] text-[var(--ayom-primary)]">
                                <Building2 className="h-4 w-4" />
                            </span>

                            <div className="min-w-0">
                                <h2 className="text-sm font-bold text-[var(--ayom-ink)]">
                                    Daftar Keluarga
                                </h2>

                                <p className="mt-0.5 text-xs text-[var(--ayom-muted)]">
                                    Kelola keluarga yang terdaftar di Ayom
                                </p>
                            </div>
                        </div>

                        <span className="hidden shrink-0 rounded-full bg-[var(--ayom-primary)]/[0.06] px-3 py-1.5 text-xs font-semibold text-[var(--ayom-primary)] sm:inline-flex">
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
                        <>
                            {/* MOBILE: KARTU KELUARGA */}
                            <ul className="space-y-4 bg-slate-200/60 p-3 md:hidden">
                                {rows.map((family) => (
                                    <li
                                        key={family.id}
                                        className="overflow-hidden rounded-2xl border border-l-4 border-slate-300/70 border-l-[color:var(--ayom-primary)] bg-white shadow-md shadow-slate-900/10"
                                    >
                                        {/* HEADER KARTU */}
                                        <div className="flex items-center gap-3 border-b border-slate-200 bg-[var(--ayom-primary)]/[0.07] px-4 py-3">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--ayom-primary)] ring-1 ring-slate-200">
                                                <Building2 className="h-4 w-4" />
                                            </span>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-bold text-[var(--ayom-ink)]">
                                                    {family.name}
                                                </p>

                                                <p className="mt-0.5 truncate text-xs text-[var(--ayom-muted)]">
                                                    Pemilik:{" "}
                                                    {family.owner?.name ?? "—"}
                                                </p>
                                            </div>

                                            <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--ayom-muted)] ring-1 ring-slate-200">
                                                #{family.id}
                                            </span>
                                        </div>

                                        {/* ISI KARTU */}
                                        <div className="p-4">
                                            <dl className="grid grid-cols-2 gap-3">
                                                <div className="min-w-0">
                                                    <dt className="text-[11px] font-medium text-[var(--ayom-muted)]">
                                                        Anggota
                                                    </dt>

                                                    <dd className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--ayom-ink)]">
                                                        <Users className="h-3.5 w-3.5 text-[var(--ayom-muted)]" />

                                                        <span className="tabular-nums">
                                                            {family.members_count ?? 0}
                                                        </span>
                                                    </dd>
                                                </div>

                                                <div className="min-w-0">
                                                    <dt className="text-[11px] font-medium text-[var(--ayom-muted)]">
                                                        Terdaftar
                                                    </dt>

                                                    <dd className="mt-1 truncate text-sm font-semibold text-[var(--ayom-ink)]">
                                                        {formatDate(family.created_at)}
                                                    </dd>
                                                </div>

                                                <div className="col-span-2 min-w-0 rounded-xl bg-[var(--ayom-primary)]/[0.07] px-3 py-2.5">
                                                    <dt className="text-[11px] font-medium text-[var(--ayom-muted)]">
                                                        Saldo
                                                    </dt>

                                                    <dd className="mt-0.5 break-words text-lg font-bold tabular-nums text-[var(--ayom-primary)]">
                                                        {formatRupiah(family.balance ?? 0)}
                                                    </dd>
                                                </div>
                                            </dl>

                                            {/* LINK DETAIL MOBILE */}
                                            <Link
                                                href={route(
                                                    "admin.families.show",
                                                    family.id,
                                                )}
                                                className="mt-3 inline-flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[var(--ayom-primary)]/30 text-sm font-semibold text-[var(--ayom-primary)] transition-colors duration-200 hover:bg-[var(--ayom-primary)] hover:text-[var(--ayom-primary-foreground)]"
                                            >
                                                Lihat detail
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {/* TABLET & DESKTOP: BARIS TERPISAH */}
                            <div className="hidden overflow-x-auto bg-slate-200/60 px-3 pb-3 md:block">
                                <table className="w-full min-w-[720px] border-separate border-spacing-y-2.5 text-left text-sm">
                                    <thead>
                                        <tr className="text-[11px] uppercase tracking-[0.08em] text-[var(--ayom-muted)]">
                                            <th className="px-5 py-3 font-semibold">
                                                Nama Keluarga
                                            </th>

                                            <th className="px-5 py-3 font-semibold">
                                                Pemilik
                                            </th>

                                            <th className="px-5 py-3 font-semibold">
                                                Anggota
                                            </th>

                                            <th className="px-5 py-3 font-semibold">
                                                Saldo
                                            </th>

                                            <th className="px-5 py-3 font-semibold">
                                                Terdaftar
                                            </th>

                                            <th className="px-5 py-3 text-right font-semibold">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {rows.map((family) => (
                                            <tr
                                                key={family.id}
                                                className="group [&>td]:border-y [&>td]:border-slate-300/70 [&>td]:bg-white [&>td]:transition-colors [&>td:first-child]:rounded-l-2xl [&>td:first-child]:border-l-4 [&>td:first-child]:border-l-[color:var(--ayom-primary)] [&>td:last-child]:rounded-r-2xl [&>td:last-child]:border-r [&:hover>td]:bg-[var(--ayom-primary)]/[0.04]"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--ayom-primary)]/[0.06] text-[var(--ayom-primary)]">
                                                            <Building2 className="h-4 w-4" />
                                                        </span>

                                                        <div className="min-w-0">
                                                            <p className="break-words font-semibold text-[var(--ayom-ink)]">
                                                                {family.name}
                                                            </p>

                                                            <p className="mt-1 text-xs text-[var(--ayom-muted)]">
                                                                ID keluarga #{family.id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 text-[var(--ayom-muted)]">
                                                    <span className="block max-w-[180px] break-words">
                                                        {family.owner?.name ?? "—"}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center gap-1.5 text-[var(--ayom-muted)]">
                                                        <Users className="h-3.5 w-3.5" />

                                                        <span className="tabular-nums">
                                                            {family.members_count ?? 0}
                                                        </span>
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 font-bold tabular-nums text-[var(--ayom-ink)]">
                                                    {formatRupiah(family.balance ?? 0)}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-[var(--ayom-muted)]">
                                                    {formatDate(family.created_at)}
                                                </td>

                                                <td className="px-5 py-4 text-right">
                                                    {/* LINK DETAIL DESKTOP */}
                                                    <Link
                                                        href={route(
                                                            "admin.families.show",
                                                            family.id,
                                                        )}
                                                        aria-label={`Lihat detail keluarga ${family.name}`}
                                                        className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-[var(--ayom-border)] bg-white px-3 text-sm font-medium text-[var(--ayom-ink)] transition-colors duration-200 hover:border-[var(--ayom-primary)] hover:text-[var(--ayom-primary)]"
                                                    >
                                                        <span className="hidden lg:inline">
                                                            Lihat Detail
                                                        </span>

                                                        <ArrowRight className="h-4 w-4" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
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