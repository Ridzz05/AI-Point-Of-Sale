<?php

namespace App\Http\Controllers;

use App\Models\PosOrder;
use App\Models\PosOrderItem;
use App\Models\Payment;
use App\Models\Receipt;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PosController extends Controller
{
    public function index()
    {
        return inertia('pos/index');
    }

    public function getCart()
    {
        $cart = session()->get('pos_cart', []);
        
        // Load product information
        $cartItems = collect($cart)->map(function ($item) {
            $product = null;
            $variant = null;

            if ($item['product_variant_id']) {
                $variant = ProductVariant::with(['product', 'inventory'])
                    ->find($item['product_variant_id']);
                $product = $variant?->product;
            } elseif ($item['product_id']) {
                $product = Product::with(['category', 'inventory'])
                    ->find($item['product_id']);
            }

            return [
                'product_id' => $item['product_id'],
                'product_variant_id' => $item['product_variant_id'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'discount_amount' => $item['discount_amount'] ?? 0,
                'product' => $product,
                'variant' => $variant,
                'subtotal' => ($item['unit_price'] - ($item['discount_amount'] ?? 0)) * $item['quantity'],
            ];
        });

        $subtotal = $cartItems->sum('subtotal');
        $tax = 0; // TODO: Implement tax calculation
        $discount = 0; // TODO: Implement discount logic
        $total = $subtotal + $tax - $discount;

        return response()->json([
            'items' => $cartItems,
            'summary' => [
                'subtotal' => $subtotal,
                'tax' => $tax,
                'discount' => $discount,
                'total' => $total,
                'item_count' => $cartItems->sum('quantity'),
            ],
        ]);
    }

    public function addToCart(Request $request)
    {
        $request->validate([
            'product_id' => 'nullable|exists:products,id',
            'product_variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = session()->get('pos_cart', []);

        // Determine product and price
        $product = null;
        $variant = null;
        $unitPrice = 0;

        if ($request->product_variant_id) {
            $variant = ProductVariant::find($request->product_variant_id);
            $product = $variant->product;
            $unitPrice = $variant->price;
        } elseif ($request->product_id) {
            $product = Product::find($request->product_id);
            $unitPrice = $product->base_price;
        }

        if (!$product || !$product->is_active) {
            return response()->json([
                'message' => 'Product not found or inactive'
            ], 404);
        }

        // Check stock availability
        $availableStock = $variant ? $variant->available_stock : $product->available_stock;
        if ($product->track_inventory && $availableStock < $request->quantity) {
            return response()->json([
                'message' => 'Insufficient stock',
                'available' => $availableStock,
            ], 422);
        }

        // Check if item already exists in cart
        $existingIndex = collect($cart)->search(function ($item) use ($request) {
            return $item['product_id'] === $request->product_id 
                && $item['product_variant_id'] === $request->product_variant_id;
        });

        if ($existingIndex !== false) {
            // Update quantity
            $cart[$existingIndex]['quantity'] += $request->quantity;
        } else {
            // Add new item
            $cart[] = [
                'product_id' => $request->product_id,
                'product_variant_id' => $request->product_variant_id,
                'quantity' => $request->quantity,
                'unit_price' => $unitPrice,
                'discount_amount' => 0,
            ];
        }

        session()->put('pos_cart', $cart);

        return $this->getCart();
    }

    public function updateCartItem(Request $request)
    {
        $request->validate([
            'index' => 'required|integer|min:0',
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = session()->get('pos_cart', []);

        if (!isset($cart[$request->index])) {
            return response()->json([
                'message' => 'Cart item not found'
            ], 404);
        }

        $cart[$request->index]['quantity'] = $request->quantity;
        session()->put('pos_cart', $cart);

        return $this->getCart();
    }

    public function removeFromCart(Request $request)
    {
        $request->validate([
            'index' => 'required|integer|min:0',
        ]);

        $cart = session()->get('pos_cart', []);

        if (!isset($cart[$request->index])) {
            return response()->json([
                'message' => 'Cart item not found'
            ], 404);
        }

        unset($cart[$request->index]);
        $cart = array_values($cart); // Re-index array
        session()->put('pos_cart', $cart);

        return $this->getCart();
    }

    public function clearCart()
    {
        session()->forget('pos_cart');
        return response()->json(['message' => 'Cart cleared']);
    }

    public function checkout(Request $request)
    {
        $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'customer_email' => 'nullable|email|max:255',
            'payments' => 'required|array|min:1',
            'payments.*.method' => 'required|in:cash,card,transfer,ewallet,credit,other',
            'payments.*.amount' => 'required|numeric|min:0',
            'payments.*.reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:1000',
        ]);

        $cart = session()->get('pos_cart', []);

        if (empty($cart)) {
            return response()->json([
                'message' => 'Cart is empty'
            ], 422);
        }

        // Validate payment amount
        $total = collect($cart)->sum(function ($item) {
            return ($item['unit_price'] - ($item['discount_amount'] ?? 0)) * $item['quantity'];
        });

        $totalPayment = collect($request->payments)->sum('amount');

        if ($totalPayment < $total) {
            return response()->json([
                'message' => 'Insufficient payment',
                'required' => $total,
                'paid' => $totalPayment,
            ], 422);
        }

        return DB::transaction(function () use ($request, $cart, $total, $totalPayment) {
            // Create order
            $order = PosOrder::create([
                'order_number' => $this->generateOrderNumber(),
                'status' => 'pending',
                'subtotal' => $total,
                'tax_amount' => 0, // TODO: Implement tax calculation
                'discount_amount' => 0, // TODO: Implement discount calculation
                'total_amount' => $total,
                'paid_amount' => $totalPayment,
                'change_amount' => $totalPayment - $total,
                'customer_id' => $request->customer_id,
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'customer_email' => $request->customer_email,
                'user_id' => auth()->id(),
                'notes' => $request->notes,
            ]);

            // Create order items
            foreach ($cart as $item) {
                $product = null;
                $variant = null;
                $productName = '';
                $productSku = '';
                $variantName = '';

                if ($item['product_variant_id']) {
                    $variant = ProductVariant::find($item['product_variant_id']);
                    $product = $variant->product;
                    $productName = $product->name;
                    $productSku = $variant->sku;
                    $variantName = $variant->name;
                } elseif ($item['product_id']) {
                    $product = Product::find($item['product_id']);
                    $productName = $product->name;
                    $productSku = $product->sku;
                }

                $orderItem = PosOrderItem::create([
                    'pos_order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'product_variant_id' => $item['product_variant_id'],
                    'product_name' => $productName,
                    'product_sku' => $productSku,
                    'variant_name' => $variantName,
                    'unit_price' => $item['unit_price'],
                    'discount_amount' => $item['discount_amount'] ?? 0,
                    'tax_rate' => 0, // TODO: Implement tax rate
                    'tax_amount' => 0, // TODO: Implement tax calculation
                    'total_price' => ($item['unit_price'] - ($item['discount_amount'] ?? 0)) * $item['quantity'],
                    'quantity' => $item['quantity'],
                    'status' => 'pending',
                ]);

                // Reserve inventory
                $orderItem->reserveInventory();
            }

            // Create payments
            foreach ($request->payments as $payment) {
                Payment::create([
                    'payment_number' => $this->generatePaymentNumber(),
                    'pos_order_id' => $order->id,
                    'method' => $payment['method'],
                    'amount' => $payment['amount'],
                    'status' => 'completed',
                    'reference_number' => $payment['reference_number'] ?? null,
                    'processed_at' => now(),
                ]);
            }

            // Complete the order
            $order->complete();

            // Create receipt
            $receipt = Receipt::create([
                'pos_order_id' => $order->id,
                'receipt_number' => Receipt::generateReceiptNumber(),
                'content' => [], // Will be populated when needed
                'template' => 'default',
            ]);

            // Clear cart
            session()->forget('pos_cart');

            return response()->json([
                'order' => $order->load(['customer', 'orderItems', 'payments']),
                'receipt' => $receipt,
                'message' => 'Order completed successfully',
            ]);
        });
    }

    public function getOrders(Request $request)
    {
        $query = PosOrder::with(['customer', 'user', 'orderItems', 'payments'])
            ->orderBy('created_at', 'desc');

        // Date filter
        if ($request->date) {
            $query->whereDate('created_at', $request->date);
        } elseif ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
            if ($request->date_to) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }
        }

        // Status filter
        if ($request->status) {
            $query->where('status', $request->status);
        }

        $orders = $query->paginate($request->per_page ?? 20);

        return response()->json($orders);
    }

    public function getOrder(PosOrder $order)
    {
        $order->load(['customer', 'user', 'orderItems.product', 'orderItems.productVariant', 'payments']);

        return response()->json($order);
    }

    public function printReceipt(PosOrder $order)
    {
        $receipt = Receipt::where('pos_order_id', $order->id)
            ->firstOrCreate([
                'pos_order_id' => $order->id,
            ], [
                'receipt_number' => Receipt::generateReceiptNumber(),
                'content' => [],
                'template' => 'default',
            ]);

        $receipt->markAsPrinted(auth()->user()->name);

        return response()->json([
            'receipt' => $receipt,
            'thermal_content' => $receipt->generateThermalContent(),
        ]);
    }

    private function generateOrderNumber(): string
    {
        $date = now()->format('Ymd');
        $lastOrder = PosOrder::whereDate('created_at', today())
            ->orderBy('order_number', 'desc')
            ->first();

        $sequence = $lastOrder ? intval(substr($lastOrder->order_number, -4)) + 1 : 1;
        
        return 'POS-' . $date . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    private function generatePaymentNumber(): string
    {
        $date = now()->format('Ymd');
        $lastPayment = Payment::whereDate('created_at', today())
            ->orderBy('payment_number', 'desc')
            ->first();

        $sequence = $lastPayment ? intval(substr($lastPayment->payment_number, -4)) + 1 : 1;
        
        return 'PAY-' . $date . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }
}