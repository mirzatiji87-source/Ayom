import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import AdminLayout from "@/Layouts/AdminLayout";
import {
    ActionButton,
    BillList,
    ErrorList,
    Fact,
    FollowUpList,
    OfficialChannelCard,
    PendingTransactionList,
    Pill,
    ReportSummary,
    Timeline,
} from "@/Components/LifeEvent/shared";

const CARD = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

export default function StatusReportShow({
    report,
    followUps = [],
    bpjsProfile = null,
    bills = [],
    pendingTransactions = [],
    canVerify = false,
    official = {},
}) {
    const { data, setData, put, processing, errors, reset } = useForm({
        note: "",
    });

    const submitVerification = (decision) => {
        const endpoint =
            decision === "verify"
                ? "admin.status-reports.verify"
                : "admin.status-reports.reject";

        put(route(endpoint, report.id), {
            preserveScroll: true,
            onSuccess: () => reset("note"),
        });
    };

    const verificationLabels = {
        pending: "Menunggu verifikasi",
        verified: "Terverifikasi",
        rejected: "Ditolak",
    };

    return (
        <AdminLayout>
            <Head title={`Detail Laporan #${report?.id ?? ""}`} />

            <div className="mx-auto max-w-6xl space-y-6 pb-10">
                <Link
                    href={route("admin.status-reports.index")}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-teal-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke daftar laporan
                </Link>

                <header>
                    <p className="text-sm font-semibold text-teal-700">
                        PEMERIKSAAN ADMIN
                    </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Detail laporan status
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Periksa informasi dan catatan pelapor sebelum menentukan
                        hasil verifikasi. Verifikasi laporan tidak menghapus
                        akun, saldo, atau riwayat transaksi.
                    </p>
                </header>

                <ReportSummary report={report} />

                <section className={CARD}>
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-teal-50 p-2 text-teal-800">
                            <ShieldCheck className="h-5 w-5" />
                        </div>

                        <div>
                            <h2 className="font-bold text-slate-900">
                                Informasi pemeriksaan
                            </h2>
                            <p className="text-sm text-slate-500">
                                Ringkasan keluarga dan status laporan.
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Fact label="Keluarga" value={report?.family?.name} />

                        <Fact
                            label="Status verifikasi"
                            value={
                                verificationLabels[
                                    report?.verification_status
                                ] ?? "Tidak diketahui"
                            }
                        />

                        <Fact
                            label="Diverifikasi oleh"
                            value={
                                report?.verifier?.name ?? "Belum diverifikasi"
                            }
                        />

                        <Fact
                            label="Nomor laporan"
                            value={`#${report?.id ?? "—"}`}
                        />

                        <Fact
                            label="Catatan verifikasi"
                            value={
                                report?.verification_note ||
                                "Belum ada catatan verifikasi."
                            }
                        />
                    </div>
                </section>

                <section className={CARD}>
                    <h2 className="font-bold text-slate-900">
                        Ringkasan kepesertaan BPJS
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        Nomor peserta ditampilkan dalam bentuk tersamarkan.
                        Informasi di Ayom tidak menggantikan verifikasi langsung
                        kepada BPJS Kesehatan.
                    </p>

                    {bpjsProfile ? (
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <Fact
                                label="Nama peserta"
                                value={bpjsProfile.participant_name}
                            />

                            <Fact
                                label="Nomor peserta"
                                value={
                                    bpjsProfile.masked_number ?? "Belum dicatat"
                                }
                            />

                            <Fact
                                label="Kelas kepesertaan"
                                value={bpjsProfile.membership_class}
                            />

                            <Fact label="Segmen" value={bpjsProfile.segment} />

                            <Fact
                                label="Status tercatat"
                                value={bpjsProfile.membership_status}
                            />
                        </div>
                    ) : (
                        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                            Belum ada profil BPJS yang tercatat untuk anggota
                            ini.
                        </p>
                    )}
                </section>

                <section className={CARD}>
                    <h2 className="font-bold text-slate-900">
                        Alur status laporan
                    </h2>

                    <div className="mt-5">
                        <Timeline report={report} />
                    </div>
                </section>

                <section className="space-y-3">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Jadwal tagihan terkait
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Tagihan ditampilkan untuk ditinjau. Riwayat tagihan
                            yang sudah ada tetap dipertahankan.
                        </p>
                    </div>

                    <BillList bills={bills ?? []} />
                </section>

                <section className="space-y-3">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Transaksi tertunda
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Periksa transaksi sebelum keluarga melakukan tindak
                            lanjut. Halaman ini tidak menghapus transaksi
                            ataupun otomatis menyelesaikannya.
                        </p>
                    </div>

                    <PendingTransactionList
                        transactions={pendingTransactions ?? []}
                    />
                </section>

                <section className="space-y-3">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Tindak lanjut keluarga
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Progres tindak lanjut yang tercatat pada laporan.
                        </p>
                    </div>

                    <FollowUpList items={followUps ?? []} />
                </section>

                <OfficialChannelCard />

                {canVerify && report?.verification_status === "pending" && (
                    <section className={`${CARD} space-y-4`}>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Keputusan verifikasi
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                Berikan catatan bila diperlukan, kemudian pilih
                                hasil pemeriksaan. Persetujuan akan memperbarui
                                status anggota dan membuat daftar tindak lanjut.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="verification-note"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Catatan admin (opsional)
                            </label>

                            <textarea
                                id="verification-note"
                                value={data.note}
                                onChange={(event) =>
                                    setData("note", event.target.value)
                                }
                                rows={3}
                                maxLength={2000}
                                placeholder="Tulis catatan pemeriksaan..."
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
                            />

                            {errors.note && (
                                <p className="mt-2 text-sm text-rose-700">
                                    {errors.note}
                                </p>
                            )}
                        </div>

                        <ErrorList errors={errors} />

                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <ActionButton
                                variant="danger"
                                disabled={processing}
                                processing={processing}
                                onClick={() => submitVerification("reject")}
                            >
                                Tolak laporan
                            </ActionButton>

                            <ActionButton
                                variant="success"
                                disabled={processing}
                                processing={processing}
                                onClick={() => submitVerification("verify")}
                            >
                                Verifikasi laporan
                            </ActionButton>
                        </div>
                    </section>
                )}

                {!canVerify && report?.verification_status === "pending" && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                        Laporan ini masih menunggu verifikasi. Hanya admin yang
                        berwenang dapat memutuskan laporan, dan pelapor tidak
                        dapat memverifikasi laporannya sendiri.
                    </div>
                )}

                {report?.verification_status !== "pending" && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                        Laporan ini sudah memiliki keputusan:{" "}
                        <strong className="text-slate-900">
                            {verificationLabels[report?.verification_status] ??
                                "Status tidak diketahui"}
                        </strong>
                        . Form verifikasi tidak ditampilkan lagi.
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
