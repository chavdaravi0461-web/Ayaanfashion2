import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { success: true, status: 'ok', database: 'connected', timestamp: new Date().toISOString() };
    } catch {
      return { success: false, status: 'degraded', database: 'disconnected', timestamp: new Date().toISOString() };
    }
  }
}
