import { useState } from "react";
import { useForm } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import CurrencyInput from "@/Components/ui/currency-input";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Plus, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function CreateTaskDialog({ dependents = [], trigger }) {
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            assigned_to: dependents.length > 0 ? String(dependents[0].id) : "",
            title: "",
            description: "",
            reward_amount: "",
            due_date: "",
        });

    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
            reset();
            clearErrors();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("tasks.store"), {
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
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                        <Plus className="mr-1.5 h-4 w-4" />
                        Buat Misi Baru
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[var(--ayom-ink)]">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        Buat Misi Baru
                    </DialogTitle>
                    <DialogDescription className="text-xs text-[var(--ayom-muted)]">
                        Berikan tugas atau misi harian untuk anak beserta
                        imbalan saldonya.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Pilih Anak */}
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="assigned_to"
                            className="text-xs font-semibold"
                        >
                            Tugaskan Kepada{" "}
                            <span className="text-rose-500">*</span>
                        </Label>
                        <Select
                            value={data.assigned_to}
                            onValueChange={(val) => setData("assigned_to", val)}
                        >
                            <SelectTrigger id="assigned_to" className="w-full">
                                <SelectValue placeholder="Pilih Anak">
                                    {
                                        dependents.find(
                                            (d) =>
                                                String(d.id) ===
                                                data.assigned_to,
                                        )?.name
                                    }
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {dependents.map((dep) => (
                                    <SelectItem
                                        key={dep.id}
                                        value={String(dep.id)}
                                    >
                                        {dep.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.assigned_to && (
                            <p className="flex items-center gap-1 text-xs text-rose-500">
                                <AlertCircle className="h-3 w-3" />
                                {errors.assigned_to}
                            </p>
                        )}
                    </div>

                    {/* Judul Misi */}
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="title"
                            className="text-xs font-semibold"
                        >
                            Judul Misi <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            placeholder="Contoh: Membersihkan Kamar, Belajar Math"
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                        />
                        {errors.title && (
                            <p className="flex items-center gap-1 text-xs text-rose-500">
                                <AlertCircle className="h-3 w-3" />
                                {errors.title}
                            </p>
                        )}
                    </div>

                    {/* Imbalan / Reward & Tenggat */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="reward_amount"
                                className="text-xs font-semibold"
                            >
                                Reward (Rp){" "}
                                <span className="text-rose-500">*</span>
                            </Label>
                            <CurrencyInput
                                id="reward_amount"
                                value={data.reward_amount}
                                onChange={(val) =>
                                    setData("reward_amount", val)
                                }
                                placeholder="10.000"
                            />
                            {errors.reward_amount && (
                                <p className="flex items-center gap-1 text-xs text-rose-500">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.reward_amount}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="due_date"
                                className="text-xs font-semibold"
                            >
                                Tenggat Waktu (Opsional)
                            </Label>
                            <Input
                                id="due_date"
                                type="date"
                                value={data.due_date}
                                onChange={(e) =>
                                    setData("due_date", e.target.value)
                                }
                            />
                            {errors.due_date && (
                                <p className="flex items-center gap-1 text-xs text-rose-500">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.due_date}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Deskripsi */}
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="description"
                            className="text-xs font-semibold"
                        >
                            Deskripsi Misi (Opsional)
                        </Label>
                        <Textarea
                            id="description"
                            rows={3}
                            placeholder="Jelaskan instruksi detail tugas jika ada..."
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                        />
                        {errors.description && (
                            <p className="flex items-center gap-1 text-xs text-rose-500">
                                <AlertCircle className="h-3 w-3" />
                                {errors.description}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                "Simpan Misi"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
