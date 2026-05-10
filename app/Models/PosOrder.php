<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PosOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'status',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'paid_amount',
        'change_amount',
        'customer_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'user_id',
        'notes',
        'metadata',
        'completed_at',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'change_amount' => 'decimal:2',
        'metadata' => 'array',
        'completed_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(PosOrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function receipts(): HasMany
    {
        return $this->hasMany(Receipt::class);
    }

    // Accessors
    public function getFormattedTotalAttribute(): string
    {
        return 'IDR ' . number_format($this->total_amount, 0, ',', '.');
    }

    public function getFormattedPaidAttribute(): string
    {
        return 'IDR ' . number_format($this->paid_amount, 0, ',', '.');
    }

    public function getFormattedChangeAttribute(): string
    {
        return 'IDR ' . number_format($this->change_amount, 0, ',', '.');
    }

    public function getRemainingAmountAttribute(): float
    {
        return $this->total_amount - $this->paid_amount;
    }

    public function getFormattedRemainingAttribute(): string
    {
        return 'IDR ' . number_format($this->remaining_amount, 0, ',', '.');
    }

    public function isPaid(): bool
    {
        return $this->paid_amount >= $this->total_amount;
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    // Methods
    public function calculateTotals(): void
    {
        $this->subtotal = $this->orderItems->sum('total_price');
        $this->total_amount = $this->subtotal + $this->tax_amount - $this->discount_amount;
        $this->save();
    }

    public function complete(): void
    {
        $this->status = 'completed';
        $this->completed_at = now();
        $this->save();

        // Process inventory deductions
        foreach ($this->orderItems as $item) {
            if ($item->product_id) {
                $inventory = $item->product->inventory;
                if ($inventory) {
                    $inventory->deduct($item->quantity);
                }
            } elseif ($item->product_variant_id) {
                $inventory = $item->productVariant->inventory;
                if ($inventory) {
                    $inventory->deduct($item->quantity);
                }
            }
        }
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();

        // Release reserved inventory
        foreach ($this->orderItems as $item) {
            if ($item->product_id) {
                $inventory = $item->product->inventory;
                if ($inventory) {
                    $inventory->release($item->quantity);
                }
            } elseif ($item->product_variant_id) {
                $inventory = $item->productVariant->inventory;
                if ($inventory) {
                    $inventory->release($item->quantity);
                }
            }
        }
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function scopeThisMonth($query)
    {
        return $query->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year);
    }
}