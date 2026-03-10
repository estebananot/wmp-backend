import { Product } from '../entities/product.entity';

export interface ProductRepositoryInterface {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findAvailable(): Promise<Product[]>;
  update(id: string, data: Partial<Product>): Promise<Product | null>;
}
