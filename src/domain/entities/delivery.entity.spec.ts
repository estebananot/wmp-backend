import { Delivery } from '../../domain/entities/delivery.entity';

describe('Delivery Entity - Extended', () => {
  it('should create delivery with all required fields', () => {
    const delivery = new Delivery({
      id: 'del-123',
      transactionId: 'txn-123',
      address: 'Carrera 10 # 20-30',
      city: 'Bogotá',
      deliveryStatus: 'PENDING',
    });

    expect(delivery.id).toBe('del-123');
    expect(delivery.transactionId).toBe('txn-123');
    expect(delivery.address).toBe('Carrera 10 # 20-30');
    expect(delivery.city).toBe('Bogotá');
    expect(delivery.deliveryStatus).toBe('PENDING');
  });

  it('should create delivery with optional fields', () => {
    const delivery = new Delivery({
      transactionId: 'txn-123',
      address: 'Calle 50 # 10-20',
      city: 'Medellín',
      department: 'Antioquia',
      postalCode: '050001',
      deliveryStatus: 'PENDING',
      deliveryNotes: 'Entregar en portería',
    });

    expect(delivery.department).toBe('Antioquia');
    expect(delivery.postalCode).toBe('050001');
    expect(delivery.deliveryNotes).toBe('Entregar en portería');
  });

  it('should create delivery with default dates', () => {
    const delivery = new Delivery({
      transactionId: 'txn-123',
      address: 'Test Address',
      city: 'Test City',
      deliveryStatus: 'PENDING',
    });

    expect(delivery.createdAt).toBeDefined();
    expect(delivery.updatedAt).toBeDefined();
  });

  it('should update status to IN_TRANSIT', () => {
    const delivery = new Delivery({
      transactionId: 'txn-123',
      address: 'Test Address',
      city: 'Test City',
      deliveryStatus: 'PENDING',
    });

    delivery.updateStatus('IN_TRANSIT');

    expect(delivery.deliveryStatus).toBe('IN_TRANSIT');
  });

  it('should update status to DELIVERED', () => {
    const delivery = new Delivery({
      transactionId: 'txn-123',
      address: 'Test Address',
      city: 'Test City',
      deliveryStatus: 'IN_TRANSIT',
    });

    delivery.updateStatus('DELIVERED');

    expect(delivery.deliveryStatus).toBe('DELIVERED');
  });

  it('should update status to CANCELLED', () => {
    const delivery = new Delivery({
      transactionId: 'txn-123',
      address: 'Test Address',
      city: 'Test City',
      deliveryStatus: 'PENDING',
    });

    delivery.updateStatus('CANCELLED');

    expect(delivery.deliveryStatus).toBe('CANCELLED');
  });

  it('should handle null optional fields', () => {
    const delivery = new Delivery({
      transactionId: 'txn-123',
      address: 'Test Address',
      city: 'Test City',
      deliveryStatus: 'PENDING',
    });

    expect(delivery.department).toBeNull();
    expect(delivery.postalCode).toBeNull();
    expect(delivery.deliveryNotes).toBeNull();
  });
});
