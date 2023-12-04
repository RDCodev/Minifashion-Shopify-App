export interface CustomerProduct {
  product_id: number;
  title: string;
  vendor: string;
  type: string;
  tags: string[];
}

export interface Customer {
  name: string;
  customer_id: any;
  email: string;
  marketing_state: boolean | number;
  products?: CustomerProduct[];
}

export interface CustomerList {
  customers: Customer[];
}