export interface CustomerProduct {
  product_id: number;
  title: string;
  vendor: string;
  type: string;
  tags: string[];
}

export interface Customer {
  name: string;
  products: CustomerProduct[];
}

export interface CustomerList {
  customers: Customer[];
}