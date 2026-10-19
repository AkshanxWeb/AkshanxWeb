<?php

namespace App\Http\Controllers;

use App\AI\Services\ChatbotReplyService;
use App\Models\Service;
use App\Services\LeadIntakeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ChatbotController extends Controller
{
    public function message(Request $request, ChatbotReplyService $chatbot): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'min:1', 'max:1000'],
            'history' => ['sometimes', 'array', 'max:6'],
            'history.*.role' => ['required', Rule::in(['user', 'assistant'])],
            'history.*.content' => ['required', 'string', 'max:1000'],
        ]);

        $response = $chatbot->respond($validated['message'], $validated['history'] ?? []);

        return response()->json($response, 200, ['Cache-Control' => 'no-store, private']);
    }

    public function captureLead(Request $request, LeadIntakeService $intake): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:254'],
            'phone' => ['nullable', 'string', 'max:40'],
            'service_id' => ['nullable', 'integer', Rule::exists('services', 'id')->where('is_published', true)],
            'project_brief' => ['required', 'string', 'min:20', 'max:6000'],
            'budget_range' => ['nullable', 'in:under-50k,50k-2l,2l-5l,5l-plus,not-sure'],
            'desired_timeline' => ['nullable', 'in:within-month,1-3-months,3-6-months,flexible'],
            'consent' => ['accepted'],
        ]);

        unset($validated['consent']);
        $result = $intake->submit($validated, 'ai_chatbot');
        $message = $result['delivery']->status === 'failed'
            ? 'Your enquiry has been saved, but the team email alert could not be queued. Please use WhatsApp if you need an immediate reply.'
            : 'Your enquiry has been saved. Our team will follow up using the details you provided.';

        return response()->json([
            'saved' => true,
            'message' => $message,
            'email_notification' => $result['delivery']->status,
        ], 201, ['Cache-Control' => 'no-store, private']);
    }

    public function services(): JsonResponse
    {
        return response()->json([
            'services' => Service::published()
                ->with('category:id,name,slug')
                ->orderBy('display_order')
                ->get(['id', 'service_category_id', 'name', 'slug', 'summary']),
        ], 200, ['Cache-Control' => 'public, max-age=300']);
    }
}
