import { Link } from '@inertiajs/react';
import AdminLayout, { AyomMark } from '@/Layouts/AdminLayout';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import RolePill from '@/Components/Admin/RolePill';
import EmptyState from '@/Components/Admin/EmptyState';
import { formatRupiah, formatDateTime, roleMeta } from '@/lib/ayom-theme';

const ROLE_ORDER = ['admin', 'orang_tua', 'lansia', 'remaja'];

function StatTile({ label, value, hint }) {
  return (
    <Card className="border-[var(--ayom-border)] shadow-none">
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--ayom-muted)]">{label}</p>
        <p className="mt-1.5 text-2xl font-semibold tabular-nums text-[var(--ayom-ink)]">{value}</p>
        {hint ? <p className="mt-1 text-xs text-[var(--ayom-muted)]">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

function RoleDistributionBar({ byRole, total }) {
  if (!total) return null;
  return (
    <div className="mt-4">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-black/[0.04]">
        {ROLE_ORDER.map((role) => {
          const count = byRole[role] ?? 0;
          if (!count) return null;
          const pct = (count / total) * 100;
          return (
            <div
              key={role}
              style={{ width: `${pct}%`, backgroundColor: roleMeta(role).dot }}
              title={`${roleMeta(role).label}: ${count}`}
            />
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {ROLE_ORDER.map((role) => (
          <div key={role} className="flex items-center gap-1.5 text-xs text-[var(--ayom-muted)]">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: roleMeta(role).dot }} />
            {roleMeta(role).label}
            <span className="font-semibold text-[var(--ayom-ink)]">{byRole[role] ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ stats, recentFamilies = [], recentActivity = [] }) {
  const s = {
    total_families: 0,
    total_users: 0,
    total_balance: 0,
    pending_approvals: 0,
    active_bills: 0,
    users_by_role: {},
    ...stats,
  };

  return (
    <AdminLayout title="Dashboard" subtitle="Ringkasan seluruh platform Ayom">
      {/* Hero + tiles — asimetris: saldo total jadi fokus utama */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="relative overflow-hidden border-[var(--ayom-border)] bg-[var(--ayom-primary)] text-[var(--ayom-primary-foreground)] shadow-none lg:col-span-2">
          <div className="absolute -right-6 -top-6 opacity-15">
            <AyomMark size={140} />
          </div>
          <CardContent className="relative p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--ayom-primary-foreground)]/70">
              Total saldo keluarga se-platform
            </p>
            <p className="mt-2 text-4xl font-semibold tabular-nums">{formatRupiah(s.total_balance)}</p>
            <p className="mt-2 max-w-md text-sm text-[var(--ayom-primary-foreground)]/80">
              Akumulasi saldo dari seluruh keluarga terdaftar, termasuk yang belum pernah top-up.
            </p>
            <RoleDistributionBar byRole={s.users_by_role} total={s.total_users} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          <StatTile label="Total Keluarga" value={s.total_families} hint="Terdaftar di platform" />
          <StatTile label="Total Pengguna" value={s.total_users} hint="Seluruh role" />
          <StatTile
            label="Approval Tertunda"
            value={s.pending_approvals}
            hint={s.pending_approvals > 0 ? 'Menunggu tindakan orang tua' : 'Tidak ada yang tertunda'}
          />
          <StatTile label="Tagihan Aktif" value={s.active_bills} hint="Auto-pilot bills berjalan" />
        </div>
      </div>

      {/* Keluarga terbaru + aktivitas terbaru */}
      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="border-[var(--ayom-border)] shadow-none xl:col-span-3">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-[var(--ayom-border)] px-5 py-4">
              <h2 className="text-sm font-semibold text-[var(--ayom-ink)]">Keluarga Terbaru</h2>
              <Link
                href={route('admin.families.index')}
                className="text-xs font-medium text-[var(--ayom-primary)] hover:underline"
              >
                Lihat semua
              </Link>
            </div>

            {recentFamilies.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  title="Belum ada keluarga terdaftar"
                  description="Keluarga baru muncul di sini begitu orang tua mendaftar."
                />
              </div>
            ) : (
              <ul className="divide-y divide-[var(--ayom-border)]">
                {recentFamilies.map((family) => (
                  <li key={family.id}>
                    <Link
                      href={route('admin.families.show', family.id)}
                      className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-black/[0.02]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--ayom-ink)]">{family.name}</p>
                        <p className="truncate text-xs text-[var(--ayom-muted)]">
                          Pemilik: {family.owner?.name ?? '—'} · {family.members_count} anggota
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold tabular-nums text-[var(--ayom-ink)]">
                        {formatRupiah(family.balance)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-[var(--ayom-border)] shadow-none xl:col-span-2">
          <CardContent className="p-0">
            <div className="border-b border-[var(--ayom-border)] px-5 py-4">
              <h2 className="text-sm font-semibold text-[var(--ayom-ink)]">Aktivitas Terbaru</h2>
            </div>

            {recentActivity.length === 0 ? (
              <div className="p-5">
                <EmptyState title="Belum ada aktivitas" description="Log aktivitas akan tampil di sini." />
              </div>
            ) : (
              <ul className="max-h-[420px] overflow-y-auto px-5 py-4">
                {recentActivity.map((log, idx) => (
                  <li key={log.id} className="relative flex gap-3 pb-5 last:pb-0">
                    {idx !== recentActivity.length - 1 && (
                      <span className="absolute left-[7px] top-4 h-full w-px bg-[var(--ayom-border)]" />
                    )}
                    <span
                      className="relative mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[var(--ayom-surface)]"
                      style={{ backgroundColor: roleMeta(log.user?.role).dot }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm text-[var(--ayom-ink)]">
                        <span className="font-medium">{log.user?.name ?? 'Sistem'}</span>{' '}
                        <span className="text-[var(--ayom-muted)]">{log.action_label ?? log.action}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--ayom-muted)]">{formatDateTime(log.created_at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
