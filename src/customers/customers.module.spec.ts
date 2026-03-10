import { Test, TestingModule } from '@nestjs/testing';
import { CustomersModule } from './customers.module';
import { CreateCustomerUseCase } from '../application/use-cases/customers/create-customer.usecase';
import { GetCustomerUseCase } from '../application/use-cases/customers/get-customer.usecase';
import { CustomersController } from '../presentation/controllers/customers.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomerEntity } from '../infrastructure/database/customer.entity';

describe('CustomersModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CustomersModule],
    })
      .overrideProvider(getRepositoryToken(CustomerEntity))
      .useValue({})
      .compile();
  });

  it('should be defined', () => {
    const customersModule = module.get<CustomersModule>(CustomersModule);
    expect(customersModule).toBeDefined();
  });

  it('should have controllers', () => {
    const controllers = module.get<CustomersController[]>(CustomersController);
    expect(controllers).toBeDefined();
  });

  it('should have use cases', () => {
    const createCustomerUseCase = module.get<CreateCustomerUseCase>(
      CreateCustomerUseCase,
    );
    const getCustomerUseCase =
      module.get<GetCustomerUseCase>(GetCustomerUseCase);

    expect(createCustomerUseCase).toBeDefined();
    expect(getCustomerUseCase).toBeDefined();
  });
});
