import { Test, TestingModule } from '@nestjs/testing';
import { WompiWebhookUseCase } from './wompi-webhook.usecase';
import type { TransactionRepositoryInterface } from '../../../domain/repositories/transaction.repository.interface';
import type { ProductRepositoryInterface } from '../../../domain/repositories/product.repository.interface';
import type { DeliveryRepositoryInterface } from '../../../domain/repositories/delivery.repository.interface';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { Product } from '../../../domain/entities/product.entity';
import * as crypto from 'crypto';

jest.mock('crypto', () => ({
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      digest: jest.fn().mockReturnValue('valid_checksum'),
    }),
  }),
}));

describe('WompiWebhookUseCase', () => {
  let useCase: WompiWebhookUseCase;

  const mockTransaction = new Transaction({
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
  });

  const mockProduct = new Product({
    id: 'product-1',
    name: 'Product 1',
    description: 'Description',
    price: 1000,
    stock: 10,
    imageUrl: 'http://example.com/image.jpg',
  });

  const mockTransactionRepo = {
    findByTransactionNumber: jest.fn(),
    update: jest.fn(),
  };

  const mockProductRepo = {
    findById: jest.fn().mockResolvedValue(mockProduct),
    update: jest.fn(),
  };

  const mockDeliveryRepo = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WompiWebhookUseCase,
        {
          provide: 'TransactionRepositoryInterface',
          useValue: mockTransactionRepo,
        },
        { provide: 'ProductRepositoryInterface', useValue: mockProductRepo },
        { provide: 'DeliveryRepositoryInterface', useValue: mockDeliveryRepo },
      ],
    }).compile();

    useCase = module.get<WompiWebhookUseCase>(WompiWebhookUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockEvent = {
      event: 'transaction.updated',
      data: {
        transaction: {
          id: '15113-1234567890-99999',
          reference: 'TXN-1234567890-abc-1234567890',
          amount_in_cents: 800000,
          currency: 'COP',
          status: 'APPROVED',
          payment_method_type: 'CARD',
          customer_email: 'test@example.com',
        },
      },
      environment: 'test',
      signature: {
        properties: [
          'transaction.id',
          'transaction.status',
          'transaction.amount_in_cents',
        ],
        checksum: 'dummy_checksum',
      },
      timestamp: 1234567890,
      sent_at: '2026-03-09T12:00:00.000Z',
    };

    it('should process webhook successfully', async () => {
      mockTransactionRepo.findByTransactionNumber.mockResolvedValue(
        mockTransaction,
      );
      mockTransactionRepo.update.mockResolvedValue({
        ...mockTransaction,
        status: 'APPROVED',
      });

      const result = await useCase.execute(mockEvent);

      expect(mockTransactionRepo.update).toHaveBeenCalled();
      expect(result.isFailure).toBe(false);
    });

    it('should return error when transaction not found', async () => {
      mockTransactionRepo.findByTransactionNumber.mockResolvedValue(null);

      const result = await useCase.execute(mockEvent);

      expect(result.isFailure).toBe(true);
      expect(result.error.message).toBe('Transaction not found');
    });

    it('should skip update if status is same', async () => {
      const approvedTransaction = new Transaction({
        ...mockTransaction,
        status: 'APPROVED',
      });
      mockTransactionRepo.findByTransactionNumber.mockResolvedValue(
        approvedTransaction,
      );

      const result = await useCase.execute(mockEvent);

      expect(mockTransactionRepo.update).not.toHaveBeenCalled();
      expect(result.isFailure).toBe(false);
    });

    it('should handle DECLINED status', async () => {
      const declinedEvent = {
        ...mockEvent,
        data: {
          ...mockEvent.data,
          transaction: {
            ...mockEvent.data.transaction,
            status: 'DECLINED',
          },
        },
      };
      mockTransactionRepo.findByTransactionNumber.mockResolvedValue(
        mockTransaction,
      );
      mockTransactionRepo.update.mockResolvedValue({
        ...mockTransaction,
        status: 'DECLINED',
      });

      const result = await useCase.execute(declinedEvent);

      expect(mockTransactionRepo.update).toHaveBeenCalled();
      expect(mockProductRepo.update).not.toHaveBeenCalled();
      expect(result.isFailure).toBe(false);
    });

    it('should handle VOIDED status', async () => {
      const voidedEvent = {
        ...mockEvent,
        data: {
          ...mockEvent.data,
          transaction: {
            ...mockEvent.data.transaction,
            status: 'VOIDED',
          },
        },
      };
      mockTransactionRepo.findByTransactionNumber.mockResolvedValue(
        mockTransaction,
      );
      mockTransactionRepo.update.mockResolvedValue({
        ...mockTransaction,
        status: 'DECLINED',
      });

      const result = await useCase.execute(voidedEvent);

      expect(result.isFailure).toBe(false);
    });

    it('should handle ERROR status', async () => {
      const errorEvent = {
        ...mockEvent,
        data: {
          ...mockEvent.data,
          transaction: {
            ...mockEvent.data.transaction,
            status: 'ERROR',
          },
        },
      };
      mockTransactionRepo.findByTransactionNumber.mockResolvedValue(
        mockTransaction,
      );
      mockTransactionRepo.update.mockResolvedValue({
        ...mockTransaction,
        status: 'ERROR',
      });

      const result = await useCase.execute(errorEvent);

      expect(result.isFailure).toBe(false);
    });

    it('should handle unknown status', async () => {
      const unknownEvent = {
        ...mockEvent,
        data: {
          ...mockEvent.data,
          transaction: {
            ...mockEvent.data.transaction,
            status: 'UNKNOWN_STATUS',
          },
        },
      };
      mockTransactionRepo.findByTransactionNumber.mockResolvedValue(
        mockTransaction,
      );
      mockTransactionRepo.update.mockResolvedValue({
        ...mockTransaction,
        status: 'ERROR',
      });

      const result = await useCase.execute(unknownEvent);

      expect(result.isFailure).toBe(false);
    });

    it('should handle errors during processing', async () => {
      mockTransactionRepo.findByTransactionNumber.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await useCase.execute(mockEvent);

      expect(result.isFailure).toBe(true);
    });
  });

  describe('verifySignature', () => {
    it('should return true for valid signature', () => {
      const event = {
        data: {
          transaction: {
            id: 'txn-123',
            status: 'APPROVED',
            amount_in_cents: 50000,
          },
        },
        signature: {
          properties: [
            'transaction.id',
            'transaction.status',
            'transaction.amount_in_cents',
          ],
          checksum: 'valid_checksum',
        },
        timestamp: 1234567890,
      } as any;

      const result = useCase.verifySignature(event);
      expect(result).toBe(true);
    });

    it('should return false for invalid signature', () => {
      const event = {
        data: {
          transaction: {
            id: 'txn-123',
            status: 'APPROVED',
            amount_in_cents: 50000,
          },
        },
        signature: {
          properties: [
            'transaction.id',
            'transaction.status',
            'transaction.amount_in_cents',
          ],
          checksum: 'invalid_checksum',
        },
        timestamp: 1234567890,
      } as any;

      const result = useCase.verifySignature(event);
      expect(result).toBe(false);
    });

    it('should handle missing nested values', () => {
      const event = {
        data: {
          transaction: {
            id: 'txn-123',
          },
        },
        signature: {
          properties: [
            'transaction.id',
            'transaction.status',
            'transaction.amount_in_cents',
          ],
          checksum: 'valid_checksum',
        },
        timestamp: 1234567890,
      } as any;

      const result = useCase.verifySignature(event);
      expect(result).toBe(true);
    });
  });
});
