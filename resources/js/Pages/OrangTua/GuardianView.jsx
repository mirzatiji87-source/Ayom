// resources/js/Pages/OrangTua/GuardianView.jsx

import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Eye, Wallet } from 'lucide-react';

import OrangTuaLayout from '@/Layouts/OrangTuaLayout';
import {
    EmptyState,
    FlashMessage,
    InitialsAvatar,
    LimitBar,
    Pagination,
    Panel,
    RoleBadge,
    SHAPE_CARD,
    SHAPE_CARD_ALT,
    SectionHead,
    TrxList,
    btnPrimary,
} from '@/Components/OrangTua/ui';
import { formatRupiah } from '@/lib/ayom-theme';

const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: (index = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: index * 0.06, duration: 0.4, ease: 'easeOut' },
    }),
};

function MemberRow({ member, index }) {
    const wallet = member.wallet;

    return (
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={index}>
            <div
                className={`flex flex-col gap-6 bg-white p-5 ring-1 ring-slate-200 transition-all duration-300 hover:ring-[var(--ayom-primary)] sm:p-7 lg:flex-row lg:items-center lg:justify-between ${
                    index % 2 === 0 ? SHAPE_CARD : SHAPE_CARD_ALT
                }`}
            >
                <div className="flex min-w-0 items-center gap-4 lg:w-64 lg:shrink-0">
                    <InitialsAvatar name={member.name} />

                    <div className="min-w-0">
                        <p className="truncate text-lg font-semibold text-slate-900">
                            {member.name}
                        </p>
                        <RoleBadge role={member.role} className="mt-1" />
                    </div>
                </div>

                <div className="grid flex-1 gap-5 sm:grid-cols-2 lg:max-w-xl">
                    <LimitBar
                        label="Limit harian"
                        spent={wallet?.daily_spent}
                        limit={wallet?.daily_limit}
                    />
                    <LimitBar
                        label="Limit bulanan"
                        spent={wallet?.monthly_spent}
                        limit={wallet?.monthly_limit}
                        barClassName="[&>div]:bg-slate-500"
                    />
                </div>

                <div className="flex items-center justify-between gap-4 lg:shrink-0 lg:justify-end">
                    <p className="text-2xl font-extrabold tabular-nums text-slate-900">
                        {formatRupiah(wallet?.balance)}
                    </p>

                    <Link
                        href={route('orang-tua.guardian-view.show', member.id)}
                        className={btnPrimary}
                    >
                        <Eye className="h-5 w-5" />
                        Detail
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

export default function GuardianView() {
    const { members = [], transactions, flash } = usePage().props;

    const rows = transactions?.data ?? [];
    const prevUrl = transactions?.prev_page_url ?? null;
    const nextUrl = transactions?.next_page_url ?? null;

    return (
        <OrangTuaLayout
            title="Guardian View"
            subtitle="Pantau arus kas belanja lansia dan remaja secara transparan"
        >
            <Head title="Guardian View" />

            <div className="mx-auto w-full max-w-6xl space-y-8 sm:space-y-10">
                <FlashMessage type="success">{flash?.success}</FlashMessage>

                <section>
                    <SectionHead
                        title="Anggota Keluarga"
                        desc="Saldo dan pemakaian limit tiap anggota."
                    />

                    {members.length === 0 ? (
                        <Panel className="py-6">
                            <EmptyState icon={Wallet}>
                                Belum ada anggota lansia/remaja untuk dipantau.
                            </EmptyState>
                        </Panel>
                    ) : (
                        <div className="space-y-4">
                            {members.map((member, index) => (
                                <MemberRow key={member.id} member={member} index={index} />
                            ))}
                        </div>
                    )}
                </section>

                <section>
                    <SectionHead
                        title="Riwayat Transaksi"
                        desc="Seluruh transaksi anggota keluarga."
                    />

                    <TrxList rows={rows} showUser alt />
                    <Pagination prevUrl={prevUrl} nextUrl={nextUrl} />
                </section>
            </div>
        </OrangTuaLayout>
    );
}