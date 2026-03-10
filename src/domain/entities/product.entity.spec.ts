import { Product } from '../../domain/entities/product.entity';

describe('Product Entity - Extended', () => {
  it('should create product with all fields', () => {
    const product = new Product({
      id: 'prod-123',
      name: 'MacBook Pro',
      description: 'M3 Pro chip',
      price: 8500000,
      stock: 5,
      imageUrl: 'https://example.com/macbook.jpg',
    });

    expect(product.id).toBe('prod-123');
    expect(product.name).toBe('MacBook Pro');
    expect(product.price).toBe(8500000);
    expect(product.stock).toBe(5);
  });

  it('should create product with default dates', () => {
    const product = new Product({
      name: 'Test Product',
      description: 'Test Description',
      price: 1000,
      stock: 10,
      imageUrl: 'http://test.com/image.jpg',
    });

    expect(product.createdAt).toBeDefined();
    expect(product.updatedAt).toBeDefined();
  });

  it('should have hasStock method returning true', () => {
    const product = new Product({
      name: 'Test',
      description: 'Test',
      price: 100,
      stock: 5,
      imageUrl: 'http://test.com/image.jpg',
    });

    expect(product.hasStock(3)).toBe(true);
    expect(product.hasStock(5)).toBe(true);
  });

  it('should have hasStock method returning false', () => {
    const product = new Product({
      name: 'Test',
      description: 'Test',
      price: 100,
      stock: 2,
      imageUrl: 'http://test.com/image.jpg',
    });

    expect(product.hasStock(3)).toBe(false);
  });

  it('should reduce stock correctly', () => {
    const product = new Product({
      name: 'Test',
      description: 'Test',
      price: 100,
      stock: 10,
      imageUrl: 'http://test.com/image.jpg',
    });

    const reduced = product.reduceStock(4);
    expect(reduced.stock).toBe(6);
    expect(product.stock).toBe(10); // Original unchanged
  });

  it('should throw when reducing more stock than available', () => {
    const product = new Product({
      name: 'Test',
      description: 'Test',
      price: 100,
      stock: 3,
      imageUrl: 'http://test.com/image.jpg',
    });

    expect(() => product.reduceStock(10)).toThrow('Insufficient stock');
  });
});
