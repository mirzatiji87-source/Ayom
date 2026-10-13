<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MemberStatusReport extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_VERIFIED = 'verified';
    public const STATUS_REJECTED = 'rejected';

    public const LIFE_STATUS_DECEASED = 'deceased';

    public const BPJS_NOT_REPORTED = 'not_reported';
    public const BPJS_REPORTED = 'reported_by_family';
    public const BPJS_CONFIRMED = 'confirmed_by_family';

    protected $fillable = [
        'family_id',
        'member_user_id',
        'reported_by',
        'reported_life_status',
        'reported_death_date',
        'report_note',
        'evidence_path',
        'verification_status',
        'verified_by',
        'verified_at',
        'verification_note',
        'bpjs_report_status',
        'bpjs_reported_at',
        'bpjs_reference',
    ];

    /**
     * Jangan kirim lokasi penyimpanan bukti ke frontend.
     * Frontend cukup menerima has_evidence.
     */
    protected $hidden = [
        'evidence_path',
    ];

    protected $appends = [
        'status_label',
        'bpjs_status_label',
        'has_evidence',
    ];

    protected function casts(): array
    {
        return [
            'reported_death_date' => 'date',
            'verified_at' => 'datetime',
            'bpjs_reported_at' => 'datetime',
        ];
    }
    

    // ================= RELATIONS =================

    public function family(): BelongsTo
    {
        return $this->belongsTo(Family::class);
    }

    public function memberUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'member_user_id');
    }

    /**
     * Alias untuk kode yang menyebut anggota sebagai subject.
     */
    public function subject(): BelongsTo
    {
        return $this->memberUser();
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function followUpItems(): HasMany
    {
        return $this->hasMany(FollowUpItem::class);
    }

    /**
     * Alias relasi untuk kode yang menggunakan nama followUps.
     */
    public function followUps(): HasMany
    {
        return $this->followUpItems();
    }

    // ================= SCOPES =================

    public function scopeForFamily(
        Builder $query,
        ?int $familyId
    ): Builder {
        if ($familyId === null) {
            // Tanpa family_id, jangan sampai laporan lintas keluarga terbuka.
            return $query->whereRaw('1 = 0');
        }

        return $query->where('family_id', $familyId);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where(
            'verification_status',
            self::STATUS_PENDING
        );
    }

    // ================= ACCESSORS =================

    public function getStatusLabelAttribute(): string
    {
        return match ($this->verification_status) {
            self::STATUS_PENDING => 'Menunggu verifikasi',
            self::STATUS_VERIFIED => 'Terverifikasi di Ayom',
            self::STATUS_REJECTED => 'Ditolak',
            default => 'Status belum diketahui',
        };
    }

    public function getBpjsStatusLabelAttribute(): string
    {
        return match ($this->bpjs_report_status) {
            self::BPJS_NOT_REPORTED => 'Belum dilaporkan',
            self::BPJS_REPORTED => 'Dilaporkan keluarga',
            self::BPJS_CONFIRMED => 'Dikonfirmasi keluarga',
            default => 'Status belum diketahui',
        };
    }

    public function getHasEvidenceAttribute(): bool
    {
        return filled($this->evidence_path);
    }
}
