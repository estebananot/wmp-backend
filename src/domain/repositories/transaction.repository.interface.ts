import { Transaction } from '../entities/transaction.entity';

export interface TransactionRepositoryInterface {
  save(transaction: Transaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findByTransactionNumber(
    transactionNumber: string,
  ): Promise<Transaction | null>;
  update(id: string, transaction: Transaction): Promise<Transaction | null>;
  findByCustomerId(customerId: string): Promise<Transaction[]>;
  findAll(): Promise<Transaction[]>;
}
