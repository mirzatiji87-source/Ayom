<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'family_id',
        'assigned_to',
        'created_by',
        'title',
        'description',
        'reward_amount',
        'status',
        'rejection_reason',
        'submitted_at',
        'reviewed_at',
        'reviewed_by',
        'due_date',
    ];

    protected $casts = [
        'reward_amount' => 'decimal:2',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'due_date' => 'date',
    ];

    // ================= RELATIONS =================

    public function family(): BelongsTo
    {
        return $this->belongsTo(Family::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    // ================= SCOPES =================

    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    public function scopeForAssignee($query, int $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    // ================= HELPERS =================

    public function submit(): void
    {
        $this->update(['status' => 'submitted', 'submitted_at' => now()]);
    }

    public function approve(User $reviewer): void
    {
        $this->update([
            'status' => 'approved',
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
        ]);

        $this->assignee->wallet?->increment('balance', $this->reward_amount);

        $this->transactions()->create([
            'user_id' => $this->assigned_to,
            'family_id' => $this->family_id,
            'type' => 'allowance',
            'category' => 'lainnya',
            'amount' => $this->reward_amount,
            'description' => 'Reward misi: ' . $this->title,
            'status' => 'completed',
            'approved_by' => $reviewer->id,
            'approved_at' => now(),
        ]);
    }

    public function reject(User $reviewer, ?string $reason = null): void
    {
        $this->update([
            'status' => 'rejected',
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'rejection_reason' => $reason,
        ]);
    }
}
