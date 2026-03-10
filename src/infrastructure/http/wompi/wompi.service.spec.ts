import { Test, TestingModule } from '@nestjs/testing';
import { WompiService } from './wompi.service';
import { getWompiConfig } from './wompi.config';
import * as crypto from 'crypto';
import { AxiosError } from 'axios';

jest.mock('./wompi.config', () => ({
  getWompiConfig: jest.fn().mockReturnValue({
    apiUrl: 'https://sandbox.wompi.co/v1',
    publicKey: 'pub_test_xxx',
    privateKey: 'prv_test_xxx',
    integrityKey: 'test_integrity_key',
    eventsKey: 'test_events_key',
  }),
}));

jest.mock('crypto', () => ({
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      digest: jest.fn().mockReturnValue('mocked_signature'),
    }),
  }),
  createHmac: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      digest: jest.fn().mockReturnValue('mocked_hmac'),
    }),
  }),
  timingSafeEqual: jest.fn().mockReturnValue(true),
}));

jest.mock('axios', () => ({
  create: jest.fn().mockReturnValue({
    post: jest.fn(),
    get: jest.fn(),
  }),
  AxiosError: class extends Error {
    code?: string;
    response?: {
      data?: {
        error?: {
          type?: string;
          reason?: string;
          messages?: Record<string, string[]>;
        };
        status?: number;
      };
    };
    message: string;
    constructor(message: string) {
      super(message);
      this.message = message;
    }
  },
}));

