# Backend - E-Commerce API

API REST para sistema de checkout con integración Wompi.

## 🛠️ Tech Stack

- **Framework**: NestJS 11 (TypeScript)
- **Base de Datos**: PostgreSQL 16
- **ORM**: TypeORM
- **Documentación**: Swagger/OpenAPI
- **Pagos**: Wompi API
- **Arquitectura**: Hexagonal + Ports & Adapters
- **Pattern**: Railway Oriented Programming (ROP)

## 🏗️ Arquitectura

```
src/
├── application/           # Use Cases + DTOs
│   ├── dto/              # Data Transfer Objects
│   ├── errors/           # Custom errors
│   └── use-cases/        # Business logic
│       ├── customers/
│       ├── products/
│       └── transactions/
├── domain/               # Entities + Interfaces
│   ├── entities/         # Domain models
│   ├── repositories/     # Repository interfaces
│   └── services/         # Service interfaces
├── infrastructure/       # External adapters
│   ├── database/         # TypeORM entities + repos
│   └── http/wompi/       # Wompi integration
├── presentation/         # Controllers
└── common/               # Shared utilities (Result pattern)
```

## 🗄️ Modelo de Datos

### Products
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Nombre producto |
| description | TEXT | Descripción |
| price | DECIMAL(10,2) | Precio en COP |
| stock | INTEGER | Cantidad disponible |
| imageUrl | VARCHAR(500) | URL imagen |

### Customers
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Nombre completo |
| email | VARCHAR(255) | Email (único) |
| phone | VARCHAR(50) | Teléfono (opcional) |

### Transactions
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Primary key |
| transactionNumber | VARCHAR(100) | Número único |
| customerId | UUID | FK → Customers |
| productId | UUID | FK → Products |
| quantity | INTEGER | Cantidad |
| productAmount | DECIMAL | Subtotal producto |
| baseFee | DECIMAL | Tarifa base (2000 COP) |
| deliveryFee | DECIMAL | Envío (5000 × qty) |
| totalAmount | DECIMAL | Total a pagar |
| status | ENUM | PENDING/APPROVED/DECLINED/ERROR |
| wompiTransactionId | VARCHAR | ID Wompi |

### Deliveries
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Primary key |
| transactionId | UUID | FK → Transactions |
| address | TEXT | Dirección |
| city | VARCHAR(100) | Ciudad |
| deliveryStatus | ENUM | PENDING/IN_TRANSIT/DELIVERED |

## 🚀 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar PostgreSQL
docker-compose up -d

# 3. Ejecutar seeds
npm run seed

# 4. Iniciar servidor
npm run start:dev
```

## 📡 API Endpoints

### Products
```
GET  /api/products      → Lista productos (stock > 0)
GET  /api/products/:id  → Detalle producto
```

### Customers
```
POST /api/customers     → Crear cliente
GET  /api/customers/:id → Obtener cliente
```

### Transactions
```
POST /api/transactions             → Crear transacción (PENDING)
GET  /api/transactions/:id         → Obtener transacción
POST /api/transactions/:id/payment → Procesar pago
```

## 📚 Swagger

Documentación interactiva disponible en:
```
http://localhost:3000/api/docs
```

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:cov

# Tests e2e
npm run test:e2e
```

### Coverage Results
```
--------------------------|---------|----------|---------|---------|
File                      | % Stmts | % Branch | % Funcs | % Lines |
--------------------------|---------|----------|---------|---------|
All files                 |   85.2  |   78.4   |   82.1  |   84.8  |
--------------------------|---------|----------|---------|---------|
```

## 🔄 Flujo de Pago

```
1. POST /api/customers          → Crear cliente
2. POST /api/transactions       → Crear transacción PENDING
3. Frontend tokeniza tarjeta    → Wompi /tokens/cards
4. POST /transactions/:id/payment → Backend procesa con Wompi
5. GET /api/transactions/:id    → Verificar estado
```

## 📦 Scripts

| Script | Descripción |
|--------|-------------|
| `npm run start:dev` | Desarrollo con hot-reload |
| `npm run build` | Compilar para producción |
| `npm run start:prod` | Ejecutar build de producción |
| `npm run seed` | Poblar base de datos |
| `npm run test` | Ejecutar tests |
| `npm run test:cov` | Tests con coverage |

---

**Framework**: NestJS 11  
**Node**: 18+  
**TypeScript**: 5.x
