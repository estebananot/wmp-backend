import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateTransactionUseCase } from '../../application/use-cases/transactions/create-transaction.usecase';
import { GetTransactionUseCase } from '../../application/use-cases/transactions/get-transaction.usecase';
import { GetAllTransactionsUseCase } from '../../application/use-cases/transactions/get-all-transactions.usecase';
import { ProcessPaymentUseCase } from '../../application/use-cases/transactions/process-payment.usecase';
import { CreateTransactionDto } from '../../application/dto/create-transaction.dto';
import { PaymentDataDto } from '../../application/dto/payment-data.dto';
import { TransactionResponseDto } from '../../application/dto/transaction-response.dto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly getTransactionUseCase: GetTransactionUseCase,
    private readonly getAllTransactionsUseCase: GetAllTransactionsUseCase,
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiResponse({
    status: 200,
    description: 'List of transactions',
    type: [TransactionResponseDto],
  })
  async getAllTransactions(): Promise<{ data: TransactionResponseDto[] }> {
    const result = await this.getAllTransactionsUseCase.execute();

    if (result.isFailure) {
      throw new HttpException(
        result.error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { data: result.value };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new transaction (PENDING state)' })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or insufficient stock',
  })
  @ApiResponse({ status: 404, description: 'Product or customer not found' })
  async createTransaction(
    @Body() dto: CreateTransactionDto,
  ): Promise<{ data: TransactionResponseDto }> {
    const result = await this.createTransactionUseCase.execute(dto);

    if (result.isFailure) {
      const message = result.error.message;
      if (message.includes('not found')) {
        throw new HttpException(message, HttpStatus.NOT_FOUND);
      }
      if (message.includes('Insufficient stock')) {
        throw new HttpException(message, HttpStatus.CONFLICT);
      }
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }

    return { data: result.value };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Transaction UUID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction details',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransaction(
    @Param('id') id: string,
  ): Promise<{ data: TransactionResponseDto }> {
    const result = await this.getTransactionUseCase.execute(id);

    if (result.isFailure) {
      if (result.error.message === 'Transaction not found') {
        throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        result.error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { data: result.value };
  }

  @Post(':id/payment')
  @ApiOperation({ summary: 'Process payment for a transaction' })
  @ApiParam({ name: 'id', type: 'string', description: 'Transaction UUID' })
  @ApiResponse({
    status: 200,
    description: 'Payment processed (check status field for result)',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid payment data' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({
    status: 409,
    description: 'Transaction already processed or insufficient stock',
  })
  async processPayment(
    @Param('id') id: string,
    @Body() paymentData: PaymentDataDto,
  ): Promise<{ data: TransactionResponseDto }> {
    const result = await this.processPaymentUseCase.execute(id, paymentData);

    if (result.isFailure) {
      const message = result.error.message;
      if (message.includes('not found')) {
        throw new HttpException(message, HttpStatus.NOT_FOUND);
      }
      if (
        message.includes('cannot be processed') ||
        message.includes('Insufficient stock')
      ) {
        throw new HttpException(message, HttpStatus.CONFLICT);
      }
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }

    return { data: result.value };
  }
}
