import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

import RemajaLayout from '@/Layouts/RemajaLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

// NOTE: halaman ini dipakai bersama oleh role `lansia` & `remaja` (route `transactions.index`).
// Layout dibiarkan RemajaLayout untuk sekarang — kalau lansia butuh tampilan sendiri
// (font besar, kontras tinggi), ganti jadi pemilihan layout berdasarkan `auth.user.role`
// dari props Inertia bersama (`usePage().props.auth.user.role`).

function formatRupiah(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));
}

const CATEGORY_OPTIONS = [
    { value: 'makanan', label: 'Makanan' },
    { value: 'transportasi', label: 'Transportasi' },
    { value: 'hiburan', label: 'Hiburan' },
    { value: 'tagihan', label: 'Tagihan' },
    { value: 'kesehatan', label: 'Kesehatan' },
    { value: 'pendidikan', label: 'Pendidikan' },
    { value: 'lainnya', label: 'Lainnya' },
];

const TYPE_META = {
    topup: { label: 'Top-up', sign: '+', className: 'bg-green-100 text-green-700' },
    expense: { label: 'Pengeluaran', sign: '-', className: 'bg-red-100 text-red-700' },
    transfer: { label: 'Transfer', sign: '-', className: 'bg-blue-100 text-blue-700' },
    bill_payment: { label: 'Tagihan', sign: '-', className: 'bg-orange-100 text-orange-700' },
    allowance: { label: 'Uang Saku', sign: '+', className: 'bg-emerald-100 text-emerald-700' },
};

const STATUS_META = {
    completed: { label: 'Selesai', className: 'bg-green-100 text-green-700' },
    pending: { label: 'Menunggu', className: 'bg-amber-100 text-amber-700' },
    approved: { label: 'Disetujui', className: 'bg-green-100 text-green-700' },
    rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-700' },
};

function TypeBadge({ type }) {
    const meta = TYPE_META[type] ?? { label: type, sign: '', className: 'bg-slate-100 text-slate-600' };
    return <Badge className={meta.className}>{meta.label}</Badge>;
}

function StatusBadge({ status }) {
    const meta = STATUS_META[status] ?? { label: status, className: 'bg-slate-100 text-slate-600' };
    return <Badge className={meta.className}>{meta.label}</Badge>;
}

function NewExpenseDialog() {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        category: '',
        description: '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        post(route('transactions.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button>
                        <Plus className="mr-1 h-4 w-4" />
                        Catat Pengeluaran
                    </Button>
                }
            />
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Catat Pengeluaran Baru</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="amount">Jumlah (Rp)</Label>
                        <Input
                            id="amount"
                            type="number"
                            min="1"
                            step="1"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            placeholder="contoh: 25000"
                        />
                        {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="category">Kategori</Label>
                        <Select value={data.category} onValueChange={(v) => setData('category', v)}>
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORY_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="description">Catatan (opsional)</Label>
                        <Input
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="contoh: Makan siang di kantin"
                            maxLength={255}
                        />
                        {errors.description && (
                            <p className="text-xs text-red-500">{errors.description}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={processing} className="w-full">
                            {processing ? 'Menyimpan...' : 'Simpan Pengeluaran'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function Transactions({ transactions }) {
    const rows = transactions?.data ?? [];
    const links = transactions?.links ?? [];

    return (
        <RemajaLayout>
            <Head title="Transaksi" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Transaksi</h1>
                    <p className="text-sm text-slate-500">Riwayat lengkap transaksi kamu.</p>
                </div>
                <NewExpenseDialog />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-500">
                        Riwayat Transaksi
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {rows.length ? (
                        <div className="divide-y">
                            {rows.map((trx) => {
                                const meta = TYPE_META[trx.type] ?? { sign: '' };
                                return (
                                    <div key={trx.id} className="flex items-center justify-between py-3">
                                        <div>
                                            <div className="mb-1 flex items-center gap-2">
                                                <p className="text-sm font-medium text-slate-700">
                                                    {trx.description || (
                                                        CATEGORY_OPTIONS.find((c) => c.value === trx.category)
                                                            ?.label ?? trx.category
                                                    )}
                                                </p>
                                                <TypeBadge type={trx.type} />
                                            </div>
                                            <p className="text-xs text-slate-400">
                                                {new Date(trx.created_at).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p
                                                className={`text-sm font-semibold ${
                                                    meta.sign === '+' ? 'text-green-600' : 'text-slate-800'
                                                }`}
                                            >
                                                {meta.sign}
                                                {formatRupiah(trx.amount)}
                                            </p>
                                            <StatusBadge status={trx.status} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="py-8 text-center text-sm text-slate-400">Belum ada transaksi.</p>
                    )}

                    {links.length > 3 && (
                        <div className="mt-4 flex flex-wrap justify-center gap-1">
                            {links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url ?? '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    preserveScroll
                                    className={`rounded-md px-3 py-1 text-sm ${
                                        link.active
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-slate-500 hover:bg-slate-100'
                                    } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </RemajaLayout>
    );
}