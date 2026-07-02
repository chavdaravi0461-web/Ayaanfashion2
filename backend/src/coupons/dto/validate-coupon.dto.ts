import { IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateCouponDto {
  @ApiProperty() @IsString() code: string;
  @ApiProperty() @IsNumber() @Type(() => Number) orderTotal: number;
}
