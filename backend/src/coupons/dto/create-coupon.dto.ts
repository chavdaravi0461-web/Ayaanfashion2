import { IsString, IsNumber, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCouponDto {
  @ApiProperty() @IsString() code: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsNumber() @Type(() => Number) discount: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() type?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Type(() => Number) minOrder?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Type(() => Number) maxUses?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() @Type(() => Boolean) isActive?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() expiresAt?: string;
}
