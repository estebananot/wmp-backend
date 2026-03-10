import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransactionBreakdownDto {
  @ApiProperty({ example: 4500000 })
  productAmount: number;

  @ApiProperty({ example: 2000 })
  baseFee: number;

  @ApiProperty({ example: 5000 })
  deliveryFee: number;
}

export class TransactionProductDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  price: number;
}

export class TransactionCustomerDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}

export class TransactionDeliveryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  deliveryStatus: string;
}

export class TransactionResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'TXN-1234567890-abc123' })
  transactionNumber: string;

  @ApiProperty({
    example: 'PENDING',
    enum: ['PENDING', 'APPROVED', 'DECLINED', 'ERROR'],
  })
  status: string;

  @ApiProperty({ example: 4507000, description: 'Total amount in COP' })
  totalAmount: number;

  @ApiProperty({ type: TransactionBreakdownDto })
  breakdown: TransactionBreakdownDto;

  @ApiPropertyOptional({ type: TransactionProductDto })
  product?: TransactionProductDto;

  @ApiPropertyOptional({ type: TransactionCustomerDto })
  customer?: TransactionCustomerDto;

  @ApiPropertyOptional({ type: TransactionDeliveryDto })
  delivery?: TransactionDeliveryDto;

  @ApiProperty()
  createdAt: Date;
}
