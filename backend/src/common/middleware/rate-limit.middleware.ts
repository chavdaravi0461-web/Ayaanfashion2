import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AdvancedRateLimiter } from './advanced-rate-limiter';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly rateLimiter = new AdvancedRateLimiter();

  private readonly limits = {
    login: { maxRequests: 5, windowMs: 60000, retryAfter: 60 },
    register: { maxRequests: 3, windowMs: 60000, retryAfter: 120 },
    api: { maxRequests: 100, windowMs: 60000, retryAfter: 30 },
    upload: { maxRequests: 10, windowMs: 60000, retryAfter: 30 },
    search: { maxRequests: 20, windowMs: 60000, retryAfter: 30 },
    auth: { maxRequests: 10, windowMs: 60000, retryAfter: 60 },
    default: { maxRequests: 60, windowMs: 60000, retryAfter: 30 },
  };

  private readonly publicPaths = ['/api/products', '/api/categories', '/api/banners', '/api/settings', '/api/health'];

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const path = req.path;
    const method = req.method;

    let limitConfig = this.limits.default;

    if (path.includes('/auth/login') || path.includes('/auth/customer/login')) {
      limitConfig = this.limits.login;
    } else if (path.includes('/auth/register') || path.includes('/auth/customer/register')) {
      limitConfig = this.limits.register;
    } else if (path.includes('/auth/')) {
      limitConfig = this.limits.auth;
    } else if (path.includes('/uploads')) {
      limitConfig = this.limits.upload;
    } else if (path.includes('/search')) {
      limitConfig = this.limits.search;
    } else if (this.publicPaths.some(p => path.startsWith(p)) && method === 'GET') {
      limitConfig = { maxRequests: 200, windowMs: 60000, retryAfter: 10 };
    } else if (path.startsWith('/api')) {
      limitConfig = this.limits.api;
    }

    const key = `${ip}:${this.getPathGroup(path)}`;
    const result = this.rateLimiter.checkRateLimit(
      key,
      limitConfig.maxRequests,
      limitConfig.windowMs,
      req,
    );

    res.setHeader('X-RateLimit-Limit', limitConfig.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, result.remaining || 0));
    res.setHeader('X-RateLimit-Reset', Math.ceil((Date.now() + limitConfig.windowMs) / 1000));

    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfter || limitConfig.retryAfter);
      res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: result.retryAfter || limitConfig.retryAfter,
      });
      return;
    }

    next();
  }

  private getPathGroup(path: string): string {
    if (path.includes('/auth/')) return 'auth';
    if (path.includes('/products')) return 'products';
    if (path.includes('/categories')) return 'categories';
    if (path.includes('/orders')) return 'orders';
    if (path.includes('/uploads')) return 'uploads';
    return 'other';
  }
}
