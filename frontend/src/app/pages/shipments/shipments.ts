import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ShipmentService } from '../../services/shipment.service';
import { Shipment } from '../../models/shipment.model';
import { UserData } from '../../models/user.model';

@Component({
  selector: 'app-shipments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shipments.html'
})
export class Shipments implements OnInit {
  private auth = inject(AuthService);
  private shipmentService = inject(ShipmentService);

  shipments: Shipment[] = [];
  loading = true;
  error: string | null = null;
  currentUser: UserData | null = null;

  ngOnInit() {
    this.currentUser = this.auth.getCurrentUserData();
    if (!this.currentUser) {
      return;
    }
    this.loadShipments(); // Fixed: Added missing method call
  }

  async loadShipments() {
    if (!this.currentUser) return;
    
    this.loading = true;
    this.error = null;
    
    try {
      this.shipments = await this.shipmentService.getShipments(
        this.currentUser.uid,
        this.currentUser.role
      );
    } catch (e: any) {
      this.error = e.message;
    } finally {
      this.loading = false;
    }
  } // Fixed: Added missing closing brace

  getStatusColor(status: string): string {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'assigned': 'bg-blue-100 text-blue-800',
      'picked': 'bg-purple-100 text-purple-800',
      'in-transit': 'bg-indigo-100 text-indigo-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  } // Fixed: Added missing closing brace

  getStatusIcon(status: string): string {
    const icons = {
      'pending': '⏳',
      'assigned': '👤',
      'picked': '📦',
      'in-transit': '🚚',
      'delivered': '✅',
      'cancelled': '❌'
    };
    return icons[status as keyof typeof icons] || '📋';
  } // Fixed: Added missing closing brace

  formatDate(timestamp: any): string {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
