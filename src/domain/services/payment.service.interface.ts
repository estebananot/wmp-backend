export interface CardData {
  number: string;
  cvc: string;
  exp_month: string;
  exp_year: string;
  card_holder: string;
}

export interface PaymentSource {
  id: string;
  type: string;
  status: string;
}

export interface WompiTransactionData {
  amount_in_cents: number;
  currency: string;
  customer_email: string;
  payment_method: {
    type: string;
    token: string;
    installments: number;
  };
  reference: string;
  acceptance_token?: string;
  customer_data?: {
    phone_number: string;
    full_name: string;
  };
  ip?: string;
}

export interface WompiTransaction {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';
  reference: string;
  amount_in_cents: number;
  currency: string;
  payment_method_type: string;
  created_at: string;
}

export interface PaymentServiceInterface {
  createPaymentSource(cardData: CardData): Promise<PaymentSource>;
  createTransaction(
    transactionData: WompiTransactionData,
  ): Promise<WompiTransaction>;
  getTransaction(transactionId: string): Promise<WompiTransaction>;
  verifySignature(data: any, signature: string): boolean;
}
