import { Head, Link, useForm } from "@inertiajs/react";
import { ExternalLink, HeartPulse, ShieldCheck, Wallet } from "lucide-react";

import OrangTuaLayout from "@/Layouts/OrangTuaLayout";
import { formatDate, formatRupiah } from "@/lib/ayom-theme";
import {
    ActionButton,
    ErrorList,
    Fact,
    OfficialChannelCard,
    Pill,
} from "@/Components/LifeEvent/shared";

const CARD = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

const ROLE_LABELS = {
    orang_tua: "Orang tua",
    lansia: "Lansia",
    remaja: "Remaja",
};

const MEMBERSHIP_LABELS = {
    unknown: "Belum diketahui",
    active: "Aktif menurut catatan",
    inactive: "Nonaktif menurut catatan",
    needs_review: "Perlu diperiksa",
};

function StatusPill({ status }) {
    const normalized = String(status ?? "unknown").toLowerCase();

    if (["completed", "active", "paid"].includes(normalized)) {
        return <Pill tone="success">{labelStatus(status)}</Pill>;
    }

    if (["pending", "unknown", "needs_review"].includes(normalized)) {
        return <Pill tone="warning">{labelStatus(status)}</Pill>;
    }

    if (["rejected", "failed", "inactive", "cancelled"].includes(normalized)) {
        return <Pill tone="danger">{labelStatus(status)}</Pill>;
    }

    return <Pill tone="neutral">{labelStatus(status)}</Pill>;
}
function LifeStatusPill({ lifeStatus }) {
    if (lifeStatus === "deceased") {
        return <Pill tone="danger">Ditandai meninggal di Ayom</Pill>;
    }

    return <Pill tone="success">Aktif di Ayom</Pill>;
}

function labelStatus(value) {
    const labels = {
        completed: "Selesai",
        pending: "Menunggu",
        rejected: "Ditolak",
        failed: "Gagal",
        cancelled: "Dibatalkan",
        paid: "Lunas tercatat",
        unknown: "Belum diketahui",
        active: "Aktif menurut catatan",
        inactive: "Nonaktif menurut catatan",
        needs_review: "Perlu diperiksa",
        normal: "Normal",
        perlu_ditinjau: "Perlu ditinjau",
        dihentikan: "Dihentikan",
        simulation: "Simulasi",
        bill_payment: "Pembayaran tagihan",
    };

    return labels[String(value ?? "").toLowerCase()] ?? value ?? "—";
}

