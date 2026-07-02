import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const settings = await this.prisma.setting.findMany({ orderBy: { key: 'asc' } });
    const result: Record<string, string> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  }

  async findOne(key: string) {
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    if (!setting) throw new NotFoundException(`Setting '${key}' not found`);
    return setting;
  }

  async update(settings: Record<string, string>) {
    for (const [key, value] of Object.entries(settings)) {
      await this.prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
    return this.findAll();
  }
}
