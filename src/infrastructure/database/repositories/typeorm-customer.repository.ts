import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../../domain/entities/customer.entity';
import { CustomerRepositoryInterface } from '../../../domain/repositories/customer.repository.interface';
import { CustomerEntity } from '../customer.entity';

@Injectable()
export class TypeOrmCustomerRepository implements CustomerRepositoryInterface {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly repository: Repository<CustomerEntity>,
  ) {}

  async save(customer: Customer): Promise<Customer> {
    const entity = CustomerEntity.fromDomain(customer);
    const savedEntity = await this.repository.save(entity);
    return savedEntity.toDomain();
  }

  async findById(id: string): Promise<Customer | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? entity.toDomain() : null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? entity.toDomain() : null;
  }
}
