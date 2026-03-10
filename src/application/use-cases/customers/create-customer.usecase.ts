import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../../common/result/result';
import type { CustomerRepositoryInterface } from '../../../domain/repositories/customer.repository.interface';
import { Customer } from '../../../domain/entities/customer.entity';
import { CreateCustomerDto } from '../../dto/create-customer.dto';
import { CustomerResponseDto } from '../../dto/customer-response.dto';

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject('CustomerRepositoryInterface')
    private readonly customerRepository: CustomerRepositoryInterface,
  ) {}

  async execute(
    dto: CreateCustomerDto,
  ): Promise<Result<CustomerResponseDto, Error>> {
    try {
      // Check if customer with email already exists
      const existingCustomer = await this.customerRepository.findByEmail(
        dto.email,
      );
      if (existingCustomer) {
        // Return existing customer
        return Result.ok({
          id: existingCustomer.id,
          name: existingCustomer.name,
          email: existingCustomer.email,
          phone: existingCustomer.phone || undefined,
          createdAt: existingCustomer.createdAt,
        });
      }

      // Create new customer
      const customer = new Customer({
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
      });

      const savedCustomer = await this.customerRepository.save(customer);

      const response: CustomerResponseDto = {
        id: savedCustomer.id,
        name: savedCustomer.name,
        email: savedCustomer.email,
        phone: savedCustomer.phone || undefined,
        createdAt: savedCustomer.createdAt,
      };

      return Result.ok(response);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to create customer'),
      );
    }
  }
}
