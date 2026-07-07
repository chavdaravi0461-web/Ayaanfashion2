import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateOrderNumber(): string {
  const prefix = 'AF';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

export function getImageUrl(path: string): string {
  if (!path) return '/placeholder.svg';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads/')) {
    const baseUrl = process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:4000/uploads';
    return `${baseUrl}/${path.replace(/^\/uploads\//, '')}`;
  }
  return path;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PACKED: 'bg-purple-100 text-purple-800',
    SHIPPED: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function calculateDiscount(mrp: number, salePrice: number): number {
  return Math.round(((mrp - salePrice) / mrp) * 100);
}

const colorNameMap: Record<string, string> = {
  red: '#FF0000', 'dark red': '#CC0000', maroon: '#800000', wine: '#800000',
  'orange red': '#FF4500', orange: '#FF6600', 'dark orange': '#FF8C00',
  gold: '#FFD700', yellow: '#FFFF00', 'light yellow': '#FFFFE0',
  lime: '#00FF00', green: '#32CD32', 'forest green': '#228B22',
  'dark green': '#006400', 'pale green': '#98FB98', 'spring green': '#00FF7F',
  cyan: '#00FFFF', teal: '#008080', 'sea green': '#20B2AA',
  blue: '#0000FF', 'dark blue': '#00008B', 'midnight blue': '#191970',
  'royal blue': '#4169E1', 'sky blue': '#87CEEB', 'light blue': '#ADD8E6',
  'powder blue': '#B0E0E6', 'dodger blue': '#1E90FF', turquoise: '#40E0D0',
  purple: '#800080', violet: '#9370DB', lavender: '#E6E6FA',
  magenta: '#FF00FF', 'deep pink': '#FF1493', 'hot pink': '#FF69B4',
  pink: '#FFC0CB', 'light pink': '#FFB6C1', 'rose gold': '#B76E79',
  brown: '#8B4513', 'saddle brown': '#8B4513', chocolate: '#D2691E',
  tan: '#D2B48C', beige: '#F5F5DC', cream: '#FFFDD0',
  white: '#FFFFFF', 'off white': '#FAFAFA', ivory: '#FFFFF0',
  'light gray': '#D3D3D3', silver: '#C0C0C0', gray: '#808080',
  'dark gray': '#696969', charcoal: '#333333', black: '#000000',
  mint: '#98FF98', coral: '#FF7F50', salmon: '#FA8072',
  copper: '#B87333', bronze: '#CD7F32', champagne: '#F7E7CE',
  olive: '#808000', peach: '#FFDAB5', ruby: '#E0115F', emerald: '#50C878',
};

export function getColorHex(color: string): string {
  if (!color) return '#ccc';
  const trimmed = color.trim().toLowerCase();
  if (trimmed.startsWith('#')) return color;
  return colorNameMap[trimmed] || '#ccc';
}
