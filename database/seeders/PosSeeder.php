<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Inventory;

class PosSeeder extends Seeder
{
    public function run(): void
    {
        // Create categories
        $categories = [
            [
                'name' => 'Makanan',
                'slug' => 'makanan',
                'description' => 'Berbagai macam makanan',
                'color' => '#ef4444',
                'icon' => 'pizza',
                'sort_order' => 1,
            ],
            [
                'name' => 'Minuman',
                'slug' => 'minuman',
                'description' => 'Berbagai macam minuman',
                'color' => '#3b82f6',
                'icon' => 'coffee',
                'sort_order' => 2,
            ],
            [
                'name' => 'Snack',
                'slug' => 'snack',
                'description' => 'Berbagai macam snack',
                'color' => '#f59e0b',
                'icon' => 'cookie',
                'sort_order' => 3,
            ],
            [
                'name' => 'Elektronik',
                'slug' => 'elektronik',
                'description' => 'Produk elektronik',
                'color' => '#8b5cf6',
                'icon' => 'device-mobile',
                'sort_order' => 4,
            ],
        ];

        $createdCategories = [];
        foreach ($categories as $categoryData) {
            $category = Category::updateOrCreate(
                ['slug' => $categoryData['slug']],
                $categoryData
            );
            $createdCategories[$category->slug] = $category;
        }

        // Create products
        $products = [
            // Makanan
            [
                'name' => 'Nasi Goreng',
                'slug' => 'nasi-goreng',
                'description' => 'Nasi goreng spesial dengan telur dan ayam',
                'sku' => 'NG-001',
                'barcode' => '123456789001',
                'base_price' => 25000,
                'cost_price' => 15000,
                'unit' => 'porsi',
                'category_id' => $createdCategories['makanan']->id,
                'track_inventory' => true,
                'min_stock_level' => 5,
            ],
            [
                'name' => 'Mie Ayam',
                'slug' => 'mie-ayam',
                'description' => 'Mie ayam dengan pangsit',
                'sku' => 'MA-001',
                'barcode' => '123456789002',
                'base_price' => 20000,
                'cost_price' => 12000,
                'unit' => 'porsi',
                'category_id' => $createdCategories['makanan']->id,
                'track_inventory' => true,
                'min_stock_level' => 5,
            ],
            [
                'name' => 'Ayam Bakar',
                'slug' => 'ayam-bakar',
                'description' => 'Ayam bakar dengan sambal dan lalapan',
                'sku' => 'AB-001',
                'barcode' => '123456789003',
                'base_price' => 35000,
                'cost_price' => 22000,
                'unit' => 'porsi',
                'category_id' => $createdCategories['makanan']->id,
                'track_inventory' => true,
                'min_stock_level' => 3,
            ],

            // Minuman
            [
                'name' => 'Es Teh Manis',
                'slug' => 'es-teh-manis',
                'description' => 'Es teh manis segar',
                'sku' => 'ETM-001',
                'barcode' => '123456789004',
                'base_price' => 8000,
                'cost_price' => 3000,
                'unit' => 'gelas',
                'category_id' => $createdCategories['minuman']->id,
                'track_inventory' => true,
                'min_stock_level' => 10,
            ],
            [
                'name' => 'Jus Alpukat',
                'slug' => 'jus-alpukat',
                'description' => 'Jus alpukat segar dengan susu',
                'sku' => 'JA-001',
                'barcode' => '123456789005',
                'base_price' => 15000,
                'cost_price' => 8000,
                'unit' => 'gelas',
                'category_id' => $createdCategories['minuman']->id,
                'track_inventory' => true,
                'min_stock_level' => 5,
            ],
            [
                'name' => 'Kopi Hitam',
                'slug' => 'kopi-hitam',
                'description' => 'Kopi hitam pilihan',
                'sku' => 'KH-001',
                'barcode' => '123456789006',
                'base_price' => 10000,
                'cost_price' => 5000,
                'unit' => 'cangkir',
                'category_id' => $createdCategories['minuman']->id,
                'track_inventory' => true,
                'min_stock_level' => 10,
            ],

            // Snack
            [
                'name' => 'Kentang Goreng',
                'slug' => 'kentang-goreng',
                'description' => 'Kentang goreng dengan saus',
                'sku' => 'KG-001',
                'barcode' => '123456789007',
                'base_price' => 18000,
                'cost_price' => 10000,
                'unit' => 'porsi',
                'category_id' => $createdCategories['snack']->id,
                'track_inventory' => true,
                'min_stock_level' => 5,
            ],
            [
                'name' => 'Roti Bakar',
                'slug' => 'roti-bakar',
                'description' => 'Roti bakar dengan selai dan meses',
                'sku' => 'RB-001',
                'barcode' => '123456789008',
                'base_price' => 12000,
                'cost_price' => 6000,
                'unit' => 'potong',
                'category_id' => $createdCategories['snack']->id,
                'track_inventory' => true,
                'min_stock_level' => 8,
            ],

            // Elektronik
            [
                'name' => 'Power Bank',
                'slug' => 'power-bank',
                'description' => 'Power bank 10000mAh',
                'sku' => 'PB-001',
                'barcode' => '123456789009',
                'base_price' => 150000,
                'cost_price' => 100000,
                'unit' => 'pcs',
                'category_id' => $createdCategories['elektronik']->id,
                'track_inventory' => true,
                'min_stock_level' => 2,
            ],
        ];

        $createdProducts = [];
        foreach ($products as $productData) {
            $product = Product::updateOrCreate(
                ['slug' => $productData['slug']],
                $productData
            );
            $createdProducts[$product->slug] = $product;

            // Create or update inventory record
            Inventory::updateOrCreate(
                [
                    'inventoryable_id' => $product->id,
                    'inventoryable_type' => Product::class,
                ],
                [
                    'quantity' => rand(10, 50),
                ]
            );
        }

        // Create product variants for some products
        $variants = [
            [
                'product_id' => $createdProducts['kopi-hitam']->id,
                'name' => 'Dingin',
                'sku' => 'KH-D-001',
                'price' => 10000,
                'cost_price' => 5000,
                'is_active' => true,
            ],
            [
                'product_id' => $createdProducts['kopi-hitam']->id,
                'name' => 'Panas',
                'sku' => 'KH-P-001',
                'price' => 10000,
                'cost_price' => 5000,
                'is_active' => true,
            ],
            [
                'product_id' => $createdProducts['jus-alpukat']->id,
                'name' => 'Small',
                'sku' => 'JA-S-001',
                'price' => 12000,
                'cost_price' => 6000,
                'attributes' => ['size' => 'small'],
                'is_active' => true,
            ],
            [
                'product_id' => $createdProducts['jus-alpukat']->id,
                'name' => 'Large',
                'sku' => 'JA-L-001',
                'price' => 18000,
                'cost_price' => 10000,
                'attributes' => ['size' => 'large'],
                'is_active' => true,
            ],
        ];

        foreach ($variants as $variantData) {
            $variant = ProductVariant::updateOrCreate(
                ['sku' => $variantData['sku']],
                $variantData
            );

            // Create or update inventory record for variant
            Inventory::updateOrCreate(
                [
                    'inventoryable_id' => $variant->id,
                    'inventoryable_type' => ProductVariant::class,
                ],
                [
                    'quantity' => rand(5, 20),
                ]
            );
        }

        $this->command->info('POS seeder completed successfully!');
        $this->command->info('Updated/Created ' . count($categories) . ' categories');
        $this->command->info('Updated/Created ' . count($products) . ' products');
        $this->command->info('Updated/Created ' . count($variants) . ' product variants');
    }
}