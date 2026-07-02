import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async findByCustomer(customerId: string) {
    return this.prisma.address.findMany({
      where: { customerId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findById(id: string) {
    const address = await this.prisma.address.findUnique({ where: { id } });
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  async create(customerId: string, data: {
    name: string; phone: string; address: string; city: string; state: string; pincode: string; isDefault?: boolean;
  }) {
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { customerId },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.create({
      data: { ...data, customerId, isDefault: data.isDefault || false },
    });
  }

  async update(id: string, customerId: string, data: any) {
    const address = await this.prisma.address.findFirst({ where: { id, customerId } });
    if (!address) throw new NotFoundException('Address not found');

    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { customerId, id: { not: id } },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.update({ where: { id }, data });
  }

  async remove(id: string, customerId: string) {
    const address = await this.prisma.address.findFirst({ where: { id, customerId } });
    if (!address) throw new NotFoundException('Address not found');
    await this.prisma.address.delete({ where: { id } });
    return { message: 'Address deleted' };
  }

  async setDefault(id: string, customerId: string) {
    const address = await this.prisma.address.findFirst({ where: { id, customerId } });
    if (!address) throw new NotFoundException('Address not found');
    await this.prisma.address.updateMany({
      where: { customerId },
      data: { isDefault: false },
    });
    return this.prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });
  }
}
