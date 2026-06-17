import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'wallet' | 'cod';
  details: string;
  isDefault: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private paymentMethodsSubject = new BehaviorSubject<PaymentMethod[]>([
    { id: '1', type: 'upi', details: 'vedant@paytm', isDefault: true },
    { id: '2', type: 'card', details: '****1234', isDefault: false }
  ]);
  
  paymentMethods$ = this.paymentMethodsSubject.asObservable();

  async processPayment(amount: number, method: PaymentMethod) {
    // Simulate payment processing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: 'TXN' + Date.now(),
          amount,
          method: method.type
        });
      }, 2000);
    });
  }
}
