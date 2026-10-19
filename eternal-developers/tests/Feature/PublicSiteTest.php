<?php

namespace Tests\Feature;

use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}