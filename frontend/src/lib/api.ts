const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface FetchOptions extends RequestInit {
  params?: Record<string, any>;
  skipCache?: boolean;
  signal?: AbortSignal;
  priority?: 'high' | 'low' | 'auto';
}

class ApiClient {
  private baseUrl: string;
  private cache = new Map<string, { expiresAt: number; promise: Promise<any> }>();
  private pendingRequests = new Map<string, Promise<any>>();
  private readonly CACHE_TTL = {
    static: 5 * 60 * 1000,
    dynamic: 30 * 1000,
  };
  private abortControllers = new Map<string, AbortController>();

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('admin_token');
    localStorage.removeItem('customer_token');
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_token') || localStorage.getItem('customer_token');
  }

  private getCacheTTL(endpoint: string): number {
    if (endpoint.includes('/featured') || endpoint.includes('/new-arrivals') || endpoint.includes('/best-sellers') || endpoint.includes('/categories')) {
      return this.CACHE_TTL.static;
    }
    return this.CACHE_TTL.dynamic;
  }

  private cancelDuplicateRequests(url: string): void {
    const existing = this.abortControllers.get(url);
    if (existing) existing.abort();
    this.abortControllers.delete(url);
  }

  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, skipCache, signal, priority, ...fetchOptions } = options;
    let url = `${this.baseUrl}${endpoint}`;

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

    const isGetRequest = !fetchOptions.method || fetchOptions.method === 'GET';
    const cacheKey = `GET:${url}`;

    if (isGetRequest && !skipCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.promise as Promise<T>;
      }

      const pending = this.pendingRequests.get(cacheKey);
      if (pending) {
        return pending as Promise<T>;
      }
    }

    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (fetchOptions.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    if (priority === 'high') {
      headers['Priority'] = 'u=1, i';
    } else if (priority === 'low') {
      headers['Priority'] = 'u=5, i';
    }

    const requestPromise = (async () => {
      let response: Response;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        response = await fetch(url, {
          ...fetchOptions,
          headers,
          signal: signal || controller.signal,
        });
      } catch (err: any) {
        if (err.name === 'AbortError') {
          throw new Error('Request timed out. Please check your connection.');
        }
        throw new Error(`Network error: Unable to reach the server. (${err.message})`);
      } finally {
        clearTimeout(timeoutId);
      }

      if (response.status === 401) {
        this.clearTokens();
        const body = await response.text();
        throw new Error(body ? JSON.parse(body).message || 'Session expired' : 'Session expired. Please login again.');
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'API request failed');
        }

        return data;
      }

      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || 'API request failed');
      }

      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    })();

    if (isGetRequest && !skipCache) {
      this.pendingRequests.set(cacheKey, requestPromise);
      this.cache.set(cacheKey, {
        expiresAt: Date.now() + this.getCacheTTL(endpoint),
        promise: requestPromise,
      });
      requestPromise.finally(() => {
        this.pendingRequests.delete(cacheKey);
      });
    }

    return requestPromise as Promise<T>;
  }

  get<T>(endpoint: string, params?: Record<string, any>, skipCache?: boolean, priority?: 'high' | 'low' | 'auto') {
    return this.request<T>(endpoint, { method: 'GET', params, skipCache, priority });
  }

  post<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) });
  }

  put<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  }

  patch<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  invalidateCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  login(email: string, password: string) {
    return this.post<{ success: boolean; data: { access_token: string; admin: any } }>('/auth/login', { email, password });
  }

  getProfile() {
    return this.get<{ success: boolean; data: any }>('/auth/profile');
  }

  getProducts(params?: Record<string, any>) {
    return this.get<{ success: boolean; data: { items: any[]; total: number; page: number; limit: number; totalPages: number } }>('/products', params);
  }

  getProduct(slug: string) {
    return this.get<{ success: boolean; data: any }>(`/products/${slug}`);
  }

  getFeaturedProducts() {
    return this.get<{ success: boolean; data: any[] }>('/products/featured', undefined, false, 'high');
  }

  getNewArrivals() {
    return this.get<{ success: boolean; data: any[] }>('/products/new-arrivals');
  }

  getBestSellers() {
    return this.get<{ success: boolean; data: any[] }>('/products/best-sellers');
  }

  getRelatedProducts(id: string) {
    return this.get<{ success: boolean; data: any[] }>(`/products/related/${id}`);
  }

  createProduct(data: FormData | any) {
    return this.post<{ success: boolean; data: any }>('/products', data);
  }

  updateProduct(id: string, data: any) {
    return this.put<{ success: boolean; data: any }>(`/products/${id}`, data);
  }

  deleteProduct(id: string) {
    return this.delete<{ success: boolean }>(`/products/${id}`);
  }

  getCategories() {
    return this.get<{ success: boolean; data: any[] }>('/categories', undefined, false, 'high');
  }

  getCategory(slug: string) {
    return this.get<{ success: boolean; data: any }>(`/categories/${slug}`);
  }

  createCategory(data: any) {
    return this.post<{ success: boolean; data: any }>('/categories', data);
  }

  updateCategory(id: string, data: any) {
    return this.put<{ success: boolean; data: any }>(`/categories/${id}`, data);
  }

  deleteCategory(id: string) {
    return this.delete<{ success: boolean }>(`/categories/${id}`);
  }

  getOrders(params?: Record<string, any>) {
    return this.get<{ success: boolean; data: { items: any[]; total: number; page: number; limit: number; totalPages: number } }>('/orders', params);
  }

  getOrder(id: string) {
    return this.get<{ success: boolean; data: any }>(`/orders/${id}`);
  }

  trackOrder(orderNumber: string) {
    return this.get<{ success: boolean; data: any }>(`/orders/tracking/${orderNumber}`);
  }

  createOrder(data: any) {
    return this.post<{ success: boolean; data: any }>('/orders', data);
  }

  updateOrderStatus(id: string, status: string, note?: string) {
    return this.put<{ success: boolean; data: any }>(`/orders/${id}/status`, { status, note });
  }

  getDashboardStats() {
    return this.get<{ success: boolean; data: any }>('/orders/stats/dashboard');
  }

  getCoupons() {
    return this.get<{ success: boolean; data: any[] }>('/coupons');
  }

  validateCoupon(code: string, subtotal: number) {
    return this.post<{ success: boolean; data: any }>('/coupons/validate', { code, subtotal });
  }

  createCoupon(data: any) {
    return this.post<{ success: boolean; data: any }>('/coupons', data);
  }

  updateCoupon(id: string, data: any) {
    return this.put<{ success: boolean; data: any }>(`/coupons/${id}`, data);
  }

  deleteCoupon(id: string) {
    return this.delete<{ success: boolean }>(`/coupons/${id}`);
  }

  getBanners() {
    return this.get<{ success: boolean; data: any[] }>('/banners', undefined, false, 'high');
  }

  createBanner(data: FormData | any) {
    return this.post<{ success: boolean; data: any }>('/banners', data);
  }

  updateBanner(id: string, data: any) {
    return this.put<{ success: boolean; data: any }>(`/banners/${id}`, data);
  }

  deleteBanner(id: string) {
    return this.delete<{ success: boolean }>(`/banners/${id}`);
  }

  getCustomers(params?: Record<string, any>) {
    return this.get<{ success: boolean; data: { items: any[]; total: number; page: number; limit: number; totalPages: number } }>('/customers', params);
  }

  getCustomer(id: string) {
    return this.get<{ success: boolean; data: any }>(`/customers/${id}`);
  }

  getCustomerOrders(id: string) {
    return this.get<{ success: boolean; data: any[] }>(`/customers/${id}/orders`);
  }

  getSettings() {
    return this.get<{ success: boolean; data: any[] | Record<string, string> }>('/settings');
  }

  updateSettings(data: Record<string, string>) {
    return this.put<{ success: boolean; data: any }>('/settings', data);
  }

  uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.post<{ success: boolean; data: { url: string } }>('/uploads', formData);
  }

  uploadMultiple(files: FileList | File[]) {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));
    return this.post<{ success: boolean; data: { files: { url: string }[] } }>('/uploads/multiple', formData);
  }

  getCustomerProfile() {
    return this.get<{ success: boolean; data: any }>('/auth/customer/profile');
  }

  updateCustomerProfile(data: any) {
    return this.put<{ success: boolean; data: any }>('/auth/customer/profile', data);
  }

  getAddresses() {
    return this.get<{ success: boolean; data: any[] }>('/addresses');
  }

  getAddress(id: string) {
    return this.get<{ success: boolean; data: any }>(`/addresses/${id}`);
  }

  createAddress(data: any) {
    return this.post<{ success: boolean; data: any }>('/addresses', data);
  }

  updateAddress(id: string, data: any) {
    return this.put<{ success: boolean; data: any }>(`/addresses/${id}`, data);
  }

  deleteAddress(id: string) {
    return this.delete<{ success: boolean }>(`/addresses/${id}`);
  }

  setDefaultAddress(id: string) {
    return this.put<{ success: boolean; data: any }>(`/addresses/${id}/default`);
  }

  getWishlist() {
    return this.get<{ success: boolean; data: any[] }>('/wishlist');
  }

  addToWishlist(productId: string) {
    return this.post<{ success: boolean; data: any }>(`/wishlist/${productId}`);
  }

  removeFromWishlist(productId: string) {
    return this.delete<{ success: boolean }>(`/wishlist/${productId}`);
  }

  toggleWishlist(productId: string) {
    return this.post<{ success: boolean; data: { added: boolean } }>(`/wishlist/${productId}/toggle`);
  }

  createReview(productId: string, data: { rating: number; comment?: string }) {
    return this.post<{ success: boolean; data: any }>(`/products/${productId}/reviews`, data);
  }

  getProductReviews(productId: string) {
    return this.get<{ success: boolean; data: any }>(`/products/${productId}/reviews`);
  }

  getMyOrders(customerId: string) {
    return this.get<{ success: boolean; data: any[] }>(`/orders/customer/${customerId}`);
  }

  customerLogin(email: string, password: string) {
    return this.post<{ success: boolean; data: { access_token: string; customer: any } }>('/auth/customer/login', { email, password });
  }

  customerRegister(data: { name: string; email: string; password: string; phone?: string }) {
    return this.post<{ success: boolean; data: { access_token: string; customer: any } }>('/auth/customer/register', data);
  }

  refreshToken(token: string) {
    return this.post<{ success: boolean; data: { access_token: string } }>('/auth/refresh', { token });
  }
}

export const api = new ApiClient(API_URL);
