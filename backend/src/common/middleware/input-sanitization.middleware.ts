import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class InputSanitizationMiddleware implements NestMiddleware {
  private readonly XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
    /expression\s*\(/gi,
    /url\s*\(/gi,
    /<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi,
  ];

  private readonly SQL_PATTERNS = [
    /(\b(union|select|insert|update|delete|drop|alter|create|exec|execute|truncate|declare|cast|convert)\b)/gi,
    /(--|\/\*|\*\/|;)/g,
    /(\b(or|and)\b\s+\d+\s*=\s*\d+)/gi,
    /'\s*(or|and)\s*'/gi,
  ];

  private readonly NOSQL_INJECTION_PATTERNS = [
    /\$where/i,
    /\$regex/i,
    /\$ne/i,
    /\$gt/i,
    /\$lt/i,
    /\$eq/i,
    /\$nin/i,
    /\$in/i,
  ];

  private readonly PATH_TRAVERSAL_PATTERNS = [
    /\.\.\//g,
    /\.\.\\ /g,
    /%2e%2e/gi,
    /\.\.%2f/gi,
    /\.\.%5c/gi,
    /%00/gi,
  ];

  use(req: Request, res: Response, next: NextFunction) {
    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }

    if (req.query) {
      req.query = this.sanitizeObject(req.query);
    }

    if (req.params) {
      req.params = this.sanitizeObject(req.params);
    }

    next();
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key of Object.keys(obj)) {
        sanitized[key] = this.sanitizeObject(obj[key]);
      }
      return sanitized;
    }

    return obj;
  }

  private sanitizeString(str: string): string {
    let sanitized = str;

    for (const pattern of this.XSS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }

    for (const pattern of this.SQL_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }

    for (const pattern of this.NOSQL_INJECTION_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }

    for (const pattern of this.PATH_TRAVERSAL_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }

    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    return sanitized;
  }
}
