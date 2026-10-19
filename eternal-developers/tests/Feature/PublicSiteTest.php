<?php

namespace Tests\Feature;

use App\Jobs\SendLeadNotification;
use App\Mail\NewLeadReceived;
use App\Models\Lead;
use App\Models\LeadNotificationDelivery;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class PublicSiteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_homepage_renders_featured_services(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Home')
                ->has('featuredServices', 6)
                ->has('categories', 10));
    }

    public function test_service_catalog_filters_by_search_and_category(): void
    {
        $this->get('/services?q=AI&category=ai-products')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Services/Index')
                ->where('filters.category', 'ai-products')
                ->has('services', 4));
    }

    public function test_project_enquiry_is_validated_and_saved(): void
    {
        $serviceId = Service::query()->where('slug', 'ai-chatbots')->value('id');

        $this->post('/contact', [
            'name' => 'A Client',
            'email' => 'client@example.com',
            'company' => 'Example Studio',
            'service_id' => $serviceId,
            'project_brief' => 'We need a support assistant grounded in our approved help documentation.',
            'budget_range' => 'not-sure',
            'desired_timeline' => 'flexible',
            'consent' => '1',
        ])->assertRedirect();

        $this->assertDatabaseHas('leads', [
            'email' => 'client@example.com',
            'service_id' => $serviceId,
            'status' => 'new',
        ]);
    }

    public function test_project_enquiry_requires_privacy_consent(): void
    {
        $this->from('/contact')->post('/contact', [
            'name' => 'A Client',
            'email' => 'client@example.com',
            'project_brief' => 'We need help improving a real business workflow.',
        ])->assertSessionHasErrors('consent');

        $this->assertDatabaseCount('leads', 0);
    }

    public function test_new_enquiry_queues_one_notification_when_a_recipient_is_configured(): void
    {
        Queue::fake();
        config(['services.lead_notifications.to' => 'studio@example.test']);

        $this->post('/contact', [
            'name' => 'A Client',
            'email' => 'client@example.com',
            'project_brief' => 'We need a clear and accessible company website.',
            'consent' => '1',
        ])->assertRedirect();

        $this->assertDatabaseHas('lead_notification_deliveries', [
            'lead_id' => 1,
            'channel' => 'email',
            'status' => 'queued',
        ]);
        Queue::assertPushed(SendLeadNotification::class, 1);
    }

    public function test_missing_notification_recipient_does_not_lose_the_lead(): void
    {
        config(['services.lead_notifications.to' => null]);

        $this->post('/contact', [
            'name' => 'A Client',
            'email' => 'client@example.com',
            'project_brief' => 'We need a clear and accessible company website.',
            'consent' => '1',
        ])->assertRedirect();

        $this->assertDatabaseHas('leads', ['email' => 'client@example.com']);
        $this->assertDatabaseHas('lead_notification_deliveries', [
            'lead_id' => 1,
            'status' => 'failed',
        ]);
    }

    public function test_admin_routes_require_an_authenticated_lead_admin(): void
    {
        $this->get('/admin/leads')->assertRedirect('/admin/login');
        $this->get('/admin/leads/export')->assertRedirect('/admin/login');
    }

    public function test_configured_admin_can_sign_in_and_open_the_lead_inbox(): void
    {
        config([
            'leads.admin.email' => 'owner@example.test',
            'leads.admin.password_hash' => Hash::make('a-long-test-password'),
        ]);

        $this->post('/admin/login', [
            'email' => 'owner@example.test',
            'password' => 'a-long-test-password',
        ])->assertRedirect('/admin/leads');

        $this->get('/admin/leads')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Leads/Index'));
    }

    public function test_admin_can_change_lead_status_and_export_csv(): void
    {
        config(['leads.admin.email' => 'owner@example.test']);

        $lead = Lead::create([
            'name' => 'A Client',
            'email' => 'client@example.com',
            'project_brief' => 'A verified project brief for a website enquiry.',
            'source' => 'website_contact_form',
            'status' => 'new',
            'privacy_consent_at' => now(),
        ]);

        $this->withSession(['lead_admin_email' => 'owner@example.test'])
            ->patch("/admin/leads/{$lead->id}", ['status' => 'contacted'])
            ->assertRedirect();

        $this->assertDatabaseHas('leads', ['id' => $lead->id, 'status' => 'contacted']);

        $this->withSession(['lead_admin_email' => 'owner@example.test'])
            ->get('/admin/leads/export')
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }

    public function test_admin_csv_export_neutralizes_spreadsheet_formulas(): void
    {
        config(['leads.admin.email' => 'owner@example.test']);
        Lead::create([
            'name' => '=HYPERLINK("https://example.test")',
            'email' => 'client@example.com',
            'project_brief' => 'A project description with sufficient detail.',
            'source' => 'website_contact_form',
            'status' => 'new',
            'privacy_consent_at' => now(),
        ]);

        $response = $this->withSession(['lead_admin_email' => 'owner@example.test'])
            ->get('/admin/leads/export')
            ->assertOk();

        $this->assertStringContainsString("'=HYPERLINK(", $response->streamedContent());
    }

    public function test_admin_logout_invalidates_the_lead_session(): void
    {
        config(['leads.admin.email' => 'owner@example.test']);

        $this->withSession(['lead_admin_email' => 'owner@example.test'])
            ->post('/admin/logout')
            ->assertRedirect('/admin/login');

        $this->get('/admin/leads')->assertRedirect('/admin/login');
    }

    public function test_chatbot_answers_from_the_approved_catalog_without_storing_the_conversation(): void
    {
        $this->postJson('/chatbot/message', [
            'message' => 'AI services',
            'history' => [],
        ])->assertOk()
            ->assertJsonPath('mode', 'guided')
            ->assertJsonPath('reply', fn ($reply) => str_contains($reply, 'AI application development'));

        $this->assertDatabaseCount('leads', 0);
    }

    public function test_chatbot_falls_back_when_the_configured_ai_provider_fails(): void
    {
        config([
            'chatbot.api_key' => 'test-key',
            'chatbot.endpoint' => 'https://ai.example.test/v1/chat/completions',
        ]);
        Http::fake(['*' => Http::response(['error' => 'temporary outage'], 503)]);

        $this->postJson('/chatbot/message', ['message' => 'website development'])
            ->assertOk()
            ->assertJsonPath('mode', 'guided')
            ->assertJsonPath('reply', fn ($reply) => str_contains($reply, 'business website'));

        Http::assertSent(fn ($request) => $request->url() === 'https://ai.example.test/v1/chat/completions');
    }

    public function test_chatbot_rate_limit_returns_too_many_requests(): void
    {
        for ($attempt = 0; $attempt < 20; $attempt++) {
            $this->postJson('/chatbot/message', ['message' => 'hello'])->assertOk();
        }

        $this->postJson('/chatbot/message', ['message' => 'hello'])->assertStatus(429);
    }

    public function test_chatbot_can_capture_a_consented_lead(): void
    {
        Queue::fake();
        config(['services.lead_notifications.to' => 'studio@example.test']);
        $serviceId = Service::query()->where('slug', 'ai-chatbots')->value('id');

        $this->postJson('/chatbot/lead', [
            'name' => 'Chat Visitor',
            'email' => 'chat@example.com',
            'phone' => '+918900000000',
            'service_id' => $serviceId,
            'project_brief' => 'We want a customer support chatbot grounded in approved docs.',
            'budget_range' => 'not-sure',
            'desired_timeline' => 'flexible',
            'consent' => true,
        ])->assertCreated()
            ->assertJsonPath('saved', true);

        $this->assertDatabaseHas('leads', [
            'email' => 'chat@example.com',
            'source' => 'ai_chatbot',
            'service_id' => $serviceId,
        ]);
        Queue::assertPushed(SendLeadNotification::class, 1);
    }

    public function test_whatsapp_link_initiation_is_not_recorded_as_a_submitted_lead(): void
    {
        $this->postJson('/contact/whatsapp-initiation', [
            'service' => 'Website Development',
        ])->assertNoContent();

        $this->assertDatabaseCount('contact_link_initiations', 1);
        $this->assertDatabaseCount('leads', 0);
    }

    public function test_successful_email_delivery_is_idempotent_when_the_job_repeats(): void
    {
        config(['services.lead_notifications.to' => 'studio@example.test']);
        Mail::fake();

        $lead = Lead::create([
            'name' => 'A Client',
            'email' => 'client@example.com',
            'project_brief' => 'We need help improving an existing business workflow.',
            'source' => 'website_contact_form',
            'status' => 'new',
            'privacy_consent_at' => now(),
        ]);
        $delivery = LeadNotificationDelivery::create([
            'lead_id' => $lead->id,
            'channel' => 'email',
            'status' => 'queued',
        ]);
        $job = new SendLeadNotification($delivery->id);

        $job->handle();
        $job->handle();

        Mail::assertSent(NewLeadReceived::class, 1);
        $this->assertDatabaseHas('lead_notification_deliveries', [
            'id' => $delivery->id,
            'status' => 'sent',
            'attempts' => 1,
        ]);
    }
}
