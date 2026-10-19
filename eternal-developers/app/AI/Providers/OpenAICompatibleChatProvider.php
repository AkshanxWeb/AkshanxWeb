<?php

namespace App\AI\Providers;

use App\AI\Contracts\ChatProvider;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class OpenAICompatibleChatProvider implements ChatProvider
{
    public function reply(array $messages): string
    {
        $apiKey = config('chatbot.api_key');

        if (! filled($apiKey)) {
            throw new RuntimeException('The AI chat provider is not configured.');
        }

        $response = Http::withToken($apiKey)
            ->acceptJson()
            ->timeout(config('chatbot.timeout', 12))
            ->post(config('chatbot.endpoint'), [
                'model' => config('chatbot.model'),
                'messages' => $messages,
                'temperature' => 0.3,
                'max_tokens' => 350,
            ]);

        $response->throw();
        $content = $response->json('choices.0.message.content');

        if (! is_string($content) || ! filled($content)) {
            throw new RuntimeException('The AI provider returned no usable response.');
        }

        return mb_substr(trim($content), 0, 1800);
    }
}
