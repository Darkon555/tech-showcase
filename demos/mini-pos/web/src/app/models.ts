export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

export interface CartLine {
  product: Product;
  qty: number;
}

export interface SaleItem {
  productId: number;
  name: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Receipt {
  id: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
}
