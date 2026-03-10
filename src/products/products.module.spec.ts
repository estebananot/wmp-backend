import { Test, TestingModule } from '@nestjs/testing';
import { ProductsModule } from './products.module';
import { GetProductsUseCase } from '../application/use-cases/products/get-products.usecase';
import { GetProductByIdUseCase } from '../application/use-cases/products/get-product-by-id.usecase';
import { TypeOrmProductRepository } from '../infrastructure/database/repositories/typeorm-product.repository';
import { ProductsController } from '../presentation/controllers/products.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductEntity } from '../infrastructure/database/product.entity';

describe('ProductsModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ProductsModule],
    })
      .overrideProvider(getRepositoryToken(ProductEntity))
      .useValue({})
      .compile();
  });

  it('should be defined', () => {
    const productsModule = module.get<ProductsModule>(ProductsModule);
    expect(productsModule).toBeDefined();
  });

  it('should have controllers', () => {
    const controllers = module.get<ProductsController[]>(ProductsController);
    expect(controllers).toBeDefined();
  });

  it('should have use cases', () => {
    const getProductsUseCase =
      module.get<GetProductsUseCase>(GetProductsUseCase);
    const getProductByIdUseCase = module.get<GetProductByIdUseCase>(
      GetProductByIdUseCase,
    );

    expect(getProductsUseCase).toBeDefined();
    expect(getProductByIdUseCase).toBeDefined();
  });
});
