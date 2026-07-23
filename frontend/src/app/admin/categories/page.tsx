'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, GripVertical, X } from 'lucide-react';
import { cn, apiFetch } from '@/lib/utils';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const loadCategories = async () => {
    try {
      const data = await apiFetch('/categories');
      setCategories(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name || '', description: cat.description || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Category Name is required');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await apiFetch(`/categories/${editingCategory.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      } else {
        await apiFetch('/categories', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await apiFetch(`/categories/${id}`, { method: 'DELETE' });
      loadCategories();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">{categories.length} categories</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-500 font-medium w-10"></th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Slug</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Products</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Order</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-500">Loading...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-500">No categories found</td></tr>
              ) : categories.map((cat, i) => (
                <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-300"><GripVertical size={16} /></td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-500 text-xs font-bold">
                        {cat.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{cat.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{cat.slug}</td>
                  <td className="py-3 px-4 text-gray-600">{cat._count?.products || 0}</td>
                  <td className="py-3 px-4 text-gray-600">{cat.order ?? i + 1}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEditModal(cat)} className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded"><Edit3 size={14} /></button>
                      <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-bold text-gray-900">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Smart Kitchen"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  placeholder="Brief overview of this category"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

