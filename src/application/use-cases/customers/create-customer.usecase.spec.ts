import { Test, TestingModule } from '@nestjs/testing';
import { CreateCustomerUseCase } from './create-customer.usecase';
import { Customer } from '../../../domain/entities/customer.entity';

describe('CreateCustomerUseCase', () => {
  let useCase: CreateCustomerUseCase;
  let mockCustomerRepository: any;

  beforeEach(async () => {
    mockCustomerRepository = {
      save: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCustomerUseCase,
        {
          provide: 'CustomerRepositoryInterface',
          useValue: mockCustomerRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateCustomerUseCase>(CreateCustomerUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return existing customer when email already exists', async () => {
    const existingCustomer = new Customer({
      id: 'cust-123',
      name: 'Juan Pérez',
      email: 'juan@test.com',
      phone: '+573212345678',
    });
    mockCustomerRepository.findByEmail.mockResolvedValue(existingCustomer);

    const dto = {
      name: 'Juan Pérez',
      email: 'juan@test.com',
      phone: '+573212345678',
    };

    const result = await useCase.execute(dto);

    expect(result.isSuccess).toBe(true);
    expect(result.value.id).toBe('cust-123');
    expect(mockCustomerRepository.save).not.toHaveBeenCalled();
  });

  it('should create new customer when email does not exist', async () => {
    mockCustomerRepository.findByEmail.mockResolvedValue(null);

    const savedCustomer = new Customer({
      id: 'cust-456',
      name: 'María García',
      email: 'maria@test.com',
      phone: '+573001234567',
    });
    mockCustomerRepository.save.mockResolvedValue(savedCustomer);

    const dto = {
      name: 'María García',
      email: 'maria@test.com',
      phone: '+573001234567',
    };

    const result = await useCase.execute(dto);

    expect(result.isSuccess).toBe(true);
    expect(result.value.id).toBe('cust-456');
    expect(result.value.name).toBe('María García');
    expect(mockCustomerRepository.save).toHaveBeenCalled();
  });

  it('should handle errors during creation', async () => {
    mockCustomerRepository.findByEmail.mockRejectedValue(
      new Error('Database error'),
    );

    const dto = {
      name: 'Test User',
      email: 'test@test.com',
      phone: '+573009999999',
    };

    const result = await useCase.execute(dto);

    expect(result.isFailure).toBe(true);
  });

  it('should handle creation errors', async () => {
    mockCustomerRepository.findByEmail.mockResolvedValue(null);
    mockCustomerRepository.save.mockRejectedValue(new Error('Save failed'));

    const dto = {
      name: 'Test User',
      email: 'test@test.com',
      phone: '+573009999999',
    };

    const result = await useCase.execute(dto);

    expect(result.isFailure).toBe(true);
  });

  it('should create customer without phone', async () => {
    mockCustomerRepository.findByEmail.mockResolvedValue(null);

    const savedCustomer = new Customer({
      id: 'cust-789',
      name: 'Test User',
      email: 'test@test.com',
    });
    mockCustomerRepository.save.mockResolvedValue(savedCustomer);

    const dto = {
      name: 'Test User',
      email: 'test@test.com',
    };

    const result = await useCase.execute(dto);

    expect(result.isSuccess).toBe(true);
    expect(result.value.phone).toBeUndefined();
  });
});
