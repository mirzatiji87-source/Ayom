// resources/js/Pages/OrangTua/GuardianMemberDetail.jsx
import { Head, Link, usePage } from "@inertiajs/react";
import { Receipt, Settings, Wallet } from "lucide-react";

import OrangTuaLayout from "@/Layouts/OrangTuaLayout";
import CreateBillDialog from "@/Components/OrangTua/CreateBillDialog";
import {
    BackLink,
    EmptyState,
    Hero,
    LimitBar,
    Pagination,
    Panel,
    RoleBadge,
    SHAPE_CARD,
    SHAPE_CARD_ALT,
    SectionHead,
    TrxList,
    btnPrimary,
} from "@/Components/OrangTua/ui";
import { formatDate, formatRupiah, initials } from "@/lib/ayom-theme";

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

            <div className="mx-auto w-full max-w-6xl space-y-8 sm:space-y-10">
                <BackLink href={route("orang-tua.guardian-view")}>
                    Kembali ke Guardian View
                </BackLink>

                {/* PROFIL + SALDO */}
                <Hero>
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-4">
                            <span
                                aria-hidden="true"
                                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/15 text-xl font-bold text-white"
                            >
                                {initials(member?.name)}
                            </span>

                            <div className="min-w-0">
                                <h2 className="break-words font-serif text-3xl leading-snug sm:text-4xl">
                                    {member?.name}
                                </h2>
                                <RoleBadge role={member?.role} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <p className="text-lg text-white/85">Saldo saat ini</p>
                            <p className="break-words text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl">
                                {formatRupiah(wallet?.balance)}
                            </p>
                        </div>
                    </div>
                </Hero>

                {/* TAGIHAN */}
                <section>
                    <SectionHead
                        title="Tagihan"
                        desc={`Tagihan rutin milik ${member?.name}.`}
                        action={<CreateBillDialog userId={member?.id} />}
                    />

                    <Panel>
                        {bills.length === 0 ? (
                            <EmptyState icon={Receipt}>
                                Belum ada tagihan untuk anggota ini.
                            </EmptyState>
                        ) : (
                            <ul>
                                {bills.map((bill) => (
                                    <li
                                        key={bill.id}
                                        className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 py-4 last:border-b-0"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-lg font-semibold text-slate-900">
                                                {bill.name}
                                            </p>
                                            <p className="mt-0.5 text-base text-slate-600">
                                                {formatRupiah(bill.amount)} · Jatuh tempo{" "}
                                                {formatDate(bill.next_due_date)}
                                            </p>
                                        </div>

                                        <span
                                            className={`rounded-full px-3 py-1 text-sm font-semibold ${
                                                bill.is_active
                                                    ? "bg-emerald-100 text-emerald-900"
                                                    : "bg-slate-200 text-slate-800"
                                            }`}
                                        >
                                            {bill.is_active ? "Aktif" : "Nonaktif"}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Panel>
                </section>

                {/* LIMIT + PENGATURAN */}
                <section className="grid gap-5 sm:gap-6 lg:grid-cols-2">
                    <div className={`bg-white p-6 ring-1 ring-slate-200 sm:p-8 ${SHAPE_CARD}`}>
                        <div className="mb-5 flex items-center gap-3">
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ayom-primary)] text-white">
                                <Wallet className="h-6 w-6" />
                            </span>
                            <h2 className="font-serif text-2xl text-slate-900">Limit Wallet</h2>
                        </div>

                        <div className="space-y-5">
                            <LimitBar
                                showEmpty
                                label="Limit harian"
                                spent={wallet?.daily_spent}
                                limit={wallet?.daily_limit}
                            />
                            <LimitBar
                                showEmpty
                                label="Limit bulanan"
                                spent={wallet?.monthly_spent}
                                limit={wallet?.monthly_limit}
                                barClassName="[&>div]:bg-slate-500"
                            />
                        </div>
                    </div>

                    <div
                        className={`flex flex-col bg-white p-6 ring-1 ring-slate-200 sm:p-8 ${SHAPE_CARD_ALT}`}
                    >
                        <div className="mb-5 flex items-center gap-3">
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ayom-primary)] text-white">
                                <Settings className="h-6 w-6" />
                            </span>
                            <h2 className="font-serif text-2xl text-slate-900">Pengaturan</h2>
                        </div>

                        <p className="text-base text-slate-700">
                            Ambang approval saat ini:{" "}
                            <span className="font-bold text-slate-900">
                                {formatRupiah(wallet?.approval_threshold)}
                            </span>
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                            Transaksi di atas jumlah ini wajib disetujui sebelum diproses.
                        </p>

                        <Link
                            href={route("wallet.limit.edit", member?.id)}
                            className={`${btnPrimary} mt-6 w-full self-start sm:w-auto lg:mt-auto`}
                        >
                            Atur Limit
                        </Link>
                    </div>
                </section>

                {/* TRANSAKSI */}
                <section>
                    <SectionHead
                        title="Riwayat Transaksi"
                        desc={`Seluruh transaksi ${member?.name}.`}
                    />

                    <TrxList rows={rows} />
                    <Pagination prevUrl={prevUrl} nextUrl={nextUrl} />
                </section>
            </div>
        </OrangTuaLayout>
    );
}