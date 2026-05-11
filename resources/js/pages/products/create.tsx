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

interface CreateProductProps {
    categories: Category[];
}

export default function CreateProduct({ categories }: CreateProductProps) {
    return (
        <>
            <Head title="Create New Product" />

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
                            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
                            <p className="text-gray-600 mt-1">Fill in the details to add a new product to your catalog.</p>
                        </div>
                    </div>

                    <ProductForm 
                        categories={categories} 
                        action="/products" 
                        submitLabel="Create Product"
                    />
                </div>
            </AuthenticatedLayout>
        </>
    );
}
