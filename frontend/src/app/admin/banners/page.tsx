'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: '', subtitle: '', link: '', linkText: '', sortOrder: '0', isActive: true });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchBanners = () => {
    setLoading(true);
    api.getBanners()
      .then((res: any) => { if (res.success) setBanners(res.data); })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBanners(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', subtitle: '', link: '', linkText: '', sortOrder: '0', isActive: true });
    setImageFile(null);
    setModalOpen(true);
  };

  const openEdit = (b: any) => {
    setEditing(b);
    setForm({ title: b.title, subtitle: b.subtitle || '', link: b.link || '', linkText: b.linkText || '', sortOrder: String(b.sortOrder), isActive: b.isActive });
    setImageFile(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      let imageUrl = editing?.image || '';
      if (imageFile) {
        const uploadRes = await api.uploadFile(imageFile);
        if (uploadRes.success) imageUrl = uploadRes.data.url;
      }
      const data = { ...form, sortOrder: parseInt(form.sortOrder), image: imageUrl };
      if (editing) { await api.updateBanner(editing.id, data); toast.success('Banner updated'); }
      else { await api.createBanner(data); toast.success('Banner created'); }
      setModalOpen(false);
      fetchBanners();
    } catch (err: any) { toast.error(err.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    try { await api.deleteBanner(id); toast.success('Banner deleted'); fetchBanners(); }
    catch (err: any) { toast.error(err.message); }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Banners</h1>
            <p className="text-gray-500">Manage homepage banners</p>
          </div>
          <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Banner</Button>
        </div>

        {error ? <ErrorState message={error} onRetry={fetchBanners} /> :
         loading ? <TableSkeleton rows={4} cols={4} /> :
         banners.length === 0 ? <EmptyState title="No banners" action={{ label: 'Add Banner', onClick: openCreate }} /> : (
          <div className="grid gap-6">
            {banners.map((b) => (
              <div key={b.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col sm:flex-row">
                <div className="sm:w-48 h-32 bg-gray-100 flex-shrink-0">
                  {b.image ? <img src={getImageUrl(b.image)} alt={b.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>}
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{b.title}</h3>
                    {b.subtitle && <p className="text-sm text-gray-500">{b.subtitle}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>Order: {b.sortOrder}</span>
                      {b.link && <span>Link: {b.link}</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {b.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-gray-100"><Edit2 className="w-4 h-4 text-gray-500" /></button>
                      <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Banner' : 'Add Banner'} size="md">
        <div className="space-y-4">
          <Input label="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Link URL" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="/shop" />
            <Input label="Link Text" value={form.linkText} onChange={(e) => setForm({ ...form, linkText: e.target.value })} placeholder="Shop Now" />
          </div>
          <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Image</p>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="text-sm" />
            {editing?.image && <img src={getImageUrl(editing.image)} alt="" className="w-32 h-20 object-cover rounded-lg mt-2" />}
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded text-primary-600" />
            <span className="text-sm">Active</span>
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} isLoading={saving}>{editing ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>
    </>
  );
}
