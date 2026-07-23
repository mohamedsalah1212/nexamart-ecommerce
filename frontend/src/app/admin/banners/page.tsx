'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { cn, apiFetch, API_URL } from '@/lib/utils';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    desktopImage: '',
    link: '/products',
    isActive: true,
  });

  const loadBanners = async () => {
    try {
      const data = await apiFetch('/banners');
      setBanners(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadBanners(); }, []);

  const openAddModal = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      desktopImage: '',
      link: '/products',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (b: any) => {
    setEditingBanner(b);
    setFormData({
      title: b.title || '',
      subtitle: b.subtitle || '',
      desktopImage: b.desktopImage || '',
      link: b.link || '/products',
      isActive: !!b.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.desktopImage) {
      alert('Banner Image URL is required');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingBanner) {
        await apiFetch(`/banners/${editingBanner.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      } else {
        await apiFetch('/banners', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }
      setIsModalOpen(false);
      loadBanners();
    } catch (err: any) {
      alert(err.message || 'Failed to save banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await apiFetch(`/banners/${id}`, { method: 'PUT', body: JSON.stringify({ isActive: !current }) });
      loadBanners();
    } catch (err) {
      alert('Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    try {
      await apiFetch(`/banners/${id}`, { method: 'DELETE' });
      loadBanners();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-sm text-gray-500 mt-1">{banners.length} banners</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Banner
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Preview</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Title</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Order</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Schedule</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-500">Loading...</td></tr>
              ) : banners.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-500">No banners found</td></tr>
              ) : banners.map((b) => (
                <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="w-20 h-12 rounded-lg bg-gray-100 overflow-hidden">
                      <img src={b.desktopImage} alt="" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">{b.title || 'Untitled'}</td>
                  <td className="py-3 px-4 text-gray-600">{b.order ?? 1}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => toggleActive(b.id, b.isActive)}
                      className={cn('flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full', b.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500')}>
                      {b.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                      {b.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    {b.startDate ? `${new Date(b.startDate).toLocaleDateString()}` : 'No schedule'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEditModal(b)} className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded"><Edit3 size={14} /></button>
                      <button onClick={() => handleDelete(b.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-bold text-gray-900">{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Banner Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Summer Sale 50% Off"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Premium kitchen & home smart gadgets"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Banner Image *</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
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
                        if (data.url) setFormData(prev => ({ ...prev, desktopImage: data.url }));
                      } catch (err) {
                        alert('Failed to upload image');
                      }
                    }}
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                  />
                  <input
                    type="text"
                    required
                    value={formData.desktopImage}
                    onChange={e => setFormData({ ...formData, desktopImage: e.target.value })}
                    className="input-field text-xs"
                    placeholder="Or paste image URL here..."
                  />
                  {formData.desktopImage && (
                    <div className="w-32 h-16 rounded-lg bg-gray-100 overflow-hidden border">
                      <img src={formData.desktopImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Click Link</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={e => setFormData({ ...formData, link: e.target.value })}
                  className="input-field"
                  placeholder="/products or /category/home-gadgets"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-primary-500"
                />
                <label htmlFor="isActive" className="text-xs font-medium text-gray-700 cursor-pointer">
                  Active (Visible on Homepage)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

