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
        Schema::create('inventory', function (Blueprint $table) {
            $table->id();
            $table->integer('quantity')->default(0);
            $table->integer('reserved_quantity')->default(0); // For pending orders
            $table->integer('available_quantity')->virtualAs('quantity - reserved_quantity');
            $table->decimal('last_cost', 10, 2)->nullable();
            $table->timestamp('last_updated_at')->nullable();
            $table->text('notes')->nullable();
            
            // Polymorphic relationship - can be for product or variant
            $table->morphs('inventoryable');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory');
    }
};