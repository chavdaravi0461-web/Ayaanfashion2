import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { TwoFactorService } from '../two-factor/two-factor.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private twoFactorService: TwoFactorService,
  ) {}

  private checkLockout(key: string): void {
    const attempt = this.loginAttempts.get(key);
    if (attempt && attempt.lockedUntil > Date.now()) {
      const remaining = Math.ceil((attempt.lockedUntil - Date.now()) / 1000);
      throw new UnauthorizedException(`Account locked. Try again in ${remaining} seconds`);
    }
    if (attempt && attempt.lockedUntil <= Date.now()) {
      this.loginAttempts.delete(key);
    }
  }

  private recordFailedAttempt(key: string): void {
    const attempt = this.loginAttempts.get(key) || { count: 0, lockedUntil: 0 };
    attempt.count++;
    if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
      attempt.lockedUntil = Date.now() + LOCKOUT_DURATION;
      this.logger.warn(`Account locked: ${key} due to ${attempt.count} failed attempts`);
    }
    this.loginAttempts.set(key, attempt);
  }

  private clearAttempts(key: string): void {
    this.loginAttempts.delete(key);
  }

  async login(dto: LoginDto) {
    this.checkLockout(dto.email);
    const admin = await this.prisma.admin.findUnique({ where: { email: dto.email } });
    if (!admin || !(await bcrypt.compare(dto.password, admin.password))) {
      this.recordFailedAttempt(dto.email);
      this.logger.warn(`Failed login attempt for email: ${dto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!admin.isActive) throw new UnauthorizedException('Account is deactivated');

    if (admin.twoFactorEnabled) {
      if (!dto.twoFactorCode) {
        return {
          requiresTwoFactor: true,
          message: 'Two-factor authentication required',
        };
      }

      const isValid = await this.twoFactorService.verifyToken(admin.id, dto.twoFactorCode);
      if (!isValid) {
        const isRecoveryCode = await this.twoFactorService.verifyRecoveryCode(admin.id, dto.twoFactorCode);
        if (!isRecoveryCode) {
          this.recordFailedAttempt(dto.email);
          throw new UnauthorizedException('Invalid 2FA code');
        }
      }
    }

    this.clearAttempts(dto.email);
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
      select: {
        id: true, name: true, email: true, role: true, isActive: true, createdAt: true,
        twoFactorEnabled: true,
      },
    });
  }

  async customerLogin(email: string, password: string) {
    this.checkLockout(`customer:${email}`);
    const customer = await this.prisma.customer.findUnique({ where: { email } });
    if (!customer || !(await bcrypt.compare(password, customer.password))) {
      this.recordFailedAttempt(`customer:${email}`);
      this.logger.warn(`Failed customer login attempt for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }
    this.clearAttempts(`customer:${email}`);
    const payload = { sub: customer.id, email: customer.email, type: 'customer' };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '12h' }),
      customer: this.sanitizeCustomer(customer),
    };
  }

  async customerRegister(data: { name: string; email: string; password: string; phone?: string }) {
    const exists = await this.prisma.customer.findUnique({ where: { email: data.email } });
    if (exists) throw new ConflictException('Email already registered');
    const hashed = await bcrypt.hash(data.password, 12);
    const customer = await this.prisma.customer.create({
      data: { ...data, password: hashed },
    });
    const payload = { sub: customer.id, email: customer.email, type: 'customer' };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '12h' }),
      customer: this.sanitizeCustomer(customer),
    };
  }

  private sanitizeCustomer(customer: any) {
    const { password, ...safe } = customer;
    return safe;
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
      const expiresIn = payload.type === 'customer' ? '12h' : '24h';
      return { access_token: this.jwtService.sign(newPayload, { expiresIn }) };
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
