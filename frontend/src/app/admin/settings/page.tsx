'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { apiFetch } from '@/lib/utils';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
    } catch (err) {
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
        <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-green-700 text-sm">Settings saved successfully!</div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">General</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input value={settings.site_name || ''} onChange={(e) => updateSetting('site_name', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
              <textarea value={settings.site_description || ''} onChange={(e) => updateSetting('site_description', e.target.value)} className="input-field" rows={2} />
            </div>
          </div>
        </div>

        <hr />

        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Contact</h2>
          <div className="space-y-4">
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
        </div>

        <hr />

        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Social Media</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
              <input value={settings.social_facebook || ''} onChange={(e) => updateSetting('social_facebook', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
              <input value={settings.social_instagram || ''} onChange={(e) => updateSetting('social_instagram', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
              <input value={settings.social_twitter || ''} onChange={(e) => updateSetting('social_twitter', e.target.value)} className="input-field" />
            </div>
          </div>
        </div>

        <hr />

        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Store Info</h2>
          <div className="space-y-4">
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
      </div>
    </div>
  );
}
