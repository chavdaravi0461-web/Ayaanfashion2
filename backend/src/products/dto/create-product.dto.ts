import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ImageDto {
  @ApiProperty() @IsString() url: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isPrimary?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsString() alt?: string;
}

export class VariantDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() size?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() color?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() colorCode?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Type(() => Number) stock?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() sku?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Type(() => Number) price?: number;
}

export class CreateProductDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty() @IsNumber() @Type(() => Number) mrp: number;
  @ApiProperty() @IsNumber() @Type(() => Number) salePrice: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Type(() => Number) discount?: number;
  @ApiProperty() @IsString() sku: string;
  @ApiProperty() @IsNumber() @Type(() => Number) stock: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() @Type(() => Boolean) isFeatured?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() @Type(() => Boolean) isNewArrival?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() @Type(() => Boolean) isBestSeller?: boolean;
  @ApiProperty() @IsString() categoryId: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() seoTitle?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() seoDescription?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() tags?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsArray() images?: ImageDto[];
  @ApiProperty({ required: false }) @IsOptional() @IsArray() variants?: VariantDto[];
}
