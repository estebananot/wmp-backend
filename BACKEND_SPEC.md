# BACKEND SPECIFICATION - Wompi E-Commerce API

## 🎯 PROJECT OVERVIEW
Build a REST API for an e-commerce checkout system integrated with Wompi payment gateway.

**Tech Stack:**
- Framework: NestJS (TypeScript)
- Database: PostgreSQL
- ORM: TypeORM
- Testing: Jest (>80% coverage required)
- Architecture: Hexagonal Architecture + Ports & Adapters
- Pattern: Railway Oriented Programming (ROP)

---

## 📁 PROJECT STRUCTURE

```
backend/
├── src/
│   ├── application/              # Use Cases Layer
│   │   ├── use-cases/
│   │   │   ├── products/
│   │   │   │   ├── get-products.usecase.ts
│   │   │   │   └── get-product-by-id.usecase.ts
│   │   │   ├── transactions/
│   │   │   │   ├── create-transaction.usecase.ts
│   │   │   │   ├── process-payment.usecase.ts
│   │   │   │   └── get-transaction.usecase.ts
│   │   │   └── stock/
│   │   │       └── update-stock.usecase.ts
│   │   └── dto/
│   │       ├── create-transaction.dto.ts
│   │       ├── payment-data.dto.ts
│   │       └── delivery-info.dto.ts
│   │
│   ├── domain/                   # Business Logic Layer
│   │   ├── entities/
│   │   │   ├── product.entity.ts
│   │   │   ├── transaction.entity.ts
│   │   │   ├── customer.entity.ts
│   │   │   └── delivery.entity.ts
│   │   ├── repositories/         # Port Interfaces
│   │   │   ├── product.repository.interface.ts
│   │   │   ├── transaction.repository.interface.ts
│   │   │   ├── customer.repository.interface.ts
│   │   │   └── delivery.repository.interface.ts
│   │   ├── services/
│   │   │   └── payment.service.interface.ts
│   │   └── value-objects/
│   │       ├── money.vo.ts
│   │       └── transaction-status.vo.ts
│   │
│   ├── infrastructure/           # Adapters Layer
│   │   ├── database/
│   │   │   ├── repositories/     # Repository Implementations
│   │   │   │   ├── typeorm-product.repository.ts
│   │   │   │   ├── typeorm-transaction.repository.ts
│   │   │   │   ├── typeorm-customer.repository.ts
│   │   │   │   └── typeorm-delivery.repository.ts
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   │       └── product.seeder.ts
│   │   ├── http/
│   │   │   └── wompi/
│   │   │       ├── wompi.service.ts
│   │   │       ├── wompi.config.ts
│   │   │       └── wompi.types.ts
│   │   └── config/
│   │       ├── database.config.ts
│   │       └── app.config.ts
│   │
│   ├── presentation/             # API Layer
│   │   └── controllers/
│   │       ├── products.controller.ts
│   │       ├── transactions.controller.ts
│   │       └── health.controller.ts
│   │
│   ├── common/                   # Shared utilities
│   │   ├── result/              # ROP Result pattern
│   │   │   ├── result.ts
│   │   │   └── result-utils.ts
│   │   ├── exceptions/
│   │   └── guards/
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🗄️ DATABASE SCHEMA

### Products Table
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_price CHECK (price > 0),
    CONSTRAINT non_negative_stock CHECK (stock >= 0)
);

CREATE INDEX idx_products_stock ON products(stock);
```

### Customers Table
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_email ON customers(email);
```

### Transactions Table
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    product_amount DECIMAL(10, 2) NOT NULL,
    base_fee DECIMAL(10, 2) NOT NULL DEFAULT 2000.00,
    delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 5000.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    wompi_transaction_id VARCHAR(255),
    wompi_reference VARCHAR(255),
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('PENDING', 'APPROVED', 'DECLINED', 'ERROR')),
    CONSTRAINT positive_quantity CHECK (quantity > 0)
);

CREATE INDEX idx_transactions_number ON transactions(transaction_number);
CREATE INDEX idx_transactions_customer ON transactions(customer_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_wompi ON transactions(wompi_transaction_id);
```

### Deliveries Table
```sql
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL UNIQUE REFERENCES transactions(id),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    postal_code VARCHAR(20),
    delivery_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    delivery_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_delivery_status CHECK (delivery_status IN ('PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'))
);

CREATE INDEX idx_deliveries_transaction ON deliveries(transaction_id);
CREATE INDEX idx_deliveries_status ON deliveries(delivery_status);
```

