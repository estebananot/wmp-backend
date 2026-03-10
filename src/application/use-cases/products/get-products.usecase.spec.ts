import { Test, TestingModule } from '@nestjs/testing';
import { GetProductsUseCase } from './get-products.usecase';
import type { ProductRepositoryInterface } from '../../../domain/repositories/product.repository.interface';
import { Product } from '../../../domain/entities/product.entity';

describe('GetProductsUseCase', () => {
  let useCase: GetProductsUseCase;
  let productRepository: ProductRepositoryInterface;

  const mockProducts: Product[] = [
    new Product({
      id: '1',
      name: 'Product 1',
      description: 'Description 1',
      price: 1000,
      stock: 10,
      imageUrl: 'http://example.com/image1.jpg',
    }),
    new Product({
      id: '2',
      name: 'Product 2',
      description: 'Description 2',
      price: 2000,
      stock: 20,
      imageUrl: 'http://example.com/image2.jpg',
    }),
  ];

  const mockProductRepository = {
    findAvailable: jest.fn().mockResolvedValue(mockProducts),
    findById: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductsUseCase,
        {
          provide: 'ProductRepositoryInterface',
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetProductsUseCase>(GetProductsUseCase);
    productRepository = module.get<ProductRepositoryInterface>(
      'ProductRepositoryInterface',
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return all available products', async () => {
      const result = await useCase.execute();

      expect(productRepository.findAvailable).toHaveBeenCalled();
      expect(result.isFailure).toBe(false);
      expect(result.value).toHaveLength(2);
      expect(result.value[0].name).toBe('Product 1');
    });

    it('should return empty array when no products', async () => {
      mockProductRepository.findAvailable.mockResolvedValueOnce([]);

      const result = await useCase.execute();

      expect(result.isFailure).toBe(false);
      expect(result.value).toHaveLength(0);
    });

    it('should handle errors', async () => {
      mockProductRepository.findAvailable.mockRejectedValueOnce(
        new Error('Database error'),
      );

      const result = await useCase.execute();

      expect(result.isFailure).toBe(true);
      expect(result.error.message).toBe('Database error');
    });
  });
});
