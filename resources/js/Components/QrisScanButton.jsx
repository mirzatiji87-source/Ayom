// Install dulu: npm i html5-qrcode
import { useEffect, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ChevronRight, QrCode, X } from "lucide-react";

/* Baca payload QRIS (format EMV TLV):
   tag 54 = nominal (hanya ada di QRIS dinamis), tag 59 = nama merchant */
export function parseQris(payload) {
    const out = {};
    let i = 0;

    while (i + 4 <= payload.length) {
        const tag = payload.slice(i, i + 2);
        const len = parseInt(payload.slice(i + 2, i + 4), 10);
        if (Number.isNaN(len)) break;
        out[tag] = payload.slice(i + 4, i + 4 + len);
        i += 4 + len;
    }

    return {
        merchant: out["59"] || "",
        amount: out["54"] ? Math.round(parseFloat(out["54"])) : null,
        valid: payload.startsWith("000201") && Boolean(out["59"]),
    };
}

/* ---------- Tombol di halaman Jajan ---------- */

export default function QrisScanButton({ onResult }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex w-full cursor-pointer items-center gap-4 rounded-2xl bg-emerald-50 p-4 text-left ring-1 ring-emerald-900/15 transition-colors duration-200 hover:bg-emerald-100 active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400"
            >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-800 text-white">
                    <QrCode className="h-6 w-6" />
                </span>

                <span className="min-w-0 flex-1">
                    <span className="block text-base font-bold text-slate-900">
                        Scan QRIS
                    </span>
                    <span className="block text-sm text-slate-600">
                        Nama toko dan nominal terisi otomatis
                    </span>
                </span>

                <ChevronRight className="h-5 w-5 shrink-0 text-emerald-800" />
            </button>

            {open && (
                <ScannerModal
                    onClose={() => setOpen(false)}
                    onResult={(r) => {
                        setOpen(false);
                        onResult(r);
                    }}
                />
            )}
        </>
    );
}

/* ---------- Modal kamera ---------- */

function ScannerModal({ onClose, onResult }) {
    const [error, setError] = useState("");

    useEffect(() => {
        const scanner = new Html5Qrcode("qris-reader");
        let handled = false;
        let started = false;

        scanner
            .start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 240, height: 240 } },
                (raw) => {
                    if (handled) return;

                    const text = raw.trim();
                    const parsed = parseQris(text);

                    if (!parsed.valid) {
                        // sementara, buat debug. Hapus "Isinya" kalau udah beres
                        setError(
                            `Ini bukan kode QRIS. Isinya: ${text.slice(0, 80)}`,
                        );
                        return;
                    }

                    handled = true;
                    onResult({
                        merchant: parsed.merchant,
                        amount: parsed.amount,
                    });
                },
                () => {},
            )
            .then(() => {
                started = true;
            })
            .catch(() =>
                setError(
                    "Kamera tidak bisa dibuka. Izinkan akses kamera di browser, lalu coba lagi.",
                ),
            );

        return () => {
            if (started) {
                scanner
                    .stop()
                    .then(() => scanner.clear())
                    .catch(() => {});
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Scan QRIS"
            className="fixed inset-0 z-50 flex flex-col bg-emerald-950/95"
        >
            <div className="flex items-center justify-between px-5 py-4 text-white">
                <p className="font-heading text-2xl">Scan QRIS</p>

                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Tutup"
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 transition-colors duration-200 hover:bg-white/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center px-6">
                <div
                    id="qris-reader"
                    className="w-full max-w-sm overflow-hidden rounded-3xl bg-black"
                />

                <p className="mt-5 text-center text-base text-emerald-100">
                    Arahkan kamera ke kode QRIS di toko.
                </p>

                {error && (
                    <p
                        role="alert"
                        className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-center text-base font-medium text-rose-900"
                    >
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}
