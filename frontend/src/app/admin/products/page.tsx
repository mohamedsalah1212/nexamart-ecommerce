'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, Copy, Eye, X, Image as ImageIcon } from 'lucide-react';
import { cn, formatPrice, apiFetch, API_URL } from '@/lib/utils';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discountPrice: '',
    categoryId: '',
    brand: '',
    sku: '',
    shortDescription: '',
    description: '',
    deliveryTime: '2-5 Business Days',
    imageUrl: '',
    imageUrls: [] as string[],
    variants: [] as any[],
    isFeatured: false,
    isBestSeller: false,
    isTrending: false,
    isFlashDeal: false,
    availability: true,
  });

  const loadProducts = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      const data = await apiFetch(`/products?${params}`);
      setProducts(data.products || []);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await apiFetch('/categories');
      setCategories(cats || []);
      if (cats?.length > 0 && !formData.categoryId) {
        setFormData(prev => ({ ...prev, categoryId: cats[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      discountPrice: '',
      categoryId: categories[0]?.id || '',
      brand: '',
      sku: '',
      shortDescription: '',
      description: '',
      deliveryTime: '2-5 Business Days',
      imageUrl: '',
      imageUrls: [],
      variants: [],
      isFeatured: false,
      isBestSeller: false,
      isTrending: false,
      isFlashDeal: false,
      availability: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    const existingUrls = p.images?.map((img: any) => img.url) || (p.mainImage ? [p.mainImage] : []);
    setFormData({
      name: p.name || '',
      price: p.price ? String(p.price) : '',
      discountPrice: p.discountPrice ? String(p.discountPrice) : '',
      categoryId: p.categoryId || (categories[0]?.id || ''),
      brand: p.brand || '',
      sku: p.sku || '',
      shortDescription: p.shortDescription || '',
      description: p.description || '',
      deliveryTime: p.deliveryTime || '2-5 Business Days',
      imageUrl: existingUrls[0] || '',
      imageUrls: existingUrls,
      variants: p.variants || [],
      isFeatured: !!p.isFeatured,
      isBestSeller: !!p.isBestSeller,
      isTrending: !!p.isTrending,
      isFlashDeal: !!p.isFlashDeal,
      availability: p.availability !== false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.categoryId) {
      alert('Please fill in Name, Price, and Category');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        imageUrls: formData.imageUrls.length > 0 ? formData.imageUrls : (formData.imageUrl ? [formData.imageUrl] : []),
      };

      if (editingProduct) {
        await apiFetch(`/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setIsModalOpen(false);
      loadProducts(pagination.page);
    } catch (err: any) {
      alert(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await apiFetch(`/products/${id}`, { method: 'DELETE' });
      loadProducts(pagination.page);
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await apiFetch(`/products/${id}/duplicate`, { method: 'POST' });
      loadProducts(pagination.page);
    } catch (err) {
      alert('Failed to duplicate');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{pagination.total || 0} total products</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadProducts()}
            className="input-field pl-9"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Product</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Category</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Price</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Tags</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-500">Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-500">No products found</td></tr>
              ) : products.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {p.mainImage ? <img src={p.mainImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={18} /></div>}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate max-w-[200px]">{p.name}</p>
                        <p className="text-xs text-gray-400">SKU: {p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{p.category?.name}</td>
                  <td className="py-3 px-4">
                    <span className="font-medium">{formatPrice(p.discountPrice || p.price)}</span>
                    {p.discountPrice && <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(p.price)}</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn('badge text-xs', p.availability ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>
                      {p.availability ? 'Available' : 'Hidden'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 flex-wrap">
                      {p.isFeatured && <span className="badge-primary text-[10px]">Featured</span>}
                      {p.isBestSeller && <span className="badge bg-orange-50 text-orange-700 text-[10px]">Best Seller</span>}
                      {p.isTrending && <span className="badge bg-purple-50 text-purple-700 text-[10px]">Trending</span>}
                      {p.isFlashDeal && <span className="badge bg-red-50 text-red-700 text-[10px]">Flash</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEditModal(p)} className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded"><Edit3 size={14} /></button>
                      <button onClick={() => handleDuplicate(p.id)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded"><Copy size={14} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }).map((_, i) => (
            <button key={i} onClick={() => loadProducts(i + 1)}
              className={cn('w-8 h-8 rounded text-sm font-medium', pagination.page === i + 1 ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-bold text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Electric Garlic Chopper"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    className="input-field"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Price (EGP) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="input-field"
                    placeholder="299.99"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Discount Price (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discountPrice}
                    onChange={e => setFormData({ ...formData, discountPrice: e.target.value })}
                    className="input-field"
                    placeholder="199.99"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Nexa"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Product Images (Upload multiple)</label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length === 0) return;
                      const uploadedUrls: string[] = [];
                      for (const file of files) {
                        const body = new FormData();
                        body.append('file', file);
                        try {
                          const res = await fetch(`${API_URL}/upload`, {
                            method: 'POST',
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`,
                            },
                            body,
                          });
                          const data = await res.json();
                          if (data.url) uploadedUrls.push(data.url);
                        } catch (err) {
                          console.error('Upload error', err);
                        }
                      }
                      if (uploadedUrls.length > 0) {
                        setFormData(prev => ({
                          ...prev,
                          imageUrls: [...prev.imageUrls, ...uploadedUrls],
                          imageUrl: prev.imageUrl || uploadedUrls[0],
                        }));
                      }
                    }}
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="extraImageUrlInput"
                      placeholder="Or paste Image URL & click Add..."
                      className="input-field text-xs flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) {
                            setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, val], imageUrl: prev.imageUrl || val }));
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('extraImageUrlInput') as HTMLInputElement;
                        const val = el?.value.trim();
                        if (val) {
                          setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, val], imageUrl: prev.imageUrl || val }));
                          el.value = '';
                        }
                      }}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded-lg text-gray-700"
                    >
                      + Add URL
                    </button>
                  </div>

                  {/* Thumbnail gallery preview with reordering & delete */}
                  {formData.imageUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {formData.imageUrls.map((url, idx) => (
                        <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                          <img src={url} alt={`Product image ${idx + 1}`} className="w-full h-full object-cover" />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 bg-primary-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                              Main
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.imageUrls.filter((_, i) => i !== idx);
                              setFormData(prev => ({
                                ...prev,
                                imageUrls: updated,
                                imageUrl: updated[0] || '',
                              }));
                            }}
                            className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── VARIANT BUILDER ── */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">Product Variants (Colors & Sizes)</h3>
                    <p className="text-[11px] text-gray-500">Add colors (with optional color images) & sizes (with custom prices)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        variants: [
                          ...prev.variants,
                          { colorName: '', sizeName: '', price: '', imageUrl: '' },
                        ],
                      }));
                    }}
                    className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
                  >
                    + Add Variant
                  </button>
                </div>

                {formData.variants.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {formData.variants.map((v, idx) => (
                      <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-white p-2.5 rounded-lg border border-gray-200 text-xs">
                        {/* Color Name */}
                        <div className="w-full sm:w-1/4">
                          <input
                            type="text"
                            placeholder="Color (e.g. Red, أسود)"
                            value={v.colorName || ''}
                            onChange={(e) => {
                              const updated = [...formData.variants];
                              updated[idx].colorName = e.target.value;
                              setFormData({ ...formData, variants: updated });
                            }}
                            className="input-field py-1 text-xs"
                          />
                        </div>

                        {/* Size Name */}
                        <div className="w-full sm:w-1/4">
                          <input
                            type="text"
                            placeholder="Size (e.g. 28cm, Large)"
                            value={v.sizeName || ''}
                            onChange={(e) => {
                              const updated = [...formData.variants];
                              updated[idx].sizeName = e.target.value;
                              setFormData({ ...formData, variants: updated });
                            }}
                            className="input-field py-1 text-xs"
                          />
                        </div>

                        {/* Variant Custom Price */}
                        <div className="w-full sm:w-1/4">
                          <input
                            type="number"
                            step="0.01"
                            placeholder={`Price (Default: ${formData.price || '0'})`}
                            value={v.price || ''}
                            onChange={(e) => {
                              const updated = [...formData.variants];
                              updated[idx].price = e.target.value;
                              setFormData({ ...formData, variants: updated });
                            }}
                            className="input-field py-1 text-xs"
                          />
                        </div>

                        {/* Color Image URL */}
                        <div className="w-full sm:w-1/4">
                          <input
                            type="text"
                            placeholder="Color Image URL"
                            value={v.imageUrl || ''}
                            onChange={(e) => {
                              const updated = [...formData.variants];
                              updated[idx].imageUrl = e.target.value;
                              setFormData({ ...formData, variants: updated });
                            }}
                            className="input-field py-1 text-xs"
                          />
                        </div>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.variants.filter((_, i) => i !== idx);
                            setFormData({ ...formData, variants: updated });
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })} className="rounded text-primary-500" />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={formData.isBestSeller} onChange={e => setFormData({ ...formData, isBestSeller: e.target.checked })} className="rounded text-primary-500" />
                  Best Seller
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={formData.isTrending} onChange={e => setFormData({ ...formData, isTrending: e.target.checked })} className="rounded text-primary-500" />
                  Trending
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={formData.isFlashDeal} onChange={e => setFormData({ ...formData, isFlashDeal: e.target.checked })} className="rounded text-primary-500" />
                  Flash Deal
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

