<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BpjsProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'family_id',
        'user_id',
        'bill_id',
        'participant_name',
        'participant_number',
        'relationship_to_head',
        'membership_class',
        'segment',
        'membership_status',
        'monthly_contribution',
        'last_verified_at',
        'notes',
    ];

    /**
     * Nomor peserta lengkap tidak boleh masuk ke JSON frontend.
     */
    protected $hidden = [
        'participant_number',
    ];

    protected function casts(): array
    {
        return [
            'participant_number' => 'encrypted',
            'monthly_contribution' => 'decimal:2',
            'last_verified_at' => 'datetime',
        ];
    }

    // ================= RELATIONS =================

    public function family(): BelongsTo
    {
        return $this->belongsTo(Family::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function bill(): BelongsTo
    {
        return $this->belongsTo(Bill::class);
    }

    // ================= HELPERS =================

    /**
     * Hanya tampilkan empat digit terakhir nomor peserta.
     * Nomor lengkap tetap terenkripsi dalam penyimpanan dan
     * tidak dikirimkan ke frontend melalui serialisasi model.
     */
    public function maskedNumber(): ?string
    {
        $number = $this->participant_number;

        if (! is_string($number) || $number === '') {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $number);

        if (! is_string($digits) || $digits === '') {
            return null;
        }

        return '•••• ' . substr($digits, -4);
    }
}
