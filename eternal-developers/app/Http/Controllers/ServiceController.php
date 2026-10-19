<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:80'],
            'category' => ['nullable', 'string', 'max:80'],
        ]);

        $services = Service::query()
            ->published()
            ->with('category:id,name,slug')
            ->when($filters['q'] ?? null, function ($query, $term) {
                $query->where(function ($search) use ($term) {
                    $search->where('name', 'like', "%{$term}%")
                        ->orWhere('summary', 'like', "%{$term}%");
                });
            })
            ->when($filters['category'] ?? null, fn ($query, $slug) => $query->whereHas(
                'category',
                fn ($category) => $category->where('slug', $slug)->where('is_published', true),
            ))
            ->orderBy('display_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('Services/Index', [
            'services' => $services,
            'categories' => ServiceCategory::published()->orderBy('display_order')->get(['name', 'slug']),
            'filters' => $filters,
        ]);
    }

    public function show(Service $service): Response
    {
        abort_unless($service->is_published, 404);

        return Inertia::render('Services/Show', [
            'service' => $service->load('category:id,name,slug'),
            'relatedServices' => Service::query()
                ->published()
                ->where('service_category_id', $service->service_category_id)
                ->whereKeyNot($service->id)
                ->orderBy('display_order')
                ->limit(3)
                ->get(['id', 'name', 'slug', 'summary']),
        ]);
    }
}
