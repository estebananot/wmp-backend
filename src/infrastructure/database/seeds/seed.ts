import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { ProductEntity } from '../product.entity';
import { CustomerEntity } from '../customer.entity';
import { TransactionEntity } from '../transaction.entity';
import { DeliveryEntity } from '../delivery.entity';
import { seedProducts } from './product.seeder';

config();

const isProduction = process.env.NODE_ENV === 'production';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'wompi_ecommerce',
  entities: [ProductEntity, CustomerEntity, TransactionEntity, DeliveryEntity],
  synchronize: true,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

async function runSeeds() {
  try {
    await dataSource.initialize();
    console.log('Database connected for seeding...');

    await seedProducts(dataSource);

    console.log('All seeds completed!');
    await dataSource.destroy();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

runSeeds();
