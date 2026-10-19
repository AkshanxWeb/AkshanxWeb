<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PublicPageController;
use App\Http\Controllers\ServiceController;

Route::get('/', HomeController::class)->name('home');
Route::get('/about', [PublicPageController::class, 'about'])->name('about');
Route::get('/pricing', [PublicPageController::class, 'pricing'])->name('pricing');
Route::get('/faqs', [PublicPageController::class, 'faqs'])->name('faqs');
Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
Route::get('/services/{service:slug}', [ServiceController::class, 'show'])->name('services.show');
Route::get('/contact', [ContactController::class, 'create'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:5,1')->name('contact.store');
