<?php

namespace App\Http\Controllers;

use App\Http\Requests\SetLimitRequest;
use App\Http\Requests\TopUpRequest;
use App\Models\ActivityLog;
use App\Models\Family;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Midtrans\Config as MidtransConfig;
use Midtrans\Snap;
use Midtrans\Transaction as MidtransApi;

class WalletController extends Controller
{
    public function __construct()
    {
        MidtransConfig::$serverKey = config('midtrans.server_key');
        MidtransConfig::$isProduction = config('midtrans.is_production');
        MidtransConfig::$isSanitized = config('midtrans.is_sanitized');
        MidtransConfig::$is3ds = config('midtrans.is_3ds');
    }

   public function topUpForm(Request $request): Response
{
    $user = Auth::user();
    $family = $user->family()->withCount('members')->first();

    $recipient = null;
    if ($request->filled('recipient_id')) {
        $recipient = User::where('id', $request->recipient_id)
            ->where('family_id', $family->id)
            ->whereIn('role', ['lansia', 'remaja'])
            ->with('wallet')
            ->first();
    }

    return Inertia::render('OrangTua/TopUpLimit', [
        'family' => $family,
        'recipient' => $recipient ? [
            'id' => $recipient->id,
            'name' => $recipient->name,
            'wallet_balance' => $recipient->wallet?->balance ?? 0,
        ] : null,
        'midtransClientKey' => config('midtrans.client_key'),
        'midtransIsProduction' => config('midtrans.is_production'),
    ]);
}

