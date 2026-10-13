<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBillRequest;
use App\Models\ActivityLog;
use App\Models\ApprovalRequest;
use App\Models\Bill;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BillController extends Controller
{
    /**
     * Ayom mencatat pembayaran dompet internal sebagai simulasi.
     * Ini bukan bukti pembayaran kepada penyedia tagihan.
     */
    protected const SIMULATION_NOTICE =
        'Pembayaran simulasi tercatat di dompet Ayom. Tagihan ke penyedia '
        . '(misalnya BPJS) belum dibayar; pembayaran sungguhan harus '
        . 'dilakukan melalui kanal resmi.';

    public function store(StoreBillRequest $request): RedirectResponse
    {
        $bill = Bill::create(
            $request->validated() + ['created_by' => Auth::id()]
        );

        ActivityLog::record('create_bill', Auth::user(), $bill);

        return back()->with('success', 'Tagihan berhasil ditambahkan.');
    }

    public function update(
        StoreBillRequest $request,
        Bill $bill
    ): RedirectResponse {
        $this->authorizeBill($bill);

        $bill->update($request->validated());

        ActivityLog::record('update_bill', Auth::user(), $bill);

        return back()->with('success', 'Tagihan diperbarui.');
    }

    public function destroy(Bill $bill): RedirectResponse
    {
        $this->authorizeBill($bill);

        $bill->update(['is_active' => false]);

        ActivityLog::record('deactivate_bill', Auth::user(), $bill);

        return back()->with('success', 'Tagihan dinonaktifkan.');
    }

    public function myBills(): Response
    {
        /** @var User $user */
        $user = Auth::user();

        return Inertia::render('Lansia/BillsReminder', [
            'bills' => $this->present(
                $user->bills()
                    ->where('is_active', true)
                    ->orderBy('next_due_date')
                    ->get()
            ),
            'paymentMode' => 'simulation',
        ]);
    }

    public function myBillsOrangTua(): Response
    {
        /** @var User $user */
        $user = Auth::user();

        return Inertia::render('OrangTua/MyBills', [
            'bills' => $this->present(
                $user->bills()
                    ->where('is_active', true)
                    ->orderBy('next_due_date')
                    ->get()
            ),
            'paymentMode' => 'simulation',
        ]);
    }

    /**
     * Bayar tagihan melalui simulasi dompet internal Ayom.
     * Semua pemeriksaan dan pencatatan dilakukan dalam transaksi DB.
     */
    public function payNow(
        Request $request,
        Bill $bill
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();

        abort_unless(
            (int) $bill->user_id === (int) $user->id,
            403
        );

        $result = DB::transaction(function () use ($bill, $user): array {
            $lockedBill = Bill::query()
                ->lockForUpdate()
                ->findOrFail($bill->id);

            if ((int) $lockedBill->user_id !== (int) $user->id) {
                return [
                    'error' => 'Anda tidak berhak membayar tagihan ini.',
                ];
            }

            $blockedReason = $lockedBill->processBlockedReason();

            if ($blockedReason !== null) {
                return ['error' => $blockedReason];
            }

            /*
             * Orang tua tidak punya dompet pribadi:
             * tagihan dibayar dari saldo keluarga.
             */
            if ($user->role === 'orang_tua') {
                $family = \App\Models\Family::query()
                    ->lockForUpdate()
                    ->find($user->family_id);

                if (! $family) {
                    return [
                        'error' => 'Data keluarga tidak ditemukan.',
                    ];
                }

                $familyAmount = (float) $lockedBill->amount;

                if ((float) $family->balance < $familyAmount) {
                    return [
                        'error' => 'Saldo keluarga tidak cukup untuk membayar tagihan ini.',
                    ];
                }

                Transaction::create([
                    'user_id' => $lockedBill->user_id,
                    'family_id' => $user->family_id,
                    'bill_id' => $lockedBill->id,
                    'type' => 'bill_payment',
                    'category' => 'tagihan',
                    'amount' => $lockedBill->amount,
                    'description' => $lockedBill->name,
                    'status' => 'completed',
                    'payment_mode' => Transaction::MODE_SIMULATION,
                ]);

                $family->decrement('balance', $familyAmount);

                $lockedBill->markAsPaid();

                ActivityLog::record(
                    'pay_bill',
                    $user,
                    $lockedBill,
                    [
                        'payment_mode' => Transaction::MODE_SIMULATION,
                    ]
                );

                return ['paid' => true];
            }

            /*
             * Pengguna selain orang tua tetap menggunakan dompet
             * pribadi dan mengikuti aturan approval seperti sebelumnya.
             */
            $wallet = $user->wallet()
                ->lockForUpdate()
                ->first();

            if (! $wallet) {
                return ['error' => 'Dompet belum tersedia.'];
            }

            $amount = (float) $lockedBill->amount;

            if (! $wallet->hasSufficientBalance($amount)) {
                return [
                    'error' => 'Saldo tidak cukup untuk membayar tagihan ini.',
                ];
            }

            if ($wallet->requiresApproval($amount)) {
                $transaction = Transaction::create([
                    'user_id' => $lockedBill->user_id,
                    'family_id' => $user->family_id,
                    'bill_id' => $lockedBill->id,
                    'type' => 'bill_payment',
                    'category' => 'tagihan',
                    'amount' => $lockedBill->amount,
                    'description' => $lockedBill->name,
                    'status' => 'pending',
                    'payment_mode' => Transaction::MODE_SIMULATION,
                ]);

                ApprovalRequest::create([
                    'transaction_id' => $transaction->id,
                    'requested_by' => $user->id,
                    'status' => 'pending',
                ]);

                ActivityLog::record(
                    'request_bill_payment_approval',
                    $user,
                    $lockedBill,
                    [
                        'payment_mode' => Transaction::MODE_SIMULATION,
                    ]
                );

                return ['pending_approval' => true];
            }

            Transaction::create([
                'user_id' => $lockedBill->user_id,
                'family_id' => $user->family_id,
                'bill_id' => $lockedBill->id,
                'type' => 'bill_payment',
                'category' => 'tagihan',
                'amount' => $lockedBill->amount,
                'description' => $lockedBill->name,
                'status' => 'completed',
                'payment_mode' => Transaction::MODE_SIMULATION,
            ]);

            $wallet->recordSpending($amount);

            $lockedBill->markAsPaid();

            ActivityLog::record(
                'pay_bill',
                $user,
                $lockedBill,
                [
                    'payment_mode' => Transaction::MODE_SIMULATION,
                ]
            );

            return ['paid' => true];
        });

        if (isset($result['error'])) {
            return back()->withErrors([
                'amount' => $result['error'],
            ]);
        }

        if (! empty($result['pending_approval'])) {
            return back()->with(
                'success',
                'Permintaan pembayaran simulasi menunggu persetujuan orang tua.'
            );
        }

        return back()->with('success', self::SIMULATION_NOTICE);
    }

    // ================= INTERNAL =================

    protected function authorizeBill(Bill $bill): void
    {
        /** @var User $actor */
        $actor = Auth::user();

        $bill->loadMissing('user');

        abort_unless(
            $actor
                && $bill->user
                && (
                    $actor->isAdmin()
                    || $actor->isGuardianOf($bill->user)
                ),
            403,
            'Anda tidak berhak mengelola tagihan ini.'
        );
    }

    /**
     * Sertakan data pembayaran terakhir dan alasan jika tagihan diblokir.
     */
    protected function present($bills)
    {
        $bills->load([
            'user:id,name,life_status',
            'latestPayment',
        ]);

        return $bills->each(function (Bill $bill): void {
            $bill->setAttribute(
                'blocked_reason',
                $bill->processBlockedReason()
            );
        });
    }
}