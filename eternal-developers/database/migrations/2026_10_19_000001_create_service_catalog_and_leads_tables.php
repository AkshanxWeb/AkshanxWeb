<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('summary');
            $table->unsignedSmallInteger('display_order')->default(0);
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });

        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_category_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('summary', 280);
            $table->text('description');
            $table->string('pricing_type')->default('custom');
            $table->decimal('price_from', 12, 2)->nullable();
            $table->char('currency', 3)->default('INR');
            $table->string('delivery_estimate')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_published')->default(false);
            $table->unsignedSmallInteger('display_order')->default(0);
            $table->string('meta_title')->nullable();
            $table->string('meta_description', 320)->nullable();
            $table->timestamps();
            $table->index(['is_published', 'is_featured', 'display_order']);
        });

        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('email')->index();
            $table->string('company')->nullable();
            $table->string('phone', 40)->nullable();
            $table->text('project_brief');
            $table->string('budget_range')->nullable();
            $table->string('desired_timeline')->nullable();
            $table->string('status')->default('new')->index();
            $table->timestamp('privacy_consent_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
        Schema::dropIfExists('services');
        Schema::dropIfExists('service_categories');
    }
};