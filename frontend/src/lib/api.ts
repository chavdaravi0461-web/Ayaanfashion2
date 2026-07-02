const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface FetchOptions extends RequestInit {
  params?: Record<string, any>;
}

class ApiClient {
  private baseUrl: string;

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

  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
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

    let response: Response;
    try {
      response = await fetch(url, {
        ...fetchOptions,
        headers,
      });
    } catch (err: any) {
      throw new Error(`Network error: Unable to reach the server. Make sure the backend is running on port 4000. (${err.message})`);
    }

    if (response.status === 401) {
      this.clearTokens();
      const body = await response.text();
      throw new Error(body ? JSON.parse(body).message || 'Session expired' : 'Session expired. Please login again.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  get<T>(endpoint: string, params?: Record<string, any>) {
    return this.request<T>(endpoint, { method: 'GET', params });
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

  // Auth
  login(email: string, password: string) {
    return this.post<{ success: boolean; data: { access_token: string; admin: any } }>('/auth/login', { email, password });
  }

  getProfile() {
    return this.get<{ success: boolean; data: any }>('/auth/profile');
  }

  // Products
  getProducts(params?: Record<string, any>) {
    return this.get<{ success: boolean; data: { items: any[]; total: number; page: number; limit: number; totalPages: number } }>('/products', params);
  }

  getProduct(slug: string) {
    return this.get<{ success: boolean; data: any }>(`/products/${slug}`);
  }

  getFeaturedProducts() {
    return this.get<{ success: boolean; data: any[] }>('/products/featured');
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

  // Categories
  getCategories() {
    return this.get<{ success: boolean; data: any[] }>('/categories');
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

  // Orders
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

  // Coupons
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

  // Banners
  getBanners() {
    return this.get<{ success: boolean; data: any[] }>('/banners');
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

  // Customers
  getCustomers(params?: Record<string, any>) {
    return this.get<{ success: boolean; data: { items: any[]; total: number; page: number; limit: number; totalPages: number } }>('/customers', params);
  }

  getCustomer(id: string) {
    return this.get<{ success: boolean; data: any }>(`/customers/${id}`);
  }

  getCustomerOrders(id: string) {
    return this.get<{ success: boolean; data: any[] }>(`/customers/${id}/orders`);
  }

  // Settings
  getSettings() {
    return this.get<{ success: boolean; data: any[] | Record<string, string> }>('/settings');
  }

  updateSettings(data: Record<string, string>) {
    return this.put<{ success: boolean; data: any }>('/settings', data);
  }

  // Uploads
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

  // Customer Profile
  getCustomerProfile() {
    return this.get<{ success: boolean; data: any }>('/auth/customer/profile');
  }

  updateCustomerProfile(data: any) {
    return this.put<{ success: boolean; data: any }>('/auth/customer/profile', data);
  }

  // Addresses
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

  // Wishlist
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

  // Reviews
  createReview(productId: string, data: { rating: number; comment?: string }) {
    return this.post<{ success: boolean; data: any }>(`/products/${productId}/reviews`, data);
  }

  getProductReviews(productId: string) {
    return this.get<{ success: boolean; data: any }>(`/products/${productId}/reviews`);
  }

  // Customer Orders
  getMyOrders(customerId: string) {
    return this.get<{ success: boolean; data: any[] }>(`/orders/customer/${customerId}`);
  }

  // Auth - Customer
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
