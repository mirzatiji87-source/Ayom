<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBillRequest;
use App\Models\ActivityLog;
use App\Models\Bill;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BillController extends Controller
{
    public function store(StoreBillRequest $request): RedirectResponse
    {
        $bill = Bill::create($request->validated() + ['created_by' => Auth::id()]);

        ActivityLog::record('create_bill', Auth::user(), $bill);

        return redirect()->back()->with('success', 'Tagihan berhasil ditambahkan.');
    }

    public function update(StoreBillRequest $request, Bill $bill): RedirectResponse
    {
        $bill->update($request->validated());

        return redirect()->back()->with('success', 'Tagihan diperbarui.');
    }

    public function destroy(Bill $bill): RedirectResponse
    {
        $bill->update(['is_active' => false]);

        return redirect()->back()->with('success', 'Tagihan dinonaktifkan.');
    }

    public function myBills(): Response
{
    /** @var User $user */
    $user = Auth::user();

    return Inertia::render('Lansia/BillsReminder', [
        'bills' => $user->bills()
            ->where('is_active', true)
            ->get(),
    ]);
}

    /** Bayar manual sekarang juga (dipakai untuk demo tanpa scheduler, atau tombol "bayar sekarang"). */
    public function payNow(Bill $bill): RedirectResponse
    {
        abort_unless($bill->user_id === Auth::id(), 403);

        $wallet = Auth::user()->wallet;

        if (! $wallet->hasSufficientBalance((float) $bill->amount)) {
            return back()->withErrors(['amount' => 'Saldo tidak cukup untuk membayar tagihan ini.']);
        }

        DB::transaction(function () use ($bill, $wallet) {
            Transaction::create([
                'user_id' => $bill->user_id,
                'family_id' => $bill->user->family_id,
                'bill_id' => $bill->id,
                'type' => 'bill_payment',
                'category' => 'tagihan',
                'amount' => $bill->amount,
                'description' => $bill->name,
                'status' => 'completed',
            ]);

            $wallet->recordSpending((float) $bill->amount);
            $bill->markAsPaid();

            ActivityLog::record('pay_bill', Auth::user(), $bill);
        });

        return redirect()->back()->with('success', 'Tagihan berhasil dibayar.');
    }
}