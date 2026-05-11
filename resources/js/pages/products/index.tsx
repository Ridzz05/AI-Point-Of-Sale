import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

interface PaginationData {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface ProductsIndexProps {
    products: PaginationData;
    categories: Category[];
    filters: {
        search?: string;
        category_id?: string;
        stock_status?: string;
    };
}

export default function ProductsIndex({ products, categories, filters }: ProductsIndexProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category_id || '');
    const [stockStatus, setStockStatus] = useState(filters.stock_status || '');
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const handleSearch = () => {
        router.get('/products', { 
            search: searchQuery, 
            category_id: selectedCategory, 
            stock_status: stockStatus 
        }, { preserveState: true });
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setStockStatus('');
        router.get('/products');
    };

    const handleDelete = () => {
        if (isDeleting) {
            router.delete(`/products/${isDeleting}`, {
                onSuccess: () => setIsDeleting(null),
            });
        }
    };


    const getStockStatus = (product: Product) => {
        if (!product.track_inventory) {
            return { label: 'No Track', color: 'gray', icon: null };
        }

        const status = product.inventory?.stock_status || 'unknown';
        const quantity = product.inventory?.available_quantity || 0;

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
                                <Button className="bg-indigo-600 hover:bg-indigo-700">
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
                                        <p className="text-2xl font-bold">{products.total}</p>
                                    </div>
                                    <Package className="text-indigo-500" size={32} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">In Stock</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {products.data.filter(p => p.inventory?.stock_status === 'in_stock').length}
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
                                            {products.data.filter(p => p.inventory?.stock_status === 'low_stock').length}
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
                                            {products.data.filter(p => p.inventory?.stock_status === 'out_of_stock').length}
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
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value)}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
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
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="in_stock">In Stock</SelectItem>
                                        <SelectItem value="low_stock">Low Stock</SelectItem>
                                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="secondary" onClick={handleSearch}>
                                    Apply
                                </Button>
                                <Button variant="ghost" onClick={clearFilters}>
                                    <Filter size={20} className="mr-2" />
                                    Clear
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
                                        <TableHead>Product</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">
                                                <div className="text-gray-500">
                                                    <Package size={48} className="mx-auto mb-4 opacity-50" />
                                                    <p>No products found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        products.data.map((product) => {
                                            const stockStatus = getStockStatus(product);
                                            const StockIcon = stockStatus.icon;
                                            
                                            return (
                                                <TableRow key={product.id}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{product.name}</p>
                                                            <p className="text-xs text-gray-500">ID: {product.id}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
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
                                                        <p className="font-semibold">{product.formatted_price}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        {product.track_inventory ? (
                                                            <div className="flex items-center gap-2">
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
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link href={`/products/${product.id}/edit`}>
                                                                <Button variant="ghost" size="sm">
                                                                    <Edit size={16} />
                                                                </Button>
                                                            </Link>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => setIsDeleting(product.id)}
                                                            >
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
                    {products.last_page > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <div className="text-sm text-gray-600">
                                Showing {((products.current_page - 1) * products.per_page) + 1} to{' '}
                                {Math.min(products.current_page * products.per_page, products.total)} of{' '}
                                {products.total} products
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    disabled={products.current_page === 1}
                                    onClick={() => router.get('/products', { ...filters, page: products.current_page - 1 })}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={products.current_page === products.last_page}
                                    onClick={() => router.get('/products', { ...filters, page: products.current_page + 1 })}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </AuthenticatedLayout>

            <AlertDialog open={isDeleting !== null} onOpenChange={() => setIsDeleting(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the product
                            and remove its data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                            Delete Product
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}