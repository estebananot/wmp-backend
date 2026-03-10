import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Customer } from '../../domain/entities/customer.entity';

@Entity('customers')
@Index('idx_customers_email', ['email'])
export class CustomerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  toDomain(): Customer {
    return new Customer({
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone || undefined,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }

  static fromDomain(customer: Customer): CustomerEntity {
    const entity = new CustomerEntity();
    if (customer.id) entity.id = customer.id;
    entity.name = customer.name;
    entity.email = customer.email;
    entity.phone = customer.phone;
    entity.createdAt = customer.createdAt;
    entity.updatedAt = customer.updatedAt;
    return entity;
  }
}
