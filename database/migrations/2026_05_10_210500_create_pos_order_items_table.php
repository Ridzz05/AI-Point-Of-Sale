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
        Schema::create('pos_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pos_order_id')->constrained()->onDelete('cascade');
            
            // Product information
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('product_variant_id')->nullable()->constrained()->onDelete('set null');
            
            // Item details at time of purchase
            $table->string('product_name');
            $table->string('product_sku');
            $table->string('variant_name')->nullable();
            
            // Pricing
            $table->decimal('unit_price', 10, 2);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('total_price', 10, 2);
            
            // Quantity
            $table->integer('quantity');
            $table->decimal('weight', 8, 3)->nullable();
            
            // Status
            $table->enum('status', ['pending', 'processed', 'cancelled'])->default('pending');
            
            // Metadata
            $table->json('metadata')->nullable(); // Product snapshot at time of sale
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pos_order_items');
    }
};