import { IsUUID, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { DeliveryInfoDto } from './delivery-info.dto';

export class CreateTransactionDto {
  @ApiProperty({ example: 'uuid', description: 'Customer ID' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ example: 'uuid', description: 'Product ID' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 1, description: 'Quantity to purchase', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ type: DeliveryInfoDto })
  @ValidateNested()
  @Type(() => DeliveryInfoDto)
  deliveryInfo: DeliveryInfoDto;
}
