<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Product;
use App\Services\AI\OpenRouterService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TransactionController extends Controller
{
    protected OpenRouterService $aiService;

    public function __construct(OpenRouterService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Transaction::with('user');

        if ($request->has('date')) {
            $query->whereDate('created_at', $request->date);
        }

        if ($request->has('payment_method')) {
            $query->byPaymentMethod($request->payment_method);
        }

        $transactions = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $transactions,
        ]);
    }

    public function processAIPrompt(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'prompt' => 'required|string',
        ]);

        $activeProductsCount = Product::active()->count();

        if ($activeProductsCount === 0) {
            return response()->json([
                'success' => true,
                'data' => [
                    'success' => false,
                    'message' => 'Tidak ada produk aktif di sistem. Silakan tambahkan produk terlebih dahulu.',
                ],
            ]);
        }

        $availableProducts = Product::active()->get()->toArray();

        try {
            $result = $this->aiService->processTransactionPrompt($validated['prompt'], $availableProducts);

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            Log::error('AI Processing Failed', [
                'error' => $e->getMessage(),
                'prompt' => $validated['prompt']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Gagal memproses perintah AI: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'paid_amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string|in:cash,card,ewallet',
            'ai_prompt' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $totalAmount = 0;
            $items = [];

            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                if ($product->stock < $item['quantity']) {
                    return response()->json([
                        'success' => false,
                        'message' => "Insufficient stock for {$product->name}",
                    ], 400);
                }

                $subtotal = $item['quantity'] * $item['price'];
                $totalAmount += $subtotal;

                $product->decreaseStock($item['quantity']);

                $items[] = [
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $subtotal,
                ];
            }

            $changeAmount = $validated['paid_amount'] - $totalAmount;

            if ($changeAmount < 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient payment amount',
                ], 400);
            }

            $transaction = Transaction::create([
                'user_id' => auth()->id(),
                'total_amount' => $totalAmount,
                'paid_amount' => $validated['paid_amount'],
                'change_amount' => $changeAmount,
                'payment_method' => $validated['payment_method'],
                'ai_prompt' => $validated['ai_prompt'] ?? null,
                'items' => $items,
            ]);

            return response()->json([
                'success' => true,
                'data' => $transaction->load('user'),
                'message' => 'Transaction completed successfully',
            ], 201);
        });
    }

    public function show(Transaction $transaction): JsonResponse
    {
        $transaction->load('user');

        return response()->json([
            'success' => true,
            'data' => $transaction,
        ]);
    }

    public function todaySummary(): JsonResponse
    {
        $transactions = Transaction::today()->get();
        $totalRevenue = $transactions->sum('total_amount');
        $totalTransactions = $transactions->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_revenue' => $totalRevenue,
                'total_transactions' => $totalTransactions,
                'transactions' => $transactions,
            ],
        ]);
    }
}
