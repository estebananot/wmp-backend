import { Customer } from './customer.entity';

describe('Customer Entity', () => {
  it('should create customer with all fields', () => {
    const customer = new Customer({
      id: 'cust-123',
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '+573212345678',
    });

    expect(customer.id).toBe('cust-123');
    expect(customer.name).toBe('Juan Pérez');
    expect(customer.email).toBe('juan@example.com');
    expect(customer.phone).toBe('+573212345678');
  });

  it('should create customer with only required fields', () => {
    const customer = new Customer({
      name: 'María García',
      email: 'maria@example.com',
    });

    expect(customer.name).toBe('María García');
    expect(customer.email).toBe('maria@example.com');
    expect(customer.phone).toBeFalsy();
  });

  it('should handle null phone', () => {
    const customer = new Customer({
      name: 'Test Customer',
      email: 'test@example.com',
      phone: undefined,
    });

    expect(customer.phone).toBeFalsy();
  });

  it('should create customer with default dates', () => {
    const customer = new Customer({
      name: 'Test Customer',
      email: 'test@example.com',
    });

    expect(customer.createdAt).toBeDefined();
    expect(customer.updatedAt).toBeDefined();
  });
});
