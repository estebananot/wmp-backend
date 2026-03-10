import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WompiWebhookUseCase } from '../../application/use-cases/transactions/wompi-webhook.usecase';

interface WompiEvent {
  event: string;
  data: {
    transaction: {
      id: string;
      reference: string;
      amount_in_cents: number;
      currency: string;
      status: string;
      payment_method_type: string;
      customer_email: string;
    };
  };
  environment: string;
  signature: {
    properties: string[];
    checksum: string;
  };
  timestamp: number;
  sent_at: string;
}

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly wompiWebhookUseCase: WompiWebhookUseCase) {}

  @Post('wompi')
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle Wompi webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  async handleWompiEvent(
    @Body() event: WompiEvent,
  ): Promise<{ received: boolean }> {
    this.logger.log(`Received Wompi event: ${event.event}`);
    this.logger.log(`Environment: ${event.environment}`);
    this.logger.log(`Transaction ID: ${event.data?.transaction?.id}`);
    this.logger.log(`Transaction status: ${event.data?.transaction?.status}`);

    if (event.event === 'transaction.updated') {
      const result = await this.wompiWebhookUseCase.execute(event);

      if (result.isFailure) {
        this.logger.error(`Webhook processing failed: ${result.error.message}`);
        throw new HttpException(result.error.message, HttpStatus.BAD_REQUEST);
      }
    }

    return { received: true };
  }
}
