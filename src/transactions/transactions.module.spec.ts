import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsModule } from './transactions.module';
import { CreateTransactionUseCase } from '../application/use-cases/transactions/create-transaction.usecase';
import { GetTransactionUseCase } from '../application/use-cases/transactions/get-transaction.usecase';
import { GetAllTransactionsUseCase } from '../application/use-cases/transactions/get-all-transactions.usecase';
import { ProcessPaymentUseCase } from '../application/use-cases/transactions/process-payment.usecase';
import { WompiWebhookUseCase } from '../application/use-cases/transactions/wompi-webhook.usecase';
import { TransactionsController } from '../presentation/controllers/transactions.controller';
import { WebhooksController } from '../presentation/controllers/webhooks.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionEntity } from '../infrastructure/database/transaction.entity';
import { DeliveryEntity } from '../infrastructure/database/delivery.entity';
import { ProductEntity } from '../infrastructure/database/product.entity';
import { CustomerEntity } from '../infrastructure/database/customer.entity';

describe('TransactionsModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TransactionsModule],
    })
      .overrideProvider(getRepositoryToken(TransactionEntity))
      .useValue({})
      .overrideProvider(getRepositoryToken(DeliveryEntity))
      .useValue({})
      .overrideProvider(getRepositoryToken(ProductEntity))
      .useValue({})
      .overrideProvider(getRepositoryToken(CustomerEntity))
      .useValue({})
      .compile();
  });

  it('should be defined', () => {
    const transactionsModule =
      module.get<TransactionsModule>(TransactionsModule);
    expect(transactionsModule).toBeDefined();
  });

  it('should have controllers', () => {
    const controllers = module.get<TransactionsController[]>(
      TransactionsController,
    );
    expect(controllers).toBeDefined();
  });

  it('should have webhooks controller', () => {
    const controllers = module.get<WebhooksController[]>(WebhooksController);
    expect(controllers).toBeDefined();
  });

  it('should have use cases', () => {
    const createTransactionUseCase = module.get<CreateTransactionUseCase>(
      CreateTransactionUseCase,
    );
    const getTransactionUseCase = module.get<GetTransactionUseCase>(
      GetTransactionUseCase,
    );
    const getAllTransactionsUseCase = module.get<GetAllTransactionsUseCase>(
      GetAllTransactionsUseCase,
    );
    const processPaymentUseCase = module.get<ProcessPaymentUseCase>(
      ProcessPaymentUseCase,
    );
    const wompiWebhookUseCase =
      module.get<WompiWebhookUseCase>(WompiWebhookUseCase);

    expect(createTransactionUseCase).toBeDefined();
    expect(getTransactionUseCase).toBeDefined();
    expect(getAllTransactionsUseCase).toBeDefined();
    expect(processPaymentUseCase).toBeDefined();
    expect(wompiWebhookUseCase).toBeDefined();
  });
});
