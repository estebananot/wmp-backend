import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../../common/result/result';
import type { ProductRepositoryInterface } from '../../../domain/repositories/product.repository.interface';
import { ProductResponseDto } from '../../dto/product-response.dto';

@Injectable()
export class GetProductByIdUseCase {
  constructor(
    @Inject('ProductRepositoryInterface')
    private readonly productRepository: ProductRepositoryInterface,
  ) {}

  async execute(id: string): Promise<Result<ProductResponseDto, Error>> {
    try {
      const product = await this.productRepository.findById(id);

      if (!product) {
        return Result.fail(new Error('Product not found'));
      }

      const response: ProductResponseDto = {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };

      return Result.ok(response);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to get product'),
      );
    }
  }
}
