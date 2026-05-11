<?php

use App\Http\Controllers\AIController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\SupportController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\InventoryController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

// Bypassing Authentication for Development
// Route::middleware(['auth', 'verified'])->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // POS / Cashier
    Route::get('/pos', [PosController::class, 'index'])->name('pos.index');
    Route::post('/pos/checkout', [PosController::class, 'checkout'])->name('pos.checkout');

    // Inventory & Products
    Route::resource('products', ProductController::class);
    Route::resource('categories', CategoryController::class);
    Route::resource('inventory', InventoryController::class);

    // Business Management
    Route::resource('customers', CustomerController::class);
    Route::resource('transactions', TransactionController::class);

    // AI Command Center
    Route::prefix('ai')->name('ai.')->group(function () {
        Route::get('/', [AIController::class, 'index'])->name('index');
        Route::get('/insight', [AIController::class, 'getInsight'])->name('insight');
        Route::post('/chat', [AIController::class, 'chat'])->name('chat');
    });

    // Support Admin
    Route::prefix('support')->name('support.admin.')->group(function () {
        Route::get('/dashboard', [SupportController::class, 'adminIndex'])->name('index');
        Route::get('/{id}/messages', [SupportController::class, 'getMessages'])->name('messages');
        Route::post('/{id}/close', [SupportController::class, 'closeChat'])->name('close');
    });

// });

// Public Support Chat
Route::prefix('support')->name('support.')->group(function () {
    Route::post('/init', [SupportController::class, 'initChat'])->name('init');
    Route::post('/{id}/send', [SupportController::class, 'sendMessage'])->name('send');
});

// require __DIR__.'/auth.php';