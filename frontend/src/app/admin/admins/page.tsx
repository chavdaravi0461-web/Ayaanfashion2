'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { toast } from 'react-hot-toast';

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(false);
    setAdmins([JSON.parse(localStorage.getItem('admin_user') || '{}')]);
  }, []);

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password) { toast.error('All fields required'); return; }
    setSaving(true);
    try {
      toast.success('Admin creation requires superadmin privileges');
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Admins</h1>
            <p className="text-gray-500">Manage admin accounts</p>
          </div>
          <Button onClick={() => setModalOpen(true)}>Add Admin</Button>
        </div>

        {error ? <ErrorState message={error} /> :
         loading ? <TableSkeleton rows={3} cols={4} /> :
         admins.length === 0 ? <EmptyState title="No admins" /> : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admins.map((a: any) => (
                  <tr key={a.id || a.email} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                    <td className="px-4 py-3 text-gray-500">{a.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                        {a.role || 'admin'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Admin" size="sm">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} options={[{ value: 'admin', label: 'Admin' }, { value: 'superadmin', label: 'Super Admin' }]} />
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd} isLoading={saving}>Add Admin</Button>
        </div>
      </Modal>
    </>
  );
}
