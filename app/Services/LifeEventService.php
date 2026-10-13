<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Bill;
use App\Models\FollowUpItem;
use App\Models\MemberStatusReport;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Models\Transaction;

class LifeEventService
{
    private const BPJS_FOLLOW_UP_TITLE =
    'Laporkan perubahan status peserta BPJS';

    private const BILL_FOLLOW_UP_TITLE =
    'Tinjau jadwal tagihan anggota';

    private const TRANSACTION_FOLLOW_UP_TITLE =
    'Tinjau transaksi tertunda anggota';

    /**
     * Membuat laporan perubahan status anggota.
     *
     * Parameter ketiga mendukung tanggal string maupun array yang dipakai
     * controller: event_date, notes, dan evidence_path.
     * Status anggota belum berubah sampai laporan disetujui admin.
     */
    public function reportDeceased(
        User $reporter,
        User $member,
        array|string|null $details = null,
        ?string $note = null
    ): MemberStatusReport {
        $deathDate = null;
        $evidencePath = null;

        if (is_array($details)) {
            $deathDate = $details['event_date']
                ?? $details['reported_death_date']
                ?? null;

            $note = $details['notes']
                ?? $details['report_note']
                ?? $note;

            $evidencePath = $details['evidence_path'] ?? null;
        } else {
            $deathDate = $details;
        }

        return DB::transaction(function () use (
            $reporter,
            $member,
            $deathDate,
            $note,
            $evidencePath
        ) {
            $actor = User::query()->findOrFail($reporter->getKey());

            $target = User::query()
                ->lockForUpdate()
                ->findOrFail($member->getKey());

            $this->assertCanManageMember($actor, $target);

            if ($target->family_id === null) {
                throw ValidationException::withMessages([
                    'user_id' => 'Anggota harus terhubung dengan keluarga.',
                ]);
            }

            if ($target->isDeceased()) {
                throw ValidationException::withMessages([
                    'user_id' => 'Status anggota ini sudah tercatat meninggal.',
                ]);
            }

            $hasPendingReport = MemberStatusReport::query()
                ->where('member_user_id', $target->id)
                ->where(
                    'verification_status',
                    MemberStatusReport::STATUS_PENDING
                )
                ->exists();

            if ($hasPendingReport) {
                throw ValidationException::withMessages([
                    'user_id' =>
                    'Masih ada laporan anggota ini yang menunggu verifikasi.',
                ]);
            }

            $report = MemberStatusReport::create([
                'family_id' => $target->family_id,
                'member_user_id' => $target->id,
                'reported_by' => $actor->id,
                'reported_life_status' =>
                MemberStatusReport::LIFE_STATUS_DECEASED,
                'reported_death_date' => $deathDate,
                'report_note' => $note,
                'evidence_path' => $evidencePath,
                'verification_status' =>
                MemberStatusReport::STATUS_PENDING,
                'bpjs_report_status' =>
                MemberStatusReport::BPJS_NOT_REPORTED,
            ]);

            // Tandai tagihan BPJS terkait agar tidak langsung diproses.
            $this->flagBpjsBills(
                $target,
                $report,
                'menunggu verifikasi laporan.'
            );

            $this->recordActivity(
                'member_status_report_created',
                $actor,
                $report,
                $report->family_id,
                [
                    'verification_status' =>
                    MemberStatusReport::STATUS_PENDING,
                ]
            );

            return $report;
        });
    }

