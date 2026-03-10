import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery } from '../../../domain/entities/delivery.entity';
import { DeliveryRepositoryInterface } from '../../../domain/repositories/delivery.repository.interface';
import { DeliveryEntity } from '../delivery.entity';

@Injectable()
export class TypeOrmDeliveryRepository implements DeliveryRepositoryInterface {
  constructor(
    @InjectRepository(DeliveryEntity)
    private readonly repository: Repository<DeliveryEntity>,
  ) {}

  async save(delivery: Delivery): Promise<Delivery> {
    const entity = DeliveryEntity.fromDomain(delivery);
    const savedEntity = await this.repository.save(entity);
    return savedEntity.toDomain();
  }

  async findById(id: string): Promise<Delivery | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? entity.toDomain() : null;
  }

  async findByTransactionId(transactionId: string): Promise<Delivery | null> {
    const entity = await this.repository.findOne({ where: { transactionId } });
    return entity ? entity.toDomain() : null;
  }

  async update(
    id: string,
    delivery: Partial<Delivery>,
  ): Promise<Delivery | null> {
    await this.repository.update(id, delivery);
    return this.findById(id);
  }
}
