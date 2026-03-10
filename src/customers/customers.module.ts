import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerEntity } from '../infrastructure/database/customer.entity';
import { TypeOrmCustomerRepository } from '../infrastructure/database/repositories/typeorm-customer.repository';
import { CreateCustomerUseCase } from '../application/use-cases/customers/create-customer.usecase';
import { GetCustomerUseCase } from '../application/use-cases/customers/get-customer.usecase';
import { CustomersController } from '../presentation/controllers/customers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity])],
  controllers: [CustomersController],
  providers: [
    CreateCustomerUseCase,
    GetCustomerUseCase,
    {
      provide: 'CustomerRepositoryInterface',
      useClass: TypeOrmCustomerRepository,
    },
  ],
  exports: ['CustomerRepositoryInterface'],
})
export class CustomersModule {}
