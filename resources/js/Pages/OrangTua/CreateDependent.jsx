import { useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import OrangTuaLayout from '@/Layouts/OrangTuaLayout';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';

function Field({ label, error, children, hint }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-[var(--ayom-ink)]">{label}</Label>
      {children}
      {hint && !error ? <p className="text-xs text-[var(--ayom-muted)]">{hint}</p> : null}
      {error ? <p className="text-xs text-[var(--ayom-danger)]">{error}</p> : null}
    </div>
  );
}

export default function CreateDependent({ families = [] }) {
  const { auth } = usePage().props;
  const isAdmin = auth.user.role === 'admin';

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'remaja',
    phone: '',
    date_of_birth: '',
    family_id: '',
    daily_limit: '',
    monthly_limit: '',
    approval_threshold: '',
  });

  function submit(e) {
    e.preventDefault();
    post(route('dependents.store'), { preserveScroll: true });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="border-[var(--ayom-border)] shadow-none">
        <CardContent className="p-6">
          <p className="text-sm text-[var(--ayom-muted)]">
            Buat akun untuk anggota keluarga yang tidak bisa mendaftar sendiri — lansia atau remaja.
            Wallet dengan limit default akan otomatis dibuat bersamaan.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Nama Lengkap" error={errors.name}>
                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} className="border-[var(--ayom-border)]" />
              </Field>
              <Field label="Peran" error={errors.role}>
                <Select value={data.role} onValueChange={(v) => setData('role', v)}>
                  <SelectTrigger className="border-[var(--ayom-border)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remaja">Remaja</SelectItem>
                    <SelectItem value="lansia">Lansia</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Email" error={errors.email}>
                <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="border-[var(--ayom-border)]" />
              </Field>
              <Field label="Nomor Telepon" error={errors.phone} hint="Opsional">
                <Input value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="border-[var(--ayom-border)]" />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Kata Sandi" error={errors.password}>
                <Input
                  type="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  className="border-[var(--ayom-border)]"
                />
              </Field>
              <Field label="Konfirmasi Kata Sandi" error={errors.password_confirmation}>
                <Input
                  type="password"
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  className="border-[var(--ayom-border)]"
                />
              </Field>
            </div>

            {isAdmin && (
              <Field label="Keluarga" error={errors.family_id} hint="Admin memilih keluarga tujuan akun ini">
                <Select value={data.family_id ? String(data.family_id) : ''} onValueChange={(v) => setData('family_id', v)}>
                  <SelectTrigger className="border-[var(--ayom-border)]">
                    <SelectValue placeholder="Pilih keluarga…" />
                  </SelectTrigger>
                  <SelectContent>
                    {families.map((f) => (
                      <SelectItem key={f.id} value={String(f.id)}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}

            <Field label="Tanggal Lahir" error={errors.date_of_birth} hint="Opsional">
              <Input
                type="date"
                value={data.date_of_birth}
                onChange={(e) => setData('date_of_birth', e.target.value)}
                className="border-[var(--ayom-border)] sm:w-56"
              />
            </Field>

            <div className="rounded-lg border border-[var(--ayom-border)] bg-black/[0.015] p-4">
              <p className="text-sm font-medium text-[var(--ayom-ink)]">Pengaturan Wallet Awal</p>
              <p className="mt-0.5 text-xs text-[var(--ayom-muted)]">
                Kosongkan untuk memakai nilai default (limit harian Rp 50.000, bulanan Rp 1.000.000, ambang approval Rp 100.000).
              </p>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Limit Harian" error={errors.daily_limit}>
                  <Input
                    type="number"
                    min="0"
                    value={data.daily_limit}
                    onChange={(e) => setData('daily_limit', e.target.value)}
                    className="border-[var(--ayom-border)]"
                  />
                </Field>
                <Field label="Limit Bulanan" error={errors.monthly_limit}>
                  <Input
                    type="number"
                    min="0"
                    value={data.monthly_limit}
                    onChange={(e) => setData('monthly_limit', e.target.value)}
                    className="border-[var(--ayom-border)]"
                  />
                </Field>
                <Field label="Ambang Approval" error={errors.approval_threshold}>
                  <Input
                    type="number"
                    min="0"
                    value={data.approval_threshold}
                    onChange={(e) => setData('approval_threshold', e.target.value)}
                    className="border-[var(--ayom-border)]"
                  />
                </Field>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="submit" disabled={processing} className="bg-[var(--ayom-primary)] hover:bg-[var(--ayom-primary-dark)]">
                {processing ? 'Menyimpan…' : 'Buat Akun'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Layout dipilih dinamis: admin & orang_tua sama-sama memakai halaman ini,
// tapi shell/nav-nya berbeda sesuai role yang sedang login.
CreateDependent.layout = (page) => {
  const isAdmin = page.props.auth.user.role === 'admin';
  const Layout = isAdmin ? AdminLayout : OrangTuaLayout;
  return (
    <Layout title="Buat Akun Dependent" subtitle="Tambah akun lansia atau remaja">
      {page}
    </Layout>
  );
};
