'use client';

import { useState, useEffect } from 'react';
import { productsApi } from '@/lib/api';
import { 
  Plus, 
  MagnifyingGlass, 
  Trash, 
  X,
  Warning,
  Selection
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
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('DELETE_THIS_DATA_PERMANENTLY?')) return;
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
    <div className="flex items-center justify-center h-64 border-4 border-black animate-pulse bg-white">
      <span className="text-xl font-black uppercase tracking-[0.5em]">Inventory_Loading_...</span>
    </div>
  );

  return (
    <div className="space-y-10">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative brutal-card bg-white p-0">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={24} weight="bold" />
          <input
            placeholder="SEARCH_INVENTORY_QUERY..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-16 pl-14 bg-white text-sm font-black uppercase tracking-tight focus:outline-none focus:bg-[#D4FF00] transition-none placeholder:text-black/20 font-mono"
          />
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={cn(
            "h-16 px-10 font-black uppercase text-sm tracking-[0.2em] flex items-center justify-center gap-4 transition-none border-4 border-black shadow-[6px_6px_0px_0px_#000] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none",
            showForm ? "bg-white text-black" : "bg-black text-white hover:bg-[#D4FF00] hover:text-black"
          )}
        >
          {showForm ? <X size={24} weight="bold" /> : <Plus size={24} weight="bold" />}
          {showForm ? 'Abort_Write' : 'Add_New_Entry'}
        </button>
      </div>

      {/* Entry Form */}
      {showForm && (
        <div className="brutal-card-lg bg-white p-0 animate-in slide-in-from-top-4 duration-300">
          <div className="p-6 border-b-4 border-black bg-black text-white flex justify-between items-center italic">
            <h3 className="text-lg font-black uppercase tracking-tighter">New_Product_Write_Interface</h3>
            <p className="text-xs font-bold opacity-50 uppercase tracking-widest">Buffer_Memory_Locked</p>
          </div>
          <form onSubmit={handleSubmit} className="p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">Label_Identifier</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="brutal-input w-full"
                  placeholder="NAME_REQUIRED"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">Class_Category</label>
                <input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="brutal-input w-full"
                  placeholder="CATEGORY_REQUIRED"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">Unit_Price_Value</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="brutal-input w-full"
                  placeholder="VALUE_RP"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">Initial_Capacity_QTY</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                  className="brutal-input w-full"
                  placeholder="QUANTITY"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">Context_Metadata</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="brutal-input w-full h-32 resize-none"
              />
            </div>
            <div className="flex justify-end gap-6 pt-6 border-t-4 border-black">
              <button type="button" onClick={() => setShowForm(false)} className="px-10 py-4 font-black uppercase text-xs hover:bg-[#F4F4F0] border-4 border-black transition-none">Discard_Data</button>
              <button type="submit" className="px-12 py-4 bg-black text-white font-black uppercase text-xs hover:bg-[#D4FF00] hover:text-black border-4 border-black shadow-[6px_6px_0px_0px_#000] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-none italic">Commit_to_DB</button>
            </div>
          </form>
        </div>
      )}

      {/* Inventory List */}
      <div className="brutal-card p-0 bg-white overflow-hidden">
        <div className="p-6 border-b-4 border-black bg-[#F4F4F0] flex justify-between items-center italic">
          <h3 className="text-xl font-black uppercase tracking-tighter underline decoration-4 underline-offset-4">Inventory_Ledger</h3>
          <div className="bg-black text-white px-4 py-2 text-xs font-black uppercase tracking-widest">
            ROWS: {filteredProducts.length}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="brutal-table-header text-left">Product_Meta</th>
                <th className="brutal-table-header text-center">Class</th>
                <th className="brutal-table-header text-right">Price_Unit</th>
                <th className="brutal-table-header text-center">Stock_Qty</th>
                <th className="brutal-table-header text-center">Status</th>
                <th className="brutal-table-header text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-black">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-[#D4FF00] hover:text-black transition-none group cursor-default">
                  <td className="brutal-table-cell">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 border-4 border-black flex items-center justify-center font-black group-hover:bg-black group-hover:text-white shrink-0 text-xl">
                        {product.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-lg font-black uppercase tracking-tighter">{product.name}</p>
                        <p className="text-[10px] font-bold opacity-60 uppercase truncate max-w-[300px] mt-1 italic tracking-widest">
                          {product.description || 'NULL_DATA_FIELD'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="brutal-table-cell text-center">
                    <span className="brutal-badge group-hover:bg-black group-hover:text-white">
                      {product.category}
                    </span>
                  </td>
                  <td className="brutal-table-cell text-right font-black italic text-lg">
                    {product.price.toLocaleString()}
                  </td>
                  <td className="brutal-table-cell text-center">
                    <div className={cn(
                      "font-black text-lg",
                      product.stock < 10 ? "text-[#FF003C] group-hover:bg-black px-2 inline-block" : ""
                    )}>
                      {product.stock.toString().padStart(3, '0')}
                      {product.stock < 10 && <Warning size={16} weight="bold" className="inline ml-2" />}
                    </div>
                  </td>
                  <td className="brutal-table-cell text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className={cn("w-3 h-3 border-2 border-black", product.is_active ? "bg-[#00FF41]" : "bg-gray-300")} />
                      <span className="text-[10px] font-black uppercase italic tracking-widest">
                        {product.is_active ? 'ENABLED' : 'OFFLINE'}
                      </span>
                    </div>
                  </td>
                  <td className="brutal-table-cell text-right">
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-3 border-4 border-black bg-white text-black group-hover:bg-[#FF003C] group-hover:text-white transition-none"
                    >
                      <Trash size={20} weight="bold" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="brutal-table-cell text-center py-32 text-gray-300 tracking-[1em] font-black uppercase">NO_RECORDS_FOUND</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
