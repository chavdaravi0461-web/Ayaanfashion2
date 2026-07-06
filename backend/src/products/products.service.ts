import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import slugify from 'slugify';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private cache = new Map<string, { data: any; expiresAt: number }>();
  private readonly CACHE_TTL = parseInt(process.env.CACHE_TTL || '300') * 1000;

  constructor(private prisma: PrismaService) {}

  private getCached(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.data;
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any, ttl?: number): void {
    this.cache.set(key, { data, expiresAt: Date.now() + (ttl || this.CACHE_TTL) });
  }

  private invalidateCache(pattern?: string): void {
    if (!pattern) { this.cache.clear(); return; }
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) this.cache.delete(key);
    }
  }

  private readonly productListSelect = {
    id: true, name: true, slug: true, mrp: true, salePrice: true, discount: true,
    stock: true, isActive: true, isFeatured: true, isNewArrival: true, isBestSeller: true,
    createdAt: true,
    images: { where: { isPrimary: true }, take: 1, orderBy: { sortOrder: 'asc' as const } },
    category: { select: { id: true, name: true, slug: true } },
  };

  async findAll(query: any) {
    const pageNum = Math.max(1, parseInt(query.page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(query.limit) || 12));
    const { search, category, sort, featured, newArrival, bestSeller, minPrice, maxPrice } = query;
    const skip = (pageNum - 1) * limitNum;
    const where: Prisma.ProductWhereInput = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      const cat = await this.prisma.category.findFirst({
        where: { OR: [{ id: category }, { slug: category }] },
        select: { id: true },
      });
      if (cat) where.categoryId = cat.id;
    }
    if (featured === 'true') where.isFeatured = true;
    if (newArrival === 'true') where.isNewArrival = true;
    if (bestSeller === 'true') where.isBestSeller = true;
    if (minPrice || maxPrice) {
      where.salePrice = {};
      if (minPrice) where.salePrice.gte = parseFloat(minPrice);
      if (maxPrice) where.salePrice.lte = parseFloat(maxPrice);
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { salePrice: 'asc' };
    else if (sort === 'price_desc') orderBy = { salePrice: 'desc' };
    else if (sort === 'name_asc') orderBy = { name: 'asc' };
    else if (sort === 'name_desc') orderBy = { name: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };
    else if (sort === 'oldest') orderBy = { createdAt: 'asc' };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        select: {
          ...this.productListSelect,
          variants: { select: { id: true, size: true, color: true, colorCode: true, stock: true, price: true, sku: true } },
          reviews: { where: { isActive: true }, select: { rating: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const productsWithAvgRating = products.map((product) => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : null;
      const { reviews, ...rest } = product;
      return { ...rest, avgRating };
    });

    return {
      items: productsWithAvgRating,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async findBySlug(slug: string) {
    const cacheKey = `product:${slug}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: true,
        variants: {
          select: { id: true, size: true, color: true, colorCode: true, stock: true, price: true, sku: true },
        },
        reviews: {
          where: { isActive: true },
          select: { id: true, rating: true, comment: true, createdAt: true, customer: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found');

    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : null;

    const result = { ...product, avgRating };
    this.setCache(cacheKey, result, 60000);
    return result;
  }

  async findFeatured() {
    const cacheKey = 'products:featured';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const products = await this.prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      select: this.productListSelect,
    });
    this.setCache(cacheKey, products, 120000);
    return products;
  }

  async findNewArrivals() {
    const cacheKey = 'products:new-arrivals';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const products = await this.prisma.product.findMany({
      where: { isActive: true, isNewArrival: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      select: this.productListSelect,
    });
    this.setCache(cacheKey, products, 120000);
    return products;
  }

  async findBestSellers() {
    const cacheKey = 'products:best-sellers';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const products = await this.prisma.product.findMany({
      where: { isActive: true, isBestSeller: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      select: this.productListSelect,
    });
    this.setCache(cacheKey, products, 120000);
    return products;
  }

  async findRelated(id: string) {
    const cacheKey = `products:related:${id}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const product = await this.prisma.product.findUnique({ where: { id }, select: { categoryId: true } });
    if (!product) throw new NotFoundException('Product not found');

    const related = await this.prisma.product.findMany({
      where: { isActive: true, categoryId: product.categoryId, id: { not: id } },
      take: 4,
      select: this.productListSelect,
    });
    this.setCache(cacheKey, related, 120000);
    return related;
  }

  async create(dto: CreateProductDto) {
    const name = dto.name?.trim();
    const sku = dto.sku?.trim();
    const categoryId = dto.categoryId?.trim();

    if (!name) throw new BadRequestException('Product name is required');
    if (!sku) throw new BadRequestException('SKU is required');
    if (!categoryId) throw new BadRequestException('Please select a category');

    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new BadRequestException('Selected category is invalid');

    const baseSlug = (dto.slug || slugify(name, { lower: true, strict: true })).trim() || `product-${Date.now()}`;
    let slug = baseSlug;
    const existingSlug = await this.prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const existingSku = await this.prisma.product.findUnique({ where: { sku } });
    if (existingSku) throw new ConflictException('SKU already exists');

    const mrp = Number(dto.mrp) || 0;
    const salePrice = Number(dto.salePrice) || 0;
    const discount = dto.discount ?? (mrp > 0 ? Math.round(((mrp - salePrice) / mrp) * 100) : 0);

    const product = await this.prisma.product.create({
      data: {
        name, slug, description: dto.description?.trim() || '', mrp, salePrice, discount, sku,
        stock: Number(dto.stock) || 0,
        isActive: dto.isActive ?? true, isFeatured: dto.isFeatured ?? false,
        isNewArrival: dto.isNewArrival ?? false, isBestSeller: dto.isBestSeller ?? false,
        categoryId,
        seoTitle: dto.seoTitle?.trim() || undefined,
        seoDescription: dto.seoDescription?.trim() || undefined,
        tags: dto.tags?.trim() || undefined,
        images: dto.images ? { create: dto.images.map((img, idx) => ({ url: img.url, alt: img.alt, isPrimary: img.isPrimary || idx === 0, sortOrder: idx })) } : undefined,
        variants: dto.variants ? { create: dto.variants.map(v => ({ size: v.size, color: v.color, colorCode: v.colorCode, stock: Number(v.stock) || 0, sku: v.sku, price: Number(v.price) || 0 })) } : undefined,
      },
      include: { images: { orderBy: { sortOrder: 'asc' } }, variants: true, category: true },
    });

    this.invalidateCache('products:');
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
      if (!category) throw new BadRequestException('Selected category is invalid');
    }

    const data: any = { ...dto };

    if (dto.name) {
      let slug = slugify(dto.name, { lower: true, strict: true });
      const existingSlug = await this.prisma.product.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existingSlug) slug = `${slug}-${Date.now()}`;
      data.slug = slug;
    }

    if (dto.mrp && dto.salePrice) {
      data.discount = Math.round(((dto.mrp - dto.salePrice) / dto.mrp) * 100);
    }

    if (dto.images) {
      await this.prisma.productImage.deleteMany({ where: { productId: id } });
      data.images = { create: dto.images.map((img, idx) => ({ url: img.url, alt: img.alt, isPrimary: img.isPrimary || idx === 0, sortOrder: idx })) };
    }

    if (dto.variants) {
      await this.prisma.productVariant.deleteMany({ where: { productId: id } });
      data.variants = { create: dto.variants.map(v => ({ size: v.size, color: v.color, colorCode: v.colorCode, stock: v.stock, sku: v.sku, price: v.price })) };
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data,
      include: { images: { orderBy: { sortOrder: 'asc' } }, variants: true, category: true },
    });

    this.invalidateCache('products:');
    return updated;
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    this.invalidateCache('products:');
    return { message: 'Product deactivated successfully' };
  }

  async addImage(productId: string, url: string, alt?: string, isPrimary?: boolean) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const count = await this.prisma.productImage.count({ where: { productId } });

    return this.prisma.productImage.create({
      data: { url, alt, isPrimary: isPrimary || count === 0, sortOrder: count, productId },
    });
  }

  async removeImage(productId: string, imageId: string) {
    const image = await this.prisma.productImage.findFirst({ where: { id: imageId, productId } });
    if (!image) throw new NotFoundException('Image not found');

    await this.prisma.productImage.delete({ where: { id: imageId } });
    return { message: 'Image deleted successfully' };
  }

  async createReview(productId: string, data: { rating: number; comment?: string; customerId?: string }) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const review = await this.prisma.review.create({
      data: { rating: data.rating, comment: data.comment, customerId: data.customerId || 'guest', productId },
      include: { customer: { select: { id: true, name: true } } },
    });

    this.invalidateCache('products:');
    return review;
  }

  async getReviews(productId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { productId, isActive: true },
      select: { id: true, rating: true, comment: true, createdAt: true, customer: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

    return { reviews, avgRating, total: reviews.length };
  }
}
