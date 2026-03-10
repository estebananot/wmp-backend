import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionUseCase } from './create-transaction.usecase';
import { Result } from '../../../common/result/result';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { Product } from '../../../domain/entities/product.entity';
import { Customer } from '../../../domain/entities/customer.entity';
import { Delivery } from '../../../domain/entities/delivery.entity';

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;
  let mockTransactionRepository: any;
  let mockProductRepository: any;
  let mockCustomerRepository: any;
  let mockDeliveryRepository: any;

  beforeEach(async () => {
    mockTransactionRepository = {
      save: jest.fn(),
      findById: jest.fn(),
    };
    mockProductRepository = {
      findById: jest.fn(),
    };
    mockCustomerRepository = {
      findById: jest.fn(),
    };
    mockDeliveryRepository = {
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionUseCase,
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
        {
          provide: 'DeliveryRepositoryInterface',
          useValue: mockDeliveryRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateTransactionUseCase>(CreateTransactionUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should fail when product not found', async () => {
    mockProductRepository.findById.mockResolvedValue(null);

    const dto = {
      customerId: 'cust-123',
      productId: 'prod-999',
      quantity: 2,
      deliveryInfo: {
        address: 'Calle 123',
        city: 'Bogotá',
        department: 'Cundinamarca',
        postalCode: '110111',
      },
    };

    const result = await useCase.execute(dto);

    expect(result.isFailure).toBe(true);
    expect(result.error.message).toBe('Product not found');
  });

  it('should fail when insufficient stock', async () => {
    const product = new Product({
      id: 'prod-123',
      name: 'Test Product',
      price: 50000,
      stock: 1,
      description: 'Test',
      imageUrl: 'http://test.com/img.jpg',
    });
    mockProductRepository.findById.mockResolvedValue(product);

    const dto = {
      customerId: 'cust-123',
      productId: 'prod-123',
      quantity: 5,
      deliveryInfo: {
        address: 'Calle 123',
        city: 'Bogotá',
        department: 'Cundinamarca',
        postalCode: '110111',
      },
    };

    const result = await useCase.execute(dto);

    expect(result.isFailure).toBe(true);
    expect(result.error.message).toContain('Insufficient stock');
  });

  it('should fail when customer not found', async () => {
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

    const dto = {
      customerId: 'cust-999',
      productId: 'prod-123',
      quantity: 2,
      deliveryInfo: {
        address: 'Calle 123',
        city: 'Bogotá',
        department: 'Cundinamarca',
        postalCode: '110111',
      },
    };

    const result = await useCase.execute(dto);

    expect(result.isFailure).toBe(true);
    expect(result.error.message).toBe('Customer not found');
  });

  it('should successfully create transaction', async () => {
    const product = new Product({
      id: 'prod-123',
      name: 'Test Product',
      price: 50000,
      stock: 10,
      description: 'Test',
      imageUrl: 'http://test.com/img.jpg',
    });
    const customer = new Customer({
      id: 'cust-123',
      name: 'Juan Pérez',
      email: 'juan@test.com',
      phone: '+573212345678',
    });

    mockProductRepository.findById.mockResolvedValue(product);
    mockCustomerRepository.findById.mockResolvedValue(customer);

    const savedTransaction = new Transaction({
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
    mockTransactionRepository.save.mockResolvedValue(savedTransaction);

    mockDeliveryRepository.save.mockResolvedValue(
      new Delivery({
        id: 'del-123',
        transactionId: 'txn-123',
        address: 'Calle 123',
        city: 'Bogotá',
        department: 'Cundinamarca',
        postalCode: '110111',
        deliveryStatus: 'PENDING',
      }),
    );

    const dto = {
      customerId: 'cust-123',
      productId: 'prod-123',
      quantity: 2,
      deliveryInfo: {
        address: 'Calle 123',
        city: 'Bogotá',
        department: 'Cundinamarca',
        postalCode: '110111',
      },
    };

    const result = await useCase.execute(dto);

    expect(result.isSuccess).toBe(true);
    expect(result.value.transactionNumber).toBe('TXN-123');
    expect(result.value.status).toBe('PENDING');
    expect(result.value.breakdown.productAmount).toBe(100000);
    expect(result.value.breakdown.baseFee).toBe(2000);
    expect(result.value.breakdown.deliveryFee).toBe(10000);
  });

  it('should handle errors during creation', async () => {
    mockProductRepository.findById.mockRejectedValue(
      new Error('Database error'),
    );

    const dto = {
      customerId: 'cust-123',
      productId: 'prod-123',
      quantity: 2,
      deliveryInfo: {
        address: 'Calle 123',
        city: 'Bogotá',
        department: 'Cundinamarca',
        postalCode: '110111',
      },
    };

    const result = await useCase.execute(dto);

    expect(result.isFailure).toBe(true);
  });
});
