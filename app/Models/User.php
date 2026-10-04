<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'family_id',
        'created_by',
        'phone',
        'date_of_birth',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'date_of_birth' => 'date',
            'is_active' => 'boolean',
        ];
    }

    // ================= RELATIONS =================

    public function family(): BelongsTo
    {
        return $this->belongsTo(Family::class);
    }

    public function ownedFamily(): HasOne
    {
        return $this->hasOne(Family::class, 'owner_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function createdUsers(): HasMany
    {
        return $this->hasMany(User::class, 'created_by');
    }

    public function wallet(): HasOne
    {
        return $this->hasOne(Wallet::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function bills(): HasMany
    {
        return $this->hasMany(Bill::class);
    }

    public function tasksAssigned(): HasMany
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    public function tasksCreated(): HasMany
    {
        return $this->hasMany(Task::class, 'created_by');
    }

    public function approvalRequestsMade(): HasMany
    {
        return $this->hasMany(ApprovalRequest::class, 'requested_by');
    }

    public function approvalRequestsReviewed(): HasMany
    {
        return $this->hasMany(ApprovalRequest::class, 'reviewed_by');
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    // ================= ROLE HELPERS =================

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isOrangTua(): bool
    {
        return $this->role === 'orang_tua';
    }

    public function isLansia(): bool
    {
        return $this->role === 'lansia';
    }

    public function isRemaja(): bool
    {
        return $this->role === 'remaja';
    }

    /** Apakah user ini boleh membuat akun lansia/remaja */
    public function canCreateDependents(): bool
    {
        return $this->isAdmin() || $this->isOrangTua();
    }

    /** Apakah $this adalah guardian (orang tua) dari $member dalam family yang sama */
    public function isGuardianOf(User $member): bool
{
    return $this->isOrangTua()
        && $this->family_id !== null
        && $this->family_id === $member->family_id
        && in_array($member->role, ['lansia', 'remaja', 'orang_tua']);
}
}
