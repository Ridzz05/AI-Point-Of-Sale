'use client';

import { useState, useEffect } from 'react';
import { productsApi } from '@/lib/api';
import {
  Plus,
  MagnifyingGlass,
  Trash,
  X,
  Warning,
  Package,
  CircleNotch,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string | null;
  is_active: boolean;
}

export function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsApi.getAll() as { data: Product[] };
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await productsApi.create({
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        description: formData.description,
      });
      setShowForm(false);
      setFormData({ name: '', category: '', price: '', stock: '', description: '' });
      loadProducts();
    } catch (error) {
      console.error('Failed to create product:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productsApi.delete(id);
      loadProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-11 pos-skeleton rounded-lg" />
      <div className="pos-card h-64 pos-skeleton" />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Products</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage your inventory and product catalog</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={cn(
            "pos-btn-primary flex items-center gap-2",
            showForm && "bg-slate-600 hover:bg-slate-700"
          )}
        >
          {showForm ? <X size={16} /> : <Plus size={16} weight="bold" />}
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {/* Add Product Form */}
      {showForm && (
        <div className="pos-card overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2.5">
            <Package size={16} className="text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900">New Product</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="pos-label">Product name *</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Cappuccino"
                  className="pos-input"
                />
              </div>
              <div>
                <label className="pos-label">Category *</label>
                <input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  placeholder="e.g. Coffee, Food"
                  className="pos-input"
                />
              </div>
              <div>
                <label className="pos-label">Price (Rp) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  placeholder="0"
                  min="0"
                  className="pos-input"
                />
              </div>
              <div>
                <label className="pos-label">Initial stock *</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                  placeholder="0"
                  min="0"
                  className="pos-input"
                />
              </div>
            </div>
            <div>
              <label className="pos-label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional product description..."
                className="pos-textarea h-24"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="pos-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="pos-btn-primary flex items-center gap-2"
              >
                {saving && <CircleNotch size={14} className="animate-spin" />}
                Save product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlass
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          placeholder="Search products by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pos-input pl-10 w-full md:w-80"
        />
      </div>

      {/* Products Table */}
      <div className="pos-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Inventory</h3>
          <span className="pos-badge-gray">{filteredProducts.length} items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="pos-table-header">Product</th>
                <th className="pos-table-header">Category</th>
                <th className="pos-table-header text-right">Price</th>
                <th className="pos-table-header text-center">Stock</th>
                <th className="pos-table-header text-center">Status</th>
                <th className="pos-table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors duration-100">
                  <td className="pos-table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-indigo-600">
                          {product.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{product.name}</p>
                        {product.description && (
                          <p className="text-xs text-slate-400 truncate max-w-[220px] mt-0.5">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="pos-table-cell">
                    <span className="pos-badge-gray">{product.category}</span>
                  </td>
                  <td className="pos-table-cell text-right">
                    <span className="text-sm font-semibold text-slate-900">
                      Rp {product.price.toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td className="pos-table-cell text-center">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 text-sm font-medium",
                      product.stock < 10 ? "text-red-600" : "text-slate-700"
                    )}>
                      {product.stock < 10 && (
                        <Warning size={13} weight="fill" className="text-red-500" />
                      )}
                      {product.stock}
                    </div>
                  </td>
                  <td className="pos-table-cell text-center">
                    {product.is_active
                      ? <span className="pos-badge-green">Active</span>
                      : <span className="pos-badge-gray">Inactive</span>
                    }
                  </td>
                  <td className="pos-table-cell text-right">
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-150"
                      title="Delete product"
                    >
                      <Trash size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <Package size={28} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No products found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
