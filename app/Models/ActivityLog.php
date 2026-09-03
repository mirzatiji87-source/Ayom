<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityLog extends Model
{
    use HasFactory;

    public $timestamps = true;
    const UPDATED_AT = null; // log tidak pernah di-update, cukup created_at

    protected $fillable = [
        'user_id',
        'family_id',
        'action',
        'subject_type',
        'subject_id',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
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

    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    // ================= HELPERS =================

    public static function record(string $action, ?User $user = null, $subject = null, array $meta = []): self
    {
        return self::create([
            'user_id' => $user?->id,
            'family_id' => $user?->family_id,
            'action' => $action,
            'subject_type' => $subject ? get_class($subject) : null,
            'subject_id' => $subject?->id,
            'meta' => $meta,
        ]);
    }
}
