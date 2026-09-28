<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'midtrans_order_id',
        'user_id',
        'family_id',
        'bill_id',
        'task_id',
        'type',
        'category',
        'amount',
        'description',
        'status',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    // ================= RELATIONS =================

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function family(): BelongsTo
    {
        return $this->belongsTo(Family::class);
    }

    public function bill(): BelongsTo
    {
        return $this->belongsTo(Bill::class);
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function approvalRequest(): HasOne
    {
        return $this->hasOne(ApprovalRequest::class);
    }

    // ================= SCOPES =================

    public function scopeExpenses($query)
    {
        return $query->where('type', 'expense');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeForFamily($query, int $familyId)
    {
        return $query->where('family_id', $familyId);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }
}
