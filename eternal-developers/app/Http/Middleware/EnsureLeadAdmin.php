<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureLeadAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $adminEmail = config('leads.admin.email');

        if (! $adminEmail || $request->session()->get('lead_admin_email') !== $adminEmail) {
            return redirect()->guest(route('admin.login'));
        }

        return $next($request);
    }
}
