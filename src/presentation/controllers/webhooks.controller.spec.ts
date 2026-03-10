import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksController } from '../../presentation/controllers/webhooks.controller';
import { WompiWebhookUseCase } from '../../application/use-cases/transactions/wompi-webhook.usecase';

const Result = {
  ok: (value: unknown) => ({ isFailure: false, value }),
  fail: (error: Error) => ({ isFailure: true, error }),
};

jest.mock(
  '../../application/use-cases/transactions/wompi-webhook.usecase',
  () => ({
    WompiWebhookUseCase: jest.fn().mockImplementation(() => ({
      execute: jest.fn(),
    })),
  }),
);

describe('WebhooksController', () => {
  let controller: WebhooksController;
  let wompiWebhookUseCase: WompiWebhookUseCase;

  const mockExecute = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [
        {
          provide: WompiWebhookUseCase,
          useValue: { execute: mockExecute },
        },
      ],
    }).compile();

    controller = module.get<WebhooksController>(WebhooksController);
    wompiWebhookUseCase = module.get<WompiWebhookUseCase>(WompiWebhookUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleWompiEvent', () => {
    const mockEvent = {
      event: 'transaction.updated',
      data: {
        transaction: {
          id: '15113-1234567890-99999',
          reference: 'TXN-1234567890-abc',
          amount_in_cents: 50000,
          currency: 'COP',
          status: 'APPROVED',
          payment_method_type: 'CARD',
          customer_email: 'test@example.com',
        },
      },
      environment: 'test',
      signature: {
        properties: [
          'transaction.id',
          'transaction.status',
          'transaction.amount_in_cents',
        ],
        checksum: 'dummy_checksum',
      },
      timestamp: 1234567890,
      sent_at: '2026-03-09T12:00:00.000Z',
    };

    it('should process transaction.updated event successfully', async () => {
      mockExecute.mockResolvedValue(Result.ok(undefined));

      const result = await controller.handleWompiEvent(mockEvent);

      expect(mockExecute).toHaveBeenCalledWith(mockEvent);
      expect(result).toEqual({ received: true });
    });

    it('should return error when webhook processing fails', async () => {
      mockExecute.mockResolvedValue(
        Result.fail(new Error('Transaction not found')),
      );

      await expect(controller.handleWompiEvent(mockEvent)).rejects.toThrow();
    });

    it('should handle other event types without calling use case', async () => {
      const otherEvent = { ...mockEvent, event: 'other.event' };

      const result = await controller.handleWompiEvent(otherEvent);

      expect(mockExecute).not.toHaveBeenCalled();
      expect(result).toEqual({ received: true });
    });
  });
});
