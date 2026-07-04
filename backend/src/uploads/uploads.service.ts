import { Injectable, BadRequestException } from '@nestjs/common';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

@Injectable()
export class UploadsService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, options?: { width?: number; height?: number }) {
    if (!file) throw new BadRequestException('No file provided');

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File too large. Maximum size is 5MB');
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.tif', '.avif', '.heic', '.heif', '.ico'];
    if (!allowedExts.includes(ext)) {
      throw new BadRequestException('Invalid file type. Allowed: all image formats except SVG');
    }

    const sanitizedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff', 'image/avif', 'image/heic', 'image/heif', 'image/x-icon', 'image/vnd.microsoft.icon'];
    if (!sanitizedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file content type');
    }

    const filename = `${crypto.randomUUID()}${ext}`;
    const filepath = path.join(this.uploadDir, filename);

    const width = options?.width || 1200;
    const height = options?.height || 1200;
    await sharp(file.buffer)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .toFile(filepath);

    return {
      url: `/uploads/${filename}`,
      filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  async uploadMultiple(files: Express.Multer.File[]) {
    if (!files || files.length === 0) throw new BadRequestException('No files provided');

    const results = await Promise.all(files.map((file) => this.uploadFile(file)));
    return { files: results };
  }
}
