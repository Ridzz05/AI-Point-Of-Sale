<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_number',
        'pos_order_id',
        'method',
        'method_details',
        'amount',
        'status',
        'transaction_id',
        'reference_number',
        'notes',
        'processed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'processed_at' => 'datetime',
    ];

    public function posOrder(): BelongsTo
    {
        return $this->belongsTo(PosOrder::class);
    }

    // Accessors
    public function getFormattedAmountAttribute(): string
    {
        return 'IDR ' . number_format($this->amount, 0, ',', '.');
    }

    public function getMethodLabelAttribute(): string
    {
        return match($this->method) {
            'cash' => 'Tunai',
            'card' => 'Kartu Kredit/Debit',
            'transfer' => 'Transfer Bank',
            'ewallet' => 'E-Wallet',
            'credit' => 'Kredit',
            'other' => 'Lainnya',
            default => ucfirst($this->method),
        };
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    // Methods
    public function complete(): void
    {
        $this->status = 'completed';
        $this->processed_at = now();
        $this->save();

        // Update order paid amount
        $order = $this->posOrder;
        $order->paid_amount += $this->amount;
        
        // Calculate change for cash payments
        if ($this->method === 'cash' && $order->paid_amount > $order->total_amount) {
            $order->change_amount = $order->paid_amount - $order->total_amount;
        }
        
        $order->save();

        // Auto-complete order if fully paid
        if ($order->isPaid() && $order->isPending()) {
            $order->complete();
        }
    }

    public function fail(): void
    {
        $this->status = 'failed';
        $this->save();
    }

    public function refund(): void
    {
        $this->status = 'refunded';
        $this->save();

        // Update order paid amount
        $order = $this->posOrder;
        $order->paid_amount -= $this->amount;
        $order->change_amount = 0;
        $order->save();
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

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeCash($query)
    {
        return $query->where('method', 'cash');
    }

    public function scopeCard($query)
    {
        return $query->where('method', 'card');
    }

    public function scopeTransfer($query)
    {
        return $query->where('method', 'transfer');
    }
}