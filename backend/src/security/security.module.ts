import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { CsrfMiddleware } from '../common/middleware/csrf.middleware';
import { SecurityMonitorMiddleware } from '../common/middleware/security-monitor.middleware';
import { InputSanitizationMiddleware } from '../common/middleware/input-sanitization.middleware';
import { RateLimitMiddleware } from '../common/middleware/rate-limit.middleware';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ApiKeyGuard],
  exports: [ApiKeyGuard],
})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityMonitorMiddleware)
      .exclude(
        { path: '/uploads/(.*)', method: RequestMethod.GET },
        { path: '/_next/(.*)', method: RequestMethod.GET },
        { path: '/images/(.*)', method: RequestMethod.GET },
      )
      .forRoutes('*');

    consumer
      .apply(RateLimitMiddleware)
      .forRoutes('*');

    consumer
      .apply(InputSanitizationMiddleware)
      .exclude(
        { path: '/uploads/(.*)', method: RequestMethod.ALL },
      )
      .forRoutes('*');

    consumer
      .apply(CsrfMiddleware)
      .forRoutes('*');
  }
}
