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
import { CreateCustomerUseCase } from '../../application/use-cases/customers/create-customer.usecase';
import { GetCustomerUseCase } from '../../application/use-cases/customers/get-customer.usecase';
import { CreateCustomerDto } from '../../application/dto/create-customer.dto';
import { CustomerResponseDto } from '../../application/dto/customer-response.dto';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly getCustomerUseCase: GetCustomerUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createCustomer(
    @Body() dto: CreateCustomerDto,
  ): Promise<{ data: CustomerResponseDto }> {
    const result = await this.createCustomerUseCase.execute(dto);

    if (result.isFailure) {
      throw new HttpException(result.error.message, HttpStatus.BAD_REQUEST);
    }

    return { data: result.value };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Customer UUID' })
  @ApiResponse({
    status: 200,
    description: 'Customer details',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async getCustomer(
    @Param('id') id: string,
  ): Promise<{ data: CustomerResponseDto }> {
    const result = await this.getCustomerUseCase.execute(id);

    if (result.isFailure) {
      if (result.error.message === 'Customer not found') {
        throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        result.error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { data: result.value };
  }
}
