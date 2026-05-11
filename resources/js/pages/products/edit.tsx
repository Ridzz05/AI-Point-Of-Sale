import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import ProductForm from '@/components/products/ProductForm';
import { Button } from '@/components/ui/button';
import { CaretLeft } from '@phosphor-icons/react';

interface Category {
    id: number;
    name: string;
}

interface EditProductProps {
    product: any;
    categories: Category[];
}

export default function EditProduct({ product, categories }: EditProductProps) {
    return (
        <>
            <Head title={`Edit Product: ${product.name}`} />

            <AuthenticatedLayout>
                <div className="p-6 max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <Link 
                                href="/products" 
                                className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-2 transition-colors"
                            >
                                <CaretLeft size={16} className="mr-1" />
                                Back to Products
                            </Link>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
                            <p className="text-gray-600 mt-1">Update the details for "{product.name}".</p>
                        </div>
                    </div>

                    <ProductForm 
                        product={product}
                        categories={categories} 
                        action={`/products/${product.id}`} 
                        method="put"
                        submitLabel="Update Product"
                    />
                </div>
            </AuthenticatedLayout>
        </>
    );
}
