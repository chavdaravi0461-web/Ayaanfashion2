const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function serverFetch<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
  let url = `${API_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    next: { revalidate: 60 },
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getServerFeaturedProducts() {
  const res = await serverFetch<{ success: boolean; data: any[] }>('/products/featured');
  return res.success ? res.data : [];
}

export async function getServerNewArrivals() {
  const res = await serverFetch<{ success: boolean; data: any[] }>('/products/new-arrivals');
  return res.success ? res.data : [];
}

export async function getServerBestSellers() {
  const res = await serverFetch<{ success: boolean; data: any[] }>('/products/best-sellers');
  return res.success ? res.data : [];
}

export async function getServerFlashSale() {
  const res = await serverFetch<{ success: boolean; data: { items: any[] } }>('/products', { sort: 'salePrice', limit: 4 });
  return res.success ? res.data.items : [];
}

export async function getServerCategories() {
  const res = await serverFetch<{ success: boolean; data: any[] }>('/categories');
  return res.success ? res.data : [];
}

export async function getServerBanners() {
  const res = await serverFetch<{ success: boolean; data: any[] }>('/banners');
  return res.success ? res.data : [];
}