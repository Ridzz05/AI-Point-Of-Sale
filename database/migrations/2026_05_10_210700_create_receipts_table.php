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
        Schema::create('receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pos_order_id')->constrained()->onDelete('cascade');
            $table->string('receipt_number')->unique();
            
            // Receipt content
            $table->json('content'); // Full receipt data as JSON
            $table->string('template')->default('default'); // Receipt template used
            
            // Print/export details
            $table->boolean('is_printed')->default(false);
            $table->timestamp('printed_at')->nullable();
            $table->string('printed_by')->nullable();
            
            // Export options
            $table->enum('format', ['json', 'pdf', 'thermal', 'email'])->default('thermal');
            $table->string('file_path')->nullable(); // For PDF receipts
            
            // Customer copy
            $table->boolean('customer_copy')->default(false);
            $table->string('customer_email')->nullable();
            $table->timestamp('emailed_at')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receipts');
    }
};