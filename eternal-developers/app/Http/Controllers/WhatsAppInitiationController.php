<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class WhatsAppInitiationController extends Controller
{
    private const SERVICES = [
        'AI Services & AI Integration',
        'Website Development',
        'Mobile App Development',
        'SEO, AEO & GEO',
        'Digital Marketing',
        'Business Automation',
        'Cloud & Software Solutions',
        'Other Enquiry',
        "I'm not sure — help me choose",
        'Talk to the team',
    ];

    public function store(Request $request): Response
    {
        $validated = $request->validate([
            'service' => ['nullable', 'string', Rule::in(self::SERVICES)],
        ]);

        try {
            DB::table('contact_link_initiations')->insert([
                'channel' => 'whatsapp',
                'service_label' => $validated['service'] ?? null,
                'created_at' => now(),
            ]);
        } catch (\Throwable $exception) {
            Log::warning('WhatsApp link initiation could not be recorded.', [
                'error' => $exception->getMessage(),
            ]);
        }

        return response()->noContent();
    }
}
