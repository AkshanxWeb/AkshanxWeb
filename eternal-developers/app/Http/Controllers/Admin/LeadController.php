<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendLeadNotification;
use App\Models\Lead;
use App\Models\LeadNotificationDelivery;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class LeadController extends Controller
{
    private const STATUSES = ['new', 'contacted', 'qualified', 'converted', 'closed'];

    private const SOURCES = ['website_contact_form', 'service_page', 'quote_request', 'ai_chatbot', 'whatsapp_initiated', 'other'];

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in(self::STATUSES)],
            'source' => ['nullable', Rule::in(self::SOURCES)],
            'service_id' => ['nullable', 'integer', 'exists:services,id'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);

        $leads = $this->filteredLeads($filters)
            ->with(['service:id,name', 'notificationDeliveries:id,lead_id,channel,status,attempts,last_error,sent_at'])
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Leads/Index', [
            'leads' => $leads,
            'services' => Service::query()->orderBy('name')->get(['id', 'name']),
            'filters' => $filters,
            'counts' => [
                'new' => Lead::where('status', 'new')->count(),
                'open' => Lead::whereIn('status', ['new', 'contacted', 'qualified'])->count(),
                'failedNotifications' => LeadNotificationDelivery::where('status', 'failed')->count(),
            ],
        ]);
    }

    public function show(Lead $lead): Response
    {
        return Inertia::render('Admin/Leads/Show', [
            'lead' => $lead->load(['service:id,name', 'notificationDeliveries']),
            'statuses' => self::STATUSES,
        ]);
    }

    public function update(Request $request, Lead $lead): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(self::STATUSES)],
        ]);

        $lead->update([
            'status' => $validated['status'],
            'contacted_at' => $validated['status'] === 'contacted' ? ($lead->contacted_at ?? now()) : $lead->contacted_at,
        ]);

        return back()->with('success', 'Lead status updated.');
    }

    public function note(Request $request, Lead $lead): RedirectResponse
    {
        $validated = $request->validate([
            'note' => ['required', 'string', 'min:2', 'max:4000'],
        ]);

        $entry = '['.now()->format('Y-m-d H:i T').'] '.$validated['note'];
        $lead->update([
            'internal_notes' => trim(($lead->internal_notes ?? '')."\n\n".$entry),
        ]);

        return back()->with('success', 'Internal note added.');
    }

    public function resendNotification(Lead $lead): RedirectResponse
    {
        if (! filled(config('services.lead_notifications.to'))) {
            return back()->withErrors(['notification' => 'Set LEAD_NOTIFICATION_EMAIL before retrying email delivery.']);
        }

        $delivery = $lead->notificationDeliveries()->firstOrCreate(
            ['channel' => 'email'],
            ['status' => 'failed'],
        );

        if ($delivery->status === 'sent') {
            return back()->withErrors(['notification' => 'This notification has already been sent.']);
        }

        $delivery->update(['status' => 'queued', 'last_error' => null]);

        try {
            SendLeadNotification::dispatch($delivery->id);
        } catch (Throwable $exception) {
            $delivery->update(['status' => 'failed', 'last_error' => $exception->getMessage()]);
            Log::error('Unable to queue a lead notification retry.', [
                'lead_id' => $lead->id,
                'delivery_id' => $delivery->id,
                'error' => $exception->getMessage(),
            ]);

            return back()->withErrors(['notification' => 'The retry could not be queued. The lead is still saved.']);
        }

        return back()->with('success', 'Email notification queued for retry.');
    }

    public function export(Request $request): StreamedResponse
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in(self::STATUSES)],
            'source' => ['nullable', Rule::in(self::SOURCES)],
            'service_id' => ['nullable', 'integer', 'exists:services,id'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);

        return response()->streamDownload(function () use ($filters): void {
            $output = fopen('php://output', 'w');
            fputcsv($output, ['Lead ID', 'Name', 'Email', 'Phone', 'Company', 'Service', 'Project brief', 'Budget', 'Timeline', 'Source', 'Status', 'Received at']);

            $this->filteredLeads($filters)->with('service:id,name')->orderByDesc('created_at')->chunk(250, function ($leads) use ($output): void {
                foreach ($leads as $lead) {
                    fputcsv($output, [
                        $this->csvCell($lead->id),
                        $this->csvCell($lead->name),
                        $this->csvCell($lead->email),
                        $this->csvCell($lead->phone),
                        $this->csvCell($lead->company),
                        $this->csvCell($lead->service?->name),
                        $this->csvCell($lead->project_brief),
                        $this->csvCell($lead->budget_range),
                        $this->csvCell($lead->desired_timeline),
                        $this->csvCell($lead->source),
                        $this->csvCell($lead->status),
                        $this->csvCell($lead->created_at?->toIso8601String()),
                    ]);
                }
            });

            fclose($output);
        }, 'leads-'.now()->format('Ymd-His').'.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-store, private',
        ]);
    }

    private function filteredLeads(array $filters)
    {
        return Lead::query()
            ->when($filters['q'] ?? null, function ($query, $term): void {
                $query->where(function ($search) use ($term): void {
                    $search->where('name', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%")
                        ->orWhere('company', 'like', "%{$term}%")
                        ->orWhere('project_brief', 'like', "%{$term}%");
                });
            })
            ->when($filters['status'] ?? null, fn ($query, $value) => $query->where('status', $value))
            ->when($filters['source'] ?? null, fn ($query, $value) => $query->where('source', $value))
            ->when($filters['service_id'] ?? null, fn ($query, $value) => $query->where('service_id', $value))
            ->when($filters['from'] ?? null, fn ($query, $value) => $query->whereDate('created_at', '>=', $value))
            ->when($filters['to'] ?? null, fn ($query, $value) => $query->whereDate('created_at', '<=', $value));
    }

    private function csvCell(mixed $value): string
    {
        $cell = (string) ($value ?? '');

        return preg_match('/^[=+\-@\t\r]/', $cell) === 1 ? "'".$cell : $cell;
    }
}
