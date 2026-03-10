export interface ProductProps {
  id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Product {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly stock: number;
  readonly imageUrl: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: ProductProps) {
    this.id = props.id || '';
    this.name = props.name;
    this.description = props.description;
    this.price = props.price;
    this.stock = props.stock;
    this.imageUrl = props.imageUrl;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  hasStock(quantity: number): boolean {
    return this.stock >= quantity;
  }

  reduceStock(quantity: number): Product {
    if (!this.hasStock(quantity)) {
      throw new Error('Insufficient stock');
    }
    return new Product({
      ...this,
      stock: this.stock - quantity,
      updatedAt: new Date(),
    });
  }
}
