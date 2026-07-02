'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ code: '', description: '', discount: '0', type: 'flat', minOrder: '0', maxUses: '0', isActive: true, expiresAt: '' });
  const [saving, setSaving] = useState(false);

  const fetchCoupons = () => {
    setLoading(true);
    api.getCoupons()
      .then((res: any) => { if (res.success) setCoupons(res.data); })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ code: '', description: '', discount: '0', type: 'flat', minOrder: '0', maxUses: '0', isActive: true, expiresAt: '' });
    setModalOpen(true);
  };

  const openEdit = (c: any) => {
    setEditing(c);
    setForm({
      code: c.code, description: c.description || '', discount: String(c.discount), type: c.type,
      minOrder: String(c.minOrder), maxUses: String(c.maxUses), isActive: c.isActive,
      expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().split('T')[0] : '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.discount) { toast.error('Code and discount are required'); return; }
    setSaving(true);
    try {
      const data = { ...form, discount: parseFloat(form.discount), minOrder: parseFloat(form.minOrder), maxUses: parseInt(form.maxUses) };
      if (editing) { await api.updateCoupon(editing.id, data); toast.success('Coupon updated'); }
      else { await api.createCoupon(data); toast.success('Coupon created'); }
      setModalOpen(false); fetchCoupons();
    } catch (err: any) { toast.error(err.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try { await api.deleteCoupon(id); toast.success('Coupon deleted'); fetchCoupons(); }
    catch (err: any) { toast.error(err.message); }
  };

  const isExpired = (date: string) => date && new Date(date) < new Date();

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Coupons</h1>
            <p className="text-gray-500">Manage discount coupons</p>
          </div>
          <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Coupon</Button>
        </div>

        {error ? <ErrorState message={error} onRetry={fetchCoupons} /> :
         loading ? <TableSkeleton rows={5} cols={5} /> :
         coupons.length === 0 ? <EmptyState title="No coupons" action={{ label: 'Add Coupon', onClick: openCreate }} /> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coupons.map((c) => (
              <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-mono font-bold text-gray-900 text-lg">{c.code}</h3>
                    <p className="text-xs text-gray-500">{c.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="p-1 rounded hover:bg-gray-100"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1 rounded hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-primary-600">{c.type === 'percentage' ? `${c.discount}%` : formatPrice(c.discount)}</span>
                  <span className="text-xs text-gray-500">OFF</span>
                </div>
                <div className="space-y-1 text-xs text-gray-500">
                  <p>Min order: {formatPrice(c.minOrder)}</p>
                  <p>Used: {c.usedCount}/{c.maxUses || '∞'}</p>
                  {c.expiresAt && <p className={isExpired(c.expiresAt) ? 'text-red-500' : ''}>Expires: {new Date(c.expiresAt).toLocaleDateString()}</p>}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.isActive && !isExpired(c.expiresAt) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {c.isActive && !isExpired(c.expiresAt) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {c.isActive && !isExpired(c.expiresAt) ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Coupon' : 'Add Coupon'} size="md">
        <div className="space-y-4">
          <Input label="Coupon Code *" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER20" />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Discount *" type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
            <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={[{ value: 'flat', label: 'Flat' }, { value: 'percentage', label: 'Percentage' }]} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Min Order" type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} />
            <Input label="Max Uses (0 = unlimited)" type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
          </div>
          <Input label="Expiry Date" type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
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
