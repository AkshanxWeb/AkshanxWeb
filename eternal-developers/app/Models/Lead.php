<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lead extends Model
{
    protected $fillable = [
        'service_id',
        'name',
        'email',
        'company',
        'phone',
        'project_brief',
        'budget_range',
        'desired_timeline',
        'status',
        'privacy_consent_at',
    ];

    protected function casts(): array
    {
        return [
            'privacy_consent_at' => 'immutable_datetime',
        ];
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}