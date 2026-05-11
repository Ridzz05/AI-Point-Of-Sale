<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'inventory', 'activeVariants.inventory'])
            ->active();

        // Search
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('sku', 'like', '%' . $request->search . '%')
                  ->orWhere('barcode', 'like', '%' . $request->search . '%');
            });
        }

        // Category filter
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // Stock filter
        if ($request->stock_status === 'in_stock') {
            $query->inStock();
        } elseif ($request->stock_status === 'low_stock') {
            $query->lowStock();
        }

        // Sort
        $sort = $request->sort ?? 'name';
        $direction = $request->direction ?? 'asc';
        
        if ($sort === 'name') {
            $query->orderBy('name', $direction);
        } elseif ($sort === 'price') {
            $query->orderBy('base_price', $direction);
        } elseif ($sort === 'stock') {
            $query->orderBy(
                Inventory::select('quantity')
                    ->whereColumn('inventoryable_id', 'products.id')
                    ->where('inventoryable_type', Product::class)
                    ->latest()
                    ->limit(1),
                $direction
            );
        }

        $products = $query->paginate($request->per_page ?? 20);

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json($products);
        }

        return Inertia::render('products/index', [
            'products' => $products,
            'categories' => Category::all(),
            'filters' => $request->only(['search', 'category_id', 'stock_status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('products/create', [
            'categories' => Category::all(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sku' => 'required|string|max:100|unique:products',
            'barcode' => 'nullable|string|max:100|unique:products',
            'base_price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'unit' => 'nullable|string|max:50',
            'category_id' => 'nullable|exists:categories,id',
            'track_inventory' => 'boolean',
            'min_stock_level' => 'nullable|integer|min:0',
            'attributes' => 'nullable|array',
        ]);

        $product = Product::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'sku' => $request->sku,
            'barcode' => $request->barcode,
            'base_price' => $request->base_price,
            'cost_price' => $request->cost_price,
            'unit' => $request->unit ?? 'pcs',
            'category_id' => $request->category_id,
            'track_inventory' => $request->track_inventory ?? true,
            'min_stock_level' => $request->min_stock_level ?? 0,
            'attributes' => $request->attributes,
        ]);

        // Create inventory record
        if ($product->track_inventory) {
            Inventory::create([
                'quantity' => 0,
                'inventoryable_id' => $product->id,
                'inventoryable_type' => Product::class,
            ]);
        }

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            $product->load(['category', 'inventory']);
            return response()->json($product, 201);
        }

        return redirect()->route('products.index')->with('success', 'Product created successfully.');
    }


    public function show($id)
    {
        $product = Product::with(['category', 'inventory', 'activeVariants.inventory'])->find($id);
        
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json($product);
    }

    public function edit(Product $product)
    {
        return Inertia::render('products/edit', [
            'product' => $product->load(['category', 'inventory']),
            'categories' => Category::all(['id', 'name']),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sku' => 'required|string|max:100|unique:products,sku,' . $product->id,
            'barcode' => 'nullable|string|max:100|unique:products,barcode,' . $product->id,
            'base_price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'unit' => 'nullable|string|max:50',
            'category_id' => 'nullable|exists:categories,id',
            'is_active' => 'boolean',
            'track_inventory' => 'boolean',
            'min_stock_level' => 'nullable|integer|min:0',
            'attributes' => 'nullable|array',
        ]);

        $product->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'sku' => $request->sku,
            'barcode' => $request->barcode,
            'base_price' => $request->base_price,
            'cost_price' => $request->cost_price,
            'unit' => $request->unit ?? 'pcs',
            'category_id' => $request->category_id,
            'is_active' => $request->is_active ?? true,
            'track_inventory' => $request->track_inventory,
            'min_stock_level' => $request->min_stock_level ?? 0,
            'attributes' => $request->attributes,
        ]);

        // Create inventory record if tracking enabled and doesn't exist
        if ($product->track_inventory && !$product->inventory) {
            Inventory::create([
                'quantity' => 0,
                'inventoryable_id' => $product->id,
                'inventoryable_type' => Product::class,
            ]);
        }

        $product->load(['category', 'inventory']);

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            $product->load(['category', 'inventory']);
            return response()->json($product);
        }

        return redirect()->route('products.index')->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        // Check if product has order items
        if ($product->orderItems()->exists()) {
            return response()->json([
                'message' => 'Cannot delete product with existing orders'
            ], 422);
        }

        $product->delete();

        if (request()->wantsJson() && !request()->header('X-Inertia')) {
            return response()->json(null, 204);
        }

        return redirect()->route('products.index')->with('success', 'Product deleted successfully.');
    }

    public function adjustStock(Request $request, $id)
    {
        $product = Product::find($id);
        
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $request->validate([
            'quantity' => 'required|integer|min:0',
            'reason' => 'nullable|string|max:255',
        ]);

        if (!$product->track_inventory) {
            return response()->json([
                'message' => 'Product does not track inventory'
            ], 422);
        }

        $inventory = $product->inventory;
        if (!$inventory) {
            $inventory = Inventory::create([
                'quantity' => 0,
                'inventoryable_id' => $product->id,
                'inventoryable_type' => Product::class,
            ]);
        }

        $inventory->adjust($request->quantity, $request->reason);

        return response()->json([
            'message' => 'Stock adjusted successfully',
            'current_quantity' => $inventory->quantity,
        ]);
    }

    public function search(Request $request)
    {
        $query = $request->input('q');
        
        if (!$query) {
            return response()->json([]);
        }

        $products = Product::active()
            ->with(['category', 'inventory'])
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', '%' . $query . '%')
                  ->orWhere('sku', 'like', '%' . $query . '%')
                  ->orWhere('barcode', $query);
            })
            ->limit(10)
            ->get();

        return response()->json($products);
    }
}