function MemberBpjsCard({ member, profile, memberBills, canEdit }) {
    const linkedBillId = profile?.bill_id ? String(profile.bill_id) : "";

    const { data, setData, put, transform, processing, errors, reset } =
        useForm({
            participant_name: profile?.participant_name ?? member.name ?? "",
            participant_number: "",
            relationship_to_head: profile?.relationship_to_head ?? "",
            membership_class: profile?.membership_class ?? "",
            segment: profile?.segment ?? "",
            membership_status: profile?.membership_status ?? "unknown",
            monthly_contribution:
                profile?.monthly_contribution == null
                    ? ""
                    : String(profile.monthly_contribution),
            notes: profile?.notes ?? "",
            bill_id: linkedBillId,
        });

    const currentBillIsListed = memberBills.some(
        (bill) => String(bill.id) === linkedBillId,
    );

    function submit(event) {
        event.preventDefault();

        transform((formData) => {
            const payload = { ...formData };

            // Nomor kosong berarti pertahankan nomor lama.
            if (!payload.participant_number.trim()) {
                delete payload.participant_number;
            }

            payload.bill_id = payload.bill_id ? Number(payload.bill_id) : null;

            payload.monthly_contribution =
                payload.monthly_contribution === ""
                    ? null
                    : Number(payload.monthly_contribution);

            return payload;
        });

        put(route("bpjs.upsert", member.id), {
            preserveScroll: true,
            onSuccess: () => reset("participant_number"),
        });
    }

    const deceased = member.life_status === "deceased";

    return (
        <article className={CARD}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="rounded-xl bg-teal-50 p-3 text-teal-800">
                        <HeartPulse className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                        <h3 className="break-words text-lg font-bold text-slate-900">
                            {member.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            {ROLE_LABELS[member.role] ?? member.role}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                            <LifeStatusPill lifeStatus={member.life_status} />

                            <Pill tone={profile ? "info" : "neutral"}>
                                {profile
                                    ? "Profil BPJS tercatat"
                                    : "Belum ada profil"}
                            </Pill>
                        </div>
                    </div>
                </div>

                {profile?.masked_number && (
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                        <p className="text-xs text-slate-500">
                            Nomor peserta tersamarkan
                        </p>
                        <p className="mt-1 font-mono text-sm font-semibold text-slate-800">
                            {profile.masked_number}
                        </p>
                    </div>
                )}
            </div>

            {deceased && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                    Anggota ini ditandai meninggal di Ayom. Profil hanya
                    ditampilkan; pengeditan profil BPJS dinonaktifkan. Catatan
                    ini tidak menyatakan bahwa status kepesertaan resmi sudah
                    berubah.
                </div>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Fact
                    label="Kelas kepesertaan"
                    value={profile?.membership_class || "Belum dicatat"}
                />

                <Fact
                    label="Segmen"
                    value={profile?.segment || "Belum dicatat"}
                />

                <Fact
                    label="Status dalam catatan Ayom"
                    value={
                        MEMBERSHIP_LABELS[profile?.membership_status] ??
                        profile?.membership_status ??
                        "Belum diketahui"
                    }
                />

                <Fact
                    label="Hubungan dengan kepala keluarga"
                    value={profile?.relationship_to_head || "Belum dicatat"}
                />

                <Fact
                    label="Iuran bulanan yang dicatat"
                    value={
                        profile?.monthly_contribution != null
                            ? formatRupiah(profile.monthly_contribution)
                            : "Belum dicatat"
                    }
                />

                <Fact
                    label="Terakhir diverifikasi"
                    value={
                        profile?.last_verified_at
                            ? formatDate(profile.last_verified_at)
                            : "Belum dicatat"
                    }
                />
            </div>

            {profile?.notes && (
                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-slate-500">
                        Catatan keluarga
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {profile.notes}
                    </p>
                </div>
            )}

            {canEdit && !deceased && (
                <details className="mt-5 rounded-xl border border-slate-200">
                    <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-teal-800 hover:bg-teal-50">
                        {profile ? "Ubah profil BPJS" : "Tambah profil BPJS"}
                    </summary>

                    <form
                        onSubmit={submit}
                        className="space-y-4 border-t border-slate-200 p-4"
                    >
                        <div>
                            <label
                                htmlFor={`participant-name-${member.id}`}
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Nama peserta
                            </label>

                            <input
                                id={`participant-name-${member.id}`}
                                type="text"
                                maxLength={255}
                                required
                                value={data.participant_name}
                                onChange={(event) =>
                                    setData(
                                        "participant_name",
                                        event.target.value,
                                    )
                                }
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
                            />

                            {errors.participant_name && (
                                <p className="mt-2 text-sm text-rose-700">
                                    {errors.participant_name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor={`participant-number-${member.id}`}
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Nomor peserta BPJS
                            </label>

                            <input
                                id={`participant-number-${member.id}`}
                                type="password"
                                inputMode="numeric"
                                autoComplete="new-password"
                                pattern="[0-9]{8,20}"
                                maxLength={20}
                                value={data.participant_number}
                                onChange={(event) =>
                                    setData(
                                        "participant_number",
                                        event.target.value.replace(/\D/g, ""),
                                    )
                                }
                                placeholder="Isi hanya saat menambah atau mengganti nomor"
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
                            />

                            <p className="mt-2 text-xs leading-5 text-slate-500">
                                8–20 digit. Kolom ini sengaja tidak diisi
                                otomatis dari nomor tersimpan. Biarkan kosong
                                untuk mempertahankan nomor sebelumnya.
                            </p>

                            {errors.participant_number && (
                                <p className="mt-2 text-sm text-rose-700">
                                    {errors.participant_number}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor={`relationship-${member.id}`}
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Hubungan keluarga
                                </label>

                                <input
                                    id={`relationship-${member.id}`}
                                    type="text"
                                    maxLength={50}
                                    value={data.relationship_to_head}
                                    onChange={(event) =>
                                        setData(
                                            "relationship_to_head",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Contoh: orang tua"
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
                                />

                                {errors.relationship_to_head && (
                                    <p className="mt-2 text-sm text-rose-700">
                                        {errors.relationship_to_head}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor={`class-${member.id}`}
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Kelas kepesertaan
                                </label>

                                <input
                                    id={`class-${member.id}`}
                                    type="text"
                                    maxLength={20}
                                    value={data.membership_class}
                                    onChange={(event) =>
                                        setData(
                                            "membership_class",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Contoh: kelas 1"
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
                                />

                                {errors.membership_class && (
                                    <p className="mt-2 text-sm text-rose-700">
                                        {errors.membership_class}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor={`segment-${member.id}`}
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Segmen
                                </label>

                                <input
                                    id={`segment-${member.id}`}
                                    type="text"
                                    maxLength={50}
                                    value={data.segment}
                                    onChange={(event) =>
                                        setData("segment", event.target.value)
                                    }
                                    placeholder="Contoh: PBI atau PBPU"
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
                                />

                                {errors.segment && (
                                    <p className="mt-2 text-sm text-rose-700">
                                        {errors.segment}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor={`membership-status-${member.id}`}
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Status dalam catatan
                                </label>

                                <select
                                    id={`membership-status-${member.id}`}
                                    value={data.membership_status}
                                    onChange={(event) =>
                                        setData(
                                            "membership_status",
                                            event.target.value,
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
                                >
                                    <option value="unknown">
                                        Belum diketahui
                                    </option>
                                    <option value="active">
                                        Aktif menurut catatan
                                    </option>
                                    <option value="inactive">
                                        Nonaktif menurut catatan
                                    </option>
                                    <option value="needs_review">
                                        Perlu diperiksa
                                    </option>
                                </select>

                                {errors.membership_status && (
                                    <p className="mt-2 text-sm text-rose-700">
                                        {errors.membership_status}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor={`contribution-${member.id}`}
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Iuran bulanan (Rp)
                                </label>

                                <input
                                    id={`contribution-${member.id}`}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.monthly_contribution}
                                    onChange={(event) =>
                                        setData(
                                            "monthly_contribution",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Opsional"
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
                                />

                                {errors.monthly_contribution && (
                                    <p className="mt-2 text-sm text-rose-700">
                                        {errors.monthly_contribution}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor={`bill-${member.id}`}
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Hubungkan tagihan BPJS
                                </label>

                                <select
                                    id={`bill-${member.id}`}
                                    value={data.bill_id}
                                    onChange={(event) =>
                                        setData("bill_id", event.target.value)
                                    }
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
                                >
                                    <option value="">Tidak dihubungkan</option>

                                    {profile?.bill_id &&
                                        !currentBillIsListed && (
                                            <option value={linkedBillId}>
                                                Tagihan tertaut sebelumnya #
                                                {linkedBillId}
                                            </option>
                                        )}

                                    {memberBills.map((bill) => (
                                        <option
                                            key={bill.id}
                                            value={String(bill.id)}
                                        >
                                            {bill.name} —{" "}
                                            {formatRupiah(bill.amount)}
                                        </option>
                                    ))}
                                </select>

                                {errors.bill_id && (
                                    <p className="mt-2 text-sm text-rose-700">
                                        {errors.bill_id}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor={`notes-${member.id}`}
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Catatan keluarga
                            </label>

                            <textarea
                                id={`notes-${member.id}`}
                                rows={3}
                                maxLength={2000}
                                value={data.notes}
                                onChange={(event) =>
                                    setData("notes", event.target.value)
                                }
                                placeholder="Catatan tambahan jika diperlukan..."
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
                            />

                            {errors.notes && (
                                <p className="mt-2 text-sm text-rose-700">
                                    {errors.notes}
                                </p>
                            )}
                        </div>

                        <ErrorList errors={errors} />

                        <div className="flex justify-end">
                            <ActionButton
                                type="submit"
                                disabled={processing}
                                processing={processing}
                            >
                                Simpan profil
                            </ActionButton>
                        </div>
                    </form>
                </details>
            )}
        </article>
    );
}

function BpjsBillCard({ bill }) {
    const payment = bill.latest_payment ?? bill.latestPayment ?? null;
    const blockedReason = bill.blocked_reason;

    return (
        <article className={CARD}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h3 className="font-bold text-slate-900">{bill.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                        Peserta: {bill.user?.name ?? "Anggota keluarga"}
                    </p>
                </div>

                <StatusPill status={bill.schedule_status ?? "normal"} />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Fact label="Nominal" value={formatRupiah(bill.amount)} />
                <Fact label="Frekuensi" value={bill.frequency ?? "—"} />
                <Fact
                    label="Jatuh tempo"
                    value={
                        bill.next_due_date
                            ? formatDate(bill.next_due_date)
                            : "—"
                    }
                />
                <Fact
                    label="Pembayaran terakhir"
                    value={
                        payment?.created_at
                            ? formatDate(payment.created_at)
                            : "Belum ada"
                    }
                />
                <Fact
                    label="Status pembayaran terakhir"
                    value={
                        payment
                            ? labelStatus(payment.status)
                            : "Belum ada pembayaran"
                    }
                />
                <Fact
                    label="Mode pencatatan"
                    value={
                        payment?.payment_mode
                            ? labelStatus(payment.payment_mode)
                            : "Belum tersedia"
                    }
                />
            </div>

            {blockedReason && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                    Perlu diperiksa: {blockedReason}
                </div>
            )}
        </article>
    );
}

function PaymentHistory({ history = [], members = [], bills = [] }) {
    const memberNames = Object.fromEntries(
        members.map((member) => [String(member.id), member.name]),
    );

    const billNames = Object.fromEntries(
        bills.map((bill) => [String(bill.id), bill.name]),
    );

    if (!history.length) {
        return (
            <div className={`${CARD} text-sm leading-6 text-slate-500`}>
                Belum ada riwayat pembayaran tagihan BPJS di Ayom.
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="divide-y divide-slate-100">
                {history.map((transaction) => (
                    <article
                        key={transaction.id}
                        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="min-w-0">
                            <p className="break-words font-semibold text-slate-900">
                                {transaction.description ||
                                    billNames[String(transaction.bill_id)] ||
                                    `Transaksi #${transaction.id}`}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                {memberNames[String(transaction.user_id)] ??
                                    "Anggota keluarga"}
                                {" · "}
                                {transaction.created_at
                                    ? formatDate(transaction.created_at)
                                    : "Tanggal tidak tersedia"}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">
                                <StatusPill status={transaction.status} />
                                {transaction.payment_mode && (
                                    <Pill tone="neutral">
                                        {labelStatus(transaction.payment_mode)}
                                    </Pill>
                                )}
                            </div>
                        </div>

                        <p className="text-lg font-bold text-slate-900">
                            {formatRupiah(transaction.amount)}
                        </p>
                    </article>
                ))}
            </div>
        </div>
    );
}

export default function BpjsOverview({
    members = [],
    bills = [],
    history = [],
    profiles = [],
    paymentMode = "simulation",
    notice,
    official = {},
}) {
    const profileByUser = Object.fromEntries(
        profiles.map((profile) => [String(profile.user_id), profile]),
    );

    const billsByUser = bills.reduce((result, bill) => {
        const userId = String(bill.user_id);

        if (!result[userId]) result[userId] = [];
        result[userId].push(bill);

        return result;
    }, {});

    const officialUrl = official?.url || "https://www.bpjs-kesehatan.go.id/";

    const configuredCareCenter =
        official?.care_center && official.care_center.trim()
            ? official.care_center
            : null;

    return (
        <OrangTuaLayout>
            <Head title="Ringkasan BPJS Keluarga" />

            <div className="mx-auto max-w-6xl space-y-6 pb-10">
                <header>
                    <p className="text-sm font-semibold text-teal-700">
                        KEUANGAN KELUARGA
                    </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        BPJS Keluarga
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Kelola catatan peserta, jadwal tagihan, dan riwayat
                        transaksi BPJS yang dicatat melalui Ayom.
                    </p>
                </header>

                <section className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-white p-2 text-sky-800 shadow-sm">
                            <ShieldCheck className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                            <h2 className="font-bold text-slate-900">
                                Ayom bukan layanan resmi BPJS
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-slate-700">
                                {notice ||
                                    "Pembayaran pada halaman ini hanya catatan simulasi internal Ayom; bukan pembayaran ke BPJS Kesehatan."}
                            </p>

                            <a
                                href={officialUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-sky-800 underline underline-offset-4"
                            >
                                Situs resmi BPJS Kesehatan
                                <ExternalLink className="h-4 w-4" />
                            </a>

                            {configuredCareCenter && (
                                <p className="mt-2 text-sm text-slate-600">
                                    Kanal layanan yang dicatat di konfigurasi:{" "}
                                    {configuredCareCenter}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className={CARD}>
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-teal-50 p-2 text-teal-800">
                                <HeartPulse className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-medium text-slate-500">
                                Anggota keluarga
                            </p>
                        </div>
                        <p className="mt-3 text-3xl font-bold text-slate-900">
                            {members.length}
                        </p>
                    </div>

                    <div className={CARD}>
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-sky-50 p-2 text-sky-800">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-medium text-slate-500">
                                Profil BPJS
                            </p>
                        </div>
                        <p className="mt-3 text-3xl font-bold text-slate-900">
                            {profiles.length}
                        </p>
                    </div>

                    <div className={CARD}>
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-amber-50 p-2 text-amber-800">
                                <Wallet className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-medium text-slate-500">
                                Tagihan aktif
                            </p>
                        </div>
                        <p className="mt-3 text-3xl font-bold text-slate-900">
                            {bills.length}
                        </p>
                    </div>
                </div>

                <section className="space-y-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Profil peserta keluarga
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                            Nomor peserta yang sudah tersimpan hanya ditampilkan
                            dalam bentuk tersamarkan. Status di halaman ini
                            merupakan catatan keluarga, bukan pengecekan
                            langsung ke sistem BPJS.
                        </p>
                    </div>

                    {members.length === 0 ? (
                        <div
                            className={`${CARD} text-sm leading-6 text-slate-500`}
                        >
                            Belum ada anggota keluarga yang dapat ditampilkan.
                            Pastikan akun orang tua terhubung dengan keluarga.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {members.map((member) => (
                                <MemberBpjsCard
                                    key={member.id}
                                    member={member}
                                    profile={
                                        profileByUser[String(member.id)] ?? null
                                    }
                                    memberBills={
                                        billsByUser[String(member.id)] ?? []
                                    }
                                    canEdit
                                />
                            ))}
                        </div>
                    )}
                </section>

                <section className="space-y-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Jadwal tagihan BPJS
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                            Daftar ini menunjukkan tagihan BPJS aktif yang
                            tercatat di Ayom. Tidak ada pembayaran resmi BPJS
                            yang dilakukan melalui halaman ini.
                        </p>
                    </div>

                    {bills.length === 0 ? (
                        <div
                            className={`${CARD} text-sm leading-6 text-slate-500`}
                        >
                            Belum ada tagihan BPJS aktif yang tercatat untuk
                            anggota keluarga ini.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {bills.map((bill) => (
                                <BpjsBillCard key={bill.id} bill={bill} />
                            ))}
                        </div>
                    )}
                </section>

                <section className="space-y-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Riwayat pembayaran di Ayom
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                            Riwayat transaksi tetap disimpan. Label simulasi
                            berarti pencatatan internal Ayom dan tidak
                            membuktikan tagihan BPJS sebenarnya telah dibayar.
                        </p>
                    </div>

                    <PaymentHistory
                        history={history}
                        members={members}
                        bills={bills}
                    />
                </section>

                <OfficialChannelCard />

                <div className="text-xs leading-5 text-slate-500">
                    Mode pencatatan: <strong>{labelStatus(paymentMode)}</strong>
                    . Untuk pengurusan administrasi kepesertaan, gunakan kanal
                    resmi BPJS Kesehatan.
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link
                        href={route("orang-tua.status-reports.index")}
                        className="inline-flex items-center justify-center rounded-xl bg-teal-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-900"
                    >
                        Laporan status anggota
                    </Link>

                    <Link
                        href={route("orang-tua.dashboard")}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Kembali ke dashboard
                    </Link>
                </div>
            </div>
        </OrangTuaLayout>
    );
}
