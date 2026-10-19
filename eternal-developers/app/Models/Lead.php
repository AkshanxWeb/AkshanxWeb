<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'source',
        'status',
        'contacted_at',
        'internal_notes',
        'privacy_consent_at',
    ];

    protected function casts(): array
    {
        return [
            'privacy_consent_at' => 'immutable_datetime',
            'contacted_at' => 'immutable_datetime',
        ];
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function notificationDeliveries(): HasMany
    {
        return $this->hasMany(LeadNotificationDelivery::class);
    }
}
