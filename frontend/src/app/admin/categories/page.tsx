'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Plus, Edit2, Trash2, FolderTree, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const defaultForm = {
  name: '',
  slug: '',
  description: '',
  parentId: '',
  imageUrl: '',
  sortOrder: '0',
  active: true,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = useCallback(() => {
    setLoading(true);
    setError('');
    api.getCategories()
      .then((res: any) => {
        if (res.success) setCategories(res.data);
      })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEdit = (cat: any) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      parentId: cat.parentId || '',
      imageUrl: cat.imageUrl || '',
      sortOrder: String(cat.sortOrder ?? 0),
      active: cat.active !== false,
    });
    setModalOpen(true);
  };

  const openDelete = (cat: any) => {
    setDeleteTarget(cat);
    setDeleteModalOpen(true);
  };

  const slugify = (val: string) =>
    val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: editing ? prev.slug : slugify(name),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Category name is required'); return; }
    if (!form.slug.trim()) { toast.error('Slug is required'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        parentId: form.parentId || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        sortOrder: parseInt(form.sortOrder) || 0,
        active: form.active,
      };
      if (editing) {
        await api.updateCategory(editing.id, payload);
        toast.success('Category updated');
      } else {
        await api.createCategory(payload);
        toast.success('Category created');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteCategory(deleteTarget.id);
      toast.success('Category deleted');
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  const parentOptions = categories
    .filter((c) => c.id !== editing?.id)
    .map((c) => ({ value: c.id, label: c.name }));

  const getCategoryImage = (cat: any) => {
    if (cat.imageUrl) {
      const src = cat.imageUrl.startsWith('http') ? cat.imageUrl : `${process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:4000/uploads'}/${cat.imageUrl.replace(/^\//, '')}`;
      return src;
    }
    return null;
  };

  const gradientColors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-pink-600',
    'from-rose-500 to-red-600',
    'from-amber-500 to-yellow-600',
    'from-indigo-500 to-blue-600',
    'from-fuchsia-500 to-pink-600',
  ];

  const getGradient = (index: number) => gradientColors[index % gradientColors.length];

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Categories</h1>
            <p className="text-sm text-gray-500 mt-1">Organize your products into categories</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Add Category
          </Button>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={fetchCategories} />
        ) : loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-0">
                <Skeleton variant="rectangular" className="h-40 w-full rounded-none" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-14" />
                  </div>
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            title="No categories yet"
            description="Create your first category to start organizing products"
            icon={<FolderTree className="w-8 h-8 text-gray-400" />}
            action={{ label: 'Add Category', onClick: openCreate }}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, index) => {
              const imageSrc = getCategoryImage(cat);
              const firstLetter = cat.name?.charAt(0)?.toUpperCase() || '?';
              return (
                <Card key={cat.id} hover className="group">
                  <div className="relative h-40 overflow-hidden">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={cn(
                      'w-full h-full flex items-center justify-center bg-gradient-to-br',
                      getGradient(index),
                      imageSrc ? 'hidden' : ''
                    )}>
                      <span className="text-5xl font-bold text-white/90 drop-shadow-sm">
                        {firstLetter}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 flex gap-1.5">
                      {cat.active !== false ? (
                        <Badge variant="success" size="sm">Active</Badge>
                      ) : (
                        <Badge variant="danger" size="sm">Inactive</Badge>
                      )}
                      {cat._count?.products > 0 && (
                        <Badge variant="primary" size="sm">
                          {cat._count.products}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">{cat.name}</h3>
                        <p className="text-xs text-gray-400 truncate">/{cat.slug}</p>
                      </div>
                      <div className="flex gap-0.5 ml-2 shrink-0">
                        <button
                          onClick={() => openEdit(cat)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        <button
                          onClick={() => openDelete(cat)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500 transition-colors" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span>Sort: {cat.sortOrder ?? 0}</span>
                      {cat.parent && (
                        <span className="flex items-center gap-1">
                          <ChevronRight className="w-3 h-3" />
                          {cat.parent.name}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Category' : 'Add Category'}
        size="lg"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Name *"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Summer Collection"
            />
            <Input
              label="Slug *"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
              placeholder="e.g. summer-collection"
            />
          </div>
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe this category..."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Parent Category"
              options={[{ value: '', label: 'None (Top-level)' }, ...parentOptions]}
              value={form.parentId}
              onChange={(e) => setForm({ ...form, parentId: e.target.value })}
            />
            <Input
              label="Sort Order"
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              placeholder="0"
            />
          </div>
          <Input
            label="Image URL"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
            </label>
            <span className="text-sm font-medium text-gray-700">Active</span>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} isLoading={saving}>
            {editing ? 'Update Category' : 'Create Category'}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => { if (!deleting) { setDeleteModalOpen(false); setDeleteTarget(null); } }}
        title="Delete Category"
        size="sm"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete <strong className="text-gray-900">{deleteTarget?.name}</strong>?
          {deleteTarget?._count?.products > 0 && (
            <span className="block mt-2 text-red-600">
              This category has {deleteTarget._count.products} product(s) associated with it.
            </span>
          )}
        </p>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => { setDeleteModalOpen(false); setDeleteTarget(null); }} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={deleting}>
            Delete Category
          </Button>
        </div>
      </Modal>
    </>
  );
}
