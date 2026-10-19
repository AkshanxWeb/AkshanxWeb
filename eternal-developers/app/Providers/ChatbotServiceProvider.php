<?php

namespace App\Providers;

use App\AI\Contracts\ChatProvider;
use App\AI\Providers\OpenAICompatibleChatProvider;
use Illuminate\Support\ServiceProvider;

class ChatbotServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(ChatProvider::class, OpenAICompatibleChatProvider::class);
    }
}
