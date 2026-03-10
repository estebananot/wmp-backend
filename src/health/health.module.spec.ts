import { Test, TestingModule } from '@nestjs/testing';
import { HealthModule } from './health.module';
import { HealthController } from './health.controller';
import { HealthCheckService } from '@nestjs/terminus';

describe('HealthModule', () => {
  let module: TestingModule;
  let healthCheckService: HealthCheckService;
  let healthController: HealthController;

  beforeEach(async () => {
    const mockHealthCheckService = {
      check: jest.fn().mockResolvedValue({
        status: 'ok',
        info: {},
        error: {},
        details: {},
      }),
    };

    module = await Test.createTestingModule({
      imports: [HealthModule],
      providers: [
        { provide: HealthCheckService, useValue: mockHealthCheckService },
      ],
    }).compile();

    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    healthController = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    const healthModule = module.get<HealthModule>(HealthModule);
    expect(healthModule).toBeDefined();
  });

  it('should have health controller', () => {
    expect(healthController).toBeDefined();
  });

  it('should have health check service', () => {
    expect(healthCheckService).toBeDefined();
  });

  it('should perform health check', async () => {
    const result = await healthController.check();
    expect(result.status).toBe('ok');
  });
});
