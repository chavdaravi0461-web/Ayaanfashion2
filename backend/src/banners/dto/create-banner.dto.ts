import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBannerDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() subtitle?: string;
  @ApiProperty() @IsString() image: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() link?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() linkText?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() sortOrder?: number;
}