    /**
     * Verifikasi atau tolak laporan.
     */
    public function verifyReport(
        User $verifier,
        MemberStatusReport $report,
        bool $approved,
        ?string $note = null
    ): MemberStatusReport {
        return DB::transaction(function () use (
            $verifier,
            $report,
            $approved,
            $note
        ) {
            $actor = User::query()->findOrFail($verifier->getKey());

            if (! $actor->isAdmin()) {
                throw new AuthorizationException(
                    'Hanya admin yang boleh memverifikasi atau menolak laporan.'
                );
            }

            $record = MemberStatusReport::query()
                ->lockForUpdate()
                ->findOrFail($report->getKey());

            $this->assertCanManageReport($actor, $record);

            if (
                $record->reported_by !== null
                && (int) $record->reported_by === (int) $actor->id
            ) {
                throw new AuthorizationException(
                    'Pembuat laporan tidak boleh memverifikasi laporannya sendiri.'
                );
            }

            if (
                $record->verification_status
                !== MemberStatusReport::STATUS_PENDING
            ) {
                throw ValidationException::withMessages([
                    'verification_status' =>
                    'Laporan ini sudah diproses sebelumnya.',
                ]);
            }

            $member = $record->member_user_id
                ? User::query()
                ->lockForUpdate()
                ->find($record->member_user_id)
                : null;

            if ($approved && ! $member) {
                throw ValidationException::withMessages([
                    'member_user_id' =>
                    'Anggota yang dilaporkan tidak ditemukan.',
                ]);
            }

            $record->verification_status = $approved
                ? MemberStatusReport::STATUS_VERIFIED
                : MemberStatusReport::STATUS_REJECTED;

            $record->verified_by = $actor->id;
            $record->verified_at = now();
            $record->verification_note = $note;
            $record->save();

            if ($approved && $member) {
                /*
                 * Laporan disetujui:
                 * - Tandai status anggota sebagai meninggal.
                 * - Nonaktifkan akun anggota.
                 * - Pertahankan record anggota dan riwayat keuangan.
                 */
                $member->forceFill([
                    'life_status' =>
                    MemberStatusReport::LIFE_STATUS_DECEASED,
                    'status_changed_at' => now(),
                    'is_active' => false,
                ])->save();

                $this->flagBpjsBills(
                    $member,
                    $record,
                    'laporan terverifikasi; tagihan perlu ditinjau.'
                );

                $this->createApprovalFollowUps($record);
            } elseif (! $approved && $member) {
                // Penolakan tidak menonaktifkan akun anggota.
                // Hapus hanya penanda jadwal milik laporan ini.
                $this->clearReportReviewFlags($member, $record);
            }

            $this->recordActivity(
                $approved
                    ? 'member_status_report_verified'
                    : 'member_status_report_rejected',
                $actor,
                $record,
                $record->family_id,
                [
                    'member_user_id' => $record->member_user_id,
                    'verification_status' => $record->verification_status,
                ]
            );

            return $record->fresh();
        });
    }

    /**
     * Alias untuk controller admin yang menggunakan verify().
     */
    public function verify(
        User $verifier,
        MemberStatusReport $report,
        ?string $note = null
    ): MemberStatusReport {
        return $this->verifyReport($verifier, $report, true, $note);
    }

    /**
     * Menolak laporan.
     */
    public function reject(
        User $verifier,
        MemberStatusReport $report,
        ?string $note = null
    ): MemberStatusReport {
        return $this->verifyReport($verifier, $report, false, $note);
    }