describe('WompiService', () => {
  let service: WompiService;
  let mockHttpClient: any;

  beforeEach(async () => {
    mockHttpClient = {
      post: jest.fn(),
      get: jest.fn(),
    };

    (require('axios').create as jest.Mock).mockReturnValue(mockHttpClient);

    const module: TestingModule = await Test.createTestingModule({
      providers: [WompiService],
    }).compile();

    service = module.get<WompiService>(WompiService);
  });

  describe('generateIntegritySignature', () => {
    it('should generate integrity signature', () => {
      const signature = service.generateIntegritySignature(
        'TEST-001',
        50000,
        'COP',
      );
      expect(crypto.createHash).toHaveBeenCalledWith('sha256');
      expect(signature).toBe('mocked_signature');
    });
  });

  describe('verifySignature', () => {
    it('should verify signature correctly', () => {
      const data = { event: 'test' };
      const signature = 'expected_signature';
      const result = service.verifySignature(data as any, signature);
      expect(result).toBe(true);
    });

    it('should return false when signature is invalid', () => {
      (crypto.timingSafeEqual as jest.Mock).mockReturnValueOnce(false);
      const data = { event: 'test' };
      const signature = 'invalid_signature';
      const result = service.verifySignature(data as any, signature);
      expect(result).toBe(false);
    });
  });

  describe('createPaymentSource', () => {
    it('should create payment source successfully', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: {
          data: {
            id: 'ps_123',
            type: 'CARD',
            status: 'ACTIVE',
          },
        },
      });

      const result = await service.createPaymentSource('tok_test');

      expect(result).toEqual({
        id: 'ps_123',
        type: 'CARD',
        status: 'ACTIVE',
      });
    });

    it('should throw error when payment source creation fails', async () => {
      mockHttpClient.post.mockRejectedValue(new Error('Network error'));

      await expect(service.createPaymentSource('tok_test')).rejects.toThrow(
        'Failed to create payment source',
      );
    });
  });

  describe('createTransaction', () => {
    it('should create transaction successfully', async () => {
      mockHttpClient.post.mockResolvedValue({
        data: {
          data: {
            id: 'txn_123',
            status: 'APPROVED',
            reference: 'TEST-001',
            amount_in_cents: 50000,
            currency: 'COP',
            payment_method: { type: 'CARD' },
            created_at: '2024-01-01T00:00:00Z',
          },
        },
      });

      const result = await service.createTransaction({
        amount_in_cents: 50000,
        currency: 'COP',
        customer_email: 'test@example.com',
        payment_method: { type: 'CARD', token: 'tok_test', installments: 1 },
        reference: 'TEST-001',
        acceptance_token: 'acc_token',
        customer_data: {
          phone_number: '+573212345678',
          full_name: 'Test User',
        },
        ip: '127.0.0.1',
      });

      expect(result).toEqual({
        id: 'txn_123',
        status: 'APPROVED',
        reference: 'TEST-001',
        amount_in_cents: 50000,
        currency: 'COP',
        payment_method_type: 'CARD',
        created_at: '2024-01-01T00:00:00Z',
      });
    });

    it('should throw error with Wompi error details', async () => {
      const wompiError = {
        response: {
          data: {
            error: {
              type: 'validation_error',
              reason: 'Invalid card',
              messages: {
                card: ['Card expired'],
              },
            },
          },
        },
      };
      mockHttpClient.post.mockRejectedValue(wompiError);

      await expect(
        service.createTransaction({
          amount_in_cents: 50000,
          currency: 'COP',
          customer_email: 'test@example.com',
          payment_method: { type: 'CARD', token: 'tok_test', installments: 1 },
          reference: 'TEST-001',
          acceptance_token: 'acc_token',
          customer_data: {
            phone_number: '+573212345678',
            full_name: 'Test User',
          },
          ip: '127.0.0.1',
        }),
      ).rejects.toThrow('Wompi error [validation_error]');
    });

    it('should throw error with only reason (no messages)', async () => {
      const wompiError = {
        response: {
          data: {
            error: {
              type: 'validation_error',
              reason: 'Invalid card',
            },
          },
        },
      };
      mockHttpClient.post.mockRejectedValue(wompiError);

      await expect(
        service.createTransaction({
          amount_in_cents: 50000,
          currency: 'COP',
          customer_email: 'test@example.com',
          payment_method: { type: 'CARD', token: 'tok_test', installments: 1 },
          reference: 'TEST-001',
          acceptance_token: 'acc_token',
          customer_data: {
            phone_number: '+573212345678',
            full_name: 'Test User',
          },
          ip: '127.0.0.1',
        }),
      ).rejects.toThrow('Wompi error [validation_error]');
    });

    it('should throw error with multiple message fields', async () => {
      const wompiError = {
        response: {
          data: {
            error: {
              type: 'validation_error',
              reason: 'Validation failed',
              messages: {
                card: ['Card expired', 'CVV invalid'],
                expiry: ['Month must be future'],
              },
            },
          },
        },
      };
      mockHttpClient.post.mockRejectedValue(wompiError);

      await expect(
        service.createTransaction({
          amount_in_cents: 50000,
          currency: 'COP',
          customer_email: 'test@example.com',
          payment_method: { type: 'CARD', token: 'tok_test', installments: 1 },
          reference: 'TEST-001',
          acceptance_token: 'acc_token',
          customer_data: {
            phone_number: '+573212345678',
            full_name: 'Test User',
          },
          ip: '127.0.0.1',
        }),
      ).rejects.toThrow('Wompi error [validation_error]');
    });

    it('should throw error on connection refused', async () => {
      const axiosError = new Error('ECONNREFUSED');
      (axiosError as any).code = 'ECONNREFUSED';
      mockHttpClient.post.mockRejectedValue(axiosError);

      await expect(
        service.createTransaction({
          amount_in_cents: 50000,
          currency: 'COP',
          customer_email: 'test@example.com',
          payment_method: { type: 'CARD', token: 'tok_test', installments: 1 },
          reference: 'TEST-001',
          acceptance_token: 'acc_token',
          customer_data: {
            phone_number: '+573212345678',
            full_name: 'Test User',
          },
          ip: '127.0.0.1',
        }),
      ).rejects.toThrow('Cannot connect to Wompi API');
    });

    it('should throw generic error for unknown failures', async () => {
      mockHttpClient.post.mockRejectedValue(new Error('Unknown error'));

      await expect(
        service.createTransaction({
          amount_in_cents: 50000,
          currency: 'COP',
          customer_email: 'test@example.com',
          payment_method: { type: 'CARD', token: 'tok_test', installments: 1 },
          reference: 'TEST-001',
          acceptance_token: 'acc_token',
          customer_data: {
            phone_number: '+573212345678',
            full_name: 'Test User',
          },
          ip: '127.0.0.1',
        }),
      ).rejects.toThrow('Wompi transaction failed');
    });
  });

  describe('getTransaction', () => {
    it('should get transaction successfully', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: {
          data: {
            id: 'txn_123',
            status: 'APPROVED',
            reference: 'TEST-001',
            amount_in_cents: 50000,
            currency: 'COP',
            payment_method: { type: 'CARD' },
            created_at: '2024-01-01T00:00:00Z',
          },
        },
      });

      const result = await service.getTransaction('txn_123');

      expect(result).toEqual({
        id: 'txn_123',
        status: 'APPROVED',
        reference: 'TEST-001',
        amount_in_cents: 50000,
        currency: 'COP',
        payment_method_type: 'CARD',
        created_at: '2024-01-01T00:00:00Z',
      });
    });

    it('should throw error when getting transaction fails', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Not found'));

      await expect(service.getTransaction('txn_123')).rejects.toThrow(
        'Failed to get transaction',
      );
    });
  });
});
