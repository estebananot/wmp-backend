import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../../common/result/result';
import type { CustomerRepositoryInterface } from '../../../domain/repositories/customer.repository.interface';
import { CustomerResponseDto } from '../../dto/customer-response.dto';

@Injectable()
export class GetCustomerUseCase {
  constructor(
    @Inject('CustomerRepositoryInterface')
    private readonly customerRepository: CustomerRepositoryInterface,
  ) {}

  async execute(id: string): Promise<Result<CustomerResponseDto, Error>> {
    try {
      const customer = await this.customerRepository.findById(id);

      if (!customer) {
        return Result.fail(new Error('Customer not found'));
      }

      const response: CustomerResponseDto = {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || undefined,
        createdAt: customer.createdAt,
      };

      return Result.ok(response);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to get customer'),
      );
    }
  }
}