    /**
     * Detail laporan untuk halaman Admin dan Orang Tua.
     * Nomor peserta lengkap dan path dokumen privat tidak dikirim ke frontend.
     */
    public function detail(MemberStatusReport $report): array
    {
        $report->load([
            'family:id,name',
            'reporter:id,name',
            'verifier:id,name',
            'subject:id,name,role,life_status',
            'subject.bpjsProfile',
            'followUpItems',
        ]);

        $profile = $report->subject?->bpjsProfile;
        $memberId = $report->member_user_id;

        $bills = $memberId
            ? Bill::query()
            ->where('user_id', $memberId)
            ->where('is_active', true)
            ->orderBy('next_due_date')
            ->get([
                'id',
                'user_id',
                'name',
                'category',
                'amount',
                'frequency',
                'next_due_date',
                'schedule_status',
                'schedule_note',
            ])
            : collect();

        $pendingTransactions = $memberId
            ? Transaction::query()
            ->where('user_id', $memberId)
            ->where('status', 'pending')
            ->latest()
            ->get([
                'id',
                'type',
                'amount',
                'description',
                'created_at',
            ])
            : collect();

        return [
            'report' => $report,
            'followUps' => $report->followUpItems->sortBy('id')->values(),

            'bpjsProfile' => $profile ? [
                'masked_number' => $profile->maskedNumber(),
                'membership_class' => $profile->membership_class,
                'segment' => $profile->segment,
                'membership_status' => $profile->membership_status,
            ] : null,

            'bills' => $bills,
            'pendingTransactions' => $pendingTransactions,

            'statusValues' => [
                'verification' => [
                    'pending' => MemberStatusReport::STATUS_PENDING,
                    'verified' => MemberStatusReport::STATUS_VERIFIED,
                    'rejected' => MemberStatusReport::STATUS_REJECTED,
                ],
                'bpjs' => [
                    'not_reported' => MemberStatusReport::BPJS_NOT_REPORTED,
                    'reported' => MemberStatusReport::BPJS_REPORTED,
                    'confirmed' => MemberStatusReport::BPJS_CONFIRMED,
                ],
            ],

            'official' => [
                'url' => config('ayom.bpjs.official_url'),
                'care_center' => config('ayom.bpjs.care_center'),
            ],

            'notice' =>
            'Status terverifikasi hanya berlaku di Ayom. Ayom bukan '
                . 'penyelenggara BPJS dan tidak dapat menonaktifkan kepesertaan. '
                . 'Keluarga perlu melapor melalui kanal resmi BPJS.',
        ];
    }

    /**
     * Mencatat bahwa keluarga telah melaporkan perubahan ke BPJS.
     * Ini catatan keluarga, bukan konfirmasi resmi dari BPJS.
     */
    public function markBpjsReported(
        User $actor,
        MemberStatusReport $report,
        ?string $reference = null
    ): MemberStatusReport {
        return $this->updateBpjsStatus(
            $actor,
            $report,
            MemberStatusReport::BPJS_REPORTED,
            $reference
        );
    }

    /**
     * Mencatat progres tindak lanjut yang dilaporkan keluarga.
     */
    public function updateBpjsStatus(
        User $actor,
        MemberStatusReport $report,
        string $status,
        ?string $reference = null
    ): MemberStatusReport {
        if (! in_array($status, [
            MemberStatusReport::BPJS_REPORTED,
            MemberStatusReport::BPJS_CONFIRMED,
        ], true)) {
            throw ValidationException::withMessages([
                'status' => 'Status pelaporan BPJS tidak valid.',
            ]);
        }

        if (
            $status === MemberStatusReport::BPJS_CONFIRMED
            && blank($reference)
        ) {
            throw ValidationException::withMessages([
                'bpjs_reference' =>
                'Masukkan nomor referensi sebelum menandai tindak lanjut ini.',
            ]);
        }

        return DB::transaction(function () use (
            $actor,
            $report,
            $status,
            $reference
        ) {
            $user = User::query()->findOrFail($actor->getKey());

            $record = MemberStatusReport::query()
                ->lockForUpdate()
                ->findOrFail($report->getKey());

            $this->assertCanManageReport($user, $record);

            if (
                $record->verification_status
                !== MemberStatusReport::STATUS_VERIFIED
            ) {
                throw ValidationException::withMessages([
                    'verification_status' =>
                    'Laporan harus diverifikasi terlebih dahulu.',
                ]);
            }

            if (
                $record->bpjs_report_status
                === MemberStatusReport::BPJS_CONFIRMED
                && $status !== MemberStatusReport::BPJS_CONFIRMED
            ) {
                throw ValidationException::withMessages([
                    'bpjs_report_status' =>
                    'Status tindak lanjut yang sudah dicatat tidak dapat diturunkan.',
                ]);
            }

            $record->bpjs_report_status = $status;
            $record->bpjs_reported_at ??= now();

            if (filled($reference)) {
                $record->bpjs_reference = $reference;
            }

            $record->save();

            $item = $record->followUpItems()
                ->where('title', self::BPJS_FOLLOW_UP_TITLE)
                ->where('status', 'pending')
                ->first();

            if ($item) {
                $item->status = 'completed';
                $item->completed_by = $user->id;
                $item->completed_at = now();
                $item->completion_note =
                    'Keluarga mencatat bahwa tindak lanjut sudah dilaporkan. '
                    . 'Catatan ini bukan konfirmasi resmi dari BPJS.';
                $item->save();
            }

            $this->recordActivity(
                'bpjs_status_report_updated_by_family',
                $user,
                $record,
                $record->family_id,
                [
                    'bpjs_report_status' => $status,
                    'reference_provided' => filled($reference),
                ]
            );

            return $record->fresh();
        });
    }

