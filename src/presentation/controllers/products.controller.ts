import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GetProductsUseCase } from '../../application/use-cases/products/get-products.usecase';
import { GetProductByIdUseCase } from '../../application/use-cases/products/get-product-by-id.usecase';
import { ProductResponseDto } from '../../application/dto/product-response.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all available products' })
  @ApiResponse({
    status: 200,
    description: 'List of products with stock > 0',
    type: [ProductResponseDto],
  })
  async getProducts(): Promise<{ data: ProductResponseDto[] }> {
    const result = await this.getProductsUseCase.execute();

    if (result.isFailure) {
      throw new HttpException(
        result.error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { data: result.value };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product UUID' })
  @ApiResponse({
    status: 200,
    description: 'Product details',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductById(
    @Param('id') id: string,
  ): Promise<{ data: ProductResponseDto }> {
    const result = await this.getProductByIdUseCase.execute(id);

    if (result.isFailure) {
      if (result.error.message === 'Product not found') {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        result.error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { data: result.value };
  }
}
