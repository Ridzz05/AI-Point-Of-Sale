<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_number')->unique();
            $table->foreignId('pos_order_id')->constrained()->onDelete('cascade');
            
            // Payment details
            $table->enum('method', ['cash', 'card', 'transfer', 'ewallet', 'credit', 'other']);
            $table->string('method_details')->nullable(); // e.g., card type, bank name
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'refunded'])->default('pending');
            
            // Transaction details
            $table->string('transaction_id')->nullable(); // Gateway transaction ID
            $table->string('reference_number')->nullable(); // Check number, etc
            $table->text('notes')->nullable();
            
            // Timestamps
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};