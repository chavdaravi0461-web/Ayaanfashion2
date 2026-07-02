import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async findByCustomer(customerId: string) {
    return this.prisma.wishlistItem.findMany({
      where: { customerId },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async add(customerId: string, productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.prisma.wishlistItem.findUnique({
      where: { customerId_productId: { customerId, productId } },
    });
    if (existing) throw new ConflictException('Product already in wishlist');

    return this.prisma.wishlistItem.create({
      data: { customerId, productId },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
    });
  }

  async remove(customerId: string, productId: string) {
    const item = await this.prisma.wishlistItem.findUnique({
      where: { customerId_productId: { customerId, productId } },
    });
    if (!item) throw new NotFoundException('Wishlist item not found');

    await this.prisma.wishlistItem.delete({
      where: { customerId_productId: { customerId, productId } },
    });
    return { message: 'Removed from wishlist' };
  }

  async toggle(customerId: string, productId: string) {
    const existing = await this.prisma.wishlistItem.findUnique({
      where: { customerId_productId: { customerId, productId } },
    });
    if (existing) {
      await this.prisma.wishlistItem.delete({
        where: { customerId_productId: { customerId, productId } },
      });
      return { added: false, message: 'Removed from wishlist' };
    }
    await this.prisma.wishlistItem.create({
      data: { customerId, productId },
    });
    return { added: true, message: 'Added to wishlist' };
  }
}
