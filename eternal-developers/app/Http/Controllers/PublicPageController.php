<?php

namespace App\Http\Controllers;

use App\Models\ServiceCategory;
use Inertia\Inertia;
use Inertia\Response;

class PublicPageController extends Controller
{
    public function about(): Response
    {
        return Inertia::render('About');
    }

    public function pricing(): Response
    {
        return Inertia::render('Pricing', [
            'categories' => ServiceCategory::published()->orderBy('display_order')->get(['name', 'slug', 'summary']),
        ]);
    }

    public function faqs(): Response
    {
        return Inertia::render('Faqs');
    }
}