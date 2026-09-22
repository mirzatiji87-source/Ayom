// resources/js/Components/ui/currency-input.jsx

import { useEffect, useState } from 'react';
import { Input } from '@/Components/ui/input';

function formatDisplay(rawValue) {
    const digitsOnly = String(rawValue ?? '').replace(/\D/g, '');
    if (!digitsOnly) return '';
    return new Intl.NumberFormat('id-ID').format(Number(digitsOnly));
}

/**
 * Input angka yang otomatis dikasih titik ribuan pas diketik
 * (500000 -> "500.000"), tapi value yang dikirim ke onChange
 * tetap angka mentah (tanpa titik), siap dikirim ke backend.
 */
export default function CurrencyInput({ value, onChange, className = '', ...props }) {
    const [display, setDisplay] = useState(formatDisplay(value));

    useEffect(() => {
        setDisplay(formatDisplay(value));
    }, [value]);

    const handleChange = (e) => {
        const raw = e.target.value.replace(/\D/g, '');
        setDisplay(formatDisplay(raw));
        onChange(raw);
    };

    return (
        <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                Rp
            </span>
            <Input
                type="text"
                inputMode="numeric"
                value={display}
                onChange={handleChange}
                className={`pl-9 ${className}`}
                {...props}
            />
        </div>
    );
}