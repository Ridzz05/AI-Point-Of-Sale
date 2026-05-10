<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupportConversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'guest_name',
        'guest_email',
        'assigned_to',
        'status',
        'last_message_at'
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function messages()
    {
        return $this->hasMany(SupportMessage::class, 'conversation_id');
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
