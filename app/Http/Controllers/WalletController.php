<?php

namespace App\Http\Controllers;

use App\Http\Requests\SetLimitRequest;
use App\Http\Requests\TopUpRequest;
use App\Models\ActivityLog;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    public function topUpForm(): Response
{
    /** @var User $user */
    $user = Auth::user();

    $family = $user->family()
        ->withCount('members')
        ->first();

    return Inertia::render('OrangTua/TopUpLimit', [
        'family' => $family,
    ]);
}

    public function topUp(TopUpRequest $request): RedirectResponse
    {
        $actor = $request->user();
        $family = $actor->family;

        DB::transaction(function () use ($actor, $family, $request) {
            $family->topUp($request->amount);

            Transaction::create([
                'user_id' => $actor->id,
                'family_id' => $family->id,
                'type' => 'topup',
                'category' => 'lainnya',
                'amount' => $request->amount,
                'description' => 'Top-up saldo keluarga',
                'status' => 'completed',
            ]);

            ActivityLog::record('top_up', $actor, $family, ['amount' => $request->amount]);
        });

        return redirect()->back()->with('success', 'Top-up berhasil.');
    }

    public function edit(User $user): Response
    {
        $this->authorize('manage', $user->wallet);

        return Inertia::render('OrangTua/SetLimit', ['member' => $user->load('wallet')]);
    }

    public function setLimit(SetLimitRequest $request, User $user): RedirectResponse
    {
        $wallet = $user->wallet;
        $this->authorize('manage', $wallet);

        $wallet->update($request->only(['daily_limit', 'monthly_limit', 'approval_threshold']));

        ActivityLog::record('set_limit', $request->user(), $user, $request->only([
            'daily_limit', 'monthly_limit', 'approval_threshold',
        ]));

        return redirect()->back()->with('success', 'Limit berhasil diperbarui.');
    }
}