<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Inventory::with(['inventoryable' => function ($morph) {
            $morph->morphWith([
                Product::class => ['category'],
                ProductVariant::class => ['product'],
            ]);
        }]);

        // Search by product name, SKU, or barcode
        if ($request->search) {
            $query->whereHas('inventoryable', function ($q) use ($request) {
                $q->where(function ($subQuery) use ($request) {
                    $subQuery->where('name', 'like', '%' . $request->search . '%')
                             ->orWhere('sku', 'like', '%' . $request->search . '%')
                             ->orWhere('barcode', $request->search);
                });
            });
        }

        // Stock status filter
        if ($request->stock_status === 'out_of_stock') {
            $query->where('quantity', '<=', 0);
        } elseif ($request->stock_status === 'low_stock') {
            $query->whereRaw('available_quantity <= 5'); // Default low stock threshold
        } elseif ($request->stock_status === 'in_stock') {
            $query->where('available_quantity', '>', 5);
        }

        // Sort
        $sort = $request->sort ?? 'quantity';
        $direction = $request->direction ?? 'desc';

        if ($sort === 'quantity') {
            $query->orderBy('quantity', $direction);
        } elseif ($sort === 'available_quantity') {
            $query->orderBy('available_quantity', $direction);
        } elseif ($sort === 'name') {
            $query->orderBy(
                Inventory::select('name')
                    ->whereColumn('inventoryable_id', 'inventories.inventoryable_id')
                    ->where('inventoryable_type', 'inventories.inventoryable_type')
                    ->limit(1),
                $direction
            );
        }

        $inventories = $query->paginate($request->per_page ?? 20);

        return response()->json($inventories);
    }

    public function show(Inventory $inventory)
    {
        $inventory->load(['inventoryable' => function ($morph) {
            $morph->morphWith([
                Product::class => ['category', 'variants'],
                ProductVariant::class => ['product'],
            ]);
        }]);

        return response()->json($inventory);
    }

    public function adjust(Request $request, Inventory $inventory)
    {
        $request->validate([
            'quantity' => 'required|integer|min:0',
            'reason' => 'nullable|string|max:255',
            'cost' => 'nullable|numeric|min:0',
        ]);

        $oldQuantity = $inventory->quantity;
        $inventory->adjust($request->quantity, $request->reason);

        if ($request->cost) {
            $inventory->last_cost = $request->cost;
            $inventory->save();
        }

        return response()->json([
            'message' => 'Inventory adjusted successfully',
            'old_quantity' => $oldQuantity,
            'new_quantity' => $inventory->quantity,
            'adjustment' => $request->quantity - $oldQuantity,
        ]);
    }

    public function add(Request $request, Inventory $inventory)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'reason' => 'nullable|string|max:255',
            'cost' => 'nullable|numeric|min:0',
        ]);

        $oldQuantity = $inventory->quantity;
        $inventory->add($request->quantity, $request->cost);

        return response()->json([
            'message' => 'Stock added successfully',
            'old_quantity' => $oldQuantity,
            'new_quantity' => $inventory->quantity,
            'added' => $request->quantity,
        ]);
    }

    public function deduct(Request $request, Inventory $inventory)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'reason' => 'nullable|string|max:255',
        ]);

        if ($inventory->quantity < $request->quantity) {
            return response()->json([
                'message' => 'Insufficient stock',
                'available' => $inventory->quantity,
                'requested' => $request->quantity,
            ], 422);
        }

        $oldQuantity = $inventory->quantity;
        $success = $inventory->deduct($request->quantity);

        if (!$success) {
            return response()->json([
                'message' => 'Failed to deduct stock'
            ], 422);
        }

        return response()->json([
            'message' => 'Stock deducted successfully',
            'old_quantity' => $oldQuantity,
            'new_quantity' => $inventory->quantity,
            'deducted' => $request->quantity,
        ]);
    }

    public function getLowStock()
    {
        $lowStockItems = Inventory::with(['inventoryable' => function ($morph) {
            $morph->morphWith([
                Product::class => ['category'],
                ProductVariant::class => ['product'],
            ]);
        }])
        ->whereRaw('available_quantity <= 5') // Default threshold
        ->orderBy('available_quantity', 'asc')
        ->limit(20)
        ->get();

        return response()->json($lowStockItems);
    }

    public function getOutOfStock()
    {
        $outOfStockItems = Inventory::with(['inventoryable' => function ($morph) {
            $morph->morphWith([
                Product::class => ['category'],
                ProductVariant::class => ['product'],
            ]);
        }])
        ->where('available_quantity', '<=', 0)
        ->orderBy('updated_at', 'desc')
        ->limit(20)
        ->get();

        return response()->json($outOfStockItems);
    }

    public function getMovementHistory(Request $request, Inventory $inventory)
    {
        // This would require a separate inventory movements table
        // For now, return basic info
        return response()->json([
            'inventory' => $inventory,
            'message' => 'Movement history feature requires additional implementation',
        ]);
    }

    public function bulkAdjust(Request $request)
    {
        $request->validate([
            'adjustments' => 'required|array',
            'adjustments.*.inventory_id' => 'required|exists:inventories,id',
            'adjustments.*.quantity' => 'required|integer|min:0',
            'adjustments.*.reason' => 'nullable|string|max:255',
        ]);

        $results = [];

        foreach ($request->adjustments as $adjustment) {
            $inventory = Inventory::find($adjustment['inventory_id']);
            $oldQuantity = $inventory->quantity;
            
            $inventory->adjust($adjustment['quantity'], $adjustment['reason'] ?? 'Bulk adjustment');
            
            $results[] = [
                'inventory_id' => $inventory->id,
                'old_quantity' => $oldQuantity,
                'new_quantity' => $inventory->quantity,
                'adjustment' => $adjustment['quantity'] - $oldQuantity,
            ];
        }

        return response()->json([
            'message' => 'Bulk adjustment completed',
            'results' => $results,
        ]);
    }
}