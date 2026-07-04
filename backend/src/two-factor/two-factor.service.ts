import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

export interface TwoFactorSecret {
  secret: string;
  otpauthUrl: string;
  qrCodeUrl: string;
}

@Injectable()
export class TwoFactorService {
  private readonly logger = new Logger(TwoFactorService.name);
  private readonly ISSUER = 'Ayaan Fashion';
  private readonly ALGORITHM = 'SHA1';
  private readonly DIGITS = 6;
  private readonly PERIOD = 30;
  private readonly SKEW = 1;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async generateSecret(adminId: string): Promise<TwoFactorSecret> {
    const secret = crypto.randomBytes(20).toString('base64');
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new UnauthorizedException('Admin not found');

    await this.prisma.admin.update({
      where: { id: adminId },
      data: { twoFactorSecret: secret, twoFactorEnabled: false },
    });

    const otpauthUrl = `otpauth://totp/${encodeURIComponent(this.ISSUER)}:${encodeURIComponent(admin.email)}?secret=${secret}&issuer=${encodeURIComponent(this.ISSUER)}&algorithm=${this.ALGORITHM}&digits=${this.DIGITS}&period=${this.PERIOD}`;

    return {
      secret,
      otpauthUrl,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`,
    };
  }

  async verifyToken(adminId: string, token: string): Promise<boolean> {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin || !admin.twoFactorSecret) return false;

    const currentTime = Math.floor(Date.now() / 1000 / this.PERIOD);

    for (let i = -this.SKEW; i <= this.SKEW; i++) {
      const time = currentTime + i;
      const expectedToken = this.generateTOTP(admin.twoFactorSecret, time);
      if (token === expectedToken) return true;
    }

    return false;
  }

  async enable2FA(adminId: string, token: string): Promise<{ recoveryCodes: string[] }> {
    const isValid = await this.verifyToken(adminId, token);
    if (!isValid) throw new UnauthorizedException('Invalid 2FA token');

    const recoveryCodes = Array.from({ length: 10 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    const hashedCodes = await Promise.all(
      recoveryCodes.map(code => crypto.createHash('sha256').update(code).digest('hex'))
    );

    await this.prisma.admin.update({
      where: { id: adminId },
      data: {
        twoFactorEnabled: true,
        twoFactorRecoveryCodes: hashedCodes.join(','),
      },
    });

    return { recoveryCodes };
  }

  async disable2FA(adminId: string, token: string): Promise<void> {
    const isValid = await this.verifyToken(adminId, token);
    if (!isValid) throw new UnauthorizedException('Invalid 2FA token');

    await this.prisma.admin.update({
      where: { id: adminId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorRecoveryCodes: null,
      },
    });
  }

  async verifyRecoveryCode(adminId: string, code: string): Promise<boolean> {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin || !admin.twoFactorRecoveryCodes) return false;

    const hashedCode = crypto.createHash('sha256').update(code.toUpperCase()).digest('hex');
    const codes = admin.twoFactorRecoveryCodes.split(',');

    const codeIndex = codes.indexOf(hashedCode);
    if (codeIndex === -1) return false;

    codes.splice(codeIndex, 1);
    await this.prisma.admin.update({
      where: { id: adminId },
      data: { twoFactorRecoveryCodes: codes.join(',') },
    });

    return true;
  }

  private generateTOTP(secret: string, time: number): string {
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeBigInt64BE(BigInt(time));

    const hmac = crypto.createHmac(this.ALGORITHM, Buffer.from(secret, 'base64'));
    hmac.update(timeBuffer);
    const hash = hmac.digest();

    const offset = hash[hash.length - 1] & 0x0f;
    const code = (
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff)
    ) % Math.pow(10, this.DIGITS);

    return code.toString().padStart(this.DIGITS, '0');
  }
}
