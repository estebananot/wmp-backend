import { Injectable, Inject, Logger } from '@nestjs/common';
import { Result } from '../../../common/result/result';
import type { TransactionRepositoryInterface } from '../../../domain/repositories/transaction.repository.interface';
import type { PaymentServiceInterface } from '../../../domain/services/payment.service.interface';
import { TransactionResponseDto } from '../../dto/transaction-response.dto';

@Injectable()
export class GetTransactionUseCase {
  private readonly logger = new Logger(GetTransactionUseCase.name);

  constructor(
    @Inject('TransactionRepositoryInterface')
    private readonly transactionRepository: TransactionRepositoryInterface,
    @Inject('PaymentServiceInterface')
    private readonly paymentService: PaymentServiceInterface,
  ) {}

  async execute(id: string): Promise<Result<TransactionResponseDto, Error>> {
    try {
      const transaction = await this.transactionRepository.findById(id);

      if (!transaction) {
        return Result.fail(new Error('Transaction not found'));
      }

      // Si está PENDING y tiene wompiTransactionId, consultar estado actualizado
      if (transaction.status === 'PENDING' && transaction.wompiTransactionId) {
        try {
          const wompiStatus = await this.paymentService.getTransaction(
            transaction.wompiTransactionId,
          );

          if (wompiStatus.status !== 'PENDING') {
            this.logger.log(
              `Updating transaction ${id} status from PENDING to ${wompiStatus.status}`,
            );
            transaction.updateStatus(wompiStatus.status, wompiStatus.id);
            await this.transactionRepository.update(id, transaction);
          }
        } catch (error) {
          this.logger.warn(`Could not fetch Wompi status: ${error}`);
        }
      }

      const response: TransactionResponseDto = {
        id: transaction.id,
        transactionNumber: transaction.transactionNumber,
        status: transaction.status,
        totalAmount: transaction.totalAmount,
        breakdown: {
          productAmount: transaction.productAmount,
          baseFee: transaction.baseFee,
          deliveryFee: transaction.deliveryFee,
        },
        createdAt: transaction.createdAt,
      };

      return Result.ok(response);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to get transaction'),
      );
    }
  }
}
