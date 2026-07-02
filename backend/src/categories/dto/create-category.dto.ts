import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() image?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() parentId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() sortOrder?: number;
}
