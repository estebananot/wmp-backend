export type DeliveryStatus =
  | 'PENDING'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

export interface DeliveryProps {
  id?: string;
  transactionId: string;
  address: string;
  city: string;
  department?: string;
  postalCode?: string;
  deliveryStatus: DeliveryStatus;
  deliveryNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Delivery {
  readonly id: string;
  readonly transactionId: string;
  readonly address: string;
  readonly city: string;
  readonly department: string | null;
  readonly postalCode: string | null;
  deliveryStatus: DeliveryStatus;
  deliveryNotes: string | null;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(props: DeliveryProps) {
    this.id = props.id || '';
    this.transactionId = props.transactionId;
    this.address = props.address;
    this.city = props.city;
    this.department = props.department || null;
    this.postalCode = props.postalCode || null;
    this.deliveryStatus = props.deliveryStatus;
    this.deliveryNotes = props.deliveryNotes || null;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  updateStatus(status: DeliveryStatus): void {
    this.deliveryStatus = status;
    this.updatedAt = new Date();
  }
}
