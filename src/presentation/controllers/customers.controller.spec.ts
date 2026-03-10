import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from '../../presentation/controllers/customers.controller';
import { CreateCustomerUseCase } from '../../application/use-cases/customers/create-customer.usecase';
import { GetCustomerUseCase } from '../../application/use-cases/customers/get-customer.usecase';
import { Customer } from '../../domain/entities/customer.entity';

describe('CustomersController', () => {
  let controller: CustomersController;
  let createCustomerUseCase: CreateCustomerUseCase;
  let getCustomerUseCase: GetCustomerUseCase;

  const mockCustomer = new Customer({
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+573212345678',
  });

  const mockCreateCustomerUseCase = {
    execute: jest.fn().mockResolvedValue({
      isFailure: false,
      value: mockCustomer,
    }),
  };

  const mockGetCustomerUseCase = {
    execute: jest.fn().mockResolvedValue({
      isFailure: false,
      value: mockCustomer,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        {
          provide: CreateCustomerUseCase,
          useValue: mockCreateCustomerUseCase,
        },
        {
          provide: GetCustomerUseCase,
          useValue: mockGetCustomerUseCase,
        },
      ],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
    createCustomerUseCase = module.get<CreateCustomerUseCase>(
      CreateCustomerUseCase,
    );
    getCustomerUseCase = module.get<GetCustomerUseCase>(GetCustomerUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCustomer', () => {
    it('should create a customer', async () => {
      const createCustomerDto = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+573212345678',
      };

      const result = await controller.createCustomer(createCustomerDto);

      expect(createCustomerUseCase.execute).toHaveBeenCalledWith(
        createCustomerDto,
      );
      expect(result).toEqual({ data: mockCustomer });
    });

    it('should throw error when creation fails', async () => {
      mockCreateCustomerUseCase.execute.mockResolvedValueOnce({
        isFailure: true,
        error: { message: 'Invalid email' },
      });

      const createCustomerDto = {
        name: 'John Doe',
        email: 'invalid-email',
        phone: '+573212345678',
      };

      await expect(
        controller.createCustomer(createCustomerDto),
      ).rejects.toThrow();
    });
  });

  describe('getCustomer', () => {
    it('should return a customer by id', async () => {
      const result = await controller.getCustomer('1');

      expect(getCustomerUseCase.execute).toHaveBeenCalledWith('1');
      expect(result).toEqual({ data: mockCustomer });
    });

    it('should throw not found when customer does not exist', async () => {
      mockGetCustomerUseCase.execute.mockResolvedValueOnce({
        isFailure: true,
        error: { message: 'Customer not found' },
      });

      await expect(controller.getCustomer('999')).rejects.toThrow(
        'Customer not found',
      );
    });

    it('should throw internal error for other failures', async () => {
      mockGetCustomerUseCase.execute.mockResolvedValueOnce({
        isFailure: true,
        error: { message: 'Database error' },
      });

      await expect(controller.getCustomer('999')).rejects.toThrow(
        'Database error',
      );
    });
  });
});
