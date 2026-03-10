export interface CustomerProps {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Customer {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: CustomerProps) {
    this.id = props.id || '';
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone || null;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}

export const DEFAULT_CUSTOMER = {
  name: 'Usuario de Prueba',
  phone: '+573000000000',
};
