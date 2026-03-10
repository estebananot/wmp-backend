import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Check,
} from 'typeorm';
import { Product } from '../../domain/entities/product.entity';

@Entity('products')
@Check('"price" > 0')
@Check('"stock" >= 0')
@Index('idx_products_stock', ['stock'])
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  stock: number;

  @Column({ type: 'varchar', length: 500, name: 'image_url' })
  imageUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  toDomain(): Product {
    return new Product({
      id: this.id,
      name: this.name,
      description: this.description,
      price: Number(this.price),
      stock: this.stock,
      imageUrl: this.imageUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }

  static fromDomain(product: Product): ProductEntity {
    const entity = new ProductEntity();
    entity.id = product.id;
    entity.name = product.name;
    entity.description = product.description;
    entity.price = product.price;
    entity.stock = product.stock;
    entity.imageUrl = product.imageUrl;
    entity.createdAt = product.createdAt;
    entity.updatedAt = product.updatedAt;
    return entity;
  }
}
