<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AdminAuthController extends Controller
{
    public function create(): InertiaResponse
    {
        return Inertia::render('Admin/Login');
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email', 'max:254'],
            'password' => ['required', 'string', 'max:200'],
        ]);

        $key = Str::transliterate(Str::lower($credentials['email']).'|'.$request->ip());

        if (RateLimiter::tooManyAttempts($key, 5)) {
            return back()->withErrors([
                'email' => 'Too many sign-in attempts. Please try again in '.RateLimiter::availableIn($key).' seconds.',
            ])->onlyInput('email');
        }

        $adminEmail = config('leads.admin.email');
        $passwordHash = config('leads.admin.password_hash');

        if (
            ! $adminEmail
            || ! $passwordHash
            || ! hash_equals(Str::lower($adminEmail), Str::lower($credentials['email']))
            || ! Hash::check($credentials['password'], $passwordHash)
        ) {
            RateLimiter::hit($key, 60);

            return back()->withErrors(['email' => 'Those sign-in details were not recognized.'])->onlyInput('email');
        }

        RateLimiter::clear($key);
        $request->session()->regenerate();
        $request->session()->put('lead_admin_email', $adminEmail);

        return redirect()->intended(route('admin.leads.index'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }
}
