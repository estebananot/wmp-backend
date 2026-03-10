import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DeliveryInfoDto {
  @ApiProperty({ example: 'Calle 123 #45-67, Edificio ABC, Apto 101' })
  @IsString()
  @MinLength(10)
  address: string;

  @ApiProperty({ example: 'Bogotá' })
  @IsString()
  city: string;

  @ApiPropertyOptional({ example: 'Cundinamarca' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ example: '110111' })
  @IsOptional()
  @IsString()
  postalCode?: string;
}
