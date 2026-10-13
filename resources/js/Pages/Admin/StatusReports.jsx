import { Head, Link } from "@inertiajs/react";
import { ExternalLink, FileText } from "lucide-react";

import AdminLayout from "@/Layouts/AdminLayout";
import { formatDate } from "@/lib/ayom-theme";
import {
    Pill,
    verificationKey,
    VERIFICATION_UI,
} from "@/Components/LifeEvent/shared";

function SummaryCard({ label, value, description }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {value}
            </p>
            <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
    );
}

export default function StatusReports({
    reports,
    pendingCount = 0,
    totalCount,
}) {
    const rows = Array.isArray(reports) ? reports : (reports?.data ?? []);
    const total = totalCount ?? reports?.total ?? rows.length;

    return (
        <AdminLayout>
            <Head title="Laporan Status Anggota" />

            <div className="space-y-6 pb-8">
                <header>
                    <p className="text-sm font-semibold text-teal-700">
                        ADMINISTRASI KELUARGA
                    </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Laporan Status Anggota
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Periksa laporan perubahan status anggota keluarga,
                        tinjau bukti pendukung, kemudian tentukan hasil
                        verifikasi. Riwayat laporan tetap disimpan.
                    </p>
                </header>

                {pendingCount > 0 && (
                    <div
                        role="status"
                        className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4"
                    >
                        <div className="flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-800">
                            {pendingCount > 99 ? "99+" : pendingCount}
                        </div>

                        <div>
                            <h2 className="font-bold text-amber-950">
                                Ada laporan yang perlu diperiksa
                            </h2>

                            <p className="mt-1 text-sm leading-6 text-amber-900">
                                Periksa laporan yang masih menunggu verifikasi.
                                Buka bukti pendukung apabila tersedia sebelum
                                mengambil keputusan.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                    <SummaryCard
                        label="Menunggu verifikasi"
                        value={pendingCount}
                        description="Laporan yang perlu diperiksa admin"
                    />

                    <SummaryCard
                        label="Total laporan"
                        value={total}
                        description="Seluruh laporan yang tercatat"
                    />
                </div>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-bold text-slate-900">
                                Semua laporan
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Bukti pendukung dapat dibuka jika pelapor
                                melampirkannya.
                            </p>
                        </div>

                        <span className="text-sm text-slate-500">
                            {rows.length} laporan ditampilkan
                        </span>
                    </div>

                    {rows.length === 0 ? (
                        <div className="px-5 py-14 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-500">
                                <FileText className="h-6 w-6" />
                            </div>

                            <h3 className="mt-4 font-semibold text-slate-900">
                                Belum ada laporan
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Laporan perubahan status anggota dari keluarga
                                akan muncul di halaman ini.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {rows.map((report) => {
                                const status = VERIFICATION_UI[
                                    verificationKey(report)
                                ] ?? {
                                    label: "Status tidak diketahui",
                                    tone: "neutral",
                                };

                                const member =
                                    report.subject?.name ??
                                    report.member_user?.name ??
                                    "Anggota keluarga";

                                const hasEvidence = Boolean(
                                    report.has_evidence,
                                );

                                return (
                                    <article
                                        key={report.id}
                                        className="p-5 transition hover:bg-slate-50/70"
                                    >
                                        <div className="flex flex-col gap-4">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-bold text-slate-900">
                                                        {member}
                                                    </h3>

                                                    <Pill tone={status.tone}>
                                                        {status.label}
                                                    </Pill>

                                                    {hasEvidence && (
                                                        <Pill tone="info">
                                                            Bukti terlampir
                                                        </Pill>
                                                    )}
                                                </div>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    Keluarga:{" "}
                                                    {report.family?.name ??
                                                        "Tidak tersedia"}
                                                </p>

                                                <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                                                    <div>
                                                        <p className="text-xs text-slate-500">
                                                            Pelapor
                                                        </p>

                                                        <p className="mt-1 font-medium text-slate-800">
                                                            {report.reporter
                                                                ?.name ??
                                                                "Tidak tersedia"}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-slate-500">
                                                            Tanggal laporan
                                                        </p>

                                                        <p className="mt-1 font-medium text-slate-800">
                                                            {report.created_at
                                                                ? formatDate(
                                                                      report.created_at,
                                                                  )
                                                                : "—"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {report.report_note && (
                                                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                                                        {report.report_note}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                                                {hasEvidence ? (
                                                    <a
                                                        href={route(
                                                            "status-reports.evidence",
                                                            report.id,
                                                        )}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-800 transition hover:bg-teal-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                        Lihat / unduh bukti
                                                    </a>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500">
                                                        Tidak ada bukti
                                                        terlampir
                                                    </span>
                                                )}

                                                <Link
                                                    href={route(
                                                        "admin.status-reports.show",
                                                        report.id,
                                                    )}
                                                    className="inline-flex items-center justify-center rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
                                                >
                                                    Periksa laporan
                                                    <span
                                                        className="ml-2"
                                                        aria-hidden="true"
                                                    >
                                                        →
                                                    </span>
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    {reports?.links?.length > 0 && (
                        <nav
                            aria-label="Navigasi halaman laporan"
                            className="flex flex-wrap gap-2 border-t border-slate-200 px-5 py-4"
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
            </div>
        </AdminLayout>
    );
}
