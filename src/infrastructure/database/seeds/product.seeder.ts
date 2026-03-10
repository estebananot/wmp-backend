import { DataSource } from 'typeorm';
import { ProductEntity } from '../product.entity';

export const seedProducts = async (dataSource: DataSource): Promise<void> => {
  const productRepository = dataSource.getRepository(ProductEntity);

  const existingProducts = await productRepository.count();
  if (existingProducts > 0) {
    console.log('Products already seeded, skipping...');
    return;
  }

  const products = [
    {
      name: 'iPhone 14 Pro',
      description:
        'Latest Apple smartphone with A16 Bionic chip, 48MP camera system, Dynamic Island, and all-day battery life. Available in Space Black.',
      price: 4500000,
      stock: 15,
      imageUrl:
        'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=800',
    },
    {
      name: 'MacBook Pro 14"',
      description:
        'Professional laptop with M3 Pro chip, 18GB RAM, 512GB SSD. Perfect for developers and creative professionals.',
      price: 8500000,
      stock: 10,
      imageUrl:
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    },
    {
      name: 'AirPods Pro 2',
      description:
        'Active Noise Cancellation, Adaptive Transparency, Personalized Spatial Audio with dynamic head tracking.',
      price: 950000,
      stock: 50,
      imageUrl:
        'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800',
    },
    {
      name: 'Apple Watch Ultra 2',
      description:
        'The most rugged and capable Apple Watch. 49mm titanium case, precision dual-frequency GPS, up to 36 hours battery.',
      price: 3200000,
      stock: 20,
      imageUrl:
        'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800',
    },
    {
      name: 'iPad Pro 12.9"',
      description:
        'M2 chip, Liquid Retina XDR display, 256GB storage. Transform your workflow with the power of a laptop in a tablet.',
      price: 5200000,
      stock: 12,
      imageUrl:
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
    },
  ];

  for (const productData of products) {
    const product = productRepository.create(productData);
    await productRepository.save(product);
    console.log(`Seeded product: ${product.name}`);
  }

  console.log('Products seeded successfully!');
};
