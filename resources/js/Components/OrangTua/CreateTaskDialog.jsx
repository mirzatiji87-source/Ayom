// resources/js/Components/OrangTua/CreateTaskDialog.jsx

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
import { Plus, ListChecks, AlertCircle, Loader2 } from "lucide-react";

function FieldLabel({ htmlFor, required = false, children }) {
    return (
        <Label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
            {children}
            {required && <span className="ml-0.5 text-rose-500">*</span>}
        </Label>
    );
}

function FieldError({ message }) {
    if (!message) return null;

    return (
        <p className="flex items-center gap-1 text-xs text-rose-600">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {message}
        </p>
    );
}

export default function CreateTaskDialog({ dependents = [], trigger }) {
    const [open, setOpen] = useState(false);
    const hasDependents = dependents.length > 0;

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            assigned_to: hasDependents ? String(dependents[0].id) : "",
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
            {trigger ? (
                <DialogTrigger render={trigger} />
            ) : (
                <DialogTrigger
                    render={
                        <Button className="w-full bg-[var(--ayom-primary)] text-white shadow-sm hover:bg-[var(--ayom-primary-dark)] sm:w-auto" />
                    }
                >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Buat Misi Baru
                </DialogTrigger>
            )}

            {/*
              Override lokal (tidak mengubah dialog.jsx global):
              - max-h + overflow-y-auto  -> form tidak kepotong di layar pendek/HP
              - rounded-2xl              -> sesuai gaya kartu di halaman Orang Tua
              - title normal-case font-sans -> judul tidak KAPITAL serif
            */}
            <DialogContent className="max-h-[calc(100dvh-2rem)] gap-5 overflow-y-auto rounded-2xl p-5 sm:max-w-[480px] sm:p-6">
                <DialogHeader className="pr-10">
                    <DialogTitle className="flex items-center gap-2 font-sans text-lg font-bold normal-case tracking-normal text-slate-900">
                        <ListChecks className="h-5 w-5 shrink-0 text-emerald-600" />
                        Buat Misi Baru
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-500">
                        Beri tugas untuk anak beserta imbalan saldonya.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Pilih Anak */}
                    <div className="space-y-1.5">
                        <FieldLabel htmlFor="assigned_to" required>
                            Tugaskan kepada
                        </FieldLabel>
                        <Select
                            value={data.assigned_to}
                            onValueChange={(val) => setData("assigned_to", val)}
                            disabled={!hasDependents}
                        >
                            <SelectTrigger id="assigned_to" className="w-full">
                                <SelectValue placeholder="Pilih anak">
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
                        {!hasDependents && (
                            <p className="text-xs text-slate-500">
                                Belum ada anak terdaftar. Buat akun dependent
                                dulu lewat menu Buat Akun Dependent.
                            </p>
                        )}
                        <FieldError message={errors.assigned_to} />
                    </div>

                    {/* Judul */}
                    <div className="space-y-1.5">
                        <FieldLabel htmlFor="title" required>
                            Judul misi
                        </FieldLabel>
                        <Input
                            id="title"
                            placeholder="Contoh: Membersihkan kamar"
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                        />
                        <FieldError message={errors.title} />
                    </div>

                    {/* Reward & Tenggat */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <FieldLabel htmlFor="reward_amount" required>
                                Reward (Rp)
                            </FieldLabel>
                            <CurrencyInput
                                id="reward_amount"
                                value={data.reward_amount}
                                onChange={(val) =>
                                    setData("reward_amount", val)
                                }
                                placeholder="10.000"
                            />
                            <FieldError message={errors.reward_amount} />
                        </div>

                        <div className="space-y-1.5">
                            <FieldLabel htmlFor="due_date">
                                Tenggat (opsional)
                            </FieldLabel>
                            <Input
                                id="due_date"
                                type="date"
                                value={data.due_date}
                                onChange={(e) =>
                                    setData("due_date", e.target.value)
                                }
                            />
                            <FieldError message={errors.due_date} />
                        </div>
                    </div>

                    {/* Deskripsi */}
                    <div className="space-y-1.5">
                        <FieldLabel htmlFor="description">
                            Deskripsi (opsional)
                        </FieldLabel>
                        <Textarea
                            id="description"
                            rows={3}
                            placeholder="Jelaskan detail tugas jika perlu"
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                        />
                        <FieldError message={errors.description} />
                    </div>

                    <DialogFooter className="pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={processing}
                            className="w-full sm:w-auto"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !hasDependents}
                            className="w-full bg-[var(--ayom-primary)] text-white hover:bg-[var(--ayom-primary-dark)] sm:w-auto"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                "Simpan misi"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
