import { Test, TestingModule } from '@nestjs/testing';
import { GetCustomerUseCase } from './get-customer.usecase';
import type { CustomerRepositoryInterface } from '../../../domain/repositories/customer.repository.interface';
import { Customer } from '../../../domain/entities/customer.entity';

describe('GetCustomerUseCase', () => {
  let useCase: GetCustomerUseCase;

  const mockCustomer = new Customer({
    id: 'customer-1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+573212345678',
  });

  const mockRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCustomerUseCase,
        { provide: 'CustomerRepositoryInterface', useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<GetCustomerUseCase>(GetCustomerUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return customer when found', async () => {
      mockRepository.findById.mockResolvedValue(mockCustomer);

      const result = await useCase.execute('customer-1');

      expect(mockRepository.findById).toHaveBeenCalledWith('customer-1');
      expect(result.isFailure).toBe(false);
      expect(result.value.id).toBe('customer-1');
    });

    it('should return error when customer not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute('invalid-id');

      expect(result.isFailure).toBe(true);
      expect(result.error.message).toBe('Customer not found');
    });
  });
});