---

## 🔌 API ENDPOINTS

### Products
```
GET    /api/products
Response: {
  data: [
    {
      id: "uuid",
      name: "Product Name",
      description: "Description",
      price: 50000,
      stock: 10,
      imageUrl: "https://..."
    }
  ]
}

GET    /api/products/:id
Response: {
  data: {
    id: "uuid",
    name: "Product Name",
    description: "Description",
    price: 50000,
    stock: 10,
    imageUrl: "https://..."
  }
}
```

### Transactions
```
POST   /api/transactions
Body: {
  customerId: "uuid",
  productId: "uuid",
  quantity: 1,
  deliveryInfo: {
    address: "Calle 123",
    city: "Bogotá",
    department: "Cundinamarca",
    postalCode: "110111"
  }
}
Response: {
  data: {
    id: "uuid",
    transactionNumber: "TXN-1234567890",
    status: "PENDING",
    totalAmount: 57000,
    breakdown: {
      productAmount: 50000,
      baseFee: 2000,
      deliveryFee: 5000
    }
  }
}

POST   /api/transactions/:id/payment
Body: {
  cardToken: "tok_...",  # Token from Wompi
  customerEmail: "user@example.com",
  acceptanceToken: "acc_..."
}
Response: {
  data: {
    id: "uuid",
    status: "APPROVED" | "DECLINED" | "ERROR",
    wompiTransactionId: "123-456",
    message: "Payment processed successfully"
  }
}

GET    /api/transactions/:id
Response: {
  data: {
    id: "uuid",
    transactionNumber: "TXN-1234567890",
    status: "APPROVED",
    totalAmount: 57000,
    product: {...},
    customer: {...},
    delivery: {...},
    createdAt: "2025-02-01T10:00:00Z"
  }
}
```

### Customers
```
POST   /api/customers
Body: {
  name: "John Doe",
  email: "john@example.com",
  phone: "+573001234567"
}
Response: {
  data: {
    id: "uuid",
    name: "John Doe",
    email: "john@example.com",
    phone: "+573001234567"
  }
}

GET    /api/customers/:id
Response: {
  data: {
    id: "uuid",
    name: "John Doe",
    email: "john@example.com",
    phone: "+573001234567",
    transactions: [...]
  }
}
```

---

## 🔐 WOMPI INTEGRATION

### Configuration
```typescript
// Environment variables
WOMPI_API_URL=https://api-sandbox.co.uat.wompi.dev/v1
WOMPI_PUBLIC_KEY=pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7
WOMPI_PRIVATE_KEY=prv_stagtest_5i0ZGIGiFcDQifYsXxvsny7Y37tKqFWg
WOMPI_EVENTS_KEY=stagtest_events_2PDUmhMywUkvb1LvxYnayFbmofT7w39N
WOMPI_INTEGRITY_KEY=stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp
```

### Wompi Service Interface
```typescript
interface WompiService {
  // Create payment source (tokenize card)
  createPaymentSource(cardData: CardData): Promise<PaymentSource>;
  
  // Create transaction
  createTransaction(transactionData: WompiTransactionData): Promise<WompiTransaction>;
  
  // Get transaction status
  getTransaction(transactionId: string): Promise<WompiTransaction>;
  
  // Verify signature for webhooks
  verifySignature(data: any, signature: string): boolean;
}

interface CardData {
  number: string;
  cvc: string;
  exp_month: string;
  exp_year: string;
  card_holder: string;
}

interface WompiTransactionData {
  amount_in_cents: number;
  currency: 'COP';
  customer_email: string;
  payment_method: {
    type: 'CARD';
    token: string;
    installments: number;
  };
  reference: string;
  customer_data?: {
    phone_number: string;
    full_name: string;
  };
}

interface WompiTransaction {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';
  reference: string;
  amount_in_cents: number;
  currency: 'COP';
  payment_method_type: string;
  created_at: string;
}
```

### Payment Flow
```
1. Frontend: Collect card data
2. Frontend: Call Wompi tokenization endpoint directly
3. Frontend: Send token to Backend
4. Backend: Create PENDING transaction in DB
5. Backend: Call Wompi /transactions with token
6. Backend: Receive Wompi response
7. Backend: Update transaction status
8. Backend: Update product stock if APPROVED
9. Backend: Return result to Frontend
```

---

## 🏗️ RAILWAY ORIENTED PROGRAMMING (ROP)

