export interface WompiTransactionRequest {
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
  signature?: string;
  integrity_signature?: string;
  timestamp?: number;
  ip?: string;
}

export interface WompiTransactionResponse {
  data: {
    id: string;
    created_at: string;
    amount_in_cents: number;
    reference: string;
    currency: string;
    payment_method_type: string;
    payment_method: {
      type: string;
      extra: {
        brand: string;
        last_four: string;
      };
    };
    status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';
    status_message: string | null;
    customer_email: string;
  };
}

export interface WompiPaymentSourceResponse {
  data: {
    id: string;
    type: string;
    status: string;
  };
}

export interface WompiErrorResponse {
  error: {
    type: string;
    reason?: string;
    messages?: {
      [key: string]: string | string[] | undefined;
    };
  };
}

export interface WompiTokenizeRequest {
  number: string;
  cvc: string;
  exp_month: string;
  exp_year: string;
  card_holder: string;
}

export interface WompiTokenizeResponse {
  data: {
    id: string;
    created_at: string;
    brand: string;
    name: string;
    last_four: string;
    exp_month: string;
    exp_year: string;
  };
}
