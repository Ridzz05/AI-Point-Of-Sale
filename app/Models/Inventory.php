<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Inventory extends Model
{
    use HasFactory;

    protected $table = 'inventory';

    protected $fillable = [
        'quantity',
        'reserved_quantity',
        'last_cost',
        'last_updated_at',
        'notes',
        'inventoryable_id',
        'inventoryable_type',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'reserved_quantity' => 'integer',
        'last_cost' => 'decimal:2',
        'last_updated_at' => 'datetime',
    ];

    public function inventoryable(): MorphTo
    {
        return $this->morphTo();
    }

    // Accessors
    public function getAvailableQuantityAttribute(): int
    {
        return max(0, $this->quantity - $this->reserved_quantity);
    }

    public function isLowStock(): bool
    {
        $model = $this->inventoryable;
        if ($model && method_exists($model, 'getMinStockLevelAttribute')) {
            return $this->available_quantity <= $model->min_stock_level;
        }
        return $this->available_quantity <= 0;
    }

    public function getStockStatusAttribute(): string
    {
        if ($this->available_quantity <= 0) {
            return 'out_of_stock';
        } elseif ($this->isLowStock()) {
            return 'low_stock';
        }
        return 'in_stock';
    }

    // Methods
    public function reserve(int $quantity): bool
    {
        if ($this->available_quantity >= $quantity) {
            $this->reserved_quantity += $quantity;
            $this->save();
            return true;
        }
        return false;
    }

    public function release(int $quantity): void
    {
        $this->reserved_quantity = max(0, $this->reserved_quantity - $quantity);
        $this->save();
    }

    public function deduct(int $quantity): bool
    {
        if ($this->quantity >= $quantity) {
            $this->quantity -= $quantity;
            $this->reserved_quantity = max(0, $this->reserved_quantity - $quantity);
            $this->last_updated_at = now();
            $this->save();
            return true;
        }
        return false;
    }

    public function add(int $quantity, float $cost = null): void
    {
        $this->quantity += $quantity;
        if ($cost !== null) {
            $this->last_cost = $cost;
        }
        $this->last_updated_at = now();
        $this->save();
    }

    public function adjust(int $newQuantity, string $reason = null): void
    {
        $this->quantity = $newQuantity;
        $this->reserved_quantity = 0;
        $this->last_updated_at = now();
        if ($reason) {
            $this->notes = $reason;
        }
        $this->save();
    }
}