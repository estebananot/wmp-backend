import { TransactionResponseDto } from './transaction-response.dto';

describe('TransactionResponseDto', () => {
  it('should create transaction response DTO', () => {
    const dto: TransactionResponseDto = {
      id: 'txn-123',
      transactionNumber: 'TXN-1234567890-abc',
      status: 'APPROVED',
      totalAmount: 5207000,
      breakdown: {
        productAmount: 5200000,
        baseFee: 2000,
        deliveryFee: 5000,
      },
      createdAt: new Date(),
    };

    expect(dto.id).toBe('txn-123');
    expect(dto.status).toBe('APPROVED');
    expect(dto.totalAmount).toBe(5207000);
    expect(dto.breakdown.productAmount).toBe(5200000);
  });

  it('should handle different statuses', () => {
    const statuses = ['PENDING', 'APPROVED', 'DECLINED', 'ERROR'] as const;

    statuses.forEach((status) => {
      const dto: TransactionResponseDto = {
        id: 'txn-123',
        transactionNumber: 'TXN-123',
        status,
        totalAmount: 1000,
        breakdown: {
          productAmount: 500,
          baseFee: 200,
          deliveryFee: 300,
        },
      };

      expect(dto.status).toBe(status);
    });
  });

  it('should have optional createdAt', () => {
    const dto: TransactionResponseDto = {
      id: 'txn-123',
      transactionNumber: 'TXN-123',
      status: 'PENDING',
      totalAmount: 1000,
      breakdown: {
        productAmount: 500,
        baseFee: 200,
        deliveryFee: 300,
      },
    };

    expect(dto.createdAt).toBeUndefined();
  });
});
