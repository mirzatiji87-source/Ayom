<?php

namespace App\Policies;

use App\Models\MemberStatusReport;
use App\Models\User;

class MemberStatusReportPolicy
{
    /**
     * Hanya orang tua yang boleh melaporkan anggota keluarga lain.
     * Tidak boleh melaporkan dirinya sendiri.
     */
    public function report(User $actor, User $subject): bool
    {
        return $actor->isOrangTua()
            && (int) $actor->id !== (int) $subject->id
            && $actor->isGuardianOf($subject);
    }

    /**
     * Admin dan orang tua dari keluarga terkait boleh melihat laporan.
     */
    public function view(
        User $actor,
        MemberStatusReport $report
    ): bool {
        return $actor->isAdmin()
            || $this->isFamilyGuardian($actor, $report);
    }

    /**
     * Mengelola tindak lanjut dan pencatatan progres BPJS.
     */
    public function manage(
        User $actor,
        MemberStatusReport $report
    ): bool {
        return $actor->isAdmin()
            || $this->isFamilyGuardian($actor, $report);
    }

    /**
     * Verifikasi atau penolakan laporan hanya untuk admin.
     */
    public function verify(
        User $actor,
        MemberStatusReport $report
    ): bool {
        return $actor->isAdmin();
    }

    private function isFamilyGuardian(
        User $actor,
        MemberStatusReport $report
    ): bool {
        return $actor->isOrangTua()
            && $actor->family_id !== null
            && (int) $actor->family_id === (int) $report->family_id;
    }
}
