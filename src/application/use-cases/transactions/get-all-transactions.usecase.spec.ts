import { Test, TestingModule } from '@nestjs/testing';
import { GetAllTransactionsUseCase } from './get-all-transactions.usecase';
import type { TransactionRepositoryInterface } from '../../../domain/repositories/transaction.repository.interface';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { Result } from '../../../common/result/result';

describe('GetAllTransactionsUseCase', () => {
  let useCase: GetAllTransactionsUseCase;

  const mockTransactions: Transaction[] = [
    new Transaction({
      id: 'transaction-1',
      transactionNumber: 'TXN-1234567890-abc',
      customerId: 'customer-1',
      productId: 'product-1',
      quantity: 1,
      productAmount: 1000,
      baseFee: 2000,
      deliveryFee: 5000,
      totalAmount: 8000,
      status: 'PENDING',
    }),
    new Transaction({
      id: 'transaction-2',
      transactionNumber: 'TXN-1234567891-def',
      customerId: 'customer-2',
      productId: 'product-2',
      quantity: 2,
      productAmount: 2000,
      baseFee: 2000,
      deliveryFee: 5000,
      totalAmount: 9000,
      status: 'APPROVED',
    }),
  ];

  const mockRepository = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllTransactionsUseCase,
        { provide: 'TransactionRepositoryInterface', useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<GetAllTransactionsUseCase>(GetAllTransactionsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return all transactions', async () => {
      mockRepository.findAll.mockResolvedValue(mockTransactions);

      const result = await useCase.execute();

      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(result.isFailure).toBe(false);
      expect(result.value).toHaveLength(2);
    });

    it('should return empty array when no transactions', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result.isFailure).toBe(false);
      expect(result.value).toHaveLength(0);
    });

    it('should handle repository errors', async () => {
      mockRepository.findAll.mockRejectedValue(new Error('Database error'));

      const result = await useCase.execute();

      expect(result.isFailure).toBe(true);
      expect(result.error.message).toBe('Database error');
    });
  });
});
