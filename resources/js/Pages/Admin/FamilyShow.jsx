// resources/js/Pages/Admin/FamilyShow.jsx
import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import {
    AlertTriangle,
    ArrowLeft,
    Loader2,
    Power,
    Trash2,
    UserPlus,
} from "lucide-react";

import AdminLayout from "@/Layouts/AdminLayout";
import RolePill from "@/Components/Admin/RolePill";
import { initials } from "@/lib/ayom-theme";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";

const rupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));

const actionBtn =
    "inline-flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ayom-primary)] disabled:cursor-not-allowed disabled:opacity-50";

export default function FamilyShow({ family, members }) {
    // confirm = { member, mode: "deactivate" | "delete" } atau null
    const [confirm, setConfirm] = useState(null);
    const [busy, setBusy] = useState(false);

    const aktif = members.filter((m) => m.is_active).length;

    function run() {
        if (!confirm) return;
        const { member, mode } = confirm;

        const opts = {
            preserveScroll: true,
            onStart: () => setBusy(true),
            onFinish: () => {
                setBusy(false);
                setConfirm(null);
            },
        };

        if (mode === "deactivate") {
            router.delete(route("dependents.destroy", member.id), opts);
        } else {
            router.delete(route("admin.members.force-destroy", member.id), opts);
        }
    }

    function reactivate(member) {
        router.put(
            route("admin.members.reactivate", member.id),
            {},
            { preserveScroll: true },
        );
    }

    return (
        <AdminLayout
            title={family.name}
            subtitle={
                family.owner
                    ? `Pemilik: ${family.owner} • ${aktif} dari ${members.length} anggota aktif`
                    : `${aktif} dari ${members.length} anggota aktif`
            }
        >
            <div className="mx-auto w-full max-w-4xl space-y-5">
                {/* aksi atas */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href={route("admin.families.index")}
                        className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-medium text-[var(--ayom-muted)] hover:text-[var(--ayom-ink)]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Semua keluarga
                    </Link>

                    <Link
                        href={route("dependents.create", {
                            family_id: family.id,
                        })}
                        className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--ayom-primary)] px-4 text-sm font-semibold text-[var(--ayom-primary-foreground)] transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ayom-primary)] focus-visible:ring-offset-2"
                    >
                        <UserPlus className="h-4 w-4" />
                        Tambah anggota
                    </Link>
                </div>

                {/* daftar anggota */}
                {members.length === 0 ? (
                    <section className="rounded-xl border border-dashed border-[var(--ayom-border)] bg-[var(--ayom-surface)] px-6 py-12 text-center">
                        <p className="text-base font-semibold text-[var(--ayom-ink)]">
                            Belum ada anggota
                        </p>
                        <p className="mt-1 text-sm text-[var(--ayom-muted)]">
                            Tambah anggota pertama untuk keluarga ini.
                        </p>
                    </section>
                ) : (
                    <ul className="divide-y divide-[var(--ayom-border)] overflow-hidden rounded-xl border border-[var(--ayom-border)] bg-[var(--ayom-surface)]">
                        {members.map((m) => {
                            const bisaHapus =
                                m.transactions_count === 0 && m.balance <= 0;

                            return (
                                <li
                                    key={m.id}
                                    className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 ${
                                        m.is_active ? "" : "bg-black/[0.03]"
                                    }`}
                                >
                                    <div className="flex min-w-0 flex-1 items-start gap-3">
                                        <span
                                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                                            style={{
                                                backgroundColor:
                                                    "var(--ayom-primary)",
                                                color: "var(--ayom-primary-foreground)",
                                                opacity: m.is_active ? 1 : 0.45,
                                            }}
                                        >
                                            {initials(m.name)}
                                        </span>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                <p className="truncate text-base font-semibold text-[var(--ayom-ink)]">
                                                    {m.name}
                                                </p>
                                                <RolePill role={m.role} />
                                                {!m.is_active && (
                                                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                                        Nonaktif
                                                    </span>
                                                )}
                                                {m.possible_duplicate && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Mungkin dobel
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-0.5 break-all text-sm text-[var(--ayom-muted)]">
                                                {m.email}
                                            </p>

                                            <p className="mt-0.5 text-sm text-[var(--ayom-muted)]">
                                                {m.role === "orang_tua"
                                                    ? "Tanpa dompet"
                                                    : `Saldo ${rupiah(m.balance)}`}{" "}
                                                • {m.transactions_count}{" "}
                                                transaksi
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 sm:shrink-0 sm:justify-end">
                                        {m.is_active ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setConfirm({
                                                        member: m,
                                                        mode: "deactivate",
                                                    })
                                                }
                                                className={`${actionBtn} flex-1 border-[var(--ayom-border)] bg-[var(--ayom-surface)] text-[var(--ayom-ink)] hover:bg-black/[0.04] sm:flex-none`}
                                            >
                                                <Power className="h-4 w-4" />
                                                Nonaktifkan
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => reactivate(m)}
                                                className={`${actionBtn} flex-1 border-[var(--ayom-border)] bg-[var(--ayom-surface)] text-[var(--ayom-ink)] hover:bg-black/[0.04] sm:flex-none`}
                                            >
                                                <Power className="h-4 w-4" />
                                                Aktifkan
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            disabled={!bisaHapus}
                                            title={
                                                bisaHapus
                                                    ? undefined
                                                    : "Akun yang punya transaksi atau saldo tidak bisa dihapus permanen. Gunakan Nonaktifkan."
                                            }
                                            onClick={() =>
                                                setConfirm({
                                                    member: m,
                                                    mode: "delete",
                                                })
                                            }
                                            className={`${actionBtn} flex-1 border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 sm:flex-none`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Hapus
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

                <p className="text-sm text-[var(--ayom-muted)]">
                    Hapus permanen hanya tersedia untuk akun tanpa transaksi dan
                    tanpa saldo, misalnya akun dobel yang baru dibuat. Akun lain
                    cukup dinonaktifkan supaya riwayat keuangannya tetap utuh.
                </p>
            </div>

            {/* dialog konfirmasi */}
            <Dialog
                open={!!confirm}
                onOpenChange={(open) => {
                    if (!open && !busy) setConfirm(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {confirm?.mode === "delete"
                                ? "Hapus akun permanen?"
                                : "Nonaktifkan akun?"}
                        </DialogTitle>
                        <DialogDescription>
                            {confirm?.mode === "delete"
                                ? `Akun ${confirm?.member.name} (${confirm?.member.email}) akan dihapus permanen dan tidak bisa dikembalikan.`
                                : `${confirm?.member.name} tidak akan bisa masuk ke Ayom lagi. Riwayat transaksinya tetap tersimpan dan akun bisa diaktifkan kembali kapan saja.`}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => setConfirm(null)}
                            className={`${actionBtn} border-[var(--ayom-border)] bg-[var(--ayom-surface)] text-[var(--ayom-ink)] hover:bg-black/[0.04]`}
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={run}
                            className={`${actionBtn} ${
                                confirm?.mode === "delete"
                                    ? "border-rose-700 bg-rose-700 text-white hover:bg-rose-800"
                                    : "border-[var(--ayom-primary)] bg-[var(--ayom-primary)] text-[var(--ayom-primary-foreground)] hover:opacity-90"
                            }`}
                        >
                            {busy && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            {confirm?.mode === "delete"
                                ? "Ya, hapus permanen"
                                : "Ya, nonaktifkan"}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}