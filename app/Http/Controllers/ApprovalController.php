<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\ApprovalRequest;
use App\Models\Bill;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ApprovalController extends Controller
{
    public function index(): Response
    {
        $actor = Auth::user();

        $requests = ApprovalRequest::pending()
            ->whereHas(
                'requester',
                fn($query) => $query->where(
                    'family_id',
                    $actor->family_id
                )
            )
            ->with(['transaction', 'requester'])
            ->latest()
            ->get();

        return Inertia::render(
            'OrangTua/ApprovalCenter',
            ['requests' => $requests]
        );
    }

    public function pendingCount(): JsonResponse
    {
        $actor = Auth::user();

        $count = ApprovalRequest::pending()
            ->whereHas(
                'requester',
                fn($query) => $query->where(
                    'family_id',
                    $actor->family_id
                )
            )
            ->count();

        return response()->json(['count' => $count]);
    }

    public function approve(
        ApprovalRequest $approvalRequest
    ): RedirectResponse {
        $this->authorizeOverRequest($approvalRequest);

        $actor = Auth::user();

        $error = DB::transaction(function () use (
            $approvalRequest,
            $actor
        ): ?string {
            $record = ApprovalRequest::query()
                ->lockForUpdate()
                ->findOrFail($approvalRequest->id);

            if ($record->status !== 'pending') {
                return 'Permintaan ini sudah diproses sebelumnya.';
            }

            $transaction = Transaction::query()
                ->lockForUpdate()
                ->findOrFail($record->transaction_id);

            if ($transaction->status !== 'pending') {
                return 'Transaksi ini sudah diproses sebelumnya.';
            }

            $member = $transaction->user;

            if (! $member) {
                return 'Pemilik transaksi tidak ditemukan.';
            }

            // Blokir persetujuan transaksi milik anggota yang telah
            // ditandai meninggal di Ayom.
            if ($member->isDeceased()) {
                return 'Persetujuan diblokir karena pemilik transaksi '
                    . 'sudah ditandai meninggal. Permintaan masih dapat ditolak.';
            }

            $bill = null;

            if ($transaction->bill_id !== null) {
                $bill = Bill::query()
                    ->lockForUpdate()
                    ->find($transaction->bill_id);

                if (! $bill) {
                    return 'Tagihan terkait tidak ditemukan.';
                }

                $blockedReason = $bill->processBlockedReason();

                if ($blockedReason !== null) {
                    return $blockedReason
                        . ' Persetujuan diblokir; Anda dapat menolaknya.';
                }
            }

            $wallet = $member->wallet()
                ->lockForUpdate()
                ->first();

            if (! $wallet) {
                return 'Dompet pemilik transaksi tidak tersedia.';
            }

            if (! $wallet->hasSufficientBalance(
                (float) $transaction->amount
            )) {
                return 'Saldo tidak lagi mencukupi untuk menyetujui transaksi.';
            }

            $record->approve($actor);

            $changes = [
                'status' => 'completed',
                'approved_by' => $actor->id,
                'approved_at' => now(),
            ];

            if ($transaction->type === 'bill_payment') {
                // Pembayaran tagihan di Ayom tetap simulasi, bukan
                // pembayaran langsung kepada penyedia tagihan.
                $changes['payment_mode'] = Transaction::MODE_SIMULATION;
            }

            $transaction->update($changes);

            $wallet->recordSpending((float) $transaction->amount);

            if ($bill && $transaction->type === 'bill_payment') {
                $bill->markAsPaid();
            }

            ActivityLog::record(
                'approve_transaction',
                $actor,
                $transaction
            );

            return null;
        });

        if ($error !== null) {
            return back()->with('error', $error);
        }

        return back()->with('success', 'Transaksi disetujui.');
    }

    public function reject(
        Request $request,
        ApprovalRequest $approvalRequest
    ): RedirectResponse {
        $this->authorizeOverRequest($approvalRequest);

        $data = $request->validate([
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $actor = Auth::user();

        $alreadyProcessed = DB::transaction(function () use (
            $approvalRequest,
            $data,
            $actor
        ): bool {
            $record = ApprovalRequest::query()
                ->lockForUpdate()
                ->findOrFail($approvalRequest->id);

            if ($record->status !== 'pending') {
                return true;
            }

            $transaction = Transaction::query()
                ->lockForUpdate()
                ->findOrFail($record->transaction_id);

            if ($transaction->status !== 'pending') {
                return true;
            }

            $record->reject($actor, $data['reason'] ?? null);

            $transaction->update(['status' => 'rejected']);

            // Transaksi pending belum memotong saldo, jadi tidak perlu refund.
            ActivityLog::record(
                'reject_transaction',
                $actor,
                $transaction,
                ['reason' => $data['reason'] ?? null]
            );

            return false;
        });

        if ($alreadyProcessed) {
            return back()->with(
                'error',
                'Permintaan ini sudah diproses sebelumnya.'
            );
        }

        return back()->with('success', 'Transaksi ditolak.');
    }


    protected function authorizeOverRequest(
        ApprovalRequest $approvalRequest
    ): void {
        /** @var \App\Models\User|null $actor */
        $actor = Auth::user();

        /** @var \App\Models\User|null $requester */
        $requester = $approvalRequest->requester;

        abort_unless(
            $actor instanceof \App\Models\User
                && $requester instanceof \App\Models\User
                && (int) $actor->id !== (int) $requester->id
                && $actor->isGuardianOf($requester),
            403,
            'Anda tidak berhak meninjau permintaan ini.'
        );
    }
}