    public function topUp(TopUpRequest $request): JsonResponse
    {
        $actor = $request->user();
        $family = $actor->family;


        $recipient = null;
        if ($request->filled('recipient_id')) {
            $recipient = User::where('id', $request->recipient_id)
                ->where('family_id', $family->id)
                ->whereIn('role', ['lansia', 'remaja'])
                ->firstOrFail();
        }

        $orderId = 'TOPUP-' . $family->id . '-' . now()->format('YmdHis') . '-' . Str::random(6);

        $transaction = Transaction::create([
            'midtrans_order_id' => $orderId,
            'user_id' => $recipient?->id ?? $actor->id,
            'family_id' => $family->id,
            'type' => 'topup',
            'category' => 'lainnya',
            'amount' => $request->amount,
            'description' => $recipient
                ? 'Top-up langsung ke ' . $recipient->name
                : 'Top-up saldo keluarga',
            'status' => 'pending',
        ]);

        // ... sisanya (Snap::getSnapToken dst) TETAP SAMA, gak perlu diubah

        try {
            $snapToken = Snap::getSnapToken([
                'transaction_details' => [
                    'order_id' => $orderId,
                    'gross_amount' => (int) $request->amount,
                ],
                'customer_details' => [
                    'first_name' => $actor->name,
                    'email' => $actor->email,
                ],
                'item_details' => [
                    [
                        'id' => 'topup-saldo',
                        'price' => (int) $request->amount,
                        'quantity' => 1,
                        'name' => 'Top-up Saldo Keluarga Ayom',
                    ]
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Midtrans Snap token gagal dibuat', ['error' => $e->getMessage()]);
            $transaction->update(['status' => 'rejected']);

            return response()->json([
                'message' => 'Gagal membuat sesi pembayaran. Coba lagi beberapa saat.',
            ], 500);
        }

        return response()->json([
            'snap_token' => $snapToken,
            'order_id' => $orderId,
        ]);
    }

    /**
     * Webhook resmi dari Midtrans. Ini jalan normal kalau app sudah
     * di-deploy ke domain publik (bukan localhost), karena Midtrans
     * manggil URL ini langsung dari server mereka.
     */
    public function midtransNotification(Request $request): JsonResponse
    {
        $payload = $request->all();

        $orderId = $payload['order_id'] ?? null;
        $statusCode = $payload['status_code'] ?? null;
        $grossAmount = $payload['gross_amount'] ?? null;
        $signatureKey = $payload['signature_key'] ?? null;

        if (!$orderId || !$statusCode || !$grossAmount || !$signatureKey) {
            return response()->json(['message' => 'Payload tidak lengkap.'], 400);
        }

        $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . config('midtrans.server_key'));

        if (!hash_equals($expectedSignature, $signatureKey)) {
            Log::warning('Midtrans notification signature tidak valid', ['order_id' => $orderId]);

            return response()->json(['message' => 'Invalid signature.'], 403);
        }

        $transaction = Transaction::where('midtrans_order_id', $orderId)->first();

        if (!$transaction) {
            return response()->json(['message' => 'Transaksi tidak ditemukan.'], 404);
        }

        $this->applyMidtransStatus(
            $transaction,
            $payload['transaction_status'] ?? null,
            $payload['fraud_status'] ?? null
        );

        return response()->json(['message' => 'OK']);
    }

    /**
     * Fallback buat testing LOKAL (localhost gak bisa nerima webhook dari
     * internet). Dipanggil dari frontend begitu popup Snap kasih tau
     * pembayaran selesai (onSuccess/onPending) - kita nanya LANGSUNG ke
     * API Midtrans "status transaksi order_id ini sekarang apa", bukan
     * nunggu Midtrans yang notif ke kita. Ini juga jalan normal di
     * production sebagai lapisan pengaman tambahan kalau webhook telat.
     */
    public function verifyTopUpStatus(Request $request): JsonResponse
    {
        $request->validate(['order_id' => ['required', 'string']]);

        $transaction = Transaction::where('midtrans_order_id', $request->order_id)
            ->where('family_id', Auth::user()->family_id)
            ->first();

        if (!$transaction) {
            return response()->json(['message' => 'Transaksi tidak ditemukan.'], 404);
        }

        if ($transaction->status !== 'pending') {
            return response()->json(['status' => $transaction->status]);
        }

        try {
            $status = MidtransApi::status($request->order_id);
        } catch (\Exception $e) {
            Log::error('Gagal cek status Midtrans', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Gagal mengecek status pembayaran.'], 500);
        }

        $this->applyMidtransStatus(
            $transaction,
            $status->transaction_status ?? null,
            $status->fraud_status ?? null
        );

        return response()->json(['status' => $transaction->fresh()->status]);
    }

    /**
     * Logic bersama dipakai baik oleh webhook maupun fallback verify -
     * biar gak dobel kode dan konsisten aturannya di satu tempat.
     */
    protected function applyMidtransStatus(Transaction $transaction, ?string $transactionStatus, ?string $fraudStatus): void
{
    if ($transaction->status !== 'pending') {
        return;
    }

    $isSuccess = in_array($transactionStatus, ['capture', 'settlement'])
        && ($fraudStatus === null || $fraudStatus === 'accept');

    $isFailed = in_array($transactionStatus, ['deny', 'cancel', 'expire']);

    if ($isSuccess) {
        DB::transaction(function () use ($transaction) {
            $recipient = $transaction->user;

            // Kalau si "pemilik" transaksi ini lansia/remaja -> masuk wallet pribadinya.
            // Kalau orang_tua -> masuk pool keluarga (perilaku lama, tetap jalan).
            if ($recipient && in_array($recipient->role, ['lansia', 'remaja'])) {
                $recipient->wallet()->increment('balance', (float) $transaction->amount);
            } else {
                $family = Family::find($transaction->family_id);
                $family->topUp((float) $transaction->amount);
            }

            $transaction->update(['status' => 'completed']);

            ActivityLog::record('top_up', $transaction->user, $transaction->family, [
                'amount' => $transaction->amount,
                'midtrans_order_id' => $transaction->midtrans_order_id,
            ]);
        });
    } elseif ($isFailed) {
        $transaction->update(['status' => 'rejected']);
    }
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
            'daily_limit',
            'monthly_limit',
            'approval_threshold',
        ]));

        return redirect()->back()->with('success', 'Limit berhasil diperbarui.');
    }

    /**
     * Pindahkan sebagian saldo pool keluarga ke wallet pribadi
     * seorang anggota (lansia/remaja).
     */
    public function allocate(Request $request, User $user): RedirectResponse
    {
        $this->authorize('manage', $user->wallet);

        $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
        ]);

        $family = $user->family;
        $amount = (float) $request->amount;

        if (!$family->hasSufficientBalance($amount)) {
            return back()->withErrors(['amount' => 'Saldo keluarga tidak cukup.']);
        }

        DB::transaction(function () use ($family, $user, $amount) {
            $family->decrement('balance', $amount);
            $user->wallet->increment('balance', $amount);

            Transaction::create([
                'user_id' => $user->id,
                'family_id' => $family->id,
                'type' => 'allowance',
                'category' => 'lainnya',
                'amount' => $amount,
                'description' => 'Isi saldo dari pool keluarga',
                'status' => 'completed',
            ]);

            ActivityLog::record('allocate_balance', Auth::user(), $user, ['amount' => $amount]);
        });

        return redirect()->back()->with('success', 'Saldo berhasil diisi ke ' . $user->name . '.');
    }
}