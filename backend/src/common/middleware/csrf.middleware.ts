import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly CSRF_SECRET = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');
  private readonly CSRF_COOKIE = '_csrf';
  private readonly CSRF_HEADER = 'x-csrf-token';
  private readonly SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];
  private readonly EXEMPT_PATHS = ['/api/auth/login', '/api/auth/register', '/api/auth/customer/login', '/api/auth/customer/register', '/api/auth/refresh', '/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/customer/login', '/api/v1/auth/customer/register', '/api/v1/auth/refresh', '/webhook'];

  use(req: Request, res: Response, next: NextFunction) {
    if (this.EXEMPT_PATHS.some(path => req.path.startsWith(path))) {
      return next();
    }

    if (this.SAFE_METHODS.includes(req.method)) {
      const csrfToken = crypto.randomBytes(32).toString('hex');
      const hmac = crypto.createHmac('sha256', this.CSRF_SECRET).update(csrfToken).digest('hex');
      const signedToken = `${csrfToken}.${hmac}`;

      res.cookie(this.CSRF_COOKIE, signedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 3600000,
      });
      res.setHeader('X-CSRF-Token', signedToken);
      return next();
    }

    const cookieToken = req.cookies?.[this.CSRF_COOKIE];
    const headerToken = req.headers[this.CSRF_HEADER] as string;

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      throw new UnauthorizedException('Invalid CSRF token');
    }

    const [token, hmac] = cookieToken.split('.');
    if (!token || !hmac) {
      throw new UnauthorizedException('Invalid CSRF token format');
    }

    const expectedHmac = crypto.createHmac('sha256', this.CSRF_SECRET).update(token).digest('hex');
    if (hmac !== expectedHmac) {
      throw new UnauthorizedException('Invalid CSRF token signature');
    }

    next();
  }
}
