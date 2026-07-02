import { IsString, IsNumber, IsOptional, IsArray, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class OrderItemDto {
  @ApiProperty() @IsString() productId: string;
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() sku?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() size?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() color?: string;
  @ApiProperty() @IsNumber() @Type(() => Number) price: number;
  @ApiProperty() @IsNumber() @Type(() => Number) @Min(1) quantity: number;
  @ApiProperty() @IsNumber() @Type(() => Number) total: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() imageUrl?: string;
}

export class CreateOrderDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() customerId?: string;
  @ApiProperty() @IsString() customerName: string;
  @ApiProperty() @IsString() customerEmail: string;
  @ApiProperty() @IsString() customerPhone: string;
  @ApiProperty() @IsString() shippingAddress: string;
  @ApiProperty() @IsString() city: string;
  @ApiProperty() @IsString() state: string;
  @ApiProperty() @IsString() pincode: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
  @ApiProperty() @IsNumber() @Type(() => Number) subtotal: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Type(() => Number) shippingCost?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Type(() => Number) tax?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Type(() => Number) discount?: number;
  @ApiProperty() @IsNumber() @Type(() => Number) total: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() couponId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() paymentMethod?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() addressId?: string;
  @ApiProperty({ type: [OrderItemDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => OrderItemDto) items: OrderItemDto[];
}
