import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../infrastructure/database/product.entity';
import { TypeOrmProductRepository } from '../infrastructure/database/repositories/typeorm-product.repository';
import { GetProductsUseCase } from '../application/use-cases/products/get-products.usecase';
import { GetProductByIdUseCase } from '../application/use-cases/products/get-product-by-id.usecase';
import { ProductsController } from '../presentation/controllers/products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  controllers: [ProductsController],
  providers: [
    GetProductsUseCase,
    GetProductByIdUseCase,
    {
      provide: 'ProductRepositoryInterface',
      useClass: TypeOrmProductRepository,
    },
  ],
  exports: ['ProductRepositoryInterface'],
})
export class ProductsModule {}