    /**
     * Menyelesaikan item tindak lanjut dalam keluarga yang berhak.
     */
    public function completeFollowUp(
        User $actor,
        FollowUpItem $item,
        ?string $note = null
    ): FollowUpItem {
        return DB::transaction(function () use ($actor, $item, $note) {
            $user = User::query()->findOrFail($actor->getKey());

            $record = FollowUpItem::query()
                ->lockForUpdate()
                ->findOrFail($item->getKey());

            $report = $record->memberStatusReport;

            if (! $report) {
                throw ValidationException::withMessages([
                    'item' => 'Laporan untuk tindak lanjut ini tidak ditemukan.',
                ]);
            }

            $this->assertCanManageReport($user, $report);

            if ($record->status !== 'pending') {
                throw ValidationException::withMessages([
                    'item' => 'Item tindak lanjut sudah diproses.',
                ]);
            }

            $record->status = 'completed';
            $record->completed_by = $user->id;
            $record->completed_at = now();
            $record->completion_note = $note;
            $record->save();

            $this->recordActivity(
                'life_event_follow_up_completed',
                $user,
                $record,
                $record->family_id,
                ['title' => $record->title]
            );

            return $record->fresh();
        });
    }

    /**
     * Menghentikan atau melanjutkan jadwal tagihan berdasarkan keputusan
     * pihak berwenang. Tagihan dan riwayatnya tetap dipertahankan.
     */
    public function resolveBillSchedule(
        User $actor,
        Bill $bill,
        string $decision,
        ?string $note = null
    ): Bill {
        $user = User::query()->findOrFail($actor->getKey());

        $bill->loadMissing('user');

        if (
            ! $bill->user
            || ! (
                $user->isAdmin()
                || $user->isGuardianOf($bill->user)
            )
        ) {
            throw new AuthorizationException(
                'Anda tidak berhak mengelola jadwal tagihan ini.'
            );
        }

        if (! in_array($decision, ['dihentikan', 'lanjut'], true)) {
            throw ValidationException::withMessages([
                'decision' => 'Keputusan jadwal tidak valid.',
            ]);
        }

        if ($decision === 'lanjut' && $bill->user->isDeceased()) {
            throw ValidationException::withMessages([
                'decision' =>
                'Jadwal tidak dapat dilanjutkan karena pemilik tagihan '
                    . 'sudah ditandai meninggal di Ayom.',
            ]);
        }

        return DB::transaction(function () use (
            $user,
            $bill,
            $decision,
            $note
        ) {
            $lockedBill = Bill::query()
                ->lockForUpdate()
                ->findOrFail($bill->getKey());

            if ($decision === 'dihentikan') {
                $lockedBill->forceFill([
                    'schedule_status' => Bill::SCHEDULE_HALTED,
                    'schedule_note' => $note
                        ?: 'Jadwal dihentikan oleh keluarga.',
                    'schedule_flagged_at' => now(),
                ])->save();
            } else {
                $lockedBill->clearScheduleReview();
            }

            $lockedBill->loadMissing('user');

            $this->recordActivity(
                'bill_schedule_resolved',
                $user,
                $lockedBill,
                $lockedBill->user?->family_id ?? $user->family_id,
                [
                    'decision' => $decision,
                    'note_provided' => filled($note),
                ]
            );

            return $lockedBill->fresh();
        });
    }

    // ================= INTERNAL =================

