import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import slugify from 'slugify';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

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
      // Support both slug and ID
      const cat = await this.prisma.category.findFirst({
        where: { OR: [{ id: category }, { slug: category }] },
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
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          category: { select: { id: true, name: true, slug: true } },
          variants: true,
          reviews: { where: { isActive: true }, select: { rating: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const productsWithAvgRating = products.map((product) => {
      const avgRating =
        product.reviews.length > 0
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
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: true,
        variants: true,
        reviews: {
          where: { isActive: true },
          include: { customer: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found');

    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : null;

    return { ...product, avgRating };
  }

  async findFeatured() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { id: true, name: true, slug: true } },
      },
    });
    return products;
  }

  async findNewArrivals() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true, isNewArrival: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { id: true, name: true, slug: true } },
      },
    });
    return products;
  }

  async findBestSellers() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true, isBestSeller: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { id: true, name: true, slug: true } },
      },
    });
    return products;
  }

  async findRelated(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    const related = await this.prisma.product.findMany({
      where: {
        isActive: true,
        categoryId: product.categoryId,
        id: { not: id },
      },
      take: 4,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { id: true, name: true, slug: true } },
      },
    });
    return related;
  }

  async create(dto: CreateProductDto) {
    let slug = dto.slug || slugify(dto.name, { lower: true, strict: true });
    const existingSlug = await this.prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const existingSku = await this.prisma.product.findUnique({ where: { sku: dto.sku } });
    if (existingSku) throw new ConflictException('SKU already exists');

    const discount = dto.discount ?? Math.round(((dto.mrp - dto.salePrice) / dto.mrp) * 100);

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        mrp: dto.mrp,
        salePrice: dto.salePrice,
        discount,
        sku: dto.sku,
        stock: dto.stock,
        isFeatured: dto.isFeatured,
        isNewArrival: dto.isNewArrival,
        isBestSeller: dto.isBestSeller,
        categoryId: dto.categoryId,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        tags: dto.tags,
        images: dto.images
          ? {
              create: dto.images.map((img, idx) => ({
                url: img.url,
                alt: img.alt,
                isPrimary: img.isPrimary || idx === 0,
                sortOrder: idx,
              })),
            }
          : undefined,
        variants: dto.variants
          ? {
              create: dto.variants.map((v) => ({
                size: v.size,
                color: v.color,
                colorCode: v.colorCode,
                stock: v.stock,
                sku: v.sku,
                price: v.price,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        variants: true,
        category: true,
      },
    });

    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    const data: any = { ...dto };

    if (dto.name) {
      let slug = slugify(dto.name, { lower: true, strict: true });
      const existingSlug = await this.prisma.product.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`;
      }
      data.slug = slug;
    }

    if (dto.mrp && dto.salePrice) {
      data.discount = Math.round(((dto.mrp - dto.salePrice) / dto.mrp) * 100);
    }

    if (dto.images) {
      await this.prisma.productImage.deleteMany({ where: { productId: id } });
      data.images = {
        create: dto.images.map((img, idx) => ({
          url: img.url,
          alt: img.alt,
          isPrimary: img.isPrimary || idx === 0,
          sortOrder: idx,
        })),
      };
    }

    if (dto.variants) {
      await this.prisma.productVariant.deleteMany({ where: { productId: id } });
      data.variants = {
        create: dto.variants.map((v) => ({
          size: v.size,
          color: v.color,
          colorCode: v.colorCode,
          stock: v.stock,
          sku: v.sku,
          price: v.price,
        })),
      };
    }

    return this.prisma.product.update({
      where: { id },
      data,
      include: {
        images: true,
        variants: true,
        category: true,
      },
    });
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Product deactivated successfully' };
  }

  async addImage(productId: string, url: string, alt?: string, isPrimary?: boolean) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const count = await this.prisma.productImage.count({ where: { productId } });

    return this.prisma.productImage.create({
      data: {
        url,
        alt,
        isPrimary: isPrimary || count === 0,
        sortOrder: count,
        productId,
      },
    });
  }

  async removeImage(productId: string, imageId: string) {
    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });
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
      data: {
        rating: data.rating,
        comment: data.comment,
        customerId: data.customerId || 'guest',
        productId,
      },
      include: {
        customer: { select: { id: true, name: true } },
      },
    });

    return review;
  }

  async getReviews(productId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { productId, isActive: true },
      include: { customer: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

    return { reviews, avgRating, total: reviews.length };
  }
}
