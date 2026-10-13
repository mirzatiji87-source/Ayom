import { Head, Link, router, useForm } from "@inertiajs/react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useState } from "react";

import OrangTuaLayout from "@/Layouts/OrangTuaLayout";
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

const CARD =
    "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

const BPJS_OPTIONS = [
    {
        value: "not_reported",
        label: "Belum ada laporan keluarga",
    },
    {
        value: "reported_by_family",
        label: "Keluarga sudah melaporkan",
    },
    {
        value: "confirmed_by_family",
        label: "Keluarga mencatat konfirmasi yang diterima",
    },
];

const VERIFICATION_LABELS = {
    pending: "Menunggu verifikasi",
    verified: "Terverifikasi admin",
    rejected: "Laporan ditolak",
};

function displayValue(value, fallback = "Belum dicatat") {
    if (value === null || value === undefined || value === "") {
        return fallback;
    }

    return value;
}

export default function StatusReportShow({
    report,
    followUps = [],
    bpjsProfile = null,
    bills = [],
    pendingTransactions = [],
    official = {},
}) {
    const [busyFollowUpId, setBusyFollowUpId] = useState(null);
    const [busyBillId, setBusyBillId] = useState(null);

    const bpjsForm = useForm({
        status: report?.bpjs_report_status ?? "not_reported",
        reference: report?.bpjs_reference ?? "",
    });

    const approved = report?.verification_status === "verified";
    const needsReference =
        bpjsForm.data.status === "confirmed_by_family";

    function submitBpjs(event) {
        event.preventDefault();

        bpjsForm.put(
            route("orang-tua.status-reports.bpjs", report.id),
            {
                preserveScroll: true,
            },
        );
    }

    function completeFollowUp(item) {
        if (busyFollowUpId !== null) return;

        setBusyFollowUpId(item.id);

        router.put(
            route("orang-tua.follow-ups.complete", item.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setBusyFollowUpId(null),
            },
        );
    }

    function resolveBill(bill, decision) {
        if (busyBillId !== null) return;

        setBusyBillId(bill.id);

        router.put(
            route("orang-tua.bills.schedule", bill.id),
            { decision },
            {
                preserveScroll: true,
                onFinish: () => setBusyBillId(null),
            },
        );
    }

    return (
        <OrangTuaLayout>
            <Head title={`Detail Laporan #${report?.id ?? ""}`} />

            <div className="mx-auto max-w-6xl space-y-6 pb-10">
                <Link
                    href={route("orang-tua.status-reports.index")}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-teal-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke laporan keluarga
                </Link>

                <header>
                    <p className="text-sm font-semibold text-teal-700">
                        DETAIL LAPORAN KELUARGA
                    </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Tindak lanjut status anggota
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Pantau verifikasi admin dan catat tindak lanjut keluarga
                        tanpa menghapus akun, saldo, tagihan, atau riwayat
                        transaksi sebelumnya.
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
                                Status pemeriksaan
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Laporan diperiksa oleh admin Ayom.
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <Fact
                            label="Status verifikasi"
                            value={
                                VERIFICATION_LABELS[
                                    report?.verification_status
                                ] ?? "Status tidak diketahui"
                            }
                        />

                        <Fact
                            label="Tanggal verifikasi"
                            value={displayValue(report?.verified_at, "Belum diverifikasi")}
                        />

                        <Fact
                            label="Catatan admin"
                            value={displayValue(
                                report?.verification_note,
                                "Belum ada catatan admin.",
                            )}
                        />
                    </div>

                    {report?.verification_status === "pending" && (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                            Laporan sedang menunggu pemeriksaan admin. Status
                            anggota belum dianggap terverifikasi.
                        </div>
                    )}

                    {report?.verification_status === "rejected" && (
                        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800">
                            Laporan ini ditolak oleh admin. Periksa catatan
                            penolakan sebelum mengirim laporan baru.
                        </div>
                    )}
                </section>

                <section className={CARD}>
                    <h2 className="font-bold text-slate-900">
                        Alur tindak lanjut
                    </h2>

                    <div className="mt-5">
                        <Timeline report={report} />
                    </div>
                </section>

                <section className={CARD}>
                    <h2 className="font-bold text-slate-900">
                        Data BPJS yang tercatat
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        Nomor peserta disamarkan. Informasi ini berasal dari
                        catatan keluarga, bukan konfirmasi langsung dari BPJS
                        Kesehatan.
                    </p>

                    {bpjsProfile ? (
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <Fact
                                label="Nama peserta"
                                value={displayValue(bpjsProfile.participant_name)}
                            />

                            <Fact
                                label="Nomor peserta"
                                value={displayValue(bpjsProfile.masked_number)}
                            />

                            <Fact
                                label="Kelas kepesertaan"
                                value={displayValue(bpjsProfile.membership_class)}
                            />

                            <Fact
                                label="Segmen"
                                value={displayValue(bpjsProfile.segment)}
                            />

                            <Fact
                                label="Status kepesertaan tercatat"
                                value={displayValue(bpjsProfile.membership_status)}
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
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="font-bold text-slate-900">
                                Catatan tindak lanjut BPJS
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                Catat tindakan yang dilakukan keluarga. Hindari
                                memasukkan informasi pribadi yang tidak diperlukan.
                            </p>
                        </div>

                        <Pill
                            tone={
                                report?.bpjs_report_status === "not_reported"
                                    ? "warning"
                                    : "info"
                            }
                        >
                            {report?.bpjs_report_status === "reported_by_family"
                                ? "Dilaporkan keluarga"
                                : report?.bpjs_report_status === "confirmed_by_family"
                                  ? "Konfirmasi dicatat keluarga"
                                  : "Belum dicatat"}
                        </Pill>
                    </div>

                    {!approved ? (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                            Form tindak lanjut tersedia setelah laporan
                            terverifikasi admin.
                        </div>
                    ) : (
                        <form onSubmit={submitBpjs} className="mt-5 space-y-4">
                            <div>
                                <label
                                    htmlFor="bpjs-status"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Status yang ingin dicatat
                                </label>

                                <select
                                    id="bpjs-status"
                                    value={bpjsForm.data.status}
                                    onChange={(event) =>
                                        bpjsForm.setData("status", event.target.value)
                                    }
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
                                >
                                    {BPJS_OPTIONS.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>

                                {bpjsForm.errors.status && (
                                    <p className="mt-2 text-sm text-rose-700">
                                        {bpjsForm.errors.status}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="bpjs-reference"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    {needsReference
                                        ? "Catatan referensi (wajib untuk status ini)"
                                        : "Catatan referensi (opsional)"}
                                </label>

                                <textarea
                                    id="bpjs-reference"
                                    value={bpjsForm.data.reference}
                                    onChange={(event) =>
                                        bpjsForm.setData(
                                            "reference",
                                            event.target.value,
                                        )
                                    }
                                    rows={3}
                                    maxLength={1000}
                                    required={needsReference}
                                    placeholder={
                                        needsReference
                                            ? "Masukkan catatan referensi tindak lanjut keluarga..."
                                            : "Catatan singkat tentang tindak lanjut keluarga..."
                                    }
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
                                />

                                {bpjsForm.errors.reference && (
                                    <p className="mt-2 text-sm text-rose-700">
                                        {bpjsForm.errors.reference}
                                    </p>
                                )}
                            </div>

                            <ErrorList errors={bpjsForm.errors} />

                            {needsReference && (
                                <p className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm leading-6 text-sky-900">
                                    Status ini berarti keluarga mencatat bahwa
                                    konfirmasi telah diterima. Ayom tidak
                                    memverifikasi kepesertaan secara langsung
                                    dengan BPJS.
                                </p>
                            )}

                            <div className="flex justify-end">
                                <ActionButton
                                    type="submit"
                                    disabled={bpjsForm.processing}
                                    processing={bpjsForm.processing}
                                >
                                    Simpan catatan BPJS
                                </ActionButton>
                            </div>
                        </form>
                    )}
                </section>

                <section className="space-y-3">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Tindak lanjut keluarga
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Tandai tindak lanjut selesai setelah benar-benar
                            dilakukan. Catatan tidak menggantikan proses resmi.
                        </p>
                    </div>

                    <FollowUpList
                        items={followUps}
                        busyId={busyFollowUpId}
                        onComplete={completeFollowUp}
                    />
                </section>

                <section className="space-y-3">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Jadwal tagihan anggota
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                            Tinjau jadwal tagihan tanpa menghapus transaksi masa
                            lalu.
                        </p>
                    </div>

                    <BillList
                        bills={bills}
                        onResolve={resolveBill}
                        busyId={busyBillId}
                    />
                </section>

                <section className="space-y-3">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Transaksi tertunda
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Periksa transaksi yang masih tertunda sebelum
                            menentukan tindak lanjut.
                        </p>
                    </div>

                    <PendingTransactionList transactions={pendingTransactions} />
                </section>

                <OfficialChannelCard />

                <p className="text-xs leading-5 text-slate-500">
                    Ayom adalah alat pencatatan dan pengelolaan keluarga, bukan
                    penyelenggara BPJS Kesehatan. Status dalam aplikasi tidak
                    otomatis mengubah status kepesertaan resmi.
                </p>
            </div>
        </OrangTuaLayout>
    );
}
