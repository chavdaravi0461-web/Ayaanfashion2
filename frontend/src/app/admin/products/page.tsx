'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Edit2, Trash2, LayoutGrid, List, ChevronUp, ChevronDown,
  Upload, X, Image as ImageIcon, Star, AlertTriangle, GripVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { api } from '@/lib/api';
import { formatPrice, getImageUrl, calculateDiscount, cn } from '@/lib/utils';

interface Variant {
  size: string;
  color: string;
  colorCode: string;
  stock: string;
  sku: string;
  price: string;
}

interface GalleryImage {
  id: string;
  url?: string;
  file?: File;
  preview?: string;
  isPrimary: boolean;
}

interface ProductForm {
  name: string;
  slug: string;
  description: string;
  mrp: string;
  salePrice: string;
  sku: string;
  stock: string;
  categoryId: string;
  tags: string;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  seoTitle: string;
  seoDescription: string;
}

const emptyForm: ProductForm = {
  name: '',
  slug: '',
  description: '',
  mrp: '',
  salePrice: '',
  sku: '',
  stock: '0',
  categoryId: '',
  tags: '',
  isActive: true,
  isFeatured: false,
  isNewArrival: false,
  isBestSeller: false,
  seoTitle: '',
  seoDescription: '',
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
];

const TABLE_COLUMNS = [
  { key: 'name', label: 'Product', sortable: true },
  { key: 'sku', label: 'SKU', sortable: true },
  { key: 'category', label: 'Category', sortable: false },
  { key: 'price', label: 'Price', sortable: true },
  { key: 'stock', label: 'Stock', sortable: true },
  { key: 'status', label: 'Status', sortable: false },
];

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function getStockLevel(stock: number): { label: string; variant: 'success' | 'warning' | 'danger' } {
  if (stock > 20) return { label: `${stock} in stock`, variant: 'success' };
  if (stock >= 5) return { label: `${stock} in stock`, variant: 'warning' };
  if (stock > 0) return { label: `${stock} in stock`, variant: 'danger' };
  return { label: 'Out of stock', variant: 'danger' };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [categories, setCategories] = useState<any[]>([]);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [saving, setSaving] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    api.getCategories().then((res: any) => {
      if (res.success) setCategories(res.data);
    }).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, any> = { page, limit: 15, sort };
      if (search) params.search = search;
      if (category) params.category = category;
      const res = await api.getProducts(params);
      if (res.success) {
        setProducts(res.data.items);
        setTotalPages(res.data.totalPages);
        setTotalItems(res.data.total);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, sort]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => { setPage(1); }, [search, category, sort]);

  const resetForm = () => {
    setForm(emptyForm);
    setGalleryImages([]);
    setVariants([]);
  };

  const openCreate = () => {
    setEditingProduct(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      mrp: String(product.mrp ?? ''),
      salePrice: String(product.salePrice ?? ''),
      sku: product.sku || '',
      stock: String(product.stock ?? '0'),
      categoryId: product.categoryId || '',
      tags: product.tags || '',
      isActive: product.isActive ?? true,
      isFeatured: product.isFeatured ?? false,
      isNewArrival: product.isNewArrival ?? false,
      isBestSeller: product.isBestSeller ?? false,
      seoTitle: product.seoTitle || '',
      seoDescription: product.seoDescription || '',
    });
    setGalleryImages(
      (product.images || []).map((img: any, i: number) => ({
        id: `existing-${i}`,
        url: img.url,
        isPrimary: img.isPrimary || i === 0,
      }))
    );
    setVariants(
      (product.variants || []).map((v: any) => ({
        size: v.size || '',
        color: v.color || '',
        colorCode: v.colorCode || '#000000',
        stock: String(v.stock ?? ''),
        sku: v.sku || '',
        price: String(v.price ?? ''),
      }))
    );
    setModalOpen(true);
  };

  const openDelete = (product: any) => {
    setDeletingProduct(product);
    setDeleteModalOpen(true);
  };

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (!sortColumn) return 0;
    const dir = sortDirection === 'asc' ? 1 : -1;
    switch (sortColumn) {
      case 'name':
        return dir * (a.name || '').localeCompare(b.name || '');
      case 'sku':
        return dir * (a.sku || '').localeCompare(b.sku || '');
      case 'price':
        return dir * ((Number(a.salePrice) || 0) - (Number(b.salePrice) || 0));
      case 'stock':
        return dir * ((Number(a.stock) || 0) - (Number(b.stock) || 0));
      default:
        return 0;
    }
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedProducts.map((p) => p.id)));
    }
  };

  const handleGalleryUpload = (files: FileList | null) => {
    if (!files) return;
    const newImages: GalleryImage[] = Array.from(files).map((file, i) => ({
      id: `new-${Date.now()}-${i}`,
      file,
      preview: URL.createObjectURL(file),
      isPrimary: galleryImages.length === 0 && i === 0,
    }));
    setGalleryImages((prev) => {
      const updated = [...prev, ...newImages];
      if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const removeGalleryImage = (id: string) => {
    setGalleryImages((prev) => {
      const removed = prev.find((img) => img.id === id);
      const filtered = prev.filter((img) => img.id !== id);
      if (removed?.isPrimary && filtered.length > 0) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  const setPrimaryImage = (id: string) => {
    setGalleryImages((prev) =>
      prev.map((img) => ({ ...img, isPrimary: img.id === id }))
    );
  };

  const handleVariantChange = (index: number, field: keyof Variant, value: string) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { size: '', color: '', colorCode: '#000000', stock: '', sku: '', price: '' },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!form.sku.trim()) {
      toast.error('SKU is required');
      return;
    }
    if (!form.categoryId) {
      toast.error('Please select a category');
      return;
    }

    setSaving(true);
    const loadingToast = toast.loading(editingProduct ? 'Updating product...' : 'Creating product...');

    try {
      const isCreating = !editingProduct;
      const numericMrp = parseFloat(form.mrp) || 0;
      const numericSalePrice = parseFloat(form.salePrice) || 0;

      const baseData: Record<string, any> = {
        ...form,
        name: form.name.trim(),
        sku: form.sku.trim(),
        mrp: numericMrp,
        salePrice: numericSalePrice,
        stock: parseInt(form.stock) || 0,
        discount: numericMrp > 0 ? calculateDiscount(numericMrp, numericSalePrice) : 0,
        variants: variants.length > 0 ? variants.map((v) => ({
          ...v,
          stock: parseInt(v.stock) || 0,
          price: parseFloat(v.price) || 0,
        })) : undefined,
      };

      if (!baseData.slug) {
        baseData.slug = generateSlug(form.name);
      }

      if (isCreating) {
        const res = await api.createProduct(baseData);
        if (!res.success) throw new Error('Failed to create product');

        const newFiles = galleryImages.filter((img) => img.file).map((img) => img.file!);
        const existingUrls = galleryImages.filter((img) => img.url).map((img) => img.url!);

        if (newFiles.length > 0) {
          void (async () => {
            try {
              const uploadRes = await api.uploadMultiple(newFiles);
              if (uploadRes.success) {
                const uploadedUrls = uploadRes.data.files.map((f: any) => f.url);
                const allUrls = [...existingUrls, ...uploadedUrls];
                if (allUrls.length > 0) {
                  await api.updateProduct(res.data.id, {
                    images: allUrls.map((url, i) => ({ url, isPrimary: i === 0 })),
                  });
                }
              }
            } catch (uploadError) {
              console.error('Image upload failed after product creation:', uploadError);
            }
          })();
        } else if (existingUrls.length > 0) {
          void (async () => {
            try {
              await api.updateProduct(res.data.id, {
                images: existingUrls.map((url, i) => ({ url, isPrimary: i === 0 })),
              });
            } catch (uploadError) {
              console.error('Image attach failed after product creation:', uploadError);
            }
          })();
        }

        toast.success('Product created successfully', { id: loadingToast });
      } else {
        const res = await api.updateProduct(editingProduct.id, baseData);
        if (!res.success) throw new Error('Failed to update product');

        const newFiles = galleryImages.filter((img) => img.file).map((img) => img.file!);
        let allUrls = galleryImages.filter((img) => img.url).map((img) => img.url!);

        if (newFiles.length > 0) {
          const uploadRes = await api.uploadMultiple(newFiles);
          if (uploadRes.success) {
            const uploadedUrls = uploadRes.data.files.map((f: any) => f.url);
            allUrls = [...allUrls, ...uploadedUrls];
          }
        }

        if (allUrls.length > 0) {
          await api.updateProduct(editingProduct.id, {
            images: allUrls.map((url, i) => ({ url, isPrimary: i === 0 })),
          });
        }

        toast.success('Product updated successfully', { id: loadingToast });
      }

      setModalOpen(false);
      setSelectedIds(new Set());
      await fetchProducts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save product', { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      await api.deleteProduct(deletingProduct.id);
      toast.success('Product deleted');
      setDeleteModalOpen(false);
      setDeletingProduct(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deletingProduct.id);
        return next;
      });
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} products?`)) return;
    setBulkDeleting(true);
    try {
      await Promise.all(Array.from(selectedIds).map((id) => api.deleteProduct(id)));
      toast.success(`${selectedIds.size} products deleted`);
      setSelectedIds(new Set());
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete products');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleBulkToggleActive = async (active: boolean) => {
    if (selectedIds.size === 0) return;
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => api.updateProduct(id, { isActive: active }))
      );
      toast.success(`${selectedIds.size} products ${active ? 'activated' : 'deactivated'}`);
      setSelectedIds(new Set());
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update products');
    }
  };

  const discount = useCallback(() => {
    const mrp = parseFloat(form.mrp) || 0;
    const sale = parseFloat(form.salePrice) || 0;
    if (mrp > 0 && sale > 0 && sale < mrp) return calculateDiscount(mrp, sale);
    return 0;
  }, [form.mrp, form.salePrice]);

  const renderSortIcon = (key: string) => {
    if (sortColumn !== key) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 inline-block ml-1" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 inline-block ml-1" />
    );
  };

  const renderTable = () => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80">
              <th className="w-10 px-4 py-3.5">
                <input
                  type="checkbox"
                  checked={sortedProducts.length > 0 && selectedIds.size === sortedProducts.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th className="px-4 py-3.5 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">#</span>
                </div>
              </th>
              {TABLE_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
                    col.sortable && 'cursor-pointer select-none hover:text-gray-700'
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && renderSortIcon(col.key)}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedProducts.map((p, idx) => {
              const stockInfo = getStockLevel(Number(p.stock) || 0);
              return (
                <tr
                  key={p.id}
                  className={cn(
                    'transition-colors',
                    selectedIds.has(p.id) ? 'bg-primary-50/50' : 'hover:bg-gray-50'
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                    {(page - 1) * 15 + idx + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                        {p.images?.[0]?.url ? (
                          <img
                            src={getImageUrl(p.images[0].url)}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <button
                          onClick={() => openEdit(p)}
                          className="font-medium text-gray-900 hover:text-primary-600 truncate block max-w-[200px] text-left"
                        >
                          {p.name}
                        </button>
                        {p.category?.name && (
                          <p className="text-xs text-gray-400 truncate max-w-[200px]">{p.category.name}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-gray-500">{p.sku || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500">{p.category?.name || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">{formatPrice(p.salePrice || 0)}</span>
                      {Number(p.mrp) > Number(p.salePrice) && (
                        <span className="text-xs text-gray-400 line-through">{formatPrice(p.mrp)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={stockInfo.variant} size="sm">{stockInfo.label}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={p.isActive ? 'success' : 'danger'} size="sm">
                      {p.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDelete(p)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {sortedProducts.map((p) => {
        const stockInfo = getStockLevel(Number(p.stock) || 0);
        return (
          <Card key={p.id} hover className="group">
            <div className="relative aspect-square bg-gray-50 border-b border-gray-100">
              {p.images?.[0]?.url ? (
                <img
                  src={getImageUrl(p.images[0].url)}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-200" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(p)}
                  className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-gray-50 text-gray-500"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => openDelete(p)}
                  className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-red-50 text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="absolute top-2 left-2">
                <Badge variant={p.isActive ? 'success' : 'danger'} size="sm">
                  {p.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            <CardContent className="p-3 space-y-1.5">
              <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-gray-900">{formatPrice(p.salePrice || 0)}</span>
                {Number(p.mrp) > Number(p.salePrice) && (
                  <span className="text-xs text-gray-400 line-through">{formatPrice(p.mrp)}</span>
                )}
              </div>
              <Badge variant={stockInfo.variant} size="sm">{stockInfo.label}</Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-white via-primary-50/40 to-white p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">
                Premium Admin
              </div>
              <h1 className="mt-2 text-2xl font-bold text-gray-900">Products</h1>
              <p className="mt-1 text-sm text-gray-500">{totalItems} total products • Fast creation with instant image handling</p>
            </div>
            <Button onClick={openCreate} className="shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <SearchInput
            value={search}
            onChange={(v) => setSearch(v)}
            placeholder="Search products..."
            className="sm:w-64"
          />
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: '', label: 'All Categories' },
              ...categories.map((c: any) => ({ value: c.id, label: c.name })),
            ]}
            className="sm:w-44"
          />
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            options={SORT_OPTIONS}
            className="sm:w-44"
          />
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden ml-auto">
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'table'
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              )}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'grid'
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-primary-50/50 border border-primary-100 rounded-lg">
            <span className="text-sm font-medium text-primary-700">
              {selectedIds.size} selected
            </span>
            <div className="h-4 w-px bg-primary-200" />
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkToggleActive(true)}
            >
              Activate
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkToggleActive(false)}
            >
              Deactivate
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={handleBulkDelete}
              isLoading={bulkDeleting}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
            </Button>
          </div>
        )}

        {error ? (
          <ErrorState message={error} onRetry={fetchProducts} />
        ) : loading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : products.length === 0 ? (
          <EmptyState
            title="No products found"
            description={search || category ? 'Try adjusting your search or filters' : 'Get started by adding your first product'}
            action={{ label: 'Add Product', onClick: openCreate }}
          />
        ) : (
          <>
            {viewMode === 'table' ? renderTable() : renderGridView()}
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingProduct ? 'Edit Product' : 'Add Product'} size="xl">
        <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2">
          <section>
            <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Basic Information</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Product Name *"
                value={form.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    name: val,
                    slug: editingProduct ? prev.slug : generateSlug(val),
                  }));
                }}
              />
              <Input
                label="Slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>
            <div className="mt-4">
              <Textarea
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
              />
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Pricing</h4>
            <div className="grid sm:grid-cols-3 gap-4">
              <Input
                label="MRP"
                type="number"
                value={form.mrp}
                onChange={(e) => setForm({ ...form, mrp: e.target.value })}
              />
              <Input
                label="Sale Price"
                type="number"
                value={form.salePrice}
                onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                <div className="px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-500 flex items-center h-[42px]">
                  {discount() > 0 ? (
                    <span className="text-green-600 font-medium">{discount()}% off</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Inventory</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="SKU *"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
              <Input
                label="Stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Organization</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Category"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                options={[
                  { value: '', label: 'Select category...' },
                  ...categories.map((c: any) => ({ value: c.id, label: c.name })),
                ]}
              />
              <Input
                label="Tags"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="Comma separated"
              />
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Status</h4>
            <div className="flex flex-wrap gap-6">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500" />
                <span className="ml-3 text-sm font-medium text-gray-700">Active</span>
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500" />
                <span className="ml-3 text-sm font-medium text-gray-700">Featured</span>
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isNewArrival}
                  onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500" />
                <span className="ml-3 text-sm font-medium text-gray-700">New Arrival</span>
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isBestSeller}
                  onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500" />
                <span className="ml-3 text-sm font-medium text-gray-700">Best Seller</span>
              </label>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Image Gallery</h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-4">
              {galleryImages.map((img) => (
                <div key={img.id} className="relative group aspect-square rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
                  <img
                    src={img.preview || getImageUrl(img.url || '')}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {img.isPrimary && (
                    <div className="absolute top-1 left-1">
                      <Badge variant="primary" size="sm">
                        <Star className="w-2.5 h-2.5 mr-0.5 fill-current" /> Primary
                      </Badge>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                    {!img.isPrimary && (
                      <button
                        onClick={() => setPrimaryImage(img.id)}
                        className="p-1 bg-white rounded-md shadow-sm hover:bg-gray-50 text-gray-600"
                        title="Set as primary"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => removeGalleryImage(img.id)}
                      className="p-1 bg-white rounded-md shadow-sm hover:bg-red-50 text-red-500"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors">
                <Upload className="w-5 h-5 text-gray-300 mb-1" />
                <span className="text-xs text-gray-400">Upload</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleGalleryUpload(e.target.files)}
                  className="hidden"
                />
              </label>
            </div>
          </section>

          <section>
            <details className="group border border-gray-200 rounded-lg">
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg [&::-webkit-details-marker]:hidden">
                <span>SEO Settings</span>
                <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4 mt-0">
                <Input
                  label="SEO Title"
                  value={form.seoTitle}
                  onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                />
                <Textarea
                  label="SEO Description"
                  value={form.seoDescription}
                  onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                  rows={3}
                />
              </div>
            </details>
          </section>

          <section>
            <details className="group border border-gray-200 rounded-lg">
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg [&::-webkit-details-marker]:hidden">
                <span>Variants ({variants.length})</span>
                <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-4 pb-4 pt-4 border-t border-gray-100 mt-0">
                {variants.length > 0 && (
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left pb-2 text-xs font-semibold text-gray-500 uppercase">Size</th>
                          <th className="text-left pb-2 text-xs font-semibold text-gray-500 uppercase">Color</th>
                          <th className="text-left pb-2 text-xs font-semibold text-gray-500 uppercase">Color Code</th>
                          <th className="text-left pb-2 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                          <th className="text-left pb-2 text-xs font-semibold text-gray-500 uppercase">SKU</th>
                          <th className="text-left pb-2 text-xs font-semibold text-gray-500 uppercase">Price</th>
                          <th className="w-10" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {variants.map((v, i) => (
                          <tr key={i}>
                            <td className="py-2 pr-2">
                              <input
                                value={v.size}
                                onChange={(e) => handleVariantChange(i, 'size', e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                placeholder="e.g. M"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                value={v.color}
                                onChange={(e) => handleVariantChange(i, 'color', e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                placeholder="e.g. Red"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={v.colorCode}
                                  onChange={(e) => handleVariantChange(i, 'colorCode', e.target.value)}
                                  className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                                />
                                <input
                                  value={v.colorCode}
                                  onChange={(e) => handleVariantChange(i, 'colorCode', e.target.value)}
                                  className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary-500"
                                />
                              </div>
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                type="number"
                                min="0"
                                value={v.stock}
                                onChange={(e) => handleVariantChange(i, 'stock', e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                placeholder="0"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                value={v.sku}
                                onChange={(e) => handleVariantChange(i, 'sku', e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                placeholder="SKU"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={v.price}
                                onChange={(e) => handleVariantChange(i, 'price', e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                placeholder="0.00"
                              />
                            </td>
                            <td className="py-2">
                              <button
                                onClick={() => removeVariant(i)}
                                className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={addVariant}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Variant
                </Button>
              </div>
            </details>
          </section>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} isLoading={saving}>
            {editingProduct ? 'Update' : 'Create'} Product
          </Button>
        </div>
      </Modal>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Product" size="sm">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-gray-900 font-medium mb-1">Are you sure?</p>
          <p className="text-sm text-gray-500 mb-6">
            This will permanently delete <strong>{deletingProduct?.name}</strong>. This action cannot be undone.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-1.5" /> Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
