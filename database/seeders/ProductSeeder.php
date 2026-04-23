<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Americano',
                'category' => 'Coffee',
                'price' => 25000,
                'stock' => 50,
                'description' => 'Classic Americano coffee',
                'is_active' => true,
            ],
            [
                'name' => 'Cappuccino',
                'category' => 'Coffee',
                'price' => 30000,
                'stock' => 40,
                'description' => 'Creamy cappuccino with foam',
                'is_active' => true,
            ],
            [
                'name' => 'Latte',
                'category' => 'Coffee',
                'price' => 32000,
                'stock' => 45,
                'description' => 'Smooth latte with steamed milk',
                'is_active' => true,
            ],
            [
                'name' => 'Croissant',
                'category' => 'Pastry',
                'price' => 18000,
                'stock' => 30,
                'description' => 'Buttery French croissant',
                'is_active' => true,
            ],
            [
                'name' => 'Chocolate Muffin',
                'category' => 'Pastry',
                'price' => 20000,
                'stock' => 25,
                'description' => 'Rich chocolate muffin',
                'is_active' => true,
            ],
            [
                'name' => 'Sandwich',
                'category' => 'Food',
                'price' => 35000,
                'stock' => 20,
                'description' => 'Club sandwich with fresh ingredients',
                'is_active' => true,
            ],
            [
                'name' => 'Green Tea',
                'category' => 'Tea',
                'price' => 20000,
                'stock' => 60,
                'description' => 'Refreshing green tea',
                'is_active' => true,
            ],
            [
                'name' => 'Espresso',
                'category' => 'Coffee',
                'price' => 22000,
                'stock' => 55,
                'description' => 'Strong espresso shot',
                'is_active' => true,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
