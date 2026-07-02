import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Wishlist')
@Controller('wishlist')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  findByCustomer(@CurrentUser() user: any) {
    return this.wishlistService.findByCustomer(user.id);
  }

  @Post(':productId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  add(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.wishlistService.add(user.id, productId);
  }

  @Delete(':productId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  remove(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.wishlistService.remove(user.id, productId);
  }

  @Post(':productId/toggle')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  toggle(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.wishlistService.toggle(user.id, productId);
  }
}
