import { DeliveryInfoDto } from './delivery-info.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

describe('DeliveryInfoDto', () => {
  it('should create delivery info DTO with all fields', async () => {
    const dto = plainToInstance(DeliveryInfoDto, {
      address: 'Carrera 10 # 20-30',
      city: 'Bogotá',
      department: 'Cundinamarca',
      postalCode: '110231',
      deliveryNotes: 'Entregar en portería',
    });

    expect(dto.address).toBe('Carrera 10 # 20-30');
    expect(dto.city).toBe('Bogotá');
    expect(dto.department).toBe('Cundinamarca');
    expect(dto.postalCode).toBe('110231');
  });

  it('should have required address and city', async () => {
    const dto = plainToInstance(DeliveryInfoDto, {
      address: 'Test Address',
      city: 'Test City',
    });

    expect(dto.address).toBe('Test Address');
    expect(dto.city).toBe('Test City');
  });
});
