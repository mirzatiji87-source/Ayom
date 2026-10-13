<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Bill extends Model
{
    use HasFactory;

    public const SCHEDULE_NORMAL = 'normal';
    public const SCHEDULE_REVIEW = 'perlu_ditinjau';
    public const SCHEDULE_HALTED = 'dihentikan';

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
        'schedule_flagged_at' => 'datetime',
    ];

    protected $appends = [
        'days_until_due',
        'reminder_status',
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

    public function bpjsProfiles(): HasMany
    {
        return $this->hasMany(BpjsProfile::class);
    }

    /**
     * Pembayaran tagihan terakhir yang berstatus selesai.
     */
    public function latestPayment(): HasOne
    {
        return $this->hasOne(Transaction::class)
            ->ofMany(['id' => 'max'], function ($query) {
                $query->where('type', 'bill_payment')
                    ->where('status', 'completed');
            });
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

    public function scopeProcessable($query)
    {
        return $query->where('is_active', true)
            ->where('schedule_status', self::SCHEDULE_NORMAL)
            ->whereHas('user', function ($userQuery) {
                $userQuery->where('life_status', '!=', 'deceased');
            });
    }

    // ================= HELPERS =================

    /**
     * Perbarui jadwal setelah pembayaran tercatat selesai.
     * Ini hanya memperbarui jadwal Ayom, bukan membayar penyedia tagihan.
     */
    public function markAsPaid(): void
    {
        $this->update([
            'last_paid_at' => now(),
            'next_due_date' => $this->calculateNextDueDate(),
        ]);
    }

    /**
     * Memeriksa apakah tagihan BPJS aktif yang perlu ditinjau
     * ketika ada laporan perubahan status anggota.
     */
    public function requiresScheduleReview(): bool
    {
        $status = $this->schedule_status ?? self::SCHEDULE_NORMAL;

        return $status !== self::SCHEDULE_NORMAL;
    }

    /**
     * Tandai jadwal tagihan untuk diperiksa.
     */
    public function flagForReview(?string $note = null): void
    {
        $this->forceFill([
            'schedule_status' => self::SCHEDULE_REVIEW,
            'schedule_note' => $note,
            'schedule_flagged_at' => now(),
        ])->save();
    }

    /**
     * Kembalikan jadwal ke status normal setelah ditinjau.
     */
    public function clearScheduleReview(): void
    {
        $this->forceFill([
            'schedule_status' => self::SCHEDULE_NORMAL,
            'schedule_note' => null,
            'schedule_flagged_at' => null,
        ])->save();
    }

    /**
     * Alasan tagihan tidak boleh diproses.
     */
    public function processBlockedReason(): ?string
    {
        if (! $this->is_active) {
            return 'Tagihan ini sudah dinonaktifkan.';
        }

        $scheduleStatus = $this->schedule_status ?? self::SCHEDULE_NORMAL;

        if ($scheduleStatus === self::SCHEDULE_HALTED) {
            return 'Jadwal tagihan ini sudah dihentikan oleh keluarga.';
        }

        if ($scheduleStatus !== self::SCHEDULE_NORMAL) {
            return 'Jadwal tagihan ini perlu ditinjau sebelum dapat diproses.';
        }

        $this->loadMissing('user');

        if (! $this->user || $this->user->isDeceased()) {
            return 'Pemilik tagihan sudah dilaporkan meninggal. Pembayaran diblokir.';
        }

        return null;
    }

    /**
     * Apakah tagihan boleh diproses berdasarkan statusnya.
     * Otorisasi tetap wajib dilakukan di controller.
     */
    public function canBeProcessed(): bool
    {
        return $this->processBlockedReason() === null;
    }

    /**
     * Jumlah hari sampai tanggal jatuh tempo.
     * Nilai negatif berarti tanggal jatuh tempo sudah lewat.
     */
    public function getDaysUntilDueAttribute(): ?int
    {
        if (! $this->next_due_date) {
            return null;
        }

        return (int) now()->startOfDay()->diffInDays(
            $this->next_due_date->copy()->startOfDay(),
            false
        );
    }

    /**
     * Status pengingat berdasarkan jadwal yang tercatat di Ayom.
     */
    public function getReminderStatusAttribute(): string
    {
        $scheduleStatus = $this->schedule_status ?? self::SCHEDULE_NORMAL;

        if ($scheduleStatus !== self::SCHEDULE_NORMAL) {
            return 'ditunda';
        }

        $this->loadMissing('user');

        if ($this->user?->isDeceased()) {
            return 'ditunda';
        }

        $days = $this->days_until_due;

        return match (true) {
            $days === null => 'normal',
            $days < 0 => 'terlambat',
            $days <= 3 => 'segera',
            default => 'normal',
        };
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
