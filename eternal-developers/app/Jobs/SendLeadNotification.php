<?php

namespace App\Jobs;

use App\Mail\NewLeadReceived;
use App\Models\LeadNotificationDelivery;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Throwable;

class SendLeadNotification implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;

    public int $uniqueFor = 3600;

    public function __construct(public int $deliveryId) {}

    public function uniqueId(): string
    {
        return (string) $this->deliveryId;
    }

    public function backoff(): array
    {
        return [30, 120];
    }

    public function handle(): void
    {
        $delivery = LeadNotificationDelivery::with('lead.service')->findOrFail($this->deliveryId);

        if ($delivery->status === 'sent') {
            return;
        }

        $recipient = config('services.lead_notifications.to');

        if (! filled($recipient)) {
            throw new \RuntimeException('LEAD_NOTIFICATION_EMAIL is not configured.');
        }

        $delivery->update([
            'status' => 'sending',
            'attempts' => $delivery->attempts + 1,
            'last_error' => null,
        ]);

        try {
            Mail::to($recipient)->send(new NewLeadReceived($delivery->lead));

            $delivery->update([
                'status' => 'sent',
                'sent_at' => now(),
                'last_error' => null,
            ]);
        } catch (Throwable $exception) {
            $delivery->update([
                'status' => 'queued',
                'last_error' => Str::limit($exception->getMessage(), 2000),
            ]);

            throw $exception;
        }
    }

    public function failed(?Throwable $exception): void
    {
        LeadNotificationDelivery::query()
            ->whereKey($this->deliveryId)
            ->where('status', '!=', 'sent')
            ->update([
                'status' => 'failed',
                'last_error' => $exception ? Str::limit($exception->getMessage(), 2000) : 'The mail job failed after retries.',
                'updated_at' => now(),
            ]);
    }
}
