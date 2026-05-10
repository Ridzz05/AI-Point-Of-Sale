<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'sku',
        'barcode',
        'base_price',
        'cost_price',
        'unit',
        'is_active',
        'track_inventory',
        'min_stock_level',
        'image',
        'attributes',
        'category_id',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'is_active' => 'boolean',
        'track_inventory' => 'boolean',
        'min_stock_level' => 'integer',
        'attributes' => 'array',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function activeVariants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->where('is_active', true);
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
        return $this->base_price;
    }

    public function getCurrentStockAttribute(): int
    {
        return $this->inventory?->quantity ?? 0;
    }

    public function getAvailableStockAttribute(): int
    {
        return $this->inventory?->available_quantity ?? 0;
    }

    public function isLowStock(): bool
    {
        return $this->track_inventory && $this->available_stock <= $this->min_stock_level;
    }

    public function getFormattedPriceAttribute(): string
    {
        return 'IDR ' . number_format($this->base_price, 0, ',', '.');
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

    public function scopeLowStock($query)
    {
        return $query->whereHas('inventory', function ($q) {
            $q->whereRaw('available_quantity <= min_stock_level');
        });
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}