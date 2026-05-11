<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = Category::withCount('activeProducts')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json($categories);
        }

        return Inertia::render('categories/index', [
            'categories' => $categories
        ]);
    }


    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'color' => $request->color,
            'icon' => $request->icon,
            'sort_order' => $request->sort_order ?? 0,
        ]);

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json($category, 201);
        }

        return redirect()->back()->with('success', 'Category created successfully.');
    }

    public function show(Category $category)
    {
        $category->load('activeProducts');

        return response()->json($category);
    }

    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $category->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'color' => $request->color,
            'icon' => $request->icon,
            'sort_order' => $request->sort_order ?? 0,
            'is_active' => $request->is_active ?? true,
        ]);

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json($category);
        }

        return redirect()->back()->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category)
    {
        // Check if category has products
        if ($category->products()->exists()) {
            return response()->json([
                'message' => 'Cannot delete category with existing products'
            ], 422);
        }

        $category->delete();

        if (request()->wantsJson() && !request()->header('X-Inertia')) {
            return response()->json(null, 204);
        }

        return redirect()->back()->with('success', 'Category deleted successfully.');
    }
}