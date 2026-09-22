// resources/js/Components/ui/date-picker.jsx

import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';

import { buttonVariants } from '@/Components/ui/button';
import { Calendar } from '@/Components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { cn } from '@/lib/utils';

/**
 * DatePicker sederhana untuk form.
 *
 * Props:
 * - value: string 'YYYY-MM-DD' atau '' (kosong)
 * - onChange: (value: string) => void  -> dipanggil dengan format 'YYYY-MM-DD'
 * - placeholder: string
 * - disabled: boolean
 * - fromYear / toYear: batas tahun di kalender (opsional)
 */
export function DatePicker({
    value,
    onChange,
    placeholder = 'Pilih tanggal',
    disabled = false,
    fromYear = 1930,
    toYear = new Date().getFullYear(),
    className,
}) {
    const selectedDate = value ? new Date(`${value}T00:00:00`) : undefined;

    const handleSelect = (date) => {
        if (!date) {
            onChange('');
            return;
        }

        // Format manual ke YYYY-MM-DD (hindari pergeseran timezone dari toISOString)
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        onChange(`${y}-${m}-${d}`);
    };

    return (
        <Popover>
            {/*
                PENTING: jangan bungkus <Button> di sini pakai asChild.
                Base UI (@base-ui/react) TIDAK mendukung pola asChild seperti Radix.
                Trigger di-style langsung pakai buttonVariants supaya tidak ada
                elemen <button> bersarang di dalam <button> (yang bikin browser
                "membetulkan" DOM secara paksa dan merusak posisi popover).
            */}
            <PopoverTrigger
                type="button"
                disabled={disabled}
                className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'w-full justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground',
                    className
                )}
            >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: localeId }) : placeholder}
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start" sideOffset={8}>
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleSelect}
                    captionLayout="dropdown"
                    fromYear={fromYear}
                    toYear={toYear}
                    defaultMonth={selectedDate ?? new Date(toYear - 30, 0)}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}