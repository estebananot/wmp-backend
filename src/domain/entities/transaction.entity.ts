export type TransactionStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

export interface TransactionProps {
  id?: string;
  transactionNumber: string;
  customerId: string;
  productId: string;
  quantity: number;
  productAmount: number;
  baseFee: number;
  deliveryFee: number;
  totalAmount: number;
  status: TransactionStatus;
  wompiTransactionId?: string;
  wompiReference?: string;
  paymentMethod?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Transaction {
  readonly id: string;
  readonly transactionNumber: string;
  readonly customerId: string;
  readonly productId: string;
  readonly quantity: number;
  readonly productAmount: number;
  readonly baseFee: number;
  readonly deliveryFee: number;
  readonly totalAmount: number;
  status: TransactionStatus;
  wompiTransactionId: string | null;
  wompiReference: string | null;
  paymentMethod: string | null;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(props: TransactionProps) {
    this.id = props.id || '';
    this.transactionNumber = props.transactionNumber;
    this.customerId = props.customerId;
    this.productId = props.productId;
    this.quantity = props.quantity;
    this.productAmount = props.productAmount;
    this.baseFee = props.baseFee;
    this.deliveryFee = props.deliveryFee;
    this.totalAmount = props.totalAmount;
    this.status = props.status;
    this.wompiTransactionId = props.wompiTransactionId || null;
    this.wompiReference = props.wompiReference || null;
    this.paymentMethod = props.paymentMethod || null;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  canBeProcessed(): boolean {
    return this.status === 'PENDING';
  }

  updateStatus(status: TransactionStatus, wompiTransactionId?: string): void {
    this.status = status;
    if (wompiTransactionId) {
      this.wompiTransactionId = wompiTransactionId;
    }
    this.updatedAt = new Date();
  }
}
