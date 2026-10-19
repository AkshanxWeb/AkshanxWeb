<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Services\LeadIntakeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function create(Request $request): Response
    {
        $selectedService = Service::query()
            ->published()
            ->where('slug', $request->query('service'))
            ->value('id');

        return Inertia::render('Contact', [
            'services' => Service::published()->orderBy('name')->get(['id', 'name']),
            'selectedServiceId' => $selectedService,
            'source' => $request->query('source') === 'quote_request'
                ? 'quote_request'
                : ($request->query('service') ? 'service_page' : 'website_contact_form'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if ($request->filled('website')) {
            return back()->with('success', 'Thanks. Your enquiry has been received.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:254'],
            'company' => ['nullable', 'string', 'max:160'],
            'phone' => ['nullable', 'string', 'max:40'],
            'service_id' => ['nullable', 'integer', 'exists:services,id'],
            'project_brief' => ['required', 'string', 'min:20', 'max:6000'],
            'budget_range' => ['nullable', 'in:under-50k,50k-2l,2l-5l,5l-plus,not-sure'],
            'desired_timeline' => ['nullable', 'in:within-month,1-3-months,3-6-months,flexible'],
            'source' => ['nullable', 'in:website_contact_form,service_page,quote_request'],
            'consent' => ['accepted'],
            'website' => ['nullable', 'max:0'],
        ]);

        unset($validated['consent'], $validated['website']);
        $source = $validated['source'] ?? 'website_contact_form';
        unset($validated['source']);
        $result = app(LeadIntakeService::class)->submit($validated, $source);

        $response = back()->with('success', 'Your enquiry has been saved.');

        if ($result['delivery']->status === 'failed') {
            $response->with('notification_warning', 'Your enquiry is saved, but the email alert could not be queued. Please use WhatsApp if you need an immediate reply.');
        }

        return $response;
    }
}