### Result Pattern Implementation
```typescript
// common/result/result.ts
export class Result<T, E = Error> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: E
  ) {}

  static ok<T, E = Error>(value: T): Result<T, E> {
    return new Result<T, E>(true, value);
  }

  static fail<T, E = Error>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  isSuccess(): boolean {
    return this._isSuccess;
  }

  isFailure(): boolean {
    return !this._isSuccess;
  }

  getValue(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value from failed result');
    }
    return this._value!;
  }

  getError(): E {
    if (this._isSuccess) {
      throw new Error('Cannot get error from successful result');
    }
    return this._error!;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isFailure()) {
      return Result.fail<U, E>(this._error!);
    }
    return Result.ok<U, E>(fn(this._value!));
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isFailure()) {
      return Result.fail<U, E>(this._error!);
    }
    return fn(this._value!);
  }
}
```

### Use Case Example with ROP
```typescript
// process-payment.usecase.ts
export class ProcessPaymentUseCase {
  async execute(
    transactionId: string,
    paymentData: PaymentDataDto
  ): Promise<Result<Transaction, PaymentError>> {
    
    return await this.getTransaction(transactionId)
      .then(this.validateTransaction)
      .then(this.callWompiPayment(paymentData))
      .then(this.updateTransactionStatus)
      .then(this.updateProductStock)
      .then(this.createDeliveryRecord)
      .catch(this.handlePaymentError);
  }

  private async getTransaction(id: string): Promise<Result<Transaction, PaymentError>> {
    const transaction = await this.transactionRepo.findById(id);
    if (!transaction) {
      return Result.fail(new PaymentError('Transaction not found'));
    }
    if (transaction.status !== 'PENDING') {
      return Result.fail(new PaymentError('Transaction already processed'));
    }
    return Result.ok(transaction);
  }

  private validateTransaction = async (
    result: Result<Transaction, PaymentError>
  ): Promise<Result<Transaction, PaymentError>> => {
    if (result.isFailure()) return result;
    
    const transaction = result.getValue();
    const product = await this.productRepo.findById(transaction.productId);
    
    if (!product || product.stock < transaction.quantity) {
      return Result.fail(new PaymentError('Insufficient stock'));
    }
    
    return Result.ok(transaction);
  }

  private callWompiPayment = (paymentData: PaymentDataDto) => 
    async (result: Result<Transaction, PaymentError>): Promise<Result<WompiResponse, PaymentError>> => {
      if (result.isFailure()) return Result.fail(result.getError());
      
      const transaction = result.getValue();
      
      try {
        const wompiResponse = await this.wompiService.createTransaction({
          amount_in_cents: transaction.totalAmount * 100,
          currency: 'COP',
          customer_email: paymentData.customerEmail,
          payment_method: {
            type: 'CARD',
            token: paymentData.cardToken,
            installments: 1
          },
          reference: transaction.transactionNumber
        });
        
        return Result.ok(wompiResponse);
      } catch (error) {
        return Result.fail(new PaymentError('Wompi payment failed', error));
      }
    }

  // ... more pipeline functions
}
```

---

## 🧪 TESTING REQUIREMENTS

### Unit Tests (>80% coverage)
```typescript
// Example: products.service.spec.ts
describe('ProductsService', () => {
  let service: ProductsService;
  let repository: MockType<ProductRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: 'ProductRepository',
          useFactory: mockRepository
        }
      ]
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get('ProductRepository');
  });

  describe('getProducts', () => {
    it('should return only products with stock > 0', async () => {
      const products = [
        { id: '1', name: 'Product 1', stock: 5 },
        { id: '2', name: 'Product 2', stock: 0 },
        { id: '3', name: 'Product 3', stock: 10 }
      ];
      
      repository.findAll.mockResolvedValue(products);
      
      const result = await service.getAvailableProducts();
      
      expect(result).toHaveLength(2);
      expect(result.every(p => p.stock > 0)).toBe(true);
    });
  });

  describe('decreaseStock', () => {
    it('should decrease stock when sufficient quantity available', async () => {
      const product = { id: '1', stock: 10 };
      repository.findById.mockResolvedValue(product);
      
      const result = await service.decreaseStock('1', 3);
      
      expect(result.isSuccess()).toBe(true);
      expect(repository.update).toHaveBeenCalledWith('1', { stock: 7 });
    });

    it('should fail when insufficient stock', async () => {
      const product = { id: '1', stock: 2 };
      repository.findById.mockResolvedValue(product);
      
      const result = await service.decreaseStock('1', 5);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toContain('Insufficient stock');
    });
  });
});
```

