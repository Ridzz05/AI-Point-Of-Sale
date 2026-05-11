import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Tag, Barcode, CurrencyDollar, Info, Boxes } from '@phosphor-icons/react';

interface Category {
    id: number;
    name: string;
}

interface ProductFormProps {
    product?: any;
    categories: Category[];
    submitLabel?: string;
    action: string;
    method?: 'post' | 'put' | 'patch';
}

export default function ProductForm({ 
    product, 
    categories, 
    submitLabel = 'Save Product', 
    action,
    method = 'post'
}: ProductFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: product?.name || '',
        description: product?.description || '',
        sku: product?.sku || '',
        barcode: product?.barcode || '',
        base_price: product?.base_price || 0,
        cost_price: product?.cost_price || 0,
        unit: product?.unit || 'pcs',
        category_id: product?.category_id?.toString() || '',
        track_inventory: product?.track_inventory ?? true,
        min_stock_level: product?.min_stock_level || 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (method === 'post') {
            post(action);
        } else if (method === 'put') {
            put(action);
        } else {
            post(action, { _method: 'patch' });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Basic Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-2 mb-2 text-indigo-600">
                                <Info size={20} weight="bold" />
                                <h3 className="font-semibold">Basic Information</h3>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="e.g. Premium Cotton T-Shirt"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="Describe your product..."
                                    rows={4}
                                />
                                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                                    <div className="relative">
                                        <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                        <Input
                                            id="sku"
                                            value={data.sku}
                                            onChange={e => setData('sku', e.target.value)}
                                            placeholder="SKU-001"
                                            className={`pl-10 ${errors.sku ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.sku && <p className="text-sm text-red-500">{errors.sku}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="barcode">Barcode (EAN/UPC)</Label>
                                    <div className="relative">
                                        <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                        <Input
                                            id="barcode"
                                            value={data.barcode}
                                            onChange={e => setData('barcode', e.target.value)}
                                            placeholder="123456789"
                                            className="pl-10"
                                        />
                                    </div>
                                    {errors.barcode && <p className="text-sm text-red-500">{errors.barcode}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-2 mb-2 text-indigo-600">
                                <CurrencyDollar size={20} weight="bold" />
                                <h3 className="font-semibold">Pricing & Units</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="base_price">Selling Price (IDR)</Label>
                                    <Input
                                        id="base_price"
                                        type="number"
                                        value={data.base_price}
                                        onChange={e => setData('base_price', parseFloat(e.target.value) || 0)}
                                        className={errors.base_price ? 'border-red-500' : ''}
                                    />
                                    {errors.base_price && <p className="text-sm text-red-500">{errors.base_price}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cost_price">Cost Price (IDR)</Label>
                                    <Input
                                        id="cost_price"
                                        type="number"
                                        value={data.cost_price}
                                        onChange={e => setData('cost_price', parseFloat(e.target.value) || 0)}
                                    />
                                    {errors.cost_price && <p className="text-sm text-red-500">{errors.cost_price}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unit">Unit of Measure</Label>
                                <Input
                                    id="unit"
                                    value={data.unit}
                                    onChange={e => setData('unit', e.target.value)}
                                    placeholder="pcs, box, kg, etc."
                                />
                                {errors.unit && <p className="text-sm text-red-500">{errors.unit}</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Inventory & Category */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-2 mb-2 text-indigo-600">
                                <Tag size={20} weight="bold" />
                                <h3 className="font-semibold">Organization</h3>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select 
                                    value={data.category_id} 
                                    onValueChange={value => setData('category_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(category => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.category_id && <p className="text-sm text-red-500">{errors.category_id}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-2 mb-2 text-indigo-600">
                                <Boxes size={20} weight="bold" />
                                <h3 className="font-semibold">Inventory Tracking</h3>
                            </div>

                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="track_inventory" className="flex flex-col space-y-1">
                                    <span>Track Inventory</span>
                                    <span className="font-normal text-xs text-gray-500">Automatically adjust stock levels</span>
                                </Label>
                                <Switch
                                    id="track_inventory"
                                    checked={data.track_inventory}
                                    onCheckedChange={checked => setData('track_inventory', checked)}
                                />
                            </div>

                            {data.track_inventory && (
                                <div className="space-y-2 pt-2">
                                    <Label htmlFor="min_stock_level">Low Stock Alert Level</Label>
                                    <Input
                                        id="min_stock_level"
                                        type="number"
                                        value={data.min_stock_level}
                                        onChange={e => setData('min_stock_level', parseInt(e.target.value) || 0)}
                                    />
                                    {errors.min_stock_level && <p className="text-sm text-red-500">{errors.min_stock_level}</p>}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        <Button 
                            type="submit" 
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700" 
                            disabled={processing}
                        >
                            {processing ? 'Saving...' : submitLabel}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
