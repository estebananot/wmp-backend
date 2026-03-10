import { Test, TestingModule } from '@nestjs/testing';
import { GetTransactionUseCase } from './get-transaction.usecase';
import { Transaction } from '../../../domain/entities/transaction.entity';

describe('GetTransactionUseCase', () => {
  let useCase: GetTransactionUseCase;
  let mockTransactionRepository: any;
  let mockPaymentService: any;

  beforeEach(async () => {
    mockTransactionRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };
    mockPaymentService = {
      getTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTransactionUseCase,
        {
          provide: 'TransactionRepositoryInterface',
          useValue: mockTransactionRepository,
        },
        { provide: 'PaymentServiceInterface', useValue: mockPaymentService },
      ],
    }).compile();

    useCase = module.get<GetTransactionUseCase>(GetTransactionUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should fail when transaction not found', async () => {
    mockTransactionRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute('txn-999');

    expect(result.isFailure).toBe(true);
    expect(result.error.message).toBe('Transaction not found');
  });

  it('should return transaction when found', async () => {
    const transaction = new Transaction({
      transactionNumber: 'TXN-123',
      customerId: 'cust-123',
      productId: 'prod-123',
      quantity: 2,
      productAmount: 100000,
      baseFee: 2000,
      deliveryFee: 10000,
      totalAmount: 112000,
      status: 'APPROVED',
    });
    mockTransactionRepository.findById.mockResolvedValue(transaction);

    const result = await useCase.execute('txn-123');

    expect(result.isSuccess).toBe(true);
    expect(result.value.transactionNumber).toBe('TXN-123');
    expect(result.value.status).toBe('APPROVED');
  });

  it('should update status from PENDING to APPROVED when Wompi status changes', async () => {
    const transaction = new Transaction({
      transactionNumber: 'TXN-123',
      customerId: 'cust-123',
      productId: 'prod-123',
      quantity: 2,
      productAmount: 100000,
      baseFee: 2000,
      deliveryFee: 10000,
      totalAmount: 112000,
      status: 'PENDING',
    });
    transaction.wompiTransactionId = 'wompi-123';
    mockTransactionRepository.findById.mockResolvedValue(transaction);

    mockPaymentService.getTransaction.mockResolvedValue({
      id: 'wompi-123',
      status: 'APPROVED',
    });

    const result = await useCase.execute('txn-123');

    expect(result.isSuccess).toBe(true);
    expect(result.value.status).toBe('APPROVED');
    expect(mockTransactionRepository.update).toHaveBeenCalled();
  });

  it('should not update when Wompi status is still PENDING', async () => {
    const transaction = new Transaction({
      transactionNumber: 'TXN-123',
      customerId: 'cust-123',
      productId: 'prod-123',
      quantity: 2,
      productAmount: 100000,
      baseFee: 2000,
      deliveryFee: 10000,
      totalAmount: 112000,
      status: 'PENDING',
    });
    transaction.wompiTransactionId = 'wompi-123';
    mockTransactionRepository.findById.mockResolvedValue(transaction);

    mockPaymentService.getTransaction.mockResolvedValue({
      id: 'wompi-123',
      status: 'PENDING',
    });

    const result = await useCase.execute('txn-123');

    expect(result.isSuccess).toBe(true);
    expect(result.value.status).toBe('PENDING');
    expect(mockTransactionRepository.update).not.toHaveBeenCalled();
  });

  it('should handle Wompi API errors gracefully', async () => {
    const transaction = new Transaction({
      transactionNumber: 'TXN-123',
      customerId: 'cust-123',
      productId: 'prod-123',
      quantity: 2,
      productAmount: 100000,
      baseFee: 2000,
      deliveryFee: 10000,
      totalAmount: 112000,
      status: 'PENDING',
    });
    transaction.wompiTransactionId = 'wompi-123';
    mockTransactionRepository.findById.mockResolvedValue(transaction);

    mockPaymentService.getTransaction.mockRejectedValue(
      new Error('Wompi API error'),
    );

    const result = await useCase.execute('txn-123');

    expect(result.isSuccess).toBe(true);
    expect(result.value.status).toBe('PENDING');
  });

  it('should handle errors during fetch', async () => {
    mockTransactionRepository.findById.mockRejectedValue(
      new Error('Database error'),
    );

    const result = await useCase.execute('txn-123');

    expect(result.isFailure).toBe(true);
  });
});
