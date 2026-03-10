import { Transaction } from '../../domain/entities/transaction.entity';

describe('Transaction Entity - Extended', () => {
  it('should create transaction with all fields', () => {
    const transaction = new Transaction({
      id: 'txn-123',
      transactionNumber: 'TXN-1234567890-abc',
      customerId: 'cust-1',
      productId: 'prod-1',
      quantity: 2,
      productAmount: 2000000,
      baseFee: 2000,
      deliveryFee: 5000,
      totalAmount: 2007000,
      status: 'PENDING',
    });

    expect(transaction.id).toBe('txn-123');
    expect(transaction.transactionNumber).toBe('TXN-1234567890-abc');
    expect(transaction.status).toBe('PENDING');
    expect(transaction.quantity).toBe(2);
  });

  it('should create transaction with default dates', () => {
    const transaction = new Transaction({
      transactionNumber: 'TXN-123',
      customerId: 'cust-1',
      productId: 'prod-1',
      quantity: 1,
      productAmount: 1000,
      baseFee: 2000,
      deliveryFee: 5000,
      totalAmount: 8000,
      status: 'PENDING',
    });

    expect(transaction.createdAt).toBeDefined();
    expect(transaction.updatedAt).toBeDefined();
  });

  it('should have canBeProcessed method returning true for PENDING', () => {
    const transaction = new Transaction({
      transactionNumber: 'TXN-123',
      customerId: 'cust-1',
      productId: 'prod-1',
      quantity: 1,
      productAmount: 1000,
      baseFee: 2000,
      deliveryFee: 5000,
      totalAmount: 8000,
      status: 'PENDING',
    });

    expect(transaction.canBeProcessed()).toBe(true);
  });

  it('should have canBeProcessed method returning false for APPROVED', () => {
    const transaction = new Transaction({
      transactionNumber: 'TXN-123',
      customerId: 'cust-1',
      productId: 'prod-1',
      quantity: 1,
      productAmount: 1000,
      baseFee: 2000,
      deliveryFee: 5000,
      totalAmount: 8000,
      status: 'APPROVED',
    });

    expect(transaction.canBeProcessed()).toBe(false);
  });

  it('should have canBeProcessed method returning false for DECLINED', () => {
    const transaction = new Transaction({
      transactionNumber: 'TXN-123',
      customerId: 'cust-1',
      productId: 'prod-1',
      quantity: 1,
      productAmount: 1000,
      baseFee: 2000,
      deliveryFee: 5000,
      totalAmount: 8000,
      status: 'DECLINED',
    });

    expect(transaction.canBeProcessed()).toBe(false);
  });

  it('should have canBeProcessed method returning false for ERROR', () => {
    const transaction = new Transaction({
      transactionNumber: 'TXN-123',
      customerId: 'cust-1',
      productId: 'prod-1',
      quantity: 1,
      productAmount: 1000,
      baseFee: 2000,
      deliveryFee: 5000,
      totalAmount: 8000,
      status: 'ERROR',
    });

    expect(transaction.canBeProcessed()).toBe(false);
  });

  it('should update status correctly', () => {
    const transaction = new Transaction({
      transactionNumber: 'TXN-123',
      customerId: 'cust-1',
      productId: 'prod-1',
      quantity: 1,
      productAmount: 1000,
      baseFee: 2000,
      deliveryFee: 5000,
      totalAmount: 8000,
      status: 'PENDING',
    });

    transaction.updateStatus('APPROVED', 'wompi-txn-999');

    expect(transaction.status).toBe('APPROVED');
    expect(transaction.wompiTransactionId).toBe('wompi-txn-999');
  });

  it('should update status to DECLINED', () => {
    const transaction = new Transaction({
      transactionNumber: 'TXN-123',
      customerId: 'cust-1',
      productId: 'prod-1',
      quantity: 1,
      productAmount: 1000,
      baseFee: 2000,
      deliveryFee: 5000,
      totalAmount: 8000,
      status: 'PENDING',
    });

    transaction.updateStatus('DECLINED', 'wompi-txn-999');

    expect(transaction.status).toBe('DECLINED');
  });
});
