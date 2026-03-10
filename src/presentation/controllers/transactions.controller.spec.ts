import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { TransactionsController } from '../../presentation/controllers/transactions.controller';
import { CreateTransactionUseCase } from '../../application/use-cases/transactions/create-transaction.usecase';
import { GetTransactionUseCase } from '../../application/use-cases/transactions/get-transaction.usecase';
import { GetAllTransactionsUseCase } from '../../application/use-cases/transactions/get-all-transactions.usecase';
import { ProcessPaymentUseCase } from '../../application/use-cases/transactions/process-payment.usecase';
import { Transaction } from '../../domain/entities/transaction.entity';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let createTransactionUseCase: CreateTransactionUseCase;
  let getTransactionUseCase: GetTransactionUseCase;
  let getAllTransactionsUseCase: GetAllTransactionsUseCase;
  let processPaymentUseCase: ProcessPaymentUseCase;

  const mockTransaction = new Transaction({
    id: '1',
    transactionNumber: 'TXN-1234567890-abc',
    customerId: '1',
    productId: '1',
    quantity: 1,
    productAmount: 1000,
    baseFee: 2000,
    deliveryFee: 5000,
    totalAmount: 8000,
    status: 'PENDING',
  });

  const mockCreateTransactionUseCase = {
    execute: jest.fn().mockResolvedValue({
      isFailure: false,
      value: mockTransaction,
    }),
  };

  const mockGetTransactionUseCase = {
    execute: jest.fn().mockResolvedValue({
      isFailure: false,
      value: mockTransaction,
    }),
  };

  const mockGetAllTransactionsUseCase = {
    execute: jest.fn().mockResolvedValue({
      isFailure: false,
      value: [mockTransaction],
    }),
  };

  const mockProcessPaymentUseCase = {
    execute: jest.fn().mockResolvedValue({
      isFailure: false,
      value: {
        id: '1',
        transactionNumber: 'TXN-1234567890-abc',
        status: 'APPROVED',
        totalAmount: 8000,
        breakdown: {
          productAmount: 1000,
          baseFee: 2000,
          deliveryFee: 5000,
        },
        createdAt: new Date(),
      },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: CreateTransactionUseCase,
          useValue: mockCreateTransactionUseCase,
        },
        {
          provide: GetTransactionUseCase,
          useValue: mockGetTransactionUseCase,
        },
        {
          provide: GetAllTransactionsUseCase,
          useValue: mockGetAllTransactionsUseCase,
        },
        {
          provide: ProcessPaymentUseCase,
          useValue: mockProcessPaymentUseCase,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    createTransactionUseCase = module.get<CreateTransactionUseCase>(
      CreateTransactionUseCase,
    );
    getTransactionUseCase = module.get<GetTransactionUseCase>(
      GetTransactionUseCase,
    );
    getAllTransactionsUseCase = module.get<GetAllTransactionsUseCase>(
      GetAllTransactionsUseCase,
    );
    processPaymentUseCase = module.get<ProcessPaymentUseCase>(
      ProcessPaymentUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTransaction', () => {
    it('should create a transaction', async () => {
      const createTransactionDto = {
        customerId: '1',
        productId: '1',
        quantity: 1,
        deliveryInfo: {
          address: 'Calle 123',
          city: 'Bogotá',
        },
      };

      const result = await controller.createTransaction(createTransactionDto);

      expect(createTransactionUseCase.execute).toHaveBeenCalledWith(
        createTransactionDto,
      );
      expect(result).toEqual({ data: mockTransaction });
    });

    it('should throw not found when product not found', async () => {
      mockCreateTransactionUseCase.execute.mockResolvedValueOnce({
        isFailure: true,
        error: { message: 'Product not found' },
      });

      const createTransactionDto = {
        customerId: '1',
        productId: '999',
        quantity: 1,
        deliveryInfo: {
          address: 'Calle 123',
          city: 'Bogotá',
        },
      };

      await expect(
        controller.createTransaction(createTransactionDto),
      ).rejects.toThrow('Product not found');
    });

    it('should throw conflict when insufficient stock', async () => {
      mockCreateTransactionUseCase.execute.mockResolvedValueOnce({
        isFailure: true,
        error: { message: 'Insufficient stock' },
      });

      const createTransactionDto = {
        customerId: '1',
        productId: '1',
        quantity: 100,
        deliveryInfo: {
          address: 'Calle 123',
          city: 'Bogotá',
        },
      };

      await expect(
        controller.createTransaction(createTransactionDto),
      ).rejects.toThrow('Insufficient stock');
    });

    it('should throw bad request for other errors', async () => {
      mockCreateTransactionUseCase.execute.mockResolvedValueOnce({
        isFailure: true,
        error: { message: 'Invalid quantity' },
      });

      const createTransactionDto = {
        customerId: '1',
        productId: '1',
        quantity: 0,
        deliveryInfo: {
          address: 'Calle 123',
          city: 'Bogotá',
        },
      };

      await expect(
        controller.createTransaction(createTransactionDto),
      ).rejects.toThrow('Invalid quantity');
    });
  });

  describe('getTransaction', () => {
    it('should return a transaction by id', async () => {
      const result = await controller.getTransaction('1');

      expect(getTransactionUseCase.execute).toHaveBeenCalledWith('1');
      expect(result).toEqual({ data: mockTransaction });
    });

    it('should throw when transaction not found', async () => {
      mockGetTransactionUseCase.execute.mockResolvedValueOnce({
        isFailure: true,
        error: { message: 'Transaction not found' },
      });

      await expect(controller.getTransaction('999')).rejects.toThrow(
        'Transaction not found',
      );
    });

    it('should throw internal error for other failures', async () => {
      mockGetTransactionUseCase.execute.mockResolvedValueOnce({
        isFailure: true,
        error: { message: 'Database error' },
      });

      await expect(controller.getTransaction('999')).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('getAllTransactions', () => {
    it('should return all transactions', async () => {
      const result = await controller.getAllTransactions();

      expect(getAllTransactionsUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual({ data: [mockTransaction] });
    });

    it('should throw internal error on failure', async () => {
      mockGetAllTransactionsUseCase.execute.mockResolvedValueOnce({
        isFailure: true,
        error: { message: 'Database error' },
      });

      await expect(controller.getAllTransactions()).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('processPayment', () => {
    it('should process payment successfully', async () => {
      const paymentData = {
        cardToken: 'tok_test_123',
        customerEmail: 'john@example.com',
        acceptanceToken: 'acceptance_token',
        ip: '192.168.1.1',
      };

      const result = await controller.processPayment('1', paymentData);

      expect(processPaymentUseCase.execute).toHaveBeenCalledWith(
        '1',
        paymentData,
      );
      expect(result.data.status).toBe('APPROVED');
    });

    it('should handle payment failure', async () => {
      mockProcessPaymentUseCase.execute.mockResolvedValueOnce({
        isFailure: true,
        error: { message: 'Payment failed' },
      });

      const paymentData = {
        cardToken: 'tok_test_123',
        customerEmail: 'john@example.com',
        acceptanceToken: 'acceptance_token',
      };

      await expect(controller.processPayment('1', paymentData)).rejects.toThrow(
        'Payment failed',
      );
    });

    it('should throw not found when transaction not found', async () => {
      mockProcessPaymentUseCase.execute.mockResolvedValueOnce({
        isFailure: true,
        error: { message: 'Transaction not found' },
      });

      const paymentData = {
        cardToken: 'tok_test_123',
        customerEmail: 'john@example.com',
        acceptanceToken: 'acceptance_token',
      };

      await expect(
        controller.processPayment('999', paymentData),
      ).rejects.toThrow('Transaction not found');
    });

    it('should throw conflict when transaction cannot be processed', async () => {
      mockProcessPaymentUseCase.execute.mockResolvedValueOnce({
        isFailure: true,
        error: {
          message: 'Transaction cannot be processed. Current status: APPROVED',
        },
      });

      const paymentData = {
        cardToken: 'tok_test_123',
        customerEmail: 'john@example.com',
        acceptanceToken: 'acceptance_token',
      };

      await expect(controller.processPayment('1', paymentData)).rejects.toThrow(
        'Transaction cannot be processed',
      );
    });

    it('should throw conflict when insufficient stock', async () => {
      mockProcessPaymentUseCase.execute.mockResolvedValueOnce({
        isFailure: true,
        error: { message: 'Insufficient stock to complete payment' },
      });

      const paymentData = {
        cardToken: 'tok_test_123',
        customerEmail: 'john@example.com',
        acceptanceToken: 'acceptance_token',
      };

      await expect(controller.processPayment('1', paymentData)).rejects.toThrow(
        'Insufficient stock',
      );
    });
  });
});
