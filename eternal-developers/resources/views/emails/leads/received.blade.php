<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>New website enquiry</title>
</head>
<body style="margin:0;background:#f2f4ef;color:#182520;font-family:Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 12px;background:#f2f4ef;">
        <tr><td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border:1px solid #dce2d8;">
                <tr><td style="padding:26px 30px;background:#192720;color:#fff;">
                    <p style="margin:0 0 8px;color:#d6f278;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Eternal Developers</p>
                    <h1 style="margin:0;font-size:24px;font-weight:600;">New project enquiry #{{ $lead->id }}</h1>
                </td></tr>
                <tr><td style="padding:28px 30px;">
                    <p style="margin:0 0 20px;color:#59675f;font-size:14px;line-height:1.6;">A new enquiry was submitted through the website.</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:13px;line-height:1.6;">
                        <tr><td style="padding:8px 0;color:#77837b;width:145px;">Name</td><td style="padding:8px 0;font-weight:600;">{{ $lead->name }}</td></tr>
                        <tr><td style="padding:8px 0;color:#77837b;">Email</td><td style="padding:8px 0;"><a href="mailto:{{ $lead->email }}" style="color:#315b42;">{{ $lead->email }}</a></td></tr>
                        @if($lead->phone)<tr><td style="padding:8px 0;color:#77837b;">Phone / WhatsApp</td><td style="padding:8px 0;">{{ $lead->phone }}</td></tr>@endif
                        @if($lead->company)<tr><td style="padding:8px 0;color:#77837b;">Company</td><td style="padding:8px 0;">{{ $lead->company }}</td></tr>@endif
                        <tr><td style="padding:8px 0;color:#77837b;">Service</td><td style="padding:8px 0;">{{ $lead->service?->name ?? 'Not selected' }}</td></tr>
                        @if($lead->budget_range)<tr><td style="padding:8px 0;color:#77837b;">Budget</td><td style="padding:8px 0;">{{ $lead->budget_range }}</td></tr>@endif
                        @if($lead->desired_timeline)<tr><td style="padding:8px 0;color:#77837b;">Timeline</td><td style="padding:8px 0;">{{ $lead->desired_timeline }}</td></tr>@endif
                        <tr><td style="padding:8px 0;color:#77837b;">Source</td><td style="padding:8px 0;">{{ str($lead->source)->replace('_', ' ')->title() }}</td></tr>
                        <tr><td style="padding:8px 0;color:#77837b;">Received</td><td style="padding:8px 0;">{{ $lead->created_at?->timezone(config('app.timezone'))->format('d M Y, H:i T') }}</td></tr>
                    </table>
                    <div style="margin-top:20px;padding:16px;background:#f4f6f1;border-left:3px solid #c0df67;">
                        <p style="margin:0 0 8px;color:#77837b;font-size:11px;text-transform:uppercase;">Project description</p>
                        <p style="margin:0;white-space:pre-wrap;font-size:13px;line-height:1.7;">{{ $lead->project_brief }}</p>
                    </div>
                    <p style="margin:24px 0 0;"><a href="{{ $adminUrl }}" style="display:inline-block;padding:12px 16px;background:#192720;color:#fff;text-decoration:none;font-size:12px;font-weight:600;">View lead #{{ $lead->id }}</a></p>
                </td></tr>
            </table>
        </td></tr>
    </table>
</body>
</html>