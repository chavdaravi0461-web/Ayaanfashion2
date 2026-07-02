'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getSettings()
      .then((res: any) => {
        if (res.success) {
          const map: Record<string, string> = {};
          if (Array.isArray(res.data)) {
            res.data.forEach((s: any) => { map[s.key] = s.value; });
          } else {
            Object.assign(map, res.data);
          }
          setSettings(map);
        }
      })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateSettings(settings);
      toast.success('Settings updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const update = (key: string, value: string) => setSettings((prev) => ({ ...prev, [key]: value }));

  const fields = [
    { key: 'site_name', label: 'Site Name', type: 'text' },
    { key: 'site_description', label: 'Site Description', type: 'textarea' },
    { key: 'site_email', label: 'Contact Email', type: 'email' },
    { key: 'site_phone', label: 'Contact Phone', type: 'text' },
    { key: 'site_address', label: 'Address', type: 'textarea' },
    { key: 'shipping_cost', label: 'Shipping Cost', type: 'number' },
    { key: 'free_shipping_min', label: 'Free Shipping Min Amount', type: 'number' },
    { key: 'tax_percentage', label: 'Tax Percentage', type: 'number' },
    { key: 'currency', label: 'Currency Symbol', type: 'text' },
    { key: 'social_instagram', label: 'Instagram URL', type: 'text' },
    { key: 'social_facebook', label: 'Facebook URL', type: 'text' },
    { key: 'social_youtube', label: 'YouTube URL', type: 'text' },
  ];

  return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Manage store settings</p>
        </div>

        {error ? <ErrorState message={error} onRetry={() => window.location.reload()} /> :
         loading ? <div className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div> : (
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            {fields.map((f) => (
              f.type === 'textarea' ? (
                <Textarea key={f.key} label={f.label} value={settings[f.key] || ''} onChange={(e) => update(f.key, e.target.value)} />
              ) : (
                <Input key={f.key} label={f.label} type={f.type} value={settings[f.key] || ''} onChange={(e) => update(f.key, e.target.value)} />
              )
            ))}
            <Button onClick={handleSave} isLoading={saving} size="lg">Save Settings</Button>
          </div>
        )}
      </div>
  );
}
