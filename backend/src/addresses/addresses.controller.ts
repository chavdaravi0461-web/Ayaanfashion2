import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Addresses')
@Controller('addresses')
export class AddressesController {
  constructor(private addressesService: AddressesService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  findByCustomer(@CurrentUser() user: any) {
    return this.addressesService.findByCustomer(user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  findById(@Param('id') id: string) {
    return this.addressesService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  create(@CurrentUser() user: any, @Body() body: {
    name: string; phone: string; address: string; city: string; state: string; pincode: string; isDefault?: boolean;
  }) {
    return this.addressesService.create(user.id, body);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    return this.addressesService.update(id, user.id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.addressesService.remove(id, user.id);
  }

  @Put(':id/default')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  setDefault(@CurrentUser() user: any, @Param('id') id: string) {
    return this.addressesService.setDefault(id, user.id);
  }
}
