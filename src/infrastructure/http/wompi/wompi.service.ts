import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosError } from 'axios';
import * as crypto from 'crypto';
import {
  PaymentServiceInterface,
  CardData,
  PaymentSource,
  WompiTransactionData,
  WompiTransaction,
} from '../../../domain/services/payment.service.interface';
import { getWompiConfig } from './wompi.config';
import {
  WompiTransactionRequest,
  WompiTransactionResponse,
  WompiPaymentSourceResponse,
  WompiErrorResponse,
} from './wompi.types';

@Injectable()
export class WompiService implements PaymentServiceInterface {
  private readonly logger = new Logger(WompiService.name);
  private readonly httpClient: AxiosInstance;
  private readonly config = getWompiConfig();

  constructor() {
    this.logger.log(`Wompi API URL: ${this.config.apiUrl}`);
    this.logger.log(`Wompi Public Key: ${this.config.publicKey.substring(0, 20)}...`);
    this.logger.log(`Wompi Private Key: ${this.config.privateKey.substring(0, 20)}...`);
    
    this.httpClient = axios.create({
      baseURL: this.config.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.privateKey}`,
      },
    });
  }

  private generateIntegritySignature(
    reference: string,
    amountInCents: number,
    currency: string,
  ): string {
    const signaturePayload = `${reference}${amountInCents}${currency}${this.config.integrityKey}`;
    this.logger.debug(`Integrity signature payload: ${signaturePayload}`);
    return crypto.createHash('sha256').update(signaturePayload).digest('hex');
  }

  async createPaymentSource(cardData: CardData): Promise<PaymentSource> {
    try {
      const response = await this.httpClient.post<WompiPaymentSourceResponse>(
        '/payment_sources',
        {
          type: 'CARD',
          token: cardData,
        },
      );

      return {
        id: response.data.data.id,
        type: response.data.data.type,
        status: response.data.data.status,
      };
    } catch (error) {
      const axiosError = error as AxiosError<WompiErrorResponse>;
      this.logger.error('Error creating payment source:', axiosError.message);
      throw new Error(`Failed to create payment source: ${axiosError.message}`);
    }
  }

  async createTransaction(
    transactionData: WompiTransactionData,
  ): Promise<WompiTransaction> {
    try {
      const integritySignature = this.generateIntegritySignature(
        transactionData.reference,
        transactionData.amount_in_cents,
        transactionData.currency,
      );

      const payload: WompiTransactionRequest = {
        amount_in_cents: transactionData.amount_in_cents,
        currency: transactionData.currency,
        customer_email: transactionData.customer_email,
        payment_method: transactionData.payment_method,
        reference: transactionData.reference,
        acceptance_token: transactionData.acceptance_token,
        customer_data: transactionData.customer_data,
        signature: integritySignature,
        ip: transactionData.ip,
      };

      this.logger.log(
        `Creating Wompi transaction with reference: ${transactionData.reference}`,
      );

      const response = await this.httpClient.post<WompiTransactionResponse>(
        '/transactions',
        payload,
      );

      const { data } = response.data;
      this.logger.log(
        `Wompi transaction created: ${data.id}, status: ${data.status}`,
      );

      return {
        id: data.id,
        status: data.status,
        reference: data.reference,
        amount_in_cents: data.amount_in_cents,
        currency: data.currency,
        payment_method_type: data.payment_method.type,
        created_at: data.created_at,
      };
    } catch (error) {
      const axiosError = error as AxiosError<WompiErrorResponse>;

      this.logger.error('Wompi API Error:', {
        type: axiosError.response?.data?.error?.type,
        reason: axiosError.response?.data?.error?.reason,
        messages: axiosError.response?.data?.error?.messages,
        status: axiosError.response?.status,
      });

      if (axiosError.response?.data?.error) {
        const wompiError = axiosError.response.data.error;
        let errorMessage = wompiError.reason || '';
        if (wompiError.messages) {
          const allMessages = Object.entries(wompiError.messages)
            .map(
              ([field, msgs]) =>
                `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`,
            )
            .join('; ');
          errorMessage = allMessages || errorMessage || 'Unknown error';
        }
        this.logger.error(`Wompi validation error: ${errorMessage}`);
        throw new Error(`Wompi error [${wompiError.type}]: ${errorMessage}`);
      }

      if (axiosError.code === 'ECONNREFUSED') {
        throw new Error(
          'Cannot connect to Wompi API. Check network connection.',
        );
      }

      throw new Error(`Wompi transaction failed: ${axiosError.message}`);
    }
  }

  async getTransaction(transactionId: string): Promise<WompiTransaction> {
    try {
      const response = await this.httpClient.get<WompiTransactionResponse>(
        `/transactions/${transactionId}`,
      );

      const { data } = response.data;

      return {
        id: data.id,
        status: data.status,
        reference: data.reference,
        amount_in_cents: data.amount_in_cents,
        currency: data.currency,
        payment_method_type: data.payment_method.type,
        created_at: data.created_at,
      };
    } catch (error) {
      const axiosError = error as AxiosError<WompiErrorResponse>;
      throw new Error(`Failed to get transaction: ${axiosError.message}`);
    }
  }

  verifySignature(data: Record<string, unknown>, signature: string): boolean {
    const payload = JSON.stringify(data);
    const expectedSignature = crypto
      .createHmac('sha256', this.config.eventsKey)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }
}
