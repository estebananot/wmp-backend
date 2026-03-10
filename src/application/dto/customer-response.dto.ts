import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Juan Pérez' })
  name: string;

  @ApiProperty({ example: 'juan@example.com' })
  email: string;

  @ApiPropertyOptional({ example: '+573001234567' })
  phone?: string;

  @ApiProperty()
  createdAt: Date;
}
