<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\PosOrder;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $totalCustomers = Customer::count();
        $totalProducts = Product::count();
        $totalRevenue = PosOrder::where('status', 'completed')->sum('total_amount');
        $totalOrders = PosOrder::count();
        
        // Generate last 6 months with 0 defaults
        $months = collect();
        for ($i = 5; $i >= 0; $i--) {
            $months->put(now()->subMonths($i)->format('M'), 0);
        }

        $revenueDataRaw = PosOrder::where('status', 'completed')
            ->where('created_at', '>=', now()->subMonths(6))
            ->get()
            ->groupBy(function($item) {
                return $item->created_at->format('M');
            })
            ->map(function($group) {
                return (float)$group->sum('total_amount');
            });

        $revenueData = $months->map(function($value, $month) use ($revenueDataRaw) {
            return [
                'month' => $month,
                'total' => $revenueDataRaw->get($month, 0)
            ];
        })->values();

        // Recent Activities (Combined)
        $recentCustomers = Customer::latest()->take(3)->get()->map(function($item) {
            return [
                'type' => 'customer',
                'title' => 'Customer Baru',
                'description' => 'Menambahkan ' . $item->name,
                'time' => $item->created_at->diffForHumans(),
                'icon' => 'user'
            ];
        });

        $recentOrders = PosOrder::latest()->take(3)->get()->map(function($item) {
            return [
                'type' => 'order',
                'title' => 'Pesanan Baru',
                'description' => 'IDR ' . number_format($item->total_amount) . ' - ' . $item->order_number,
                'time' => $item->created_at->diffForHumans(),
                'icon' => 'shopping-cart'
            ];
        });

        $activities = $recentCustomers->concat($recentOrders)
            ->sortByDesc('time')
            ->values()
            ->take(6);

        return Inertia::render('dashboard', [
            'stats' => [
                'totalCustomers' => $totalCustomers,
                'totalProducts' => $totalProducts,
                'totalRevenue' => (float)$totalRevenue,
                'totalOrders' => $totalOrders,
            ],
            'revenueData' => $revenueData,
            'activities' => $activities,
        ]);
    }
}

