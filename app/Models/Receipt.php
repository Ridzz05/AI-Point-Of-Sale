<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Receipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'pos_order_id',
        'receipt_number',
        'content',
        'template',
        'is_printed',
        'printed_at',
        'printed_by',
        'format',
        'file_path',
        'customer_copy',
        'customer_email',
        'emailed_at',
    ];

    protected $casts = [
        'content' => 'array',
        'is_printed' => 'boolean',
        'customer_copy' => 'boolean',
        'printed_at' => 'datetime',
        'emailed_at' => 'datetime',
    ];

    public function posOrder(): BelongsTo
    {
        return $this->belongsTo(PosOrder::class);
    }

    // Accessors
    public function getFormattedReceiptNumberAttribute(): string
    {
        return 'RCP-' . str_pad($this->receipt_number, 8, '0', STR_PAD_LEFT);
    }

    public function isEmailed(): bool
    {
        return $this->emailed_at !== null;
    }

    // Methods
    public function markAsPrinted(string $printedBy = null): void
    {
        $this->is_printed = true;
        $this->printed_at = now();
        $this->printed_by = $printedBy;
        $this->save();
    }

    public function markAsEmailed(): void
    {
        $this->emailed_at = now();
        $this->save();
    }

    public function generateContent(): array
    {
        $order = $this->posOrder;
        
        return [
            'receipt_number' => $this->formatted_receipt_number,
            'order_number' => $order->order_number,
            'date' => $order->created_at->format('Y-m-d H:i'),
            'cashier' => $order->user?->name ?? 'System',
            'customer' => [
                'name' => $order->customer_name,
                'phone' => $order->customer_phone,
                'email' => $order->customer_email,
            ],
            'items' => $order->orderItems->map(function ($item) {
                return [
                    'name' => $item->product_name,
                    'variant' => $item->variant_name,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->formatted_unit_price,
                    'total' => $item->formatted_total_price,
                ];
            }),
            'summary' => [
                'subtotal' => 'IDR ' . number_format($order->subtotal, 0, ',', '.'),
                'tax' => 'IDR ' . number_format($order->tax_amount, 0, ',', '.'),
                'discount' => 'IDR ' . number_format($order->discount_amount, 0, ',', '.'),
                'total' => $order->formatted_total,
                'paid' => $order->formatted_paid,
                'change' => $order->formatted_change,
            ],
            'payments' => $order->payments->map(function ($payment) {
                return [
                    'method' => $payment->method_label,
                    'amount' => $payment->formatted_amount,
                    'reference' => $payment->reference_number,
                ];
            }),
            'store_info' => [
                'name' => config('app.name', 'AI-POS Store'),
                'address' => config('store.address', 'Store Address'),
                'phone' => config('store.phone', 'Store Phone'),
                'email' => config('store.email', 'store@example.com'),
            ],
            'footer' => 'Thank you for your purchase!',
        ];
    }

    public function generateThermalContent(): string
    {
        $content = $this->generateContent();
        $output = [];

        // Header
        $output[] = str_repeat('=', 32);
        $output[] = strtoupper($content['store_info']['name']);
        $output[] = $content['store_info']['address'];
        $output[] = 'Tel: ' . $content['store_info']['phone'];
        $output[] = str_repeat('=', 32);

        // Order info
        $output[] = 'Receipt: ' . $content['receipt_number'];
        $output[] = 'Date: ' . $content['date'];
        $output[] = 'Cashier: ' . $content['cashier'];
        if ($content['customer']['name']) {
            $output[] = 'Customer: ' . $content['customer']['name'];
        }
        $output[] = str_repeat('-', 32);

        // Items
        foreach ($content['items'] as $item) {
            $name = $item['name'];
            if ($item['variant']) {
                $name .= ' (' . $item['variant'] . ')';
            }
            $output[] = $name;
            $output[] = sprintf("  %d x %s", $item['quantity'], $item['unit_price']);
            $output[] = sprintf("  %s", $item['total']);
        }

        $output[] = str_repeat('-', 32);

        // Summary
        $output[] = sprintf("Subtotal: %s", $content['summary']['subtotal']);
        if ($content['summary']['tax'] !== 'IDR 0') {
            $output[] = sprintf("Tax: %s", $content['summary']['tax']);
        }
        if ($content['summary']['discount'] !== 'IDR 0') {
            $output[] = sprintf("Discount: %s", $content['summary']['discount']);
        }
        $output[] = sprintf("TOTAL: %s", $content['summary']['total']);
        $output[] = str_repeat('-', 32);
        $output[] = sprintf("Paid: %s", $content['summary']['paid']);
        $output[] = sprintf("Change: %s", $content['summary']['change']);
        $output[] = str_repeat('=', 32);

        // Footer
        $output[] = $content['footer'];
        $output[] = '';
        $output[] = '';

        return implode("\n", $output);
    }

    // Static method to generate receipt number
    public static function generateReceiptNumber(): string
    {
        $date = now()->format('Ymd');
        $lastReceipt = self::whereDate('created_at', today())
            ->orderBy('receipt_number', 'desc')
            ->first();

        $sequence = $lastReceipt ? intval($lastReceipt->receipt_number) + 1 : 1;
        
        return $date . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }
}