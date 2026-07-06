import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { CouponsModule } from './coupons/coupons.module';
import { BannersModule } from './banners/banners.module';
import { SettingsModule } from './settings/settings.module';
import { CustomersModule } from './customers/customers.module';
import { UploadsModule } from './uploads/uploads.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { AddressesModule } from './addresses/addresses.module';
import { HealthModule } from './health/health.module';
import { SecurityModule } from './security/security.module';
import { TwoFactorModule } from './two-factor/two-factor.module';
import { EmailModule } from './email/email.module';
import { SecurityMonitoringService } from './security/security-monitoring.service';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      { ttl: 60000, limit: 100 },
      { ttl: 1000, limit: 20 },
      { ttl: 300000, limit: 300 },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        maxAge: '30d',
        immutable: true,
        etag: true,
        lastModified: true,
        dotfiles: 'deny',
        index: false,
      },
    }),
    EmailModule,
    SecurityModule,
    TwoFactorModule,
    PrismaModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    CouponsModule,
    BannersModule,
    SettingsModule,
    CustomersModule,
    UploadsModule,
    WishlistModule,
    AddressesModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    RolesGuard,
    SecurityMonitoringService,
  ],
})
export class AppModule {}
