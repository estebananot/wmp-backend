import { Delivery } from '../entities/delivery.entity';

export interface DeliveryRepositoryInterface {
  save(delivery: Delivery): Promise<Delivery>;
  findById(id: string): Promise<Delivery | null>;
  findByTransactionId(transactionId: string): Promise<Delivery | null>;
  update(id: string, delivery: Partial<Delivery>): Promise<Delivery | null>;
}
