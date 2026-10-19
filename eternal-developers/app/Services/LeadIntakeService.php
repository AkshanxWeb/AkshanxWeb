<?php

namespace App\Services;

use App\Jobs\SendLeadNotification;
use App\Models\Lead;
use App\Models\LeadNotificationDelivery;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class LeadIntakeService
{
    /** @return array{lead: Lead, delivery: LeadNotificationDelivery} */
    public function submit(array $data, string $source): array
    {
        $data['source'] = $source;
        $data['privacy_consent_at'] = now();

        $lead = DB::transaction(fn () => Lead::create($data));
        $delivery = LeadNotificationDelivery::create([
            'lead_id' => $lead->id,
            'channel' => 'email',
            'status' => 'queued',
        ]);

        if (! filled(config('services.lead_notifications.to'))) {
            $delivery->update([
                'status' => 'failed',
                'last_error' => 'LEAD_NOTIFICATION_EMAIL is not configured.',
            ]);
            Log::warning('Lead notification was not queued because no recipient is configured.', [
                'lead_id' => $lead->id,
                'delivery_id' => $delivery->id,
            ]);
        } else {
            try {
                SendLeadNotification::dispatch($delivery->id);
            } catch (Throwable $exception) {
                $delivery->update([
                    'status' => 'failed',
                    'last_error' => $exception->getMessage(),
                ]);
                Log::error('Unable to queue lead notification.', [
                    'lead_id' => $lead->id,
                    'delivery_id' => $delivery->id,
                    'error' => $exception->getMessage(),
                ]);
            }
        }

        return ['lead' => $lead, 'delivery' => $delivery->refresh()];
    }
}
