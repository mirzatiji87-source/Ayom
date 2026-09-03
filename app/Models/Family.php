<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Family extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'owner_id',
        'balance',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
    ];

    // ================= RELATIONS =================

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function lansiaMembers(): HasMany
    {
        return $this->members()->where('role', 'lansia');
    }

    public function remajaMembers(): HasMany
    {
        return $this->members()->where('role', 'remaja');
    }

    public function orangTuaMembers(): HasMany
    {
        return $this->members()->where('role', 'orang_tua');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    // ================= HELPERS =================

    public function topUp(float $amount): void
    {
        $this->increment('balance', $amount);
    }

    public function hasSufficientBalance(float $amount): bool
    {
        return $this->balance >= $amount;
    }
}
