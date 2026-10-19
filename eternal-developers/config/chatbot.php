<?php

return [
    'api_key' => env('AI_CHAT_API_KEY'),
    'endpoint' => env('AI_CHAT_ENDPOINT', 'https://api.openai.com/v1/chat/completions'),
    'model' => env('AI_CHAT_MODEL', 'gpt-4o-mini'),
    'timeout' => (int) env('AI_CHAT_TIMEOUT', 12),
];
