'use client';

import { useState, useEffect } from 'react';
import { Save, Upload } from 'lucide-react';
import { apiFetch } from '@/lib/utils';

const THEMES = [
  { key: 'blue',    label: 'Blue',    color: '#3b82f6' },
  { key: 'emerald', label: 'Emerald', color: '#10b981' },
  { key: 'rose',    label: 'Rose',    color: '#f43f5e' },
  { key: 'violet',  label: 'Violet',  color: '#8b5cf6' },
  { key: 'amber',   label: 'Amber',   color: '#f59e0b' },
  { key: 'gray',    label: 'Gray',    color: '#6b7280' },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetch('/settings')
      .then(setSettings)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();
      if (data.url) updateSetting('site_logo', data.url);
    } catch {
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        await apiFetch('/settings', {
          method: 'PUT',
          body: JSON.stringify({ key, value }),
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your store settings</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="btn-primary flex items-center gap-2">
          <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saved && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-green-700 text-sm">
          Settings saved successfully!
        </div>
      )}

      {/* Branding */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
        <h2 className="font-semibold text-gray-900">Branding</h2>

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Store Logo</label>
          <div className="flex gap-3 items-start">
            <input
              value={settings.site_logo || ''}
              onChange={(e) => updateSetting('site_logo', e.target.value)}
              placeholder="https://... or upload below"
              className="input-field flex-1"
            />
            <label className="btn-secondary cursor-pointer flex items-center gap-2 whitespace-nowrap">
              <Upload size={14} />
              {isUploading ? 'Uploading...' : 'Upload'}
              <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
            </label>
          </div>
          {settings.site_logo && (
            <div className="mt-3 p-4 border border-gray-100 rounded-lg bg-gray-50 inline-block">
              <img src={settings.site_logo} alt="Logo Preview" className="h-10 object-contain" />
            </div>
          )}
        </div>

        {/* Theme Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Store Theme Color</label>
          <div className="flex flex-wrap gap-4">
            {THEMES.map((theme) => {
              const isActive = settings.site_theme === theme.key;
              return (
                <button
                  key={theme.key}
                  onClick={() => updateSetting('site_theme', theme.key)}
                  title={theme.label}
                  style={{ backgroundColor: theme.color }}
                  className={
                    isActive
                      ? 'w-12 h-12 rounded-full border-4 border-gray-900 scale-110 shadow-lg transition-all'
                      : 'w-12 h-12 rounded-full border-4 border-transparent hover:scale-105 transition-all'
                  }
                />
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Current: <strong>{settings.site_theme || 'blue'}</strong> — save and refresh to apply.
          </p>
        </div>
      </div>

      {/* General */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">General</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
          <input value={settings.site_name || ''} onChange={(e) => updateSetting('site_name', e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
          <textarea value={settings.site_description || ''} onChange={(e) => updateSetting('site_description', e.target.value)} className="input-field" rows={2} />
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Contact</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input value={settings.contact_email || ''} onChange={(e) => updateSetting('contact_email', e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input value={settings.contact_phone || ''} onChange={(e) => updateSetting('contact_phone', e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
          <input value={settings.whatsapp_number || ''} onChange={(e) => updateSetting('whatsapp_number', e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input value={settings.address || ''} onChange={(e) => updateSetting('address', e.target.value)} className="input-field" />
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Social Media</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
          <input value={settings.social_facebook || ''} onChange={(e) => updateSetting('social_facebook', e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
          <input value={settings.social_instagram || ''} onChange={(e) => updateSetting('social_instagram', e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Twitter / X</label>
          <input value={settings.social_twitter || ''} onChange={(e) => updateSetting('social_twitter', e.target.value)} className="input-field" />
        </div>
      </div>

      {/* Store Info */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Store Info</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Info</label>
          <input value={settings.delivery_info || ''} onChange={(e) => updateSetting('delivery_info', e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Info</label>
          <input value={settings.payment_info || ''} onChange={(e) => updateSetting('payment_info', e.target.value)} className="input-field" />
        </div>
      </div>
    </div>
  );
}
