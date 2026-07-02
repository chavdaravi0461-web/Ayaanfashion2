import { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const UPLOADS_URL = process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:4000/uploads';

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, { next: { revalidate: 60 } });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

function getImageUrl(path: string): string {
  if (!path) return `${SITE_URL}/placeholder.svg`;
  if (path.startsWith('http')) return path;
  return `${UPLOADS_URL}/${path.replace(/^\//, '')}`;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);

  if (!product) {
    return { title: 'Product Not Found - Ayaan Fashion' };
  }

  const title = `${product.name} - Ayaan Fashion`;
  const description = product.description?.substring(0, 160) || `Shop ${product.name} at Ayaan Fashion`;
  const imageUrl = getImageUrl(product.images?.[0]?.url);
  const url = `${SITE_URL}/product/${product.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      images: [{ url: imageUrl, width: 800, height: 800, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: { canonical: url },
  };
}
