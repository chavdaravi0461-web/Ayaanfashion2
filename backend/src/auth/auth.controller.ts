import { Controller, Post, Get, Body, UseGuards, Headers } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user);
  }

  @Post('customer/login')
  customerLogin(@Body() dto: { email: string; password: string }) {
    return this.authService.customerLogin(dto.email, dto.password);
  }

  @Post('customer/register')
  customerRegister(@Body() dto: { name: string; email: string; password: string; phone?: string }) {
    return this.authService.customerRegister(dto);
  }

  @Get('customer/profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  customerProfile(@CurrentUser() user: any) {
    if (user.type !== 'customer') throw new Error('Not a customer');
    return this.authService.customerProfile(user.id);
  }

  @Post('refresh')
  refreshToken(@Body('token') token: string) {
    return this.authService.refreshToken(token);
  }
}
