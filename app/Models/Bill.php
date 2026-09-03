<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bill extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'created_by',
        'name',
        'category',
        'amount',
        'frequency',
        'next_due_date',
        'auto_pay',
        'is_active',
        'last_paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'next_due_date' => 'date',
        'auto_pay' => 'boolean',
        'is_active' => 'boolean',
        'last_paid_at' => 'datetime',
    ];

    // ================= RELATIONS =================

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    // ================= SCOPES =================

    public function scopeDue($query)
    {
        return $query->where('is_active', true)
            ->where('next_due_date', '<=', now()->toDateString());
    }

    public function scopeAutoPay($query)
    {
        return $query->where('auto_pay', true);
    }

    // ================= HELPERS =================

    public function markAsPaid(): void
    {
        $this->update([
            'last_paid_at' => now(),
            'next_due_date' => $this->calculateNextDueDate(),
        ]);
    }

    protected function calculateNextDueDate(): string
    {
        $base = $this->next_due_date ?? now();

        return match ($this->frequency) {
            'daily' => $base->copy()->addDay()->toDateString(),
            'weekly' => $base->copy()->addWeek()->toDateString(),
            default => $base->copy()->addMonth()->toDateString(),
        };
    }
}
