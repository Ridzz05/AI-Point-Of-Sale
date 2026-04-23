<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\TransactionController;

// Public routes
Route::post('auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me', [AuthController::class, 'me']);

    // Product Routes
    Route::apiResource('products', ProductController::class);
    Route::post('products/{product}/stock', [ProductController::class, 'updateStock']);

    // Transaction Routes
    Route::get('transactions/today', [TransactionController::class, 'todaySummary']);
    Route::post('transactions/process-ai', [TransactionController::class, 'processAIPrompt']);
    Route::apiResource('transactions', TransactionController::class);
});
