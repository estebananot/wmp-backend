import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Transaction } from '../../domain/entities/transaction.entity';
import type { TransactionStatus } from '../../domain/entities/transaction.entity';
import { CustomerEntity } from './customer.entity';
import { ProductEntity } from './product.entity';

@Entity('transactions')
@Index('idx_transactions_number', ['transactionNumber'])
@Index('idx_transactions_customer', ['customerId'])
@Index('idx_transactions_status', ['status'])
@Index('idx_transactions_wompi', ['wompiTransactionId'])
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    name: 'transaction_number',
  })
  transactionNumber: string;

  @Column({ type: 'uuid', name: 'customer_id' })
  customerId: string;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'product_amount' })
  productAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'base_fee' })
  baseFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'delivery_fee' })
  deliveryFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @Column({ type: 'varchar', length: 50 })
  status: TransactionStatus;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'wompi_transaction_id',
  })
  wompiTransactionId: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'wompi_reference',
  })
  wompiReference: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'payment_method',
  })
  paymentMethod: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => CustomerEntity)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  toDomain(): Transaction {
    return new Transaction({
      id: this.id,
      transactionNumber: this.transactionNumber,
      customerId: this.customerId,
      productId: this.productId,
      quantity: this.quantity,
      productAmount: Number(this.productAmount),
      baseFee: Number(this.baseFee),
      deliveryFee: Number(this.deliveryFee),
      totalAmount: Number(this.totalAmount),
      status: this.status,
      wompiTransactionId: this.wompiTransactionId || undefined,
      wompiReference: this.wompiReference || undefined,
      paymentMethod: this.paymentMethod || undefined,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }

  static fromDomain(transaction: Transaction): TransactionEntity {
    const entity = new TransactionEntity();
    if (transaction.id) entity.id = transaction.id;
    entity.transactionNumber = transaction.transactionNumber;
    entity.customerId = transaction.customerId;
    entity.productId = transaction.productId;
    entity.quantity = transaction.quantity;
    entity.productAmount = transaction.productAmount;
    entity.baseFee = transaction.baseFee;
    entity.deliveryFee = transaction.deliveryFee;
    entity.totalAmount = transaction.totalAmount;
    entity.status = transaction.status;
    entity.wompiTransactionId = transaction.wompiTransactionId;
    entity.wompiReference = transaction.wompiReference;
    entity.paymentMethod = transaction.paymentMethod;
    entity.createdAt = transaction.createdAt;
    entity.updatedAt = transaction.updatedAt;
    return entity;
  }
}
