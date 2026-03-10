import { Injectable, Inject, Logger } from '@nestjs/common';
import { Result } from '../../../common/result/result';
import type { TransactionRepositoryInterface } from '../../../domain/repositories/transaction.repository.interface';
import type { ProductRepositoryInterface } from '../../../domain/repositories/product.repository.interface';
import type { CustomerRepositoryInterface } from '../../../domain/repositories/customer.repository.interface';
import type { PaymentServiceInterface } from '../../../domain/services/payment.service.interface';
import { PaymentDataDto } from '../../dto/payment-data.dto';
import { TransactionResponseDto } from '../../dto/transaction-response.dto';
import { PaymentError } from '../../errors/payment.error';

@Injectable()
export class ProcessPaymentUseCase {
  private readonly logger = new Logger(ProcessPaymentUseCase.name);

  constructor(
    @Inject('TransactionRepositoryInterface')
    private readonly transactionRepository: TransactionRepositoryInterface,
    @Inject('ProductRepositoryInterface')
    private readonly productRepository: ProductRepositoryInterface,
    @Inject('CustomerRepositoryInterface')
    private readonly customerRepository: CustomerRepositoryInterface,
    @Inject('PaymentServiceInterface')
    private readonly paymentService: PaymentServiceInterface,
  ) {}

  async execute(
    transactionId: string,
    paymentData: PaymentDataDto,
  ): Promise<Result<TransactionResponseDto, PaymentError>> {
    try {
      this.logger.log(`Processing payment for transaction: ${transactionId}`);

      // Get the transaction
      const transaction =
        await this.transactionRepository.findById(transactionId);

      if (!transaction) {
        this.logger.error(`Transaction not found: ${transactionId}`);
        return Result.fail<TransactionResponseDto, PaymentError>(
          new PaymentError('Transaction not found'),
        );
      }

      this.logger.log(
        `Transaction found: ${transaction.transactionNumber}, status: ${transaction.status}`,
      );

      // Validate that transaction is in PENDING state
      if (!transaction.canBeProcessed()) {
        this.logger.error(
          `Transaction cannot be processed. Current status: ${transaction.status}`,
        );
        return Result.fail<TransactionResponseDto, PaymentError>(
          new PaymentError(
            `Transaction cannot be processed. Current status: ${transaction.status}`,
          ),
        );
      }

      // Validate stock again before processing payment
      const product = await this.productRepository.findById(
        transaction.productId,
      );
      if (!product) {
        this.logger.error(`Product not found: ${transaction.productId}`);
        return Result.fail<TransactionResponseDto, PaymentError>(
          new PaymentError('Product not found'),
        );
      }

      if (product.stock < transaction.quantity) {
        this.logger.error(
          `Insufficient stock. Available: ${product.stock}, Requested: ${transaction.quantity}`,
        );
        return Result.fail<TransactionResponseDto, PaymentError>(
          new PaymentError('Insufficient stock to complete payment'),
        );
      }

      this.logger.log(
        `Creating Wompi transaction for amount: ${transaction.totalAmount} COP`,
      );

      // Generate unique payment reference (Wompi doesn't allow reusing references)
      const paymentReference = `${transaction.transactionNumber}-${Date.now()}`;
      this.logger.log(`Using payment reference: ${paymentReference}`);

      // Get customer data for customer_data field
      const customer = await this.customerRepository.findById(
        transaction.customerId,
      );
      const customerPhone = customer?.phone || '+573000000000';
      const customerName = customer?.name || 'Usuario de Prueba';

      // Call Wompi to process payment
      const wompiResponse = await this.paymentService.createTransaction({
        amount_in_cents: transaction.totalAmount * 100, // Convert to cents
        currency: 'COP',
        customer_email: paymentData.customerEmail,
        payment_method: {
          type: 'CARD',
          token: paymentData.cardToken,
          installments: 1,
        },
        reference: paymentReference,
        acceptance_token: paymentData.acceptanceToken,
        customer_data: {
          phone_number: customerPhone,
          full_name: customerName,
        },
        ip: paymentData.ip || '0.0.0.0',
      });

      this.logger.log(
        `Wompi response: id=${wompiResponse.id}, status=${wompiResponse.status}`,
      );

      // Update transaction with Wompi response
      transaction.updateStatus(wompiResponse.status, wompiResponse.id);
      transaction.paymentMethod = wompiResponse.payment_method_type;
      transaction.wompiReference = paymentReference;

      const updatedTransaction = await this.transactionRepository.update(
        transactionId,
        transaction,
      );

      if (!updatedTransaction) {
        return Result.fail<TransactionResponseDto, PaymentError>(
          new PaymentError('Failed to update transaction'),
        );
      }

      // If payment was approved, reduce product stock
      if (wompiResponse.status === 'APPROVED') {
        const newStock = product.stock - transaction.quantity;
        await this.productRepository.update(product.id, { stock: newStock });
        this.logger.log(`Stock updated. New stock: ${newStock}`);
      }

      // Prepare response
      const responseDto: TransactionResponseDto = {
        id: updatedTransaction.id,
        transactionNumber: updatedTransaction.transactionNumber,
        status: updatedTransaction.status,
        totalAmount: updatedTransaction.totalAmount,
        breakdown: {
          productAmount: updatedTransaction.productAmount,
          baseFee: updatedTransaction.baseFee,
          deliveryFee: updatedTransaction.deliveryFee,
        },
        createdAt: updatedTransaction.createdAt,
      };

      return Result.ok(responseDto);
    } catch (error) {
      this.logger.error(
        `Payment processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return Result.fail<TransactionResponseDto, PaymentError>(
        new PaymentError(
          error instanceof Error ? error.message : 'Payment processing failed',
          error instanceof Error ? error : undefined,
        ),
      );
    }
  }
}
