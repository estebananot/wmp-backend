import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '../../presentation/controllers/products.controller';
import { GetProductsUseCase } from '../../application/use-cases/products/get-products.usecase';
import { GetProductByIdUseCase } from '../../application/use-cases/products/get-product-by-id.usecase';
import { Product } from '../../domain/entities/product.entity';

describe('ProductsController', () => {
  let controller: ProductsController;
  let getProductsUseCase: GetProductsUseCase;
  let getProductByIdUseCase: GetProductByIdUseCase;

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

  const mockGetProductsUseCase = {
    execute: jest.fn().mockResolvedValue({
      isFailure: false,
      value: mockProducts,
    }),
  };

  const mockGetProductByIdUseCase = {
    execute: jest.fn().mockResolvedValue({
      isFailure: false,
      value: mockProducts[0],
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: GetProductsUseCase,
          useValue: mockGetProductsUseCase,
        },
        {
          provide: GetProductByIdUseCase,
          useValue: mockGetProductByIdUseCase,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    getProductsUseCase = module.get<GetProductsUseCase>(GetProductsUseCase);
    getProductByIdUseCase = module.get<GetProductByIdUseCase>(
      GetProductByIdUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should return an array of products', async () => {
      const result = await controller.getProducts();

      expect(getProductsUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual({ data: mockProducts });
    });

    it('should return empty array when no products', async () => {
      mockGetProductsUseCase.execute.mockResolvedValueOnce({
        isFailure: false,
        value: [],
      });

      const result = await controller.getProducts();

      expect(result).toEqual({ data: [] });
    });
  });

  describe('getProductById', () => {
    it('should return a product by id', async () => {
      const result = await controller.getProductById('1');

      expect(getProductByIdUseCase.execute).toHaveBeenCalledWith('1');
      expect(result).toEqual({ data: mockProducts[0] });
    });

    it('should throw when product not found', async () => {
      mockGetProductByIdUseCase.execute.mockResolvedValueOnce({
        isFailure: true,
        error: { message: 'Product not found' },
      });

      await expect(controller.getProductById('999')).rejects.toThrow(
        'Product not found',
      );
    });

    it('should throw internal error for other failures', async () => {
      mockGetProductByIdUseCase.execute.mockResolvedValueOnce({
        isFailure: true,
        error: { message: 'Database error' },
      });

      await expect(controller.getProductById('999')).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('getProducts failure', () => {
    it('should throw internal server error on failure', async () => {
      mockGetProductsUseCase.execute.mockResolvedValueOnce({
        isFailure: true,
        error: { message: 'Database error' },
      });

      await expect(controller.getProducts()).rejects.toThrow('Database error');
    });
  });
});
