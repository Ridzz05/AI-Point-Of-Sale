<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

Schema::disableForeignKeyConstraints();
DB::table('inventories')->truncate();
DB::table('product_variants')->truncate();
DB::table('products')->truncate();
DB::table('categories')->truncate();
DB::table('pos_order_items')->truncate();
DB::table('pos_orders')->truncate();
DB::table('transactions')->truncate();
Schema::enableForeignKeyConstraints();

echo "All dummy data removed successfully.\n";
