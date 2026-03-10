import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Product } from '../../../domain/entities/product.entity';
import { ProductRepositoryInterface } from '../../../domain/repositories/product.repository.interface';
import { ProductEntity } from '../product.entity';

@Injectable()
export class TypeOrmProductRepository implements ProductRepositoryInterface {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {}

  async findAll(): Promise<Product[]> {
    const entities = await this.repository.find({
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => entity.toDomain());
  }

  async findById(id: string): Promise<Product | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? entity.toDomain() : null;
  }

  async findAvailable(): Promise<Product[]> {
    const entities = await this.repository.find({
      where: { stock: MoreThan(0) },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => entity.toDomain());
  }

  async update(id: string, data: Partial<Product>): Promise<Product | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }
}
