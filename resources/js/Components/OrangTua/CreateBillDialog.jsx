import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import CurrencyInput from '@/Components/ui/currency-input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Plus, Receipt, AlertCircle, Loader2 } from 'lucide-react';

const CATEGORY_OPTIONS = [
    { value: 'listrik', label: 'Listrik' },
    { value: 'air', label: 'Air' },
    { value: 'bpjs', label: 'BPJS Kesehatan' },
    { value: 'obat', label: 'Obat' },
    { value: 'internet', label: 'Internet' },
    { value: 'lainnya', label: 'Lainnya' },
];

const FREQUENCY_OPTIONS = [
    { value: 'daily', label: 'Harian' },
    { value: 'weekly', label: 'Mingguan' },
    { value: 'monthly', label: 'Bulanan' },
];

export default function CreateBillDialog({ userId, trigger }) {
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        user_id: userId,
        name: '',
        category: 'lainnya',
        amount: '',
        frequency: 'monthly',
        next_due_date: '',
        auto_pay: true,
    });

    const handleOpenChange = (next) => {
        setOpen(next);
        if (!next) {
            reset();
            clearErrors();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('bills.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                reset();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button className="bg-emerald-600 text-white shadow-sm hover:bg-emerald-700">
                        <Plus className="mr-1.5 h-4 w-4" />
                        Tambah Tagihan
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[var(--ayom-ink)]">
                        <Receipt className="h-5 w-5 text-emerald-600" />
                        Tambah Tagihan
                    </DialogTitle>
                    <DialogDescription className="text-xs text-[var(--ayom-muted)]">
                        Tagihan akan muncul sebagai pengingat dan bisa dibayar langsung dari saldo.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="bill-name" className="text-xs font-semibold">
                            Nama Tagihan <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                            id="bill-name"
                            placeholder="Contoh: Listrik PLN, BPJS Kesehatan"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && (
                            <p className="flex items-center gap-1 text-xs text-rose-500">
                                <AlertCircle className="h-3 w-3" />
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="bill-category" className="text-xs font-semibold">
                                Kategori <span className="text-rose-500">*</span>
                            </Label>
                            <Select value={data.category} onValueChange={(v) => setData('category', v)}>
                                <SelectTrigger id="bill-category" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORY_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category && (
                                <p className="flex items-center gap-1 text-xs text-rose-500">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.category}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="bill-frequency" className="text-xs font-semibold">
                                Frekuensi <span className="text-rose-500">*</span>
                            </Label>
                            <Select value={data.frequency} onValueChange={(v) => setData('frequency', v)}>
                                <SelectTrigger id="bill-frequency" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {FREQUENCY_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="bill-amount" className="text-xs font-semibold">
                                Nominal (Rp) <span className="text-rose-500">*</span>
                            </Label>
                            <CurrencyInput
                                id="bill-amount"
                                value={data.amount}
                                onChange={(val) => setData('amount', val)}
                                placeholder="150.000"
                            />
                            {errors.amount && (
                                <p className="flex items-center gap-1 text-xs text-rose-500">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.amount}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="bill-due" className="text-xs font-semibold">
                                Jatuh Tempo Berikutnya <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="bill-due"
                                type="date"
                                value={data.next_due_date}
                                onChange={(e) => setData('next_due_date', e.target.value)}
                            />
                            {errors.next_due_date && (
                                <p className="flex items-center gap-1 text-xs text-rose-500">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.next_due_date}
                                </p>
                            )}
                        </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={data.auto_pay}
                            onChange={(e) => setData('auto_pay', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        Aktifkan pembayaran otomatis
                    </label>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={processing}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-emerald-600 text-white hover:bg-emerald-700">
                            {processing ? (
                                <>
                                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Tagihan'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}