### Integration Tests
```typescript
// Example: transactions.e2e.spec.ts
describe('Transactions (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Setup test database
  });

  it('/api/transactions (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/transactions')
      .send({
        customerId: 'uuid',
        productId: 'uuid',
        quantity: 1,
        deliveryInfo: {
          address: 'Test Address',
          city: 'Bogotá'
        }
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.data.status).toBe('PENDING');
        expect(res.body.data.totalAmount).toBeGreaterThan(0);
      });
  });
});
```

---

## 📋 VALIDATION RULES

### DTOs with class-validator
```typescript
// create-transaction.dto.ts
export class CreateTransactionDto {
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  @Max(10)
  quantity: number;

  @ValidateNested()
  @Type(() => DeliveryInfoDto)
  deliveryInfo: DeliveryInfoDto;
}

// payment-data.dto.ts
export class PaymentDataDto {
  @IsString()
  @IsNotEmpty()
  cardToken: string;

  @IsEmail()
  customerEmail: string;

  @IsString()
  @IsNotEmpty()
  acceptanceToken: string;
}

// delivery-info.dto.ts
export class DeliveryInfoDto {
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;
}
```

---

## 🔒 SECURITY CONSIDERATIONS

### OWASP Alignments
1. **Input Validation**: Use class-validator on all DTOs
2. **SQL Injection**: Use TypeORM parameterized queries
3. **Sensitive Data**: 
   - NEVER store card numbers
   - Only store Wompi tokens
   - Hash/encrypt customer PII if needed
4. **HTTPS**: Enforce in production
5. **CORS**: Configure properly
6. **Rate Limiting**: Implement on payment endpoints
7. **Security Headers**: helmet middleware

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(helmet());
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));
  
  await app.listen(3000);
}
```

---

## 📦 SEED DATA

### Initial Products
```typescript
// seeds/product.seeder.ts
const products = [
  {
    name: 'iPhone 14 Pro',
    description: 'Latest Apple smartphone with A16 Bionic chip',
    price: 4500000, // COP
    stock: 15,
    imageUrl: 'https://example.com/iphone14.jpg'
  },
  {
    name: 'Samsung Galaxy S23',
    description: 'Flagship Android phone with Snapdragon 8 Gen 2',
    price: 3800000,
    stock: 20,
    imageUrl: 'https://example.com/galaxy-s23.jpg'
  },
  {
    name: 'MacBook Pro M2',
    description: '14-inch laptop with M2 Pro chip',
    price: 8500000,
    stock: 8,
    imageUrl: 'https://example.com/macbook-m2.jpg'
  }
];
```

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Seed data loaded
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Rate limiting active
- [ ] Health check endpoint working
- [ ] Logging configured
- [ ] Error monitoring setup
- [ ] API documentation (Swagger) generated

---

## 📚 DOCUMENTATION REQUIREMENTS

### README.md must include:
1. Project description
2. Tech stack
3. Architecture diagram (Hexagonal)
4. Database schema (ERD)
5. API documentation (Swagger URL or Postman collection)
6. Setup instructions
7. Environment variables
8. Running tests with coverage results
9. Deployment URL
10. Known limitations

### Swagger Setup
```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle('Wompi E-Commerce API')
  .setDescription('API for product checkout with Wompi integration')
  .setVersion('1.0')
  .addTag('products')
  .addTag('transactions')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

---

## 🎯 SUCCESS CRITERIA

- ✅ All endpoints working correctly
- ✅ >80% test coverage
- ✅ Hexagonal architecture implemented
- ✅ ROP pattern used in use cases
- ✅ Wompi integration functional
- ✅ Stock management working
- ✅ Transaction lifecycle complete
- ✅ Proper error handling
- ✅ Input validation on all endpoints
- ✅ API documented (Swagger)
- ✅ Deployed to cloud (AWS/others)
- ✅ Security headers configured
- ✅ HTTPS enabled

---

## 💡 TIPS FOR AI CODING ASSISTANT

When implementing:
1. Start with domain entities (pure business logic)
2. Then create repository interfaces (ports)
3. Implement use cases with ROP
4. Add repository implementations (adapters)
5. Create controllers (thin layer)
6. Write tests alongside implementation
7. Configure Wompi service last
8. Add seed data and migrations

**Priority Order:**
1. Database setup + migrations
2. Entities + repositories
3. Product module (simplest)
4. Customer module
5. Transaction module (complex)
6. Wompi integration
7. Tests
8. Documentation
