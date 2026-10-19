<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\ServiceCategory;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Home', [
            'featuredServices' => Service::query()
                ->published()
                ->with('category:id,name,slug')
                ->where('is_featured', true)
                ->orderBy('display_order')
                ->limit(6)
                ->get(),
            'categories' => ServiceCategory::query()
                ->published()
                ->withCount(['services' => fn ($query) => $query->published()])
                ->orderBy('display_order')
                ->get(['id', 'name', 'slug', 'summary']),
        ]);
    }
}
