<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\AIController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\InventoryController;

Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

// Existing routes
Route::resource('customers', \App\Http\Controllers\CustomerController::class);
Route::resource('projects', ProjectController::class);
Route::resource('transactions', TransactionController::class);

// AI Routes
Route::get('/ai', [AIController::class, 'index'])->name('ai.index');
Route::get('/ai/insight', [AIController::class, 'getInsight'])->name('ai.insight');
Route::post('/ai/chat', [AIController::class, 'chat'])->name('ai.chat');

// POS Routes
Route::get('/pos', [PosController::class, 'index'])->name('pos.index');
Route::prefix('api/pos')->group(function () {
    // Cart operations
    Route::get('/cart', [PosController::class, 'getCart']);
    Route::post('/cart/add', [PosController::class, 'addToCart']);
    Route::put('/cart/{index}', [PosController::class, 'updateCartItem']);
    Route::delete('/cart/{index}', [PosController::class, 'removeFromCart']);
    Route::delete('/cart', [PosController::class, 'clearCart']);
    
    // Checkout
    Route::post('/checkout', [PosController::class, 'checkout']);
    
    // Orders
    Route::get('/orders', [PosController::class, 'getOrders']);
    Route::get('/orders/{order}', [PosController::class, 'getOrder']);
    Route::post('/orders/{order}/print-receipt', [PosController::class, 'printReceipt']);
});

// Product Management Routes
Route::prefix('api/products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::post('/', [ProductController::class, 'store']);
    Route::get('/search', [ProductController::class, 'search']);
    Route::get('/{product}', [ProductController::class, 'show']);
    Route::put('/{product}', [ProductController::class, 'update']);
    Route::delete('/{product}', [ProductController::class, 'destroy']);
    Route::post('/{product}/adjust-stock', [ProductController::class, 'adjustStock']);
});

// Category Management Routes
Route::prefix('api/categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);
    Route::post('/', [CategoryController::class, 'store']);
    Route::get('/{category}', [CategoryController::class, 'show']);
    Route::put('/{category}', [CategoryController::class, 'update']);
    Route::delete('/{category}', [CategoryController::class, 'destroy']);
});

// Inventory Management Routes
Route::prefix('api/inventory')->group(function () {
    Route::get('/', [InventoryController::class, 'index']);
    Route::get('/low-stock', [InventoryController::class, 'getLowStock']);
    Route::get('/out-of-stock', [InventoryController::class, 'getOutOfStock']);
    Route::get('/{inventory}', [InventoryController::class, 'show']);
    Route::put('/{inventory}/adjust', [InventoryController::class, 'adjust']);
    Route::post('/{inventory}/add', [InventoryController::class, 'add']);
    Route::post('/{inventory}/deduct', [InventoryController::class, 'deduct']);
    Route::get('/{inventory}/history', [InventoryController::class, 'getMovementHistory']);
    Route::post('/bulk-adjust', [InventoryController::class, 'bulkAdjust']);
});

// Support Chat Routes
Route::prefix('support')->group(function () {
    // Public routes
    Route::post('/init', [\App\Http\Controllers\SupportController::class, 'initChat'])->name('support.init');
    Route::post('/{id}/send', [\App\Http\Controllers\SupportController::class, 'sendMessage'])->name('support.send');
    
    // Admin routes
    Route::middleware(['auth'])->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\SupportController::class, 'adminIndex'])->name('support.admin.index');
        Route::get('/{id}/messages', [\App\Http\Controllers\SupportController::class, 'getMessages'])->name('support.admin.messages');
        Route::post('/{id}/close', [\App\Http\Controllers\SupportController::class, 'closeChat'])->name('support.admin.close');
    });
});