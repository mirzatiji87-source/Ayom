import { useEffect, useRef, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import EmptyState from '@/Components/Admin/EmptyState';
import { formatRupiah, formatDate } from '@/lib/ayom-theme';

export default function Families({ families, filters = {} }) {
  const [search, setSearch] = useState(filters.search ?? '');
  const firstRun = useRef(true);

  // Debounce sederhana: ketik -> tunggu 400ms -> query ulang tanpa reload penuh.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      router.get(
        route('admin.families.index'),
        search ? { search } : {},
        { preserveState: true, replace: true, preserveScroll: true }
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
        <div className="hidden w-64 sm:block">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama keluarga atau pemilik…"
            className="border-[var(--ayom-border)]"
          />
        </div>
      }
    >
      <div className="mb-4 sm:hidden">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama keluarga atau pemilik…"
          className="border-[var(--ayom-border)]"
        />
      </div>

      <Card className="border-[var(--ayom-border)] shadow-none">
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title={search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada keluarga terdaftar'}
                description={
                  search
                    ? 'Coba kata kunci lain atau hapus pencarian.'
                    : 'Keluarga akan muncul di sini begitu ada orang tua yang mendaftar.'
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--ayom-border)] text-xs uppercase tracking-wide text-[var(--ayom-muted)]">
                    <th className="px-5 py-3 font-medium">Nama Keluarga</th>
                    <th className="px-5 py-3 font-medium">Pemilik (Orang Tua)</th>
                    <th className="px-5 py-3 font-medium">Anggota</th>
                    <th className="px-5 py-3 font-medium">Saldo</th>
                    <th className="px-5 py-3 font-medium">Terdaftar</th>
                    <th className="px-5 py-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ayom-border)]">
                  {rows.map((family) => (
                    <tr key={family.id} className="transition-colors hover:bg-black/[0.02]">
                      <td className="px-5 py-3.5 font-medium text-[var(--ayom-ink)]">{family.name}</td>
                      <td className="px-5 py-3.5 text-[var(--ayom-muted)]">{family.owner?.name ?? '—'}</td>
                      <td className="px-5 py-3.5 tabular-nums text-[var(--ayom-muted)]">{family.members_count}</td>
                      <td className="px-5 py-3.5 font-semibold tabular-nums text-[var(--ayom-ink)]">
                        {formatRupiah(family.balance)}
                      </td>
                      <td className="px-5 py-3.5 text-[var(--ayom-muted)]">{formatDate(family.created_at)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <Button asChild variant="outline" size="sm" className="border-[var(--ayom-border)]">
                          <Link href={route('admin.families.show', family.id)}>Lihat Detail</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {links.length > 3 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
          {links.map((link, idx) => (
            <button
              key={idx}
              type="button"
              disabled={!link.url}
              onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
              className={`min-w-[36px] rounded-md px-3 py-1.5 text-sm transition-colors ${
                link.active
                  ? 'bg-[var(--ayom-primary)] text-[var(--ayom-primary-foreground)]'
                  : link.url
                  ? 'text-[var(--ayom-muted)] hover:bg-black/[0.05]'
                  : 'cursor-not-allowed text-[var(--ayom-muted)]/40'
              }`}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
