import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private cache = new Map<string, { data: any; expiresAt: number }>();
  private readonly defaultTTL = parseInt(process.env.CACHE_TTL || '300') * 1000;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    if (req.method !== 'GET') return next.handle();

    const key = `${req.originalUrl}`;
    const cached = this.cache.get(key);

    if (cached && cached.expiresAt > Date.now()) {
      res.setHeader('X-Cache', 'HIT');
      return of(cached.data);
    }

    this.cache.delete(key);

    return next.handle().pipe(
      tap(data => {
        if (data && req.url.includes('/products/featured') || req.url.includes('/products/new-arrivals') || req.url.includes('/products/best-sellers') || req.url.includes('/categories')) {
          this.cache.set(key, { data, expiresAt: Date.now() + this.defaultTTL });
          res.setHeader('X-Cache', 'MISS');
        }
      }),
    );
  }
}
