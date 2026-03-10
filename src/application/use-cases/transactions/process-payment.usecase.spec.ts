import { Test, TestingModule } from '@nestjs/testing';
import { ProcessPaymentUseCase } from './process-payment.usecase';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { Product } from '../../../domain/entities/product.entity';
import { Customer } from '../../../domain/entities/customer.entity';

describe('ProcessPaymentUseCase', () => {
  let useCase: ProcessPaymentUseCase;
  let mockTransactionRepository: any;
  let mockProductRepository: any;
  let mockCustomerRepository: any;
  let mockPaymentService: any;

  beforeEach(async () => {
    mockTransactionRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };
    mockProductRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };
    mockCustomerRepository = {
      findById: jest.fn(),
    };
    mockPaymentService = {
      createTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessPaymentUseCase,
        {
          provide: 'TransactionRepositoryInterface',
          useValue: mockTransactionRepository,
        },
        {
          provide: 'ProductRepositoryInterface',
          useValue: mockProductRepository,
        },
        {
          provide: 'CustomerRepositoryInterface',
          useValue: mockCustomerRepository,
        },
        { provide: 'PaymentServiceInterface', useValue: mockPaymentService },
      ],
    }).compile();

    useCase = module.get<ProcessPaymentUseCase>(ProcessPaymentUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should fail when transaction not found', async () => {
    mockTransactionRepository.findById.mockResolvedValue(null);

    const paymentData = {
      cardToken: 'tok_test',
      acceptanceToken: 'acc_token',
      customerEmail: 'test@example.com',
      ip: '127.0.0.1',
    };

    const result = await useCase.execute('txn-999', paymentData);

    expect(result.isFailure).toBe(true);
    expect(result.error.message).toBe('Transaction not found');
  });

  it('should fail when transaction cannot be processed (not PENDING)', async () => {
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

    const paymentData = {
      cardToken: 'tok_test',
      acceptanceToken: 'acc_token',
      customerEmail: 'test@example.com',
      ip: '127.0.0.1',
    };

    const result = await useCase.execute('txn-123', paymentData);

    expect(result.isFailure).toBe(true);
    expect(result.error.message).toContain('cannot be processed');
  });

  it('should fail when product not found', async () => {
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
    mockTransactionRepository.findById.mockResolvedValue(transaction);
    mockProductRepository.findById.mockResolvedValue(null);

    const paymentData = {
      cardToken: 'tok_test',
      acceptanceToken: 'acc_token',
      customerEmail: 'test@example.com',
      ip: '127.0.0.1',
    };

    const result = await useCase.execute('txn-123', paymentData);

    expect(result.isFailure).toBe(true);
    expect(result.error.message).toBe('Product not found');
  });

  it('should fail when insufficient stock', async () => {
    const transaction = new Transaction({
      transactionNumber: 'TXN-123',
      customerId: 'cust-123',
      productId: 'prod-123',
      quantity: 5,
      productAmount: 250000,
      baseFee: 2000,
      deliveryFee: 25000,
      totalAmount: 277000,
      status: 'PENDING',
    });
    mockTransactionRepository.findById.mockResolvedValue(transaction);

    const product = new Product({
      id: 'prod-123',
      name: 'Test Product',
      price: 50000,
      stock: 2,
      description: 'Test',
      imageUrl: 'http://test.com/img.jpg',
    });
    mockProductRepository.findById.mockResolvedValue(product);

    const paymentData = {
      cardToken: 'tok_test',
      acceptanceToken: 'acc_token',
      customerEmail: 'test@example.com',
      ip: '127.0.0.1',
    };

    const result = await useCase.execute('txn-123', paymentData);

    expect(result.isFailure).toBe(true);
    expect(result.error.message).toContain('Insufficient stock');
  });

  it('should successfully process payment and reduce stock', async () => {
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
    mockTransactionRepository.findById.mockResolvedValue(transaction);

    const product = new Product({
      id: 'prod-123',
      name: 'Test Product',
      price: 50000,
      stock: 10,
      description: 'Test',
      imageUrl: 'http://test.com/img.jpg',
    });
    mockProductRepository.findById.mockResolvedValue(product);

    const customer = new Customer({
      id: 'cust-123',
      name: 'Juan Pérez',
      email: 'juan@test.com',
      phone: '+573212345678',
    });
    mockCustomerRepository.findById.mockResolvedValue(customer);

    mockPaymentService.createTransaction.mockResolvedValue({
      id: 'wompi-123',
      status: 'APPROVED',
      payment_method_type: 'CARD',
    });

    const updatedTransaction = new Transaction({
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
    mockTransactionRepository.update.mockResolvedValue(updatedTransaction);

    const paymentData = {
      cardToken: 'tok_test',
      acceptanceToken: 'acc_token',
      customerEmail: 'test@example.com',
      ip: '127.0.0.1',
    };

    const result = await useCase.execute('txn-123', paymentData);

    expect(result.isSuccess).toBe(true);
    expect(result.value.status).toBe('APPROVED');
    expect(mockProductRepository.update).toHaveBeenCalledWith('prod-123', {
      stock: 8,
    });
  });

  it('should not reduce stock when payment not approved', async () => {
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
    mockTransactionRepository.findById.mockResolvedValue(transaction);

    const product = new Product({
      id: 'prod-123',
      name: 'Test Product',
      price: 50000,
      stock: 10,
      description: 'Test',
      imageUrl: 'http://test.com/img.jpg',
    });
    mockProductRepository.findById.mockResolvedValue(product);

    const customer = new Customer({
      id: 'cust-123',
      name: 'Juan Pérez',
      email: 'juan@test.com',
      phone: '+573212345678',
    });
    mockCustomerRepository.findById.mockResolvedValue(customer);

    mockPaymentService.createTransaction.mockResolvedValue({
      id: 'wompi-123',
      status: 'DECLINED',
      payment_method_type: 'CARD',
    });

    const updatedTransaction = new Transaction({
      transactionNumber: 'TXN-123',
      customerId: 'cust-123',
      productId: 'prod-123',
      quantity: 2,
      productAmount: 100000,
      baseFee: 2000,
      deliveryFee: 10000,
      totalAmount: 112000,
      status: 'DECLINED',
    });
    mockTransactionRepository.update.mockResolvedValue(updatedTransaction);

    const paymentData = {
      cardToken: 'tok_test',
      acceptanceToken: 'acc_token',
      customerEmail: 'test@example.com',
      ip: '127.0.0.1',
    };

    const result = await useCase.execute('txn-123', paymentData);

    expect(result.isSuccess).toBe(true);
    expect(result.value.status).toBe('DECLINED');
    expect(mockProductRepository.update).not.toHaveBeenCalled();
  });

  it('should fail when update fails', async () => {
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
    mockTransactionRepository.findById.mockResolvedValue(transaction);

    const product = new Product({
      id: 'prod-123',
      name: 'Test Product',
      price: 50000,
      stock: 10,
      description: 'Test',
      imageUrl: 'http://test.com/img.jpg',
    });
    mockProductRepository.findById.mockResolvedValue(product);

    const customer = new Customer({
      id: 'cust-123',
      name: 'Juan Pérez',
      email: 'juan@test.com',
      phone: '+573212345678',
    });
    mockCustomerRepository.findById.mockResolvedValue(customer);

    mockPaymentService.createTransaction.mockResolvedValue({
      id: 'wompi-123',
      status: 'APPROVED',
      payment_method_type: 'CARD',
    });

    mockTransactionRepository.update.mockResolvedValue(null);

    const paymentData = {
      cardToken: 'tok_test',
      acceptanceToken: 'acc_token',
      customerEmail: 'test@example.com',
      ip: '127.0.0.1',
    };

    const result = await useCase.execute('txn-123', paymentData);

    expect(result.isFailure).toBe(true);
    expect(result.error.message).toBe('Failed to update transaction');
  });

  it('should handle payment service errors', async () => {
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
    mockTransactionRepository.findById.mockResolvedValue(transaction);

    const product = new Product({
      id: 'prod-123',
      name: 'Test Product',
      price: 50000,
      stock: 10,
      description: 'Test',
      imageUrl: 'http://test.com/img.jpg',
    });
    mockProductRepository.findById.mockResolvedValue(product);

    const customer = new Customer({
      id: 'cust-123',
      name: 'Juan Pérez',
      email: 'juan@test.com',
      phone: '+573212345678',
    });
    mockCustomerRepository.findById.mockResolvedValue(customer);

    mockPaymentService.createTransaction.mockRejectedValue(
      new Error('Payment gateway error'),
    );

    const paymentData = {
      cardToken: 'tok_test',
      acceptanceToken: 'acc_token',
      customerEmail: 'test@example.com',
      ip: '127.0.0.1',
    };

    const result = await useCase.execute('txn-123', paymentData);

    expect(result.isFailure).toBe(true);
    expect(result.error.message).toBe('Payment gateway error');
  });

  it('should use default customer data when customer not found', async () => {
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
    mockTransactionRepository.findById.mockResolvedValue(transaction);

    const product = new Product({
      id: 'prod-123',
      name: 'Test Product',
      price: 50000,
      stock: 10,
      description: 'Test',
      imageUrl: 'http://test.com/img.jpg',
    });
    mockProductRepository.findById.mockResolvedValue(product);

    mockCustomerRepository.findById.mockResolvedValue(null);

    mockPaymentService.createTransaction.mockResolvedValue({
      id: 'wompi-123',
      status: 'APPROVED',
      payment_method_type: 'CARD',
    });

    const updatedTransaction = new Transaction({
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
    mockTransactionRepository.update.mockResolvedValue(updatedTransaction);

    const paymentData = {
      cardToken: 'tok_test',
      acceptanceToken: 'acc_token',
      customerEmail: 'test@example.com',
      ip: '127.0.0.1',
    };

    const result = await useCase.execute('txn-123', paymentData);

    expect(result.isSuccess).toBe(true);
    expect(mockPaymentService.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_data: {
          phone_number: '+573000000000',
          full_name: 'Usuario de Prueba',
        },
      }),
    );
  });
});
