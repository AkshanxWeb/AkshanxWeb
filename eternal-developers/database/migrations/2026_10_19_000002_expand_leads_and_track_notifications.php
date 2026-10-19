<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ExpandLeadsAndTrackNotifications extends Migration
{
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->string('source', 32)->default('website_contact_form')->index();
            $table->timestamp('contacted_at')->nullable();
            $table->longText('internal_notes')->nullable();
        });

        Schema::create('lead_notification_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $table->string('channel', 20)->default('email');
            $table->string('status', 20)->default('queued')->index();
            $table->unsignedSmallInteger('attempts')->default(0);
            $table->text('last_error')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
            $table->unique(['lead_id', 'channel']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lead_notification_deliveries');

        Schema::table('leads', function (Blueprint $table) {
            $table->dropColumn(['source', 'contacted_at', 'internal_notes']);
        });
    }
}
