import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthCheckService) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check API health status' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  @ApiResponse({ status: 503, description: 'API is unhealthy' })
  check(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }
}
