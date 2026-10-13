<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FollowUpItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'family_id',
        'member_status_report_id',
        'assigned_to',
        'title',
        'description',
        'status',
        'due_date',
        'completed_by',
        'completed_at',
        'completion_note',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'completed_at' => 'datetime',
        ];
    }

    public function family(): BelongsTo
    {
        return $this->belongsTo(Family::class);
    }

    public function memberStatusReport(): BelongsTo
    {
        return $this->belongsTo(
            MemberStatusReport::class,
            'member_status_report_id'
        );
    }


    /**
     * Alias relasi untuk controller yang menggunakan $item->report.
     */
    public function report(): BelongsTo
    {
        return $this->memberStatusReport();
    }


    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function completer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }
}
