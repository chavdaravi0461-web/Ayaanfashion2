import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'featured', required: false })
  @ApiQuery({ name: 'newArrival', required: false })
  @ApiQuery({ name: 'bestSeller', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  findAll(@Query() query: any) {
    return this.productsService.findAll(query);
  }

  @Get('featured')
  findFeatured() {
    return this.productsService.findFeatured();
  }

  @Get('new-arrivals')
  findNewArrivals() {
    return this.productsService.findNewArrivals();
  }

  @Get('best-sellers')
  findBestSellers() {
    return this.productsService.findBestSellers();
  }

  @Get('related/:id')
  findRelated(@Param('id') id: string) {
    return this.productsService.findRelated(id);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post(':id/images')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  addImage(
    @Param('id') id: string,
    @Body() body: { url: string; alt?: string; isPrimary?: boolean },
  ) {
    return this.productsService.addImage(id, body.url, body.alt, body.isPrimary);
  }

  @Delete(':id/images/:imageId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  removeImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.productsService.removeImage(id, imageId);
  }

  @Post(':id/reviews')
  createReview(@Param('id') id: string, @Body() body: { rating: number; comment?: string; customerId?: string }) {
    return this.productsService.createReview(id, body);
  }

  @Get(':id/reviews')
  getReviews(@Param('id') id: string) {
    return this.productsService.getReviews(id);
  }
}
