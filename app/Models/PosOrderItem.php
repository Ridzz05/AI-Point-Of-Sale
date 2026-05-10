<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PosOrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'pos_order_id',
        'product_id',
        'product_variant_id',
        'product_name',
        'product_sku',
        'variant_name',
        'unit_price',
        'discount_amount',
        'tax_rate',
        'tax_amount',
        'total_price',
        'quantity',
        'weight',
        'status',
        'metadata',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_price' => 'decimal:2',
        'quantity' => 'integer',
        'weight' => 'decimal:3',
        'metadata' => 'array',
    ];

    public function posOrder(): BelongsTo
    {
        return $this->belongsTo(PosOrder::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function productVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }

    // Accessors
    public function getFormattedUnitPriceAttribute(): string
    {
        return 'IDR ' . number_format($this->unit_price, 0, ',', '.');
    }

    public function getFormattedTotalPriceAttribute(): string
    {
        return 'IDR ' . number_format($this->total_price, 0, ',', '.');
    }

    public function getEffectivePriceAttribute(): float
    {
        return $this->unit_price - $this->discount_amount;
    }

    public function getFormattedEffectivePriceAttribute(): string
    {
        return 'IDR ' . number_format($this->effective_price, 0, ',', '.');
    }

    // Methods
    public function calculateTotals(): void
    {
        $effectivePrice = $this->unit_price - $this->discount_amount;
        $this->total_price = ($effectivePrice * $this->quantity) + $this->tax_amount;
        $this->save();
    }

    public function reserveInventory(): bool
    {
        if ($this->product_id) {
            $inventory = $this->product->inventory;
            if ($inventory) {
                return $inventory->reserve($this->quantity);
            }
        } elseif ($this->product_variant_id) {
            $inventory = $this->productVariant->inventory;
            if ($inventory) {
                return $inventory->reserve($this->quantity);
            }
        }
        return true; // No inventory tracking
    }

    public function releaseInventory(): void
    {
        if ($this->product_id) {
            $inventory = $this->product->inventory;
            if ($inventory) {
                $inventory->release($this->quantity);
            }
        } elseif ($this->product_variant_id) {
            $inventory = $this->productVariant->inventory;
            if ($inventory) {
                $inventory->release($this->quantity);
            }
        }
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeProcessed($query)
    {
        return $query->where('status', 'processed');
    }
}