<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\ApprovalRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ApprovalController extends Controller
{
    public function index(): Response
    {
        $requests = ApprovalRequest::pending()
            ->whereHas('requester', fn ($q) => $q->where('family_id', Auth::user()->family_id))
            ->with(['transaction', 'requester'])
            ->latest()
            ->get();

        return Inertia::render('OrangTua/ApprovalCenter', ['requests' => $requests]);
    }

    public function approve(ApprovalRequest $approvalRequest): RedirectResponse
    {
        $this->authorizeOverRequest($approvalRequest);

        DB::transaction(function () use ($approvalRequest) {
            $approvalRequest->approve(Auth::user());

            $transaction = $approvalRequest->transaction;
            $transaction->update([
                'status' => 'completed',
                'approved_by' => Auth::id(),
                'approved_at' => now(),
            ]);

            $transaction->user->wallet->recordSpending((float) $transaction->amount);

            ActivityLog::record('approve_transaction', Auth::user(), $transaction);
        });

        return redirect()->back()->with('success', 'Transaksi disetujui.');
    }

    public function reject(Request $request, ApprovalRequest $approvalRequest): RedirectResponse
    {
        $this->authorizeOverRequest($approvalRequest);

        $request->validate(['reason' => ['nullable', 'string', 'max:255']]);

        DB::transaction(function () use ($approvalRequest, $request) {
            $approvalRequest->reject(Auth::user(), $request->reason);
            $approvalRequest->transaction->update(['status' => 'rejected']);
            // saldo tidak pernah dipotong untuk transaksi pending, jadi tidak perlu dikembalikan

            ActivityLog::record('reject_transaction', Auth::user(), $approvalRequest->transaction, [
                'reason' => $request->reason,
            ]);
        });

        return redirect()->back()->with('success', 'Transaksi ditolak.');
    }

    protected function authorizeOverRequest(ApprovalRequest $approvalRequest): void
{
    /** @var \App\Models\User $actor */
    $actor = Auth::user();

    $requester = $approvalRequest->requester;

    abort_unless(
        $actor->isGuardianOf($requester),
        403,
        'Anda tidak berhak meninjau permintaan ini.'
    );
}
}