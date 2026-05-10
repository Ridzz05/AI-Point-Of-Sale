import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    MagnifyingGlass,
    Plus,
    Edit,
    Trash,
    Package,
    TrendUp,
    TrendDown,
    AlertTriangle,
    Eye,
    Filter,
    Download,
    Upload,
} from '@phosphor-icons/react';
import axios from 'axios';

interface Product {
    id: number;
    name: string;
    sku: string;
    base_price: number;
    formatted_price: string;
    is_active: boolean;
    track_inventory: boolean;
    min_stock_level: number;
    category?: {
        id: number;
        name: string;
        color: string;
    };
    inventory?: {
        quantity: number;
        available_quantity: number;
        stock_status: string;
    };
    created_at: string;
}

interface Category {
    id: number;
    name: string;
    color: string;
}

export default function ProductsIndex() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [stockStatus, setStockStatus] = useState<string>('');
    const [sortBy, setSortBy] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
    });

    useEffect(() => {
        loadCategories();
        loadProducts();
    }, [searchQuery, selectedCategory, stockStatus, sortBy, sortDirection]);

    const loadCategories = async () => {
        try {
            const response = await axios.get('/api/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const loadProducts = async (page = 1) => {
        try {
            setLoading(true);
            const params: any = {
                page,
                per_page: pagination.per_page,
                sort: sortBy,
                direction: sortDirection,
            };

            if (searchQuery) params.search = searchQuery;
            if (selectedCategory) params.category_id = selectedCategory;
            if (stockStatus) params.stock_status = stockStatus;

            const response = await axios.get('/api/products', { params });
            setProducts(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                per_page: response.data.per_page,
                total: response.data.total,
            });
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStockStatus = (product: Product) => {
        if (!product.track_inventory) {
            return { label: 'No Track', color: 'gray', icon: null };
        }

        const status = product.inventory?.stock_status || 'unknown';
        const quantity = product.inventory?.available_quantity || 0;
        const minLevel = product.min_stock_level || 0;

        switch (status) {
            case 'in_stock':
                return { 
                    label: `In Stock (${quantity})`, 
                    color: 'green', 
                    icon: TrendUp 
                };
            case 'low_stock':
                return { 
                    label: `Low Stock (${quantity})`, 
                    color: 'yellow', 
                    icon: AlertTriangle 
                };
            case 'out_of_stock':
                return { 
                    label: 'Out of Stock', 
                    color: 'red', 
                    icon: TrendDown 
                };
            default:
                return { label: 'Unknown', color: 'gray', icon: null };
        }
    };

    const toggleSort = (field: string) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field: string) => {
        if (sortBy !== field) return null;
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    return (
        <>
            <Head title="Products Management" />
            
            <AuthenticatedLayout>
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
                            <p className="text-gray-600 mt-1">Manage your product catalog and inventory</p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline">
                                <Upload size={20} className="mr-2" />
                                Import
                            </Button>
                            <Button variant="outline">
                                <Download size={20} className="mr-2" />
                                Export
                            </Button>
                            <Link href="/products/create">
                                <Button>
                                    <Plus size={20} className="mr-2" />
                                    Add Product
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Products</p>
                                        <p className="text-2xl font-bold">{pagination.total}</p>
                                    </div>
                                    <Package className="text-blue-500" size={32} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">In Stock</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {products.filter(p => p.inventory?.stock_status === 'in_stock').length}
                                        </p>
                                    </div>
                                    <TrendUp className="text-green-500" size={32} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Low Stock</p>
                                        <p className="text-2xl font-bold text-yellow-600">
                                            {products.filter(p => p.inventory?.stock_status === 'low_stock').length}
                                        </p>
                                    </div>
                                    <AlertTriangle className="text-yellow-500" size={32} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Out of Stock</p>
                                        <p className="text-2xl font-bold text-red-600">
                                            {products.filter(p => p.inventory?.stock_status === 'out_of_stock').length}
                                        </p>
                                    </div>
                                    <TrendDown className="text-red-500" size={32} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap gap-4">
                                <div className="flex-1 min-w-[200px]">
                                    <div className="relative">
                                        <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <Input
                                            placeholder="Search products..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <Select value={selectedCategory?.toString() || ''} onValueChange={(value) => setSelectedCategory(value ? parseInt(value) : null)}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Categories</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={stockStatus} onValueChange={setStockStatus}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Stock Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Status</SelectItem>
                                        <SelectItem value="in_stock">In Stock</SelectItem>
                                        <SelectItem value="low_stock">Low Stock</SelectItem>
                                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCategory(null);
                                    setStockStatus('');
                                }}>
                                    <Filter size={20} className="mr-2" />
                                    Clear Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Products Table */}
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead 
                                            className="cursor-pointer hover:bg-gray-50"
                                            onClick={() => toggleSort('name')}
                                        >
                                            Product {getSortIcon('name')}
                                        </TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead 
                                            className="cursor-pointer hover:bg-gray-50"
                                            onClick={() => toggleSort('price')}
                                        >
                                            Price {getSortIcon('price')}
                                        </TableHead>
                                        <TableHead 
                                            className="cursor-pointer hover:bg-gray-50"
                                            onClick={() => toggleSort('stock')}
                                        >
                                            Stock {getSortIcon('stock')}
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">
                                                Loading products...
                                            </TableCell>
                                        </TableRow>
                                    ) : products.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">
                                                <div className="text-gray-500">
                                                    <Package size={48} className="mx-auto mb-4 opacity-50" />
                                                    <p>No products found</p>
                                                    <p className="text-sm">Try adjusting your filters or add a new product</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        products.map((product) => {
                                            const stockStatus = getStockStatus(product);
                                            const StockIcon = stockStatus.icon;
                                            
                                            return (
                                                <TableRow key={product.id}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{product.name}</p>
                                                            <p className="text-sm text-gray-500">ID: {product.id}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                                            {product.sku}
                                                        </code>
                                                    </TableCell>
                                                    <TableCell>
                                                        {product.category ? (
                                                            <Badge variant="outline" style={{ borderColor: product.category.color }}>
                                                                {product.category.name}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-gray-400">No Category</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-semibold">{product.formatted_price}</p>
                                                            {product.track_inventory && (
                                                                <p className="text-xs text-gray-500">
                                                                    Min: {product.min_stock_level} {product.unit || 'pcs'}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {product.track_inventory ? (
                                                            <div className="flex items-center gap-2">
                                                                {StockIcon && <StockIcon size={16} className={stockStatus.color === 'green' ? 'text-green-500' : stockStatus.color === 'yellow' ? 'text-yellow-500' : 'text-red-500'} />}
                                                                <Badge variant={stockStatus.color === 'green' ? 'default' : stockStatus.color === 'yellow' ? 'secondary' : 'destructive'}>
                                                                    {stockStatus.label}
                                                                </Badge>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">Not tracked</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                                            {product.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button variant="outline" size="sm">
                                                                <Eye size={16} />
                                                            </Button>
                                                            <Button variant="outline" size="sm">
                                                                <Edit size={16} />
                                                            </Button>
                                                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                                                <Trash size={16} />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <div className="text-sm text-gray-600">
                                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                                {pagination.total} products
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    disabled={pagination.current_page === 1}
                                    onClick={() => loadProducts(pagination.current_page - 1)}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={pagination.current_page === pagination.last_page}
                                    onClick={() => loadProducts(pagination.current_page + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </AuthenticatedLayout>
        </>
    );
}