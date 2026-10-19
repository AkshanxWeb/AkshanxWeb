<?php

namespace App\Mail;

use App\Models\Lead;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewLeadReceived extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(public Lead $lead)
    {
        $this->lead->loadMissing('service');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New website enquiry #'.$this->lead->id,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.leads.received',
            text: 'emails.leads.received-text',
            with: [
                'adminUrl' => rtrim(config('app.url'), '/').'/admin/leads/'.$this->lead->id,
            ],
        );
    }
}
