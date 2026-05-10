<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'sku',
        'barcode',
        'price',
        'cost_price',
        'weight',
        'attributes',
        'image',
        'is_active',
        'product_id',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'weight' => 'decimal:3',
        'is_active' => 'boolean',
        'attributes' => 'array',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function inventory(): MorphOne
    {
        return $this->morphOne(Inventory::class, 'inventoryable');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(PosOrderItem::class);
    }

    // Accessors
    public function getCurrentPriceAttribute(): float
    {
        return $this->price;
    }

    public function getCurrentStockAttribute(): int
    {
        return $this->inventory?->quantity ?? 0;
    }

    public function getAvailableStockAttribute(): int
    {
        return $this->inventory?->available_quantity ?? 0;
    }

    public function getFormattedPriceAttribute(): string
    {
        return 'IDR ' . number_format($this->price, 0, ',', '.');
    }

    public function getFullSkuAttribute(): string
    {
        return $this->product->sku . '-' . $this->sku;
    }

    public function getFullNameAttribute(): string
    {
        return $this->product->name . ' - ' . $this->name;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInStock($query)
    {
        return $query->whereHas('inventory', function ($q) {
            $q->where('available_quantity', '>', 0);
        });
    }
}