import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([newNotification, ...current].slice(0, 50)); // Keep last 50
  }

  markAsRead(id: string) {
    const notifications = this.notificationsSubject.value.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(notifications);
  }

  // Simulate real-time notifications
  simulateDriverNotifications() {
    setInterval(() => {
      const messages = [
        { type: 'info' as const, title: 'New Shipment Available', message: 'Electronics delivery in Mumbai - ₹450' },
        { type: 'success' as const, title: 'Payment Received', message: 'You received ₹320 for completed delivery' },
        { type: 'warning' as const, title: 'Pickup Reminder', message: 'Pickup scheduled in 30 minutes' }
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      this.addNotification(randomMessage);
    }, 60000); // Every minute for demo
  }
}
