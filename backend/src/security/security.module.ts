import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
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
      .forRoutes('*');

    consumer
      .apply(InputSanitizationMiddleware)
      .forRoutes('*');

    consumer
      .apply(RateLimitMiddleware)
      .forRoutes('*');

    consumer
      .apply(CsrfMiddleware)
      .forRoutes('*');
  }
}
