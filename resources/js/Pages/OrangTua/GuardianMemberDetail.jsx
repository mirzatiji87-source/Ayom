// resources/js/Pages/OrangTua/GuardianMemberDetail.jsx
import CreateBillDialog from "@/Components/OrangTua/CreateBillDialog";
import { initials, formatDate } from "@/lib/ayom-theme";
import {
    ArrowLeft,
    ArrowRight,
    Wallet,
    Settings,
    ArrowUpRight,
    Receipt,
} from "lucide-react";
import { Head, Link, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";

import OrangTuaLayout from "@/Layouts/OrangTuaLayout";

import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Progress } from "@/Components/ui/progress";




const rupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));

const roleLabel = {
    lansia: "Lansia",
    remaja: "Remaja",
};

const typeLabel = {
    topup: "Top-up",
    expense: "Pengeluaran",
    transfer: "Transfer",
    bill_payment: "Bayar Tagihan",
    allowance: "Uang Saku",
};

const statusVariant = {
    completed: "default",
    pending: "secondary",
    approved: "default",
    rejected: "destructive",
};

function LimitBar({
    label,
    spent,
    limit,
    trackClassName = "bg-slate-100",
    barClassName = "bg-[var(--ayom-primary)]",
}) {
    if (limit === null || limit === undefined || Number(limit) <= 0) {
        return <p className="text-sm text-slate-400">{label}: belum diatur.</p>;
    }

    const rawPct = (Number(spent ?? 0) / Number(limit)) * 100;
    const pct = Math.min(100, rawPct);
    const isOver = rawPct > 100;
    const isNear = rawPct >= 80 && rawPct <= 100;

    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-500">{label}</span>
                <span
                    className={`font-medium tabular-nums ${isOver ? "text-rose-600" : "text-slate-700"}`}
                >
                    {rupiah(spent)}
                    <span className="text-slate-400"> / {rupiah(limit)}</span>
                </span>
            </div>

            <Progress
                value={pct}
                className={`h-2.5 rounded-full ${isOver ? "bg-rose-100" : trackClassName} [&>div]:rounded-full ${
                    isOver
                        ? "[&>div]:bg-rose-500"
                        : isNear
                          ? "[&>div]:bg-amber-500"
                          : `[&>div]:${barClassName}`
                }`}
            />

            {isOver && (
                <p className="mt-1 text-xs font-medium text-rose-600">
                    Melebihi limit
                </p>
            )}
        </div>
    );
}

export default function GuardianMemberDetail() {
    const { member, transactions, bills = [] } = usePage().props;
    const wallet = member?.wallet;

    const rows = transactions?.data ?? [];
    const prevUrl = transactions?.prev_page_url ?? null;
    const nextUrl = transactions?.next_page_url ?? null;

    return (
        <OrangTuaLayout
            title={member?.name ?? "Detail Anggota"}
            subtitle="Detail saldo, limit, dan riwayat transaksi"
        >
            <Head title={member?.name ?? "Detail Anggota"} />

            <div className="space-y-6">
                <Link
                    href={route("orang-tua.guardian-view")}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--ayom-primary)] hover:opacity-80"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Guardian View
                </Link>

                {/* PROFIL + SALDO */}
                <motion.section
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--ayom-primary)] via-[var(--ayom-primary)] to-[var(--ayom-primary-dark)] p-6 text-white shadow-xl shadow-slate-200/50 sm:p-8"
                >
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10"
                    />

                    <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold text-white backdrop-blur">
                                {initials(member?.name)}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold sm:text-2xl">
                                    {member?.name}
                                </h1>
                                <Badge
                                    variant="outline"
                                    className="mt-1.5 rounded-full border-white/30 bg-white/10 text-white"
                                >
                                    {roleLabel[member?.role] ?? member?.role}
                                </Badge>
                            </div>
                        </div>

                        <div className="text-left sm:text-right">
                            <p className="text-sm text-white/80">
                                Saldo saat ini
                            </p>
                            <p className="text-2xl font-bold sm:text-3xl">
                                {rupiah(wallet?.balance)}
                            </p>
                        </div>
                    </div>
                </motion.section>

                {/* TAGIHAN */}
