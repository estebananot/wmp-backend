import { CustomerResponseDto } from './customer-response.dto';

describe('CustomerResponseDto', () => {
  it('should create customer response DTO', () => {
    const dto: CustomerResponseDto = {
      id: 'cust-123',
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '+573212345678',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(dto.id).toBe('cust-123');
    expect(dto.name).toBe('Juan Pérez');
    expect(dto.email).toBe('juan@example.com');
    expect(dto.phone).toBe('+573212345678');
  });

  it('should have optional phone', () => {
    const dto: CustomerResponseDto = {
      id: 'cust-123',
      name: 'Test Customer',
      email: 'test@example.com',
    };

    expect(dto.phone).toBeUndefined();
    expect(dto.createdAt).toBeUndefined();
    expect(dto.updatedAt).toBeUndefined();
  });
});
