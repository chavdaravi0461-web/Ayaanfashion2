export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  mrp: number;
  salePrice: number;
  discount: number;
  sku: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  categoryId: string;
  category: Category;
  seoTitle?: string;
  seoDescription?: string;
  tags?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  size?: string;
  color?: string;
  colorCode?: string;
  stock: number;
  sku?: string;
  price?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  parent?: Category;
  children: Category[];
  isActive: boolean;
  sortOrder: number;
  products?: Product[];
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  sku?: string;
  size?: string;
  color?: string;
  price: number;
  quantity: number;
  total: number;
  imageUrl?: string;
}

export interface OrderStatusHistory {
  id: string;
  status: OrderStatus;
  note?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  orders: Order[];
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount: number;
  type: 'flat' | 'percentage';
  minOrder: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  linkText?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  mrp: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
  stock: number;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  customerName: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
