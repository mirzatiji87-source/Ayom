import { usePage, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import OrangTuaLayout from '@/Layouts/OrangTuaLayout';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import RolePill from '@/Components/Admin/RolePill';
import { formatRupiah } from '@/lib/ayom-theme';
import { CheckCircle2 } from 'lucide-react';

function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-[var(--ayom-ink)]">{label}</Label>
      {children}
      {error ? <p className="text-xs text-[var(--ayom-danger)]">{error}</p> : null}
    </div>
  );
}

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
    <div className="mx-auto max-w-xl">
      {(flash?.success || recentlySuccessful) && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {flash?.success ?? 'Limit berhasil diperbarui.'}
        </div>
      )}

      <Card className="border-[var(--ayom-border)] shadow-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-between border-b border-[var(--ayom-border)] pb-4">
            <div>
              <p className="text-sm font-semibold text-[var(--ayom-ink)]">{member.name}</p>
              <p className="text-xs text-[var(--ayom-muted)]">{member.email}</p>
            </div>
            <RolePill role={member.role} />
          </div>

          <div className="mt-4 rounded-lg bg-black/[0.02] px-4 py-3 text-sm text-[var(--ayom-muted)]">
            Saldo wallet saat ini:{' '}
            <span className="font-semibold text-[var(--ayom-ink)]">{formatRupiah(wallet.balance)}</span>
          </div>

          <form onSubmit={submit} className="mt-5 space-y-5">
            <Field label="Limit Harian (Rp)" error={errors.daily_limit}>
              <Input
                type="number"
                min="0"
                value={data.daily_limit}
                onChange={(e) => setData('daily_limit', e.target.value)}
                className="border-[var(--ayom-border)]"
              />
            </Field>
            <Field label="Limit Bulanan (Rp)" error={errors.monthly_limit}>
              <Input
                type="number"
                min="0"
                value={data.monthly_limit}
                onChange={(e) => setData('monthly_limit', e.target.value)}
                className="border-[var(--ayom-border)]"
              />
            </Field>
            <Field label="Ambang Approval (Rp)" error={errors.approval_threshold}>
              <Input
                type="number"
                min="0"
                value={data.approval_threshold}
                onChange={(e) => setData('approval_threshold', e.target.value)}
                className="border-[var(--ayom-border)]"
              />
              <p className="text-xs text-[var(--ayom-muted)]">
                Transaksi di atas jumlah ini wajib disetujui orang tua sebelum diproses.
              </p>
            </Field>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={processing} className="bg-emerald-600 text-white hover:bg-emerald-700">
                {processing ? 'Menyimpan…' : 'Simpan Limit'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
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