    private function assertCanManageMember(
        User $actor,
        User $member
    ): void {
        if ($actor->isAdmin()) {
            return;
        }

        if (
            (int) $actor->id === (int) $member->id
            || ! $actor->isGuardianOf($member)
            || $actor->family_id === null
            || (int) $actor->family_id !== (int) $member->family_id
        ) {
            throw new AuthorizationException(
                'Anda tidak memiliki izin untuk mengelola anggota ini.'
            );
        }
    }

    private function assertCanManageReport(
        User $actor,
        MemberStatusReport $report
    ): void {
        if ($actor->isAdmin()) {
            return;
        }

        $member = $report->memberUser;

        if (
            ! $member
            || $actor->family_id === null
            || (int) $actor->family_id !== (int) $report->family_id
            || (int) $actor->id === (int) $member->id
            || ! $actor->isGuardianOf($member)
        ) {
            throw new AuthorizationException(
                'Anda tidak memiliki izin untuk mengelola laporan ini.'
            );
        }
    }

    private function flagBpjsBills(
        User $member,
        MemberStatusReport $report,
        string $detail
    ): void {
        $message = "Laporan status anggota #{$report->id}: {$detail}";
        $prefix = "Laporan status anggota #{$report->id}:";

        Bill::query()
            ->where('user_id', $member->id)
            ->where('category', 'bpjs')
            ->where('is_active', true)
            ->get()
            ->each(function (Bill $bill) use ($message, $prefix) {
                $status = $bill->schedule_status ?? Bill::SCHEDULE_NORMAL;

                // Jangan menimpa penanda jadwal milik proses lain.
                // Penanda dari laporan yang sama boleh diperbarui.
                $sameReport = str_starts_with(
                    (string) $bill->schedule_note,
                    $prefix
                );

                if ($status === Bill::SCHEDULE_NORMAL || $sameReport) {
                    $bill->flagForReview($message);
                }
            });
    }

    private function clearReportReviewFlags(
        User $member,
        MemberStatusReport $report
    ): void {
        $prefix = "Laporan status anggota #{$report->id}:";

        Bill::query()
            ->where('user_id', $member->id)
            ->where('category', 'bpjs')
            ->where('schedule_status', Bill::SCHEDULE_REVIEW)
            ->get()
            ->each(function (Bill $bill) use ($prefix) {
                if (
                    str_starts_with(
                        (string) $bill->schedule_note,
                        $prefix
                    )
                ) {
                    $bill->clearScheduleReview();
                }
            });
    }

    private function createApprovalFollowUps(
        MemberStatusReport $report
    ): void {
        $items = [
            [
                'title' => self::BPJS_FOLLOW_UP_TITLE,
                'description' =>
                'Hubungi kanal resmi BPJS Kesehatan untuk menindaklanjuti '
                    . 'perubahan data peserta. Status ini perlu dikonfirmasi '
                    . 'melalui kanal resmi.',
            ],
            [
                'title' => self::BILL_FOLLOW_UP_TITLE,
                'description' =>
                'Tinjau jadwal tagihan berulang milik anggota dan tentukan '
                    . 'tagihan yang perlu dihentikan atau dilanjutkan.',
            ],
            [
                'title' => self::TRANSACTION_FOLLOW_UP_TITLE,
                'description' =>
                'Tinjau transaksi tertunda milik anggota. Jangan menyetujui '
                    . 'transaksi jika pemiliknya sudah ditandai meninggal di Ayom.',
            ],
        ];

        foreach ($items as $item) {
            $report->followUpItems()->firstOrCreate(
                ['title' => $item['title']],
                [
                    'family_id' => $report->family_id,
                    'description' => $item['description'],
                    'status' => 'pending',
                ]
            );
        }
    }

    private function recordActivity(
        string $action,
        User $actor,
        Model $subject,
        ?int $familyId,
        array $meta = []
    ): void {
        ActivityLog::create([
            'user_id' => $actor->id,
            'family_id' => $familyId,
            'action' => $action,
            'subject_type' => get_class($subject),
            'subject_id' => $subject->getKey(),
            'meta' => $meta,
        ]);
    }
}
