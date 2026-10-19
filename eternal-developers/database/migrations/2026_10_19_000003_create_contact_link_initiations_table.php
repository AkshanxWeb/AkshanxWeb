<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateContactLinkInitiationsTable extends Migration
{
    public function up(): void
    {
        Schema::create('contact_link_initiations', function (Blueprint $table) {
            $table->id();
            $table->string('channel', 20)->default('whatsapp');
            $table->string('service_label', 120)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['channel', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_link_initiations');
    }
}
