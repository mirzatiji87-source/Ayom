import { usePage, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import OrangTuaLayout from '@/Layouts/OrangTuaLayout';
import { Input } from '@/Components/ui/input';
import RolePill from '@/Components/Admin/RolePill';
import {
    Field,
    FlashMessage,
    Hero,
    SHAPE_CARD,
    btnPrimary,
    inputCls,
} from '@/Components/OrangTua/ui';
import { formatRupiah } from '@/lib/ayom-theme';

export default function SetLimit({ member }) {
    const { flash } = usePage().props;
    const wallet = member.wallet ?? {};

    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        daily_limit: wallet.daily_limit ?? '',
        monthly_limit: wallet.monthly_limit ?? '',
        approval_threshold: wallet.approval_threshold ?? '',
    });

    function submit(e) {
        e.preventDefault();
        put(route('wallet.limit.update', member.id), { preserveScroll: true });
    }

    return (
        <div className="mx-auto w-full max-w-2xl space-y-6">
            <FlashMessage type="success">
                {flash?.success || (recentlySuccessful ? 'Limit berhasil diperbarui.' : null)}
            </FlashMessage>

            <Hero>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="break-words font-serif text-2xl sm:text-3xl">{member.name}</p>
                        <p className="break-all text-base text-white/85">{member.email}</p>
                    </div>
                    <RolePill role={member.role} />
                </div>

                <p className="mt-6 text-lg text-white/85">Saldo wallet saat ini</p>
                <p className="break-words text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl">
                    {formatRupiah(wallet.balance)}
                </p>
            </Hero>

            <form
                onSubmit={submit}
                className={`space-y-6 bg-white p-6 ring-1 ring-slate-200 sm:p-8 ${SHAPE_CARD}`}
            >
                <Field label="Limit Harian (Rp)" htmlFor="daily_limit" error={errors.daily_limit}>
                    <Input
                        id="daily_limit"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={data.daily_limit}
                        onChange={(e) => setData('daily_limit', e.target.value)}
                        className={inputCls}
                    />
                </Field>

                <Field label="Limit Bulanan (Rp)" htmlFor="monthly_limit" error={errors.monthly_limit}>
                    <Input
                        id="monthly_limit"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={data.monthly_limit}
                        onChange={(e) => setData('monthly_limit', e.target.value)}
                        className={inputCls}
                    />
                </Field>

                <Field
                    label="Ambang Approval (Rp)"
                    htmlFor="approval_threshold"
                    error={errors.approval_threshold}
                    hint="Transaksi di atas jumlah ini wajib disetujui orang tua sebelum diproses."
                >
                    <Input
                        id="approval_threshold"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={data.approval_threshold}
                        onChange={(e) => setData('approval_threshold', e.target.value)}
                        className={inputCls}
                    />
                </Field>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className={`${btnPrimary} w-full sm:w-auto`}
                    >
                        {processing ? 'Menyimpan…' : 'Simpan Limit'}
                    </button>
                </div>
            </form>
        </div>
    );
}

SetLimit.layout = (page) => {
    const isAdmin = page.props.auth.user.role === 'admin';
    const Layout = isAdmin ? AdminLayout : OrangTuaLayout;
    return (
        <Layout title="Atur Limit Wallet" subtitle="Ubah limit harian, bulanan, dan ambang approval">
            {page}
        </Layout>
    );
};