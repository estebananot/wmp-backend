import { ProductResponseDto } from './product-response.dto';

describe('ProductResponseDto', () => {
  it('should create product response DTO', () => {
    const dto: ProductResponseDto = {
      id: 'prod-123',
      name: 'iPad Pro',
      description: 'M2 chip',
      price: 5200000,
      stock: 10,
      imageUrl: 'https://example.com/ipad.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(dto.id).toBe('prod-123');
    expect(dto.name).toBe('iPad Pro');
    expect(dto.price).toBe(5200000);
    expect(dto.stock).toBe(10);
  });

  it('should have optional fields', () => {
    const dto: ProductResponseDto = {
      id: 'prod-123',
      name: 'Test',
      description: 'Test',
      price: 1000,
      stock: 5,
      imageUrl: 'http://test.com/img.jpg',
    };

    expect(dto.createdAt).toBeUndefined();
    expect(dto.updatedAt).toBeUndefined();
  });
});
