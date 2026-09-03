import { Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import RolePill from '@/Components/Admin/RolePill';
import EmptyState from '@/Components/Admin/EmptyState';
import { formatRupiah, formatDate, initials } from '@/lib/ayom-theme';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';

export default function FamilyDetail({ family }) {
  const members = family?.members ?? [];

  return (
    <AdminLayout
      title={family.name}
      subtitle="Detail keluarga"
      actions={
        <Button asChild variant="outline" size="sm" className="border-[var(--ayom-border)]">
          <Link href={route('admin.families.index')}>← Daftar Keluarga</Link>
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-[var(--ayom-border)] shadow-none lg:col-span-2">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--ayom-muted)]">
              Saldo Keluarga Terpusat
            </p>
            <p className="mt-1.5 text-3xl font-semibold tabular-nums text-[var(--ayom-ink)]">
              {formatRupiah(family.balance)}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[var(--ayom-border)] pt-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-[var(--ayom-muted)]">Pemilik</p>
                <p className="text-sm font-medium text-[var(--ayom-ink)]">{family.owner?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--ayom-muted)]">Jumlah Anggota</p>
                <p className="text-sm font-medium text-[var(--ayom-ink)]">{members.length}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--ayom-muted)]">Terdaftar Sejak</p>
                <p className="text-sm font-medium text-[var(--ayom-ink)]">{formatDate(family.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--ayom-border)] shadow-none">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--ayom-muted)]">Komposisi Peran</p>
            <div className="mt-3 flex flex-col gap-2">
              {['orang_tua', 'lansia', 'remaja'].map((role) => (
                <div key={role} className="flex items-center justify-between text-sm">
                  <RolePill role={role} />
                  <span className="font-semibold tabular-nums text-[var(--ayom-ink)]">
                    {members.filter((m) => m.role === role).length}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 border-[var(--ayom-border)] shadow-none">
        <CardContent className="p-0">
          <div className="border-b border-[var(--ayom-border)] px-5 py-4">
            <h2 className="text-sm font-semibold text-[var(--ayom-ink)]">Anggota Keluarga</h2>
          </div>

          {members.length === 0 ? (
            <div className="p-6">
              <EmptyState title="Belum ada anggota" description="Anggota akan tampil setelah dibuat oleh orang tua atau admin." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--ayom-border)] text-xs uppercase tracking-wide text-[var(--ayom-muted)]">
                    <th className="px-5 py-3 font-medium">Nama</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">Saldo Wallet</th>
                    <th className="px-5 py-3 font-medium">Limit Harian</th>
                    <th className="px-5 py-3 font-medium">Limit Bulanan</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ayom-border)]">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-black/[0.02]">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-black/[0.05] text-[11px] font-semibold text-[var(--ayom-ink)]">
                              {initials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-[var(--ayom-ink)]">{member.name}</p>
                            <p className="text-xs text-[var(--ayom-muted)]">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <RolePill role={member.role} />
                      </td>
                      <td className="px-5 py-3.5 tabular-nums text-[var(--ayom-ink)]">
                        {member.wallet ? formatRupiah(member.wallet.balance) : '—'}
                      </td>
                      <td className="px-5 py-3.5 tabular-nums text-[var(--ayom-muted)]">
                        {member.wallet?.daily_limit ? formatRupiah(member.wallet.daily_limit) : '—'}
                      </td>
                      <td className="px-5 py-3.5 tabular-nums text-[var(--ayom-muted)]">
                        {member.wallet?.monthly_limit ? formatRupiah(member.wallet.monthly_limit) : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            member.is_active
                              ? 'bg-[var(--ayom-primary)]/10 text-[var(--ayom-primary-dark)]'
                              : 'bg-[var(--ayom-danger-soft)] text-[var(--ayom-danger)]'
                          }`}
                        >
                          {member.is_active ? 'Aktif' : 'Nonaktif'}
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
