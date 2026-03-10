import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Delivery } from '../../domain/entities/delivery.entity';
import type { DeliveryStatus } from '../../domain/entities/delivery.entity';
import { TransactionEntity } from './transaction.entity';

@Entity('deliveries')
@Index('idx_deliveries_transaction', ['transactionId'])
@Index('idx_deliveries_status', ['deliveryStatus'])
export class DeliveryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true, name: 'transaction_id' })
  transactionId: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'postal_code' })
  postalCode: string | null;

  @Column({ type: 'varchar', length: 50, name: 'delivery_status' })
  deliveryStatus: DeliveryStatus;

  @Column({ type: 'text', nullable: true, name: 'delivery_notes' })
  deliveryNotes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => TransactionEntity)
  @JoinColumn({ name: 'transaction_id' })
  transaction: TransactionEntity;

  toDomain(): Delivery {
    return new Delivery({
      id: this.id,
      transactionId: this.transactionId,
      address: this.address,
      city: this.city,
      department: this.department || undefined,
      postalCode: this.postalCode || undefined,
      deliveryStatus: this.deliveryStatus,
      deliveryNotes: this.deliveryNotes || undefined,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }

  static fromDomain(delivery: Delivery): DeliveryEntity {
    const entity = new DeliveryEntity();
    if (delivery.id) entity.id = delivery.id;
    entity.transactionId = delivery.transactionId;
    entity.address = delivery.address;
    entity.city = delivery.city;
    entity.department = delivery.department;
    entity.postalCode = delivery.postalCode;
    entity.deliveryStatus = delivery.deliveryStatus;
    entity.deliveryNotes = delivery.deliveryNotes;
    entity.createdAt = delivery.createdAt;
    entity.updatedAt = delivery.updatedAt;
    return entity;
  }
}
