import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { orders: true } } },
    });
  }

  async findById(id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
      include: { _count: { select: { orders: true } } },
    });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async create(dto: CreateCouponDto) {
    const existing = await this.prisma.coupon.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException('Coupon code already exists');

    return this.prisma.coupon.create({
      data: {
        code: dto.code.toUpperCase(),
        description: dto.description,
        discount: dto.discount,
        type: dto.type || 'flat',
        minOrder: dto.minOrder || 0,
        maxUses: dto.maxUses || 0,
        isActive: dto.isActive ?? true,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });
  }

  async update(id: string, dto: UpdateCouponDto) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');

    const data: any = { ...dto };
    if (dto.code) data.code = dto.code.toUpperCase();
    if (dto.expiresAt) data.expiresAt = new Date(dto.expiresAt);

    return this.prisma.coupon.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');

    await this.prisma.coupon.delete({ where: { id } });
    return { message: 'Coupon deleted successfully' };
  }

  async validate(dto: ValidateCouponDto) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: dto.code } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    if (!coupon.isActive) throw new BadRequestException('Coupon is inactive');
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new BadRequestException('Coupon has expired');
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) throw new BadRequestException('Coupon usage limit reached');
    if (dto.orderTotal < Number(coupon.minOrder)) throw new BadRequestException(`Minimum order amount of ₹${coupon.minOrder} required`);

    let discountAmount = Number(coupon.discount);
    if (coupon.type === 'percentage') {
      discountAmount = (dto.orderTotal * discountAmount) / 100;
    }

    return {
      valid: true,
      coupon,
      discountAmount,
      finalTotal: dto.orderTotal - discountAmount,
    };
  }
}
