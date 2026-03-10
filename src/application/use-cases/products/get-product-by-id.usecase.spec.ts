import { Test, TestingModule } from '@nestjs/testing';
import { GetProductByIdUseCase } from './get-product-by-id.usecase';
import type { ProductRepositoryInterface } from '../../../domain/repositories/product.repository.interface';
import { Product } from '../../../domain/entities/product.entity';

describe('GetProductByIdUseCase', () => {
  let useCase: GetProductByIdUseCase;

  const mockProduct = new Product({
    id: 'product-1',
    name: 'iPad Pro',
    description: 'M2 chip',
    price: 5200000,
    stock: 12,
    imageUrl: 'https://example.com/ipad.jpg',
  });

  const mockRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductByIdUseCase,
        { provide: 'ProductRepositoryInterface', useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<GetProductByIdUseCase>(GetProductByIdUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return product when found', async () => {
      mockRepository.findById.mockResolvedValue(mockProduct);

      const result = await useCase.execute('product-1');

      expect(mockRepository.findById).toHaveBeenCalledWith('product-1');
      expect(result.isFailure).toBe(false);
      expect(result.value.id).toBe('product-1');
    });

    it('should return error when product not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute('invalid-id');

      expect(result.isFailure).toBe(true);
      expect(result.error.message).toBe('Product not found');
    });
  });
});
