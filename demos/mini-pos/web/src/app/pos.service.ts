import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { Observable } from "rxjs";
import { API_URL } from "./app.config";
import type { Product, Receipt } from "./models";

@Injectable({ providedIn: "root" })
export class PosService {
  private http = inject(HttpClient);

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${API_URL}/api/products`);
  }

  checkout(items: { productId: number; qty: number }[]): Observable<Receipt> {
    return this.http.post<Receipt>(`${API_URL}/api/sales`, { items });
  }

  getSales(): Observable<Receipt[]> {
    return this.http.get<Receipt[]>(`${API_URL}/api/sales`);
  }
}
