import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    ShoppingCart, 
    MagnifyingGlass,
    Plus, 
    Minus, 
    Trash, 
    CreditCard, 
    Receipt,
    Package,
    Users,
    TrendUp
} from '@phosphor-icons/react';
import axios from 'axios';
import PaymentModal from '@/components/pos/PaymentModal';

interface Product {
    id: number;
    name: string;
    sku: string;
    base_price: number;
    formatted_price: string;
    category?: {
        id: number;
        name: string;
        color: string;
        icon: string;
    };
    inventory?: {
        quantity: number;
        available_quantity: number;
        stock_status: string;
    };
}

interface CartItem {
    product_id?: number;
    product_variant_id?: number;
    quantity: number;
    unit_price: number;
    discount_amount: number;
    product?: Product;
    variant?: any;
    subtotal: number;
}

interface CartSummary {
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    item_count: number;
}

export default function POSIndex() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [cartSummary, setCartSummary] = useState<CartSummary>({
        subtotal: 0,
        tax: 0,
        discount: 0,
        total: 0,
        item_count: 0,
    });
    const [loading, setLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Load initial data
    useEffect(() => {
        loadCategories();
        loadProducts();
        loadCart();
    }, []);

    // Load products when category or search changes
    useEffect(() => {
        loadProducts();
    }, [selectedCategory, searchQuery]);

    const loadCategories = async () => {
        try {
            const response = await axios.get('/api/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const loadProducts = async () => {
        try {
            const params: any = {};
            if (selectedCategory) params.category_id = selectedCategory;
            if (searchQuery) params.search = searchQuery;
            
            const response = await axios.get('/api/products', { params });
            setProducts(response.data.data);
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    };

    const loadCart = async () => {
        try {
            const response = await axios.get('/api/pos/cart');
            setCart(response.data.items);
            setCartSummary(response.data.summary);
        } catch (error) {
            console.error('Failed to load cart:', error);
        }
    };

    const addToCart = async (product: Product, variant?: any) => {
        try {
            setLoading(true);
            await axios.post('/api/pos/cart/add', {
                product_id: variant ? null : product.id,
                product_variant_id: variant ? variant.id : null,
                quantity: 1,
            });
            await loadCart();
        } catch (error) {
            console.error('Failed to add to cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateCartItem = async (index: number, quantity: number) => {
        try {
            await axios.put(`/api/pos/cart/${index}`, { quantity });
            await loadCart();
        } catch (error) {
            console.error('Failed to update cart item:', error);
        }
    };

    const removeFromCart = async (index: number) => {
        try {
            await axios.delete(`/api/pos/cart/${index}`);
            await loadCart();
        } catch (error) {
            console.error('Failed to remove from cart:', error);
        }
    };

    const clearCart = async () => {
        try {
            await axios.delete('/api/pos/cart');
            await loadCart();
        } catch (error) {
            console.error('Failed to clear cart:', error);
        }
    };

    const handlePaymentSuccess = (order: any) => {
        // Show success message or redirect to receipt
        console.log('Order completed:', order);
        // You can add a success toast or redirect here
    };

    const getStockStatus = (product: Product) => {
        if (!product.inventory) return { label: 'No Track', color: 'gray' };
        
        const status = product.inventory.stock_status;
        switch (status) {
            case 'in_stock':
                return { label: 'In Stock', color: 'green' };
            case 'low_stock':
                return { label: 'Low Stock', color: 'yellow' };
            case 'out_of_stock':
                return { label: 'Out of Stock', color: 'red' };
            default:
                return { label: 'Unknown', color: 'gray' };
        }
    };

    return (
        <>
            <Head title="Point of Sale" />
            
            <div className="flex h-screen bg-gray-50">
                {/* Left Panel - Products */}
                <div className="flex-1 p-6 overflow-hidden">
                    <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">Point of Sale</h1>
                            
                            {/* Search and Categories */}
                            <div className="flex gap-4 mb-4">
                                <div className="flex-1 relative">
                                    <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <Input
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Category Filter */}
                            <div className="flex gap-2 flex-wrap">
                                <Button
                                    variant={selectedCategory === null ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedCategory(null)}
                                >
                                    All Products
                                </Button>
                                {categories.map((category) => (
                                    <Button
                                        key={category.id}
                                        variant={selectedCategory === category.id ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedCategory(category.id)}
                                    >
                                        {category.name}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {products.map((product) => {
                                    const stockStatus = getStockStatus(product);
                                    return (
                                        <Card 
                                            key={product.id} 
                                            className="cursor-pointer hover:shadow-md transition-shadow"
                                            onClick={() => addToCart(product)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                                                    <Badge variant={stockStatus.color === 'green' ? 'default' : stockStatus.color === 'yellow' ? 'secondary' : 'destructive'}>
                                                        {stockStatus.label}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-gray-500 mb-2">{product.sku}</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-lg">{product.formatted_price}</span>
                                                    <Plus className="text-gray-400" size={20} />
                                                </div>
                                                {product.category && (
                                                    <div className="mt-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            {product.category.name}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Cart */}
                <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
                    {/* Cart Header */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <ShoppingCart size={20} />
                                Cart
                            </h2>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={clearCart}
                                disabled={cart.length === 0}
                            >
                                Clear
                            </Button>
                        </div>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {cart.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
                                <p>Your cart is empty</p>
                                <p className="text-sm">Add products to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cart.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-sm">
                                                {item.product?.name || 'Unknown Product'}
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                {item.variant ? item.variant.name : item.product?.sku}
                                            </p>
                                            <p className="font-semibold">
                                                IDR {item.unit_price.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => updateCartItem(index, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus size={14} />
                                            </Button>
                                            <span className="w-8 text-center">{item.quantity}</span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => updateCartItem(index, item.quantity + 1)}
                                            >
                                                <Plus size={14} />
                                            </Button>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeFromCart(index)}
                                        >
                                            <Trash size={14} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cart Summary */}
                    {cart.length > 0 && (
                        <div className="border-t border-gray-200 p-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal ({cartSummary.item_count} items)</span>
                                    <span>IDR {cartSummary.subtotal.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Tax</span>
                                    <span>IDR {cartSummary.tax.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Discount</span>
                                    <span>IDR {cartSummary.discount.toLocaleString('id-ID')}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>IDR {cartSummary.total.toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            <Button 
                                className="w-full mt-4" 
                                size="lg"
                                disabled={loading || cart.length === 0}
                                onClick={() => setShowPaymentModal(true)}
                            >
                                <CreditCard className="mr-2" size={20} />
                                Proceed to Payment
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}