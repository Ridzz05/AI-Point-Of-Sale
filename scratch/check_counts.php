<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$tables = ['products', 'categories', 'inventories', 'pos_orders'];
foreach ($tables as $table) {
    try {
        $count = DB::table($table)->count();
        echo "$table: $count\n";
    } catch (\Exception $e) {
        echo "$table: table not found or error\n";
    }
}
