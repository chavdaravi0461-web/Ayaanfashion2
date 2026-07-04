import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

export const API_KEY_GUARD = 'api_key_guard';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isApiKeyRequired = this.reflector.getAllAndOverride<boolean>(API_KEY_GUARD, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isApiKeyRequired) return true;

    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API key required');
    }

    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

    const validKey = await this.prisma.apiKey.findFirst({
      where: {
        key: hashedKey,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    });

    if (!validKey) {
      this.logger.warn(`Invalid API key attempt from IP: ${request.ip}`);
      throw new UnauthorizedException('Invalid API key');
    }

    await this.prisma.apiKey.update({
      where: { id: validKey.id },
      data: { lastUsedAt: new Date() },
    });

    request.apiKey = validKey;
    return true;
  }
}
