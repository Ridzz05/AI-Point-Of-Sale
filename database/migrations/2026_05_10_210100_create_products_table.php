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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('sku')->unique(); // Stock Keeping Unit
            $table->string('barcode')->nullable(); // For barcode scanning
            $table->decimal('base_price', 10, 2);
            $table->decimal('cost_price', 10, 2)->nullable(); // For profit calculation
            $table->string('unit')->default('pcs'); // pcs, kg, liter, etc
            $table->boolean('is_active')->default(true);
            $table->boolean('track_inventory')->default(true);
            $table->integer('min_stock_level')->default(0); // Alert threshold
            $table->string('image')->nullable(); // Product image path
            $table->json('attributes')->nullable(); // For additional product attributes
            $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};