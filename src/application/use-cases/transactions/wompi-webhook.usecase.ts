import { Injectable, Inject, Logger } from '@nestjs/common';
import { Result } from '../../../common/result/result';
import type { TransactionRepositoryInterface } from '../../../domain/repositories/transaction.repository.interface';
import type { ProductRepositoryInterface } from '../../../domain/repositories/product.repository.interface';
import type { DeliveryRepositoryInterface } from '../../../domain/repositories/delivery.repository.interface';
import { PaymentError } from '../../errors/payment.error';
import * as crypto from 'crypto';
import { getWompiConfig } from '../../../infrastructure/http/wompi/wompi.config';

interface WompiTransactionData {
  id: string;
  reference: string;
  amount_in_cents: number;
  currency: string;
  status: string;
  payment_method_type: string;
  customer_email: string;
}

interface WompiEvent {
  event: string;
  data: {
    transaction: WompiTransactionData;
  };
  environment: string;
  signature: {
    properties: string[];
    checksum: string;
  };
  timestamp: number;
  sent_at: string;
}

@Injectable()
export class WompiWebhookUseCase {
  private readonly logger = new Logger(WompiWebhookUseCase.name);
  private readonly config = getWompiConfig();

  constructor(
    @Inject('TransactionRepositoryInterface')
    private readonly transactionRepository: TransactionRepositoryInterface,
    @Inject('ProductRepositoryInterface')
    private readonly productRepository: ProductRepositoryInterface,
    @Inject('DeliveryRepositoryInterface')
    private readonly deliveryRepository: DeliveryRepositoryInterface,
  ) {}

  async execute(event: WompiEvent): Promise<Result<void, PaymentError>> {
    try {
      const { transaction } = event.data;

      this.logger.log(
        `Processing webhook for transaction: ${transaction.reference}`,
      );
      this.logger.log(`New status: ${transaction.status}`);

      // The Wompi reference format is: {transactionNumber}-{wompi_timestamp}
      // Our transaction numbers are like: TXN-{timestamp}-{random}
      // Wompi adds another timestamp: TXN-{timestamp}-{random}-{wompi_timestamp}
      const wompiRef = transaction.reference;

      // Try to find by full reference first
      let dbTransaction =
        await this.transactionRepository.findByTransactionNumber(wompiRef);

      if (!dbTransaction) {
        // Try removing the last part (Wompi's timestamp) - format: TXN-{timestamp}-{random}
        const parts = wompiRef.split('-');
        if (parts.length >= 3 && parts[0] === 'TXN') {
          const possibleRef = parts.slice(0, 3).join('-');
          dbTransaction =
            await this.transactionRepository.findByTransactionNumber(
              possibleRef,
            );
        }
      }

      if (!dbTransaction) {
        this.logger.error(`Transaction not found: ${wompiRef}`);
        return Result.fail(new PaymentError('Transaction not found'));
      }

      const currentStatus = dbTransaction.status;
      const newStatus = this.mapWompiStatus(transaction.status);

      if (currentStatus === newStatus) {
        this.logger.log(`Transaction already has status: ${currentStatus}`);
        return Result.ok(undefined);
      }

      dbTransaction.updateStatus(newStatus, transaction.id);

      await this.transactionRepository.update(dbTransaction.id, dbTransaction);

      this.logger.log(
        `Transaction ${dbTransaction.transactionNumber} updated to status: ${newStatus}`,
      );

      if (newStatus === 'APPROVED' && currentStatus !== 'APPROVED') {
        const product = await this.productRepository.findById(
          dbTransaction.productId,
        );
        if (product && product.stock >= dbTransaction.quantity) {
          const newStock = product.stock - dbTransaction.quantity;
          await this.productRepository.update(product.id, { stock: newStock });
          this.logger.log(
            `Stock updated for product ${product.id}: ${newStock}`,
          );
        }
      }

      return Result.ok(undefined);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Webhook processing failed';
      this.logger.error(`Webhook processing failed: ${errorMessage}`);
      return Result.fail(new PaymentError(errorMessage));
    }
  }

  private mapWompiStatus(
    wompiStatus: string,
  ): 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR' {
    const statusMap: Record<
      string,
      'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR'
    > = {
      PENDING: 'PENDING',
      APPROVED: 'APPROVED',
      DECLINED: 'DECLINED',
      VOIDED: 'DECLINED',
      ERROR: 'ERROR',
    };

    return statusMap[wompiStatus] || 'ERROR';
  }

  verifySignature(event: WompiEvent): boolean {
    try {
      const { signature, timestamp } = event;
      const { properties, checksum } = signature;

      const data = event.data.transaction as unknown as Record<string, unknown>;
      let concatenatedValue = '';

      for (const prop of properties) {
        const value = this.getNestedValue(data, prop);
        concatenatedValue += value;
      }

      concatenatedValue += timestamp.toString();
      concatenatedValue += this.config.eventsKey;

      const expectedChecksum = crypto
        .createHash('sha256')
        .update(concatenatedValue)
        .digest('hex');

      return expectedChecksum === checksum;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Signature verification failed';
      this.logger.error(`Signature verification failed: ${errorMessage}`);
      return false;
    }
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): string {
    const value = path.split('.').reduce((current: unknown, key: string) => {
      if (current && typeof current === 'object') {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
    if (value === undefined || value === null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean')
      return String(value);
    return '';
  }
}
