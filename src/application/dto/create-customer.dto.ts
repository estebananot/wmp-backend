import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Juan Pérez', description: 'Customer full name' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'juan@example.com', description: 'Customer email' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    example: '+573001234567',
    description: 'Customer phone',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
