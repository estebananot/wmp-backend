import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { TransactionRepositoryInterface } from '../../../domain/repositories/transaction.repository.interface';
import { TransactionEntity } from '../transaction.entity';

@Injectable()
export class TypeOrmTransactionRepository implements TransactionRepositoryInterface {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly repository: Repository<TransactionEntity>,
  ) {}

  async save(transaction: Transaction): Promise<Transaction> {
    const entity = TransactionEntity.fromDomain(transaction);
    const savedEntity = await this.repository.save(entity);
    return savedEntity.toDomain();
  }

  async findById(id: string): Promise<Transaction | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? entity.toDomain() : null;
  }

  async findByTransactionNumber(
    transactionNumber: string,
  ): Promise<Transaction | null> {
    const entity = await this.repository.findOne({
      where: { transactionNumber },
    });
    return entity ? entity.toDomain() : null;
  }

  async update(
    id: string,
    transaction: Transaction,
  ): Promise<Transaction | null> {
    const entity = TransactionEntity.fromDomain(transaction);
    entity.id = id;
    await this.repository.save(entity);
    return this.findById(id);
  }

  async findByCustomerId(customerId: string): Promise<Transaction[]> {
    const entities = await this.repository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => entity.toDomain());
  }

  async findAll(): Promise<Transaction[]> {
    const entities = await this.repository.find({
      order: { createdAt: 'DESC' },
      take: 50, // Limit to last 50 transactions
    });
    return entities.map((entity) => entity.toDomain());
  }
}
