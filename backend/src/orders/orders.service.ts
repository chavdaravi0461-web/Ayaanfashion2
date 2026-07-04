import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus, Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const prefix = `AF-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-`;
    const count = await this.prisma.order.count({
      where: { orderNumber: { startsWith: prefix } },
    });
    return `${prefix}${String(count + 1).padStart(4, '0')}`;
  }

  async findAll(query: any) {
    const pageNum = Math.max(1, parseInt(query.page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    const { search, status, sort = 'desc' } = query;
    const skip = (pageNum - 1) * limitNum;
    const where: Prisma.OrderWhereInput = {};

    if (status) where.orderStatus = status as OrderStatus;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: sort === 'asc' ? 'asc' : 'desc' },
        include: {
          items: true,
          statusHistory: { orderBy: { createdAt: 'desc' } },
          _count: { select: { items: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items: orders,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async findById(id: string, user?: any) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: { select: { name: true, slug: true, images: { where: { isPrimary: true }, take: 1 } } } },
        },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        coupon: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (user && user.type !== 'admin' && order.customerId !== user.id) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async findByOrderNumber(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findByCustomer(customerId: string) {
    const orders = await this.prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    return orders;
  }

  async create(dto: CreateOrderDto) {
    const orderNumber = await this.generateOrderNumber();

    if (dto.couponId) {
      const coupon = await this.prisma.coupon.findUnique({ where: { id: dto.couponId } });
      if (!coupon || !coupon.isActive) throw new BadRequestException('Invalid coupon');
      if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new BadRequestException('Coupon expired');
      if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) throw new BadRequestException('Coupon usage limit reached');
      if (dto.subtotal < Number(coupon.minOrder)) throw new BadRequestException(`Minimum order amount of ${coupon.minOrder} required`);

      await this.prisma.coupon.update({
        where: { id: dto.couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        customerId: dto.customerId,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        customerPhone: dto.customerPhone,
        addressId: dto.addressId,
        shippingAddress: dto.shippingAddress,
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,
        notes: dto.notes,
        subtotal: dto.subtotal,
        shippingCost: dto.shippingCost || 0,
        tax: dto.tax || 0,
        discount: dto.discount || 0,
        total: dto.total,
        couponId: dto.couponId,
        paymentMethod: dto.paymentMethod || 'cod',
        paymentStatus: 'pending',
        orderStatus: 'PENDING',
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            sku: item.sku,
            size: item.size,
            color: item.color,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
            imageUrl: item.imageUrl,
          })),
        },
        statusHistory: {
          create: {
            status: 'PENDING',
            note: 'Order placed successfully',
          },
        },
      },
      include: {
        items: true,
        statusHistory: true,
      },
    });

    for (const item of dto.items) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    this.sendOrderConfirmationEmail(order, dto).catch(err => {
      this.logger.error(`Failed to send confirmation email for order ${order.orderNumber}: ${err.message}`);
    });

    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PACKED', 'CANCELLED'],
      PACKED: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED', 'CANCELLED'],
      DELIVERED: [],
      CANCELLED: [],
    };

    const allowed = validTransitions[order.orderStatus] || [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(`Cannot transition from ${order.orderStatus} to ${dto.status}`);
    }

    const data: any = {
      orderStatus: dto.status,
      statusHistory: {
        create: {
          status: dto.status,
          note: dto.note || `Status changed to ${dto.status}`,
        },
      },
    };

    if (dto.trackingNumber) data.trackingNumber = dto.trackingNumber;
    if (dto.status === 'DELIVERED') data.paymentStatus = 'paid';

    return this.prisma.order.update({
      where: { id },
      data,
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalOrders,
      totalRevenue,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      monthOrders,
      monthRevenue,
      todayOrders,
      lowStockProducts,
      recentOrders,
      revenueByMonth,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.aggregate({ _sum: { total: true }, where: { orderStatus: 'DELIVERED' } }),
      this.prisma.order.count({ where: { orderStatus: 'PENDING' } }),
      this.prisma.order.count({ where: { orderStatus: 'SHIPPED' } }),
      this.prisma.order.count({ where: { orderStatus: 'DELIVERED' } }),
      this.prisma.order.count({ where: { orderStatus: 'CANCELLED' } }),
      this.prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: startOfMonth }, orderStatus: 'DELIVERED' },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } },
      }),
      this.prisma.product.count({ where: { stock: { lte: 5 }, isActive: true } }),
      this.prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      this.prisma.$queryRaw<Array<{ month: Date; count: bigint; revenue: number }>>`
        SELECT DATE_TRUNC('month', "createdAt") as month, COUNT(*)::int as count, SUM("total") as revenue
        FROM "Order"
        WHERE "createdAt" >= ${startOfYear} AND "orderStatus" = 'DELIVERED'
        GROUP BY month
        ORDER BY month ASC
      `,
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      monthOrders,
      monthRevenue: monthRevenue._sum.total || 0,
      todayOrders,
      lowStockProducts,
      recentOrders,
      monthlyRevenue: (revenueByMonth as any[]).map((r: any) => ({
        month: r.month.toISOString().slice(0, 7),
        revenue: Number(r.revenue) || 0,
      })),
    };
  }

  private async sendOrderConfirmationEmail(order: any, dto: CreateOrderDto): Promise<void> {
    try {
      await this.emailService.sendOrderConfirmation({
        orderNumber: order.orderNumber,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        customerPhone: dto.customerPhone,
        shippingAddress: dto.shippingAddress,
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,
        items: dto.items.map(item => ({
          name: item.name,
          size: item.size,
          color: item.color,
          price: Number(item.price),
          quantity: item.quantity,
          total: Number(item.total),
          imageUrl: item.imageUrl,
        })),
        subtotal: Number(dto.subtotal),
        shippingCost: Number(dto.shippingCost || 0),
        tax: Number(dto.tax || 0),
        discount: Number(dto.discount || 0),
        total: Number(dto.total),
        paymentMethod: dto.paymentMethod || 'cod',
        notes: dto.notes,
      });
      this.logger.log(`Order confirmation email sent successfully for order ${order.orderNumber}`);
    } catch (error) {
      this.logger.error(`Failed to send order confirmation email: ${error.message}`);
    }
  }
}
