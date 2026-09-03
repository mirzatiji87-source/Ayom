<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Wallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'balance',
        'daily_limit',
        'monthly_limit',
        'daily_spent',
        'monthly_spent',
        'daily_spent_reset_at',
        'monthly_spent_reset_at',
        'approval_threshold',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
        'daily_limit' => 'decimal:2',
        'monthly_limit' => 'decimal:2',
        'daily_spent' => 'decimal:2',
        'monthly_spent' => 'decimal:2',
        'approval_threshold' => 'decimal:2',
        'daily_spent_reset_at' => 'date',
        'monthly_spent_reset_at' => 'date',
    ];

    // ================= RELATIONS =================

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ================= HELPERS =================

    /** Apakah nominal transaksi ini butuh approval orang tua */
    public function requiresApproval(float $amount): bool
    {
        return $amount > $this->approval_threshold;
    }

    /** Apakah masih ada sisa limit harian untuk nominal ini */
    public function withinDailyLimit(float $amount): bool
    {
        if (is_null($this->daily_limit)) {
            return true;
        }
        return ($this->daily_spent + $amount) <= $this->daily_limit;
    }

    /** Apakah masih ada sisa limit bulanan untuk nominal ini */
    public function withinMonthlyLimit(float $amount): bool
    {
        if (is_null($this->monthly_limit)) {
            return true;
        }
        return ($this->monthly_spent + $amount) <= $this->monthly_limit;
    }

    public function hasSufficientBalance(float $amount): bool
    {
        return $this->balance >= $amount;
    }

    public function recordSpending(float $amount): void
    {
        $this->resetCountersIfNeeded();
        $this->decrement('balance', $amount);
        $this->increment('daily_spent', $amount);
        $this->increment('monthly_spent', $amount);
    }

    /** Reset akumulasi harian/bulanan jika sudah lewat periodenya */
    protected function resetCountersIfNeeded(): void
    {
        $today = now()->toDateString();
        $thisMonth = now()->startOfMonth()->toDateString();

        if ($this->daily_spent_reset_at?->toDateString() !== $today) {
            $this->update(['daily_spent' => 0, 'daily_spent_reset_at' => $today]);
        }

        if ($this->monthly_spent_reset_at?->toDateString() !== $thisMonth) {
            $this->update(['monthly_spent' => 0, 'monthly_spent_reset_at' => $thisMonth]);
        }
    }
}
