import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'iPhone 14 Pro' })
  name: string;

  @ApiProperty({ example: 'Latest Apple smartphone...' })
  description: string;

  @ApiProperty({ example: 4500000, description: 'Price in COP' })
  price: number;

  @ApiProperty({ example: 15, description: 'Available stock' })
  stock: number;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  imageUrl: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
