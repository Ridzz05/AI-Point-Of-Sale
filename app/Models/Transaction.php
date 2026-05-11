<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'amount',
        'status',
        'invoice_url',
        'attachment_path',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
