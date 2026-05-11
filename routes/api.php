<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\DashboardController;


// POS API Routes
Route::prefix('pos')->group(function () {
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

// Product Management API Routes
Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::post('/', [ProductController::class, 'store']);
    Route::get('/search', [ProductController::class, 'search']);
    Route::get('/{product}', [ProductController::class, 'show']);
    Route::match(['put', 'patch'], '/{product}', [ProductController::class, 'update']);
    Route::delete('/{product}', [ProductController::class, 'destroy']);
    Route::post('/{product}/adjust-stock', [ProductController::class, 'adjustStock']);
});

// Category Management API Routes
Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);
    Route::post('/', [CategoryController::class, 'store']);
    Route::get('/{category}', [CategoryController::class, 'show']);
    Route::put('/{category}', [CategoryController::class, 'update']);
    Route::delete('/{category}', [CategoryController::class, 'destroy']);
});

// Inventory Management API Routes
Route::prefix('inventory')->group(function () {
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