import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from '../infrastructure/database/transaction.entity';
import { DeliveryEntity } from '../infrastructure/database/delivery.entity';
import { ProductEntity } from '../infrastructure/database/product.entity';
import { CustomerEntity } from '../infrastructure/database/customer.entity';
import { TypeOrmTransactionRepository } from '../infrastructure/database/repositories/typeorm-transaction.repository';
import { TypeOrmDeliveryRepository } from '../infrastructure/database/repositories/typeorm-delivery.repository';
import { TypeOrmProductRepository } from '../infrastructure/database/repositories/typeorm-product.repository';
import { TypeOrmCustomerRepository } from '../infrastructure/database/repositories/typeorm-customer.repository';
import { WompiService } from '../infrastructure/http/wompi/wompi.service';
import { CreateTransactionUseCase } from '../application/use-cases/transactions/create-transaction.usecase';
import { GetTransactionUseCase } from '../application/use-cases/transactions/get-transaction.usecase';
import { GetAllTransactionsUseCase } from '../application/use-cases/transactions/get-all-transactions.usecase';
import { ProcessPaymentUseCase } from '../application/use-cases/transactions/process-payment.usecase';
import { WompiWebhookUseCase } from '../application/use-cases/transactions/wompi-webhook.usecase';
import { TransactionsController } from '../presentation/controllers/transactions.controller';
import { WebhooksController } from '../presentation/controllers/webhooks.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TransactionEntity,
      DeliveryEntity,
      ProductEntity,
      CustomerEntity,
    ]),
  ],
  controllers: [TransactionsController, WebhooksController],
  providers: [
    CreateTransactionUseCase,
    GetTransactionUseCase,
    GetAllTransactionsUseCase,
    ProcessPaymentUseCase,
    WompiWebhookUseCase,
    WompiService,
    {
      provide: 'TransactionRepositoryInterface',
      useClass: TypeOrmTransactionRepository,
    },
    {
      provide: 'DeliveryRepositoryInterface',
      useClass: TypeOrmDeliveryRepository,
    },
    {
      provide: 'ProductRepositoryInterface',
      useClass: TypeOrmProductRepository,
    },
    {
      provide: 'CustomerRepositoryInterface',
      useClass: TypeOrmCustomerRepository,
    },
    {
      provide: 'PaymentServiceInterface',
      useClass: WompiService,
    },
  ],
})
export class TransactionsModule {}
