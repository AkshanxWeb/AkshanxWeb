<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ServiceCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $catalog = [
            ['Web & software', 'web-software', 'Websites and applications built around the way your business works.', [
                ['Business websites', 'Fast, accessible websites designed to explain your offer and turn the right visits into conversations.', true],
                ['Web applications', 'Custom web products, internal tools, and customer portals designed around real workflows.', true],
                ['E-commerce development', 'Commerce experiences with thoughtful catalog, checkout, and operations flows.', true],
                ['Laravel development', 'Maintainable Laravel applications, APIs, dashboards, and integrations.'],
                ['Website maintenance', 'Ongoing updates, performance improvements, and dependable technical care.'],
            ]],
            ['AI & intelligent products', 'ai-products', 'Practical AI applications with clear boundaries, useful outcomes, and human oversight.', [
                ['AI application development', 'Purpose-built AI features integrated into your product, team, or customer experience.', true],
                ['AI agents & workflows', 'Bounded, reviewable workflows that use approved tools and keep people in control.', true],
                ['AI chatbots', 'Helpful assistants grounded in approved business information, with a clear path to human support.', true],
                ['Document intelligence', 'Extract, classify, and summarize business documents with reviewable results.'],
                ['AI strategy & evaluation', 'Identify worthwhile AI opportunities and test quality, safety, and operational fit.'],
            ]],
            ['Automation & integrations', 'automation-integrations', 'Connect your tools and reduce repetitive work without losing oversight.', [
                ['Business process automation', 'Map and automate repeatable processes with clear ownership and failure handling.', true],
                ['AI & API integrations', 'Connect approved AI providers, CRMs, and business systems to your existing software.'],
                ['Workflow automation', 'Design maintainable n8n, Make, and custom workflows with bounded retries and auditability.'],
            ]],
            ['Search growth', 'search-growth', 'Build discoverability with technically sound, useful, and measurable search experiences.', [
                ['Search engine optimization', 'Technical and on-page SEO work focused on a healthier site and useful content.', true],
                ['Answer engine optimization', 'Structure credible information to make direct answers easier to understand and cite.'],
                ['Generative engine optimization', 'Improve content clarity and entity consistency for emerging AI-assisted discovery.'],
            ]],
            ['Mobile applications', 'mobile-apps', 'Mobile products that feel considered from the first screen through everyday use.', [
                ['Cross-platform app development', 'Plan and build maintainable mobile applications for iOS and Android.', true],
                ['Mobile app integrations', 'Add authentication, notifications, analytics, and service connections to mobile products.'],
            ]],
            ['Digital marketing', 'digital-marketing', 'Connect thoughtful campaigns to useful landing experiences and clear measurement.', [
                ['Performance marketing', 'Campaign planning and measurement across paid channels, with transparent learning goals.'],
                ['Lead generation systems', 'Connect forms, landing pages, CRM workflows, and follow-up into a cohesive journey.'],
            ]],
            ['Product design & brand', 'product-design-brand', 'Make complex products feel clear, distinctive, and easy to use.', [
                ['UI/UX design', 'Research, flows, prototypes, and interfaces grounded in user needs and product goals.', true],
                ['Design systems', 'Reusable interface patterns and foundations that help teams design and ship consistently.'],
                ['Brand identity', 'A coherent visual system for expressing your business across digital touchpoints.'],
            ]],
            ['Cloud & DevOps', 'cloud-devops', 'Ship reliably with infrastructure that fits the product and the team operating it.', [
                ['Cloud deployment', 'Production deployments and cloud architecture shaped around your application requirements.'],
                ['CI/CD & DevOps', 'Automated delivery workflows, environment setup, and operational handover.'],
                ['Performance & reliability', 'Investigate bottlenecks and improve the resilience of applications and databases.'],
            ]],
            ['Data & business systems', 'data-business-systems', 'Turn scattered operational data into useful software and decision support.', [
                ['Analytics dashboards', 'Purpose-built reporting views that connect meaningful metrics to day-to-day decisions.'],
                ['Custom business software', 'CRM, inventory, billing, and operations software shaped around your process.'],
            ]],
            ['Support & optimization', 'support-optimization', 'Keep digital products dependable, fast, and ready for what comes next.', [
                ['Application security review', 'Practical review of application risks, access boundaries, and production configuration.'],
                ['Ongoing product support', 'A clear support rhythm for fixes, updates, improvements, and technical guidance.'],
            ]],
        ];

        foreach ($catalog as $categoryOrder => [$categoryName, $categorySlug, $summary, $services]) {
            $category = ServiceCategory::updateOrCreate(
                ['slug' => $categorySlug],
                [
                    'name' => $categoryName,
                    'summary' => $summary,
                    'display_order' => $categoryOrder,
                    'is_published' => true,
                ],
            );

            foreach ($services as $serviceOrder => $serviceData) {
                [$name, $serviceSummary, $featured] = array_pad($serviceData, 3, false);
                $slug = Str::slug($name);

                Service::updateOrCreate(
                    ['slug' => $slug],
                    [
                        'service_category_id' => $category->id,
                        'name' => $name,
                        'summary' => $serviceSummary,
                        'description' => $serviceSummary.' We begin by understanding the context, constraints, and outcomes that matter to your team, then shape the right scope together.',
                        'pricing_type' => 'custom',
                        'price_from' => null,
                        'currency' => 'INR',
                        'is_featured' => $featured,
                        'is_published' => true,
                        'display_order' => $serviceOrder,
                        'meta_title' => $name.' | Eternal Developers',
                        'meta_description' => $serviceSummary,
                    ],
                );
            }
        }
    }
}
