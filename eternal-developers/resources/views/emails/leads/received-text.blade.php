New project enquiry #{{ $lead->id }}

Name: {{ $lead->name }}
Email: {{ $lead->email }}
Phone / WhatsApp: {{ $lead->phone ?: 'Not provided' }}
Company: {{ $lead->company ?: 'Not provided' }}
Service: {{ $lead->service?->name ?? 'Not selected' }}
Budget: {{ $lead->budget_range ?: 'Not provided' }}
Timeline: {{ $lead->desired_timeline ?: 'Not provided' }}
Source: {{ str($lead->source)->replace('_', ' ')->title() }}
Received: {{ $lead->created_at?->timezone(config('app.timezone'))->format('d M Y, H:i T') }}

Project description:
{{ $lead->project_brief }}

View lead: {{ $adminUrl }}