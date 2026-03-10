import { Injectable, Inject } from '@nestjs/common';
import * as crypto from 'crypto';
import { Result } from '../../../common/result/result';
import type { TransactionRepositoryInterface } from '../../../domain/repositories/transaction.repository.interface';
import type { ProductRepositoryInterface } from '../../../domain/repositories/product.repository.interface';
import type { CustomerRepositoryInterface } from '../../../domain/repositories/customer.repository.interface';
import type { DeliveryRepositoryInterface } from '../../../domain/repositories/delivery.repository.interface';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { Delivery } from '../../../domain/entities/delivery.entity';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';
import { TransactionResponseDto } from '../../dto/transaction-response.dto';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject('TransactionRepositoryInterface')
    private readonly transactionRepository: TransactionRepositoryInterface,
    @Inject('ProductRepositoryInterface')
    private readonly productRepository: ProductRepositoryInterface,
    @Inject('CustomerRepositoryInterface')
    private readonly customerRepository: CustomerRepositoryInterface,
    @Inject('DeliveryRepositoryInterface')
    private readonly deliveryRepository: DeliveryRepositoryInterface,
  ) {}

  async execute(
    dto: CreateTransactionDto,
  ): Promise<Result<TransactionResponseDto, Error>> {
    try {
      // Validate product exists and has sufficient stock
      const product = await this.productRepository.findById(dto.productId);
      if (!product) {
        return Result.fail<TransactionResponseDto, Error>(
          new Error('Product not found'),
        );
      }

      if (product.stock < dto.quantity) {
        return Result.fail<TransactionResponseDto, Error>(
          new Error(
            `Insufficient stock. Available: ${product.stock}, Requested: ${dto.quantity}`,
          ),
        );
      }

      // Validate customer exists
      const customer = await this.customerRepository.findById(dto.customerId);
      if (!customer) {
        return Result.fail<TransactionResponseDto, Error>(
          new Error('Customer not found'),
        );
      }

      // Calculate amounts
      const productAmount = product.price * dto.quantity;
      const baseFee = 2000; // Fixed fee per transaction
      const deliveryFee = 5000 * dto.quantity; // Fee per unit
      const totalAmount = productAmount + baseFee + deliveryFee;

      // Generate unique transaction number with UUID to avoid collisions
      const uuid = crypto.randomUUID();
      const transactionNumber = `TXN-${Date.now()}-${uuid.substring(0, 8)}`;

      // Create the transaction
      const transaction = new Transaction({
        transactionNumber,
        customerId: dto.customerId,
        productId: dto.productId,
        quantity: dto.quantity,
        productAmount,
        baseFee,
        deliveryFee,
        totalAmount,
        status: 'PENDING',
      });

      // Save the transaction
      const savedTransaction =
        await this.transactionRepository.save(transaction);

      // Create the delivery record
      const delivery = new Delivery({
        transactionId: savedTransaction.id,
        address: dto.deliveryInfo.address,
        city: dto.deliveryInfo.city,
        department: dto.deliveryInfo.department,
        postalCode: dto.deliveryInfo.postalCode,
        deliveryStatus: 'PENDING',
      });

      await this.deliveryRepository.save(delivery);

      // Prepare response
      const responseDto: TransactionResponseDto = {
        id: savedTransaction.id,
        transactionNumber: savedTransaction.transactionNumber,
        status: savedTransaction.status,
        totalAmount: savedTransaction.totalAmount,
        breakdown: {
          productAmount: savedTransaction.productAmount,
          baseFee: savedTransaction.baseFee,
          deliveryFee: savedTransaction.deliveryFee,
        },
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
        },
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
        },
        delivery: {
          id: delivery.id,
          address: delivery.address,
          city: delivery.city,
          deliveryStatus: delivery.deliveryStatus,
        },
        createdAt: savedTransaction.createdAt,
      };

      return Result.ok(responseDto);
    } catch (error) {
      return Result.fail<TransactionResponseDto, Error>(
        error instanceof Error
          ? error
          : new Error('Failed to create transaction'),
      );
    }
  }
}
