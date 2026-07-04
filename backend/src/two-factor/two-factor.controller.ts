import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { TwoFactorService } from './two-factor.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Two-Factor Authentication')
@Controller('auth/2fa')
export class TwoFactorController {
  constructor(private twoFactorService: TwoFactorService) {}

  @Post('generate')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async generate(@CurrentUser() user: any) {
    if (user.type !== 'admin') {
      throw new Error('Only admins can enable 2FA');
    }
    return this.twoFactorService.generateSecret(user.id);
  }

  @Post('verify')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async verify(@CurrentUser() user: any, @Body('token') token: string) {
    const isValid = await this.twoFactorService.verifyToken(user.id, token);
    return { valid: isValid };
  }

  @Post('enable')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async enable(@CurrentUser() user: any, @Body('token') token: string) {
    if (user.type !== 'admin') {
      throw new Error('Only admins can enable 2FA');
    }
    return this.twoFactorService.enable2FA(user.id, token);
  }

  @Post('disable')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async disable(@CurrentUser() user: any, @Body('token') token: string) {
    if (user.type !== 'admin') {
      throw new Error('Only admins can disable 2FA');
    }
    await this.twoFactorService.disable2FA(user.id, token);
    return { message: '2FA disabled successfully' };
  }

  @Post('recovery')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async verifyRecovery(@Body('adminId') adminId: string, @Body('code') code: string) {
    const isValid = await this.twoFactorService.verifyRecoveryCode(adminId, code);
    return { valid: isValid };
  }
}