<section>
    <div className="mb-4 flex items-center justify-between">
        <div>
            <h2 className="text-xl font-bold text-slate-900">Tagihan</h2>
            <p className="mt-1 text-sm text-slate-500">Tagihan rutin milik {member?.name}.</p>
        </div>
        <CreateBillDialog userId={member?.id} />
    </div>

    {bills.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-slate-200 bg-slate-50/40">
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
                <Receipt className="h-8 w-8 text-slate-300" />
                <p className="text-sm text-slate-500">Belum ada tagihan untuk anggota ini.</p>
            </CardContent>
        </Card>
    ) : (
        <div className="space-y-3">
            {bills.map((bill) => (
                <Card key={bill.id} className="rounded-2xl border-slate-200">
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                        <div className="min-w-0">
                            <p className="font-semibold text-slate-900">{bill.name}</p>
                            <p className="mt-0.5 text-sm text-slate-500">
                                {rupiah(bill.amount)} · Jatuh tempo {formatDate(bill.next_due_date)}
                            </p>
                        </div>
                        <Badge variant={bill.is_active ? 'outline' : 'secondary'} className="rounded-full">
                            {bill.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                    </CardContent>
                </Card>
            ))}
        </div>
    )}
</section>

                {/* LIMIT + ACTION */}
                <section className="grid gap-4 sm:grid-cols-2">
                    <Card className="rounded-3xl border-slate-200 shadow-sm">
                        <CardContent className="p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-[var(--ayom-primary)]" />
                                <h2 className="text-base font-bold text-slate-900">
                                    Limit Wallet
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <LimitBar
                                    label="Limit harian"
                                    spent={wallet?.daily_spent}
                                    limit={wallet?.daily_limit}
                                />
                                <LimitBar
                                    label="Limit bulanan"
                                    spent={wallet?.monthly_spent}
                                    limit={wallet?.monthly_limit}
                                    trackClassName="bg-slate-100"
                                    barClassName="bg-slate-500"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col justify-between rounded-3xl border-slate-200 shadow-sm">
                        <CardContent className="p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <Settings className="h-5 w-5 text-[var(--ayom-primary)]" />
                                <h2 className="text-base font-bold text-slate-900">
                                    Pengaturan
                                </h2>
                            </div>

                            <p className="text-sm text-slate-500">
                                Ambang approval saat ini:{" "}
                                <span className="font-semibold text-slate-900">
                                    {rupiah(wallet?.approval_threshold)}
                                </span>
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                Transaksi di atas jumlah ini wajib disetujui
                                sebelum diproses.
                            </p>

                            <Link
                                href={route("wallet.limit.edit", member?.id)}
                                className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[var(--ayom-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--ayom-primary-dark)] active:scale-[0.98]"
                            >
                                Atur Limit
                            </Link>
                        </CardContent>
                    </Card>
                </section>

                {/* TRANSAKSI */}
                <section>
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-slate-900">
                            Riwayat Transaksi
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Seluruh transaksi {member?.name}.
                        </p>
                    </div>

                    <Card className="overflow-hidden rounded-3xl border-slate-200">
                        <CardContent className="divide-y divide-slate-100 p-0">
                            {rows.length === 0 ? (
                                <div className="p-8 text-center">
                                    <ArrowUpRight className="mx-auto h-8 w-8 text-slate-300" />
                                    <p className="mt-3 text-sm text-slate-500">
                                        Belum ada transaksi.
                                    </p>
                                </div>
                            ) : (
                                rows.map((trx) => (
                                    <div
                                        key={trx.id}
                                        className="flex items-center justify-between gap-4 p-5 transition hover:bg-slate-50"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-slate-900">
                                                {typeLabel[trx.type] ??
                                                    trx.type}
                                            </p>
                                            <p className="mt-1 truncate text-sm text-slate-500">
                                                {trx.description ?? "-"}
                                            </p>
                                        </div>

                                        <div className="shrink-0 text-right">
                                            <p className="font-bold tabular-nums text-slate-900">
                                                {rupiah(trx.amount)}
                                            </p>
                                            <Badge
                                                variant={
                                                    statusVariant[trx.status] ??
                                                    "outline"
                                                }
                                                className="mt-1 rounded-full"
                                            >
                                                {trx.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {(prevUrl || nextUrl) && (
                        <div className="mt-4 flex items-center justify-between">
                            {prevUrl ? (
                                <Link
                                    href={prevUrl}
                                    className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--ayom-primary)] hover:opacity-80"
                                >
                                    <ArrowLeft className="h-4 w-4" /> Sebelumnya
                                </Link>
                            ) : (
                                <span />
                            )}

                            {nextUrl ? (
                                <Link
                                    href={nextUrl}
                                    className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--ayom-primary)] hover:opacity-80"
                                >
                                    Selanjutnya{" "}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <span />
                            )}
                        </div>
                    )}
                </section>
            </div>
        </OrangTuaLayout>
    );
}
