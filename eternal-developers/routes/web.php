<?php

use App\Http\Controllers\Admin\LeadController as AdminLeadController;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PublicPageController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\WhatsAppInitiationController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/about', [PublicPageController::class, 'about'])->name('about');
Route::get('/pricing', [PublicPageController::class, 'pricing'])->name('pricing');
Route::get('/faqs', [PublicPageController::class, 'faqs'])->name('faqs');
Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
Route::get('/services/{service:slug}', [ServiceController::class, 'show'])->name('services.show');
Route::get('/contact', [ContactController::class, 'create'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:5,1')->name('contact.store');
Route::post('/contact/whatsapp-initiation', [WhatsAppInitiationController::class, 'store'])->middleware('throttle:20,1')->name('contact.whatsapp-initiation');
Route::get('/chatbot/services', [ChatbotController::class, 'services'])->name('chatbot.services');
Route::post('/chatbot/message', [ChatbotController::class, 'message'])->middleware('throttle:20,1')->name('chatbot.message');
Route::post('/chatbot/lead', [ChatbotController::class, 'captureLead'])->middleware('throttle:5,1')->name('chatbot.lead');

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/login', [AdminAuthController::class, 'create'])->name('login');
    Route::post('/login', [AdminAuthController::class, 'store'])->middleware('throttle:5,1')->name('login.store');
    Route::post('/logout', [AdminAuthController::class, 'destroy'])->middleware('lead.admin')->name('logout');

    Route::middleware('lead.admin')->group(function () {
        Route::get('/leads', [AdminLeadController::class, 'index'])->name('leads.index');
        Route::get('/leads/export', [AdminLeadController::class, 'export'])->name('leads.export');
        Route::get('/leads/{lead}', [AdminLeadController::class, 'show'])->name('leads.show');
        Route::patch('/leads/{lead}', [AdminLeadController::class, 'update'])->name('leads.update');
        Route::post('/leads/{lead}/notes', [AdminLeadController::class, 'note'])->name('leads.notes.store');
        Route::post('/leads/{lead}/notification', [AdminLeadController::class, 'resendNotification'])->name('leads.notification.resend');
    });
});
