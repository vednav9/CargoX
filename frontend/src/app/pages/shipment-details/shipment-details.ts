import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ShipmentService } from '../../services/shipment.service';
import { Shipment } from '../../models/shipment.model';
import { UserData } from '../../models/user.model';
import { LiveTracking } from '../../components/live-tracking/live-tracking';

@Component({
  selector: 'app-shipment-details',
  standalone: true,
  imports: [CommonModule, RouterModule, LiveTracking],
  templateUrl: './shipment-details.html' // Fixed: Correct template path
})
export class ShipmentDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private shipmentService = inject(ShipmentService);

  shipment: Shipment | null = null;
  loading = true;
  error: string | null = null;
  currentUser: UserData | null = null;

  statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: '📋' },
    { key: 'assigned', label: 'Driver Assigned', icon: '👤' },
    { key: 'picked', label: 'Package Picked', icon: '📦' },
    { key: 'in-transit', label: 'In Transit', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '✅' }
  ];

  ngOnInit() {
    this.currentUser = this.auth.getCurrentUserData();
    this.route.paramMap.subscribe(params => {
      const shipmentId = params.get('id');
      if (shipmentId) {
        this.loadShipmentDetails(shipmentId);
      }
    });
  } // Fixed: Added missing closing brace

  async loadShipmentDetails(shipmentId: string) {
    this.loading = true;
    this.error = null;

    try {
      this.shipment = await this.shipmentService.getShipmentById(shipmentId);
      if (!this.shipment) {
        this.error = 'Shipment not found';
      }
    } catch (e: any) {
      this.error = e.message;
    } finally {
      this.loading = false;
    }
  } // Fixed: Added missing closing brace

  async updateStatus(newStatus: Shipment['status']) {
    if (!this.shipment || !this.currentUser) return;

    try {
      await this.shipmentService.updateShipmentStatus(this.shipment.id, newStatus);
      this.shipment.status = newStatus;
    } catch (e: any) {
      this.error = e.message;
    }
  } // Fixed: Added missing closing brace

  getStepStatus(stepKey: string): 'completed' | 'current' | 'pending' {
    if (!this.shipment) return 'pending';
    
    const currentIndex = this.statusSteps.findIndex(step => step.key === this.shipment!.status);
    const stepIndex = this.statusSteps.findIndex(step => step.key === stepKey);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  } // Fixed: Added missing closing brace

  canUpdateStatus(): boolean {
    return this.currentUser?.role === 'driver' && this.shipment?.driverId === this.currentUser.uid;
  } // Fixed: Added missing closing brace

  formatDate(timestamp: any): string {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
