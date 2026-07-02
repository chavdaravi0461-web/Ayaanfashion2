import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const admin = await this.prisma.admin.findUnique({ where: { email: dto.email } });
    if (!admin || !(await bcrypt.compare(dto.password, admin.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!admin.isActive) throw new UnauthorizedException('Account is deactivated');
    return this.generateToken(admin);
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.admin.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already exists');
    const hashed = await bcrypt.hash(dto.password, 12);
    const admin = await this.prisma.admin.create({
      data: { ...dto, password: hashed },
    });
    return this.generateToken(admin);
  }

  async getProfile(user: any) {
    if (user.type === 'customer') {
      return this.customerProfile(user.id);
    }
    return this.prisma.admin.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });
  }

  async customerLogin(email: string, password: string) {
    const customer = await this.prisma.customer.findUnique({ where: { email } });
    if (!customer || !(await bcrypt.compare(password, customer.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: customer.id, email: customer.email, type: 'customer' };
    return { access_token: this.jwtService.sign(payload), customer };
  }

  async customerRegister(data: { name: string; email: string; password: string; phone?: string }) {
    const exists = await this.prisma.customer.findUnique({ where: { email: data.email } });
    if (exists) throw new ConflictException('Email already registered');
    const hashed = await bcrypt.hash(data.password, 12);
    const customer = await this.prisma.customer.create({
      data: { ...data, password: hashed },
    });
    const payload = { sub: customer.id, email: customer.email, type: 'customer' };
    return { access_token: this.jwtService.sign(payload), customer };
  }

  async customerProfile(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true, name: true, email: true, phone: true, createdAt: true,
        _count: { select: { orders: true, addresses: true, wishlist: true } },
        addresses: { orderBy: { isDefault: 'desc' } },
      },
    });
    if (!customer) throw new UnauthorizedException('Customer not found');
    return customer;
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const newPayload = { sub: payload.sub, email: payload.email, type: payload.type };
      return { access_token: this.jwtService.sign(newPayload) };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private generateToken(admin: any) {
    const payload = { sub: admin.id, email: admin.email, type: 'admin' };
    return {
      access_token: this.jwtService.sign(payload),
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    };
  }
}
