
import { Head, Link, useForm } from "@inertiajs/react";
import { FileText, Upload, ChevronDown } from "lucide-react";

import OrangTuaLayout from "@/Layouts/OrangTuaLayout";
import { formatDate } from "@/lib/ayom-theme";

import {
    ActionButton,
    ErrorList,
    OfficialChannelCard,
    ReportSummary,
} from "@/Components/LifeEvent/shared";

const CARD = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

const ROLE_LABELS = {
    admin: "Admin",
    orang_tua: "Orang tua",
    lansia: "Lansia",
    remaja: "Remaja",
};

const VERIFICATION_LABELS = {
    pending: "Menunggu verifikasi",
    verified: "Terverifikasi",
    rejected: "Ditolak",
};

function SummaryCard({ label, value, description, valueClass = "" }) {
    return (
        <div className={CARD}>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p
                className={`mt-2 text-3xl font-bold tracking-tight text-slate-900 ${valueClass}`}
            >
                {value}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
                {description}
            </p>
        </div>
    );
}

function VerificationPill({ status }) {
    const normalized = String(status ?? "pending").toLowerCase();

    const tone =
        normalized === "verified"
            ? "success"
            : normalized === "rejected"
              ? "danger"
              : "warning";

    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                tone === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : tone === "danger"
                      ? "bg-rose-50 text-rose-700"
                      : "bg-amber-50 text-amber-800"
            }`}
        >
            {VERIFICATION_LABELS[normalized] ?? "Status tidak diketahui"}
        </span>
    );
}

export default function StatusReports({ reports, members = [] }) {
    const rows = Array.isArray(reports) ? reports : (reports?.data ?? []);

    const total = reports?.total ?? rows.length;

    const pendingCount = rows.filter(
        (report) => report.verification_status === "pending",
    ).length;

    const verifiedCount = rows.filter(
        (report) => report.verification_status === "verified",
    ).length;

    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: "",
        event_date: "",
        notes: "",
        evidence: null,
    });

    function submitReport(event) {
        event.preventDefault();

        const formElement = event.currentTarget;

        post(route("orang-tua.status-reports.store"), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                formElement.reset();
            },
        });
    }

    return (
        <OrangTuaLayout>
            <Head title="Laporan Status Anggota" />

            <div className="mx-auto max-w-6xl space-y-6 pb-10">
                <header>
                    <p className="text-sm font-semibold text-teal-700">
                        KELOLA KELUARGA
                    </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Laporan Status Anggota
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Laporkan perubahan status anggota keluarga untuk
                        diperiksa admin. Laporan tidak langsung menghapus akun,
                        saldo, tagihan, ataupun riwayat transaksi.
                    </p>
                </header>

                <div className="grid gap-4 sm:grid-cols-3">
                    <SummaryCard
                        label="Total laporan"
                        value={total}
                        description="Jumlah seluruh laporan keluarga"
                    />

                    <SummaryCard
                        label="Menunggu verifikasi"
                        value={pendingCount}
                        valueClass={
                            pendingCount > 0 ? "text-amber-700" : "text-slate-900"
                        }
                        description="Laporan berstatus menunggu pada halaman ini"
                    />

                    <SummaryCard
                        label="Terverifikasi"
                        value={verifiedCount}
                        valueClass="text-emerald-700"
                        description="Laporan terverifikasi pada halaman ini"
                    />
                </div>

                {pendingCount === 0 && rows.length > 0 && (
                    <div
                        role="status"
                        className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            ✓
                        </div>

                        <div>
                            <h2 className="font-bold text-emerald-900">
                                Tidak ada laporan yang menunggu di halaman ini
                            </h2>

                            <p className="mt-1 text-sm leading-6 text-emerald-800">
                                Laporan yang sudah diverifikasi tetap tersimpan
                                di riwayat bawah dan bisa dibuka kembali.
                                Angka menunggu akan menjadi nol setelah laporan
                                mendapat keputusan.
                            </p>
                        </div>
                    </div>
                )}

                <details className={`${CARD} group`}>
                    <summary className="flex cursor-pointer list-none items-start gap-3 [&::-webkit-details-marker]:hidden">
                        <div className="rounded-xl bg-teal-50 p-2 text-teal-800">
                            <FileText className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h2 className="text-lg font-bold text-slate-900">
                                Buat laporan baru
                            </h2>

                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                Buka formulir saat ingin melaporkan perubahan
                                status anggota keluarga.
                            </p>
                        </div>

                        <span className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-teal-800">
                            <span className="group-open:hidden">Buka</span>
                            <span className="hidden group-open:inline">
                                Tutup
                            </span>

                            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                        </span>
                    </summary>

                    <form
                        onSubmit={submitReport}
                        className="mt-5 space-y-5 border-t border-slate-100 pt-5"
                    >
                        <div>
                            <label
                                htmlFor="member-user-id"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Anggota keluarga
                            </label>

                            <select
                                id="member-user-id"
                                value={data.user_id}
                                onChange={(event) =>
                                    setData("user_id", event.target.value)
                                }
                                required
                                disabled={processing || members.length === 0}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15 disabled:cursor-not-allowed disabled:bg-slate-100"
                            >
                                <option value="">Pilih anggota keluarga</option>

                                {members.map((member) => (
                                    <option key={member.id} value={member.id}>
                                        {member.name}
                                        {member.role
                                            ? ` — ${ROLE_LABELS[member.role] ?? member.role}`
                                            : ""}
                                    </option>
                                ))}
                            </select>

                            {errors.user_id && (
                                <p className="mt-2 text-sm text-rose-700">
                                    {errors.user_id}
                                </p>
                            )}

                            {members.length === 0 && (
                                <p className="mt-2 text-sm text-amber-700">
                                    Belum ada anggota keluarga yang bisa
                                    dipilih. Periksa akun dan hubungan keluarga
                                    yang terdaftar.
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="event-date"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Tanggal peristiwa
                            </label>

                            <input
                                id="event-date"
                                type="date"
                                value={data.event_date}
                                onChange={(event) =>
                                    setData("event_date", event.target.value)
                                }
                                required
                                disabled={processing}
                                max={new Date().toISOString().slice(0, 10)}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15 disabled:bg-slate-100"
                            />

                            {errors.event_date && (
                                <p className="mt-2 text-sm text-rose-700">
                                    {errors.event_date}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="report-notes"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Catatan laporan
                            </label>

                            <textarea
                                id="report-notes"
                                value={data.notes}
                                onChange={(event) =>
                                    setData("notes", event.target.value)
                                }
                                rows={4}
                                maxLength={2000}
                                disabled={processing}
                                placeholder="Tambahkan informasi pendukung yang relevan..."
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15 disabled:bg-slate-100"
                            />

                            {errors.notes && (
                                <p className="mt-2 text-sm text-rose-700">
                                    {errors.notes}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="report-evidence"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Bukti pendukung (opsional)
                            </label>

                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                                <label
                                    htmlFor="report-evidence"
                                    className="flex cursor-pointer items-center gap-3"
                                >
                                    <div className="rounded-lg bg-white p-2 text-slate-600 shadow-sm">
                                        <Upload className="h-5 w-5" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-800">
                                            Pilih berkas
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Unggah bukti yang relevan saja.
                                            Hindari mengirim dokumen pribadi
                                            yang tidak diperlukan.
                                        </p>
                                    </div>
                                </label>

                                <input
                                    id="report-evidence"
                                    type="file"
                                    accept="image/jpeg,image/png,application/pdf"
                                    disabled={processing}
                                    onChange={(event) =>
                                        setData(
                                            "evidence",
                                            event.target.files?.[0] ?? null,
                                        )
                                    }
                                    className="mt-4 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:font-semibold file:text-slate-700 hover:file:bg-slate-100 disabled:opacity-60"
                                />

                                {data.evidence && (
                                    <p className="mt-2 break-all text-xs text-slate-600">
                                        Dipilih: {data.evidence.name}
                                    </p>
                                )}

                                {errors.evidence && (
                                    <p className="mt-2 text-sm text-rose-700">
                                        {errors.evidence}
                                    </p>
                                )}
                            </div>
                        </div>

                        <ErrorList errors={errors} />

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                disabled={processing}
                                onClick={() => {
                                    reset();
                                    const fileInput =
                                        document.getElementById(
                                            "report-evidence",
                                        );
                                    if (fileInput) fileInput.value = "";
                                }}
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Bersihkan formulir
                            </button>

                            <ActionButton
                                type="submit"
                                disabled={processing || members.length === 0}
                                processing={processing}
                            >
                                Kirim laporan
                            </ActionButton>
                        </div>
                    </form>
                </details>

                <section className="space-y-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Riwayat laporan keluarga
                        </h2>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                            Semua laporan yang tampil di daftar ini bisa dibuka
                            untuk melihat status dan tindak lanjutnya. Laporan
                            yang sudah selesai diperiksa tidak dihapus.
                        </p>
                    </div>

                    {rows.length === 0 ? (
                        <div className={`${CARD} py-10 text-center`}>
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                                <FileText className="h-6 w-6" />
                            </div>

                            <p className="mt-4 font-semibold text-slate-900">
                                Belum ada laporan
                            </p>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Klik “Buka” pada formulir di atas untuk membuat
                                laporan pertama keluarga.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {rows.map((report) => (
                                <article
                                    key={report.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                                >
                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-sm font-semibold text-slate-800">
                                            Laporan #{report.id}
                                        </p>

                                        <VerificationPill
                                            status={report.verification_status}
                                        />
                                    </div>

                                    <ReportSummary report={report} />

                                    {report.verification_status ===
                                        "verified" && (
                                        <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">
                                            Laporan ini sudah diverifikasi
                                            admin. Lu tetap bisa membuka
                                            detailnya untuk melihat tindak
                                            lanjut keluarga.
                                        </p>
                                    )}

                                    {report.verification_status ===
                                        "rejected" && (
                                        <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm leading-6 text-rose-800">
                                            Laporan ini ditolak. Buka detail
                                            untuk membaca catatan pemeriksaan
                                            admin, jika tersedia.
                                        </p>
                                    )}

                                    <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-xs text-slate-500">
                                            Dibuat{" "}
                                            {report.created_at
                                                ? formatDate(report.created_at)
                                                : "—"}
                                        </p>

                                        <Link
                                            href={route(
                                                "orang-tua.status-reports.show",
                                                report.id,
                                            )}
                                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-700 hover:text-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
                                        >
                                            Lihat detail
                                            <span
                                                className="ml-2"
                                                aria-hidden="true"
                                            >
                                                →
                                            </span>
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {reports?.links?.length > 0 && (
                        <nav
                            aria-label="Navigasi halaman laporan"
                            className="flex flex-wrap gap-2"
                        >
                            {reports.links.map((link, index) => (
                                <Link
                                    key={`${index}-${link.label}`}
                                    href={link.url ?? "#"}
                                    preserveScroll
                                    aria-current={
                                        link.active ? "page" : undefined
                                    }
                                    className={[
                                        "rounded-lg border px-3 py-2 text-sm",
                                        link.active
                                            ? "border-teal-800 bg-teal-800 text-white"
                                            : "border-slate-200 bg-white text-slate-700",
                                        !link.url
                                            ? "pointer-events-none opacity-40"
                                            : "hover:bg-slate-50",
                                    ].join(" ")}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </nav>
                    )}
                </section>

                <OfficialChannelCard />

                <p className="px-1 text-xs leading-5 text-slate-500">
                    Catatan BPJS dalam Ayom merupakan catatan tindak lanjut
                    keluarga, bukan konfirmasi resmi dari BPJS Kesehatan.
                    Perubahan status kepesertaan harus diurus melalui kanal
                    resmi BPJS.
                </p>
            </div>
        </OrangTuaLayout>
    );
}
