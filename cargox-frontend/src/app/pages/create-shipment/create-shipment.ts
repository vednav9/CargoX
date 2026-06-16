import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ShipmentService } from '../../services/shipment.service';
import { Shipment } from '../../models/shipment.model';

@Component({
  selector: 'app-create-shipment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-shipment.html'
})
export class CreateShipment implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private shipmentService = inject(ShipmentService);
  
  // Make router public so template can access it
  router = inject(Router);

  loading = false;
  error: string | null = null;
  estimatedFare = 0;
  currentUser = this.auth.getCurrentUserData();

  // ... rest of your existing code remains the same
  form = this.fb.group({
    pickup: this.fb.group({
      address: ['', [Validators.required]],
      date: ['', [Validators.required]],
      time: ['', [Validators.required]]
    }),
    dropoff: this.fb.group({
      address: ['', [Validators.required]]
    }),
    package: this.fb.group({
      type: ['', [Validators.required]],
      weight: [0, [Validators.required, Validators.min(0.1)]],
      dimensions: ['', [Validators.required]],
      description: [''],
      fragile: [false]
    }),
    vehicleType: ['', [Validators.required]],
    notes: ['']
  });

  vehicleTypes = [
    { value: 'bike', label: 'Bike/Scooter', icon: '🛵' },
    { value: 'tempo', label: 'Tempo/Mini Van', icon: '🚐' },
    { value: 'truck-small', label: 'Small Truck', icon: '🚚' },
    { value: 'truck-large', label: 'Large Truck', icon: '🚛' },
    { value: 'container', label: 'Container', icon: '📦' },
    { value: 'refrigerated', label: 'Refrigerated', icon: '❄️' }
  ];

  packageTypes = [
    'Documents',
    'Electronics',
    'Furniture',
    'Food Items',
    'Clothing',
    'Industrial Equipment',
    'Medical Supplies',
    'Other'
  ];

  ngOnInit() {
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Watch for changes to calculate fare
    this.form.valueChanges.subscribe(() => {
      this.calculateEstimatedFare();
    });
  }

  private calculateEstimatedFare() {
    const vehicleType = this.form.get('vehicleType')?.value;
    const weight = this.form.get('package.weight')?.value;
    
    if (vehicleType && weight) {
      // Simulated distance (in real app, use Google Maps Distance Matrix API)
      const estimatedDistance = 10; // km
      this.estimatedFare = this.shipmentService.calculateFare(estimatedDistance, vehicleType);
    }
  }

  async onSubmit() {
    if (this.form.invalid || !this.currentUser) {
      this.error = 'Please fill all required fields correctly.';
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const formValue = this.form.value;
      
      const shipmentData: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'> = {
        customerId: this.currentUser.uid,
        status: 'pending',
        pickup: {
          address: formValue.pickup?.address || '',
          coordinates: { lat: 0, lng: 0 }, // Will integrate Google Maps later
          time: new Date(`${formValue.pickup?.date} ${formValue.pickup?.time}`) as any
        },
        dropoff: {
          address: formValue.dropoff?.address || '',
          coordinates: { lat: 0, lng: 0 }
        },
        package: {
          type: formValue.package?.type || '',
          weight: Number(formValue.package?.weight) || 0,
          dimensions: formValue.package?.dimensions || '',
          description: formValue.package?.description || '',
          fragile: formValue.package?.fragile || false
        },
        payment: {
          amount: this.estimatedFare,
          currency: 'INR',
          status: 'pending'
        },
        notes: formValue.notes || ''
      };

      const shipmentId = await this.shipmentService.createShipment(shipmentData);
      
      // Redirect to shipment details or dashboard
      this.router.navigate(['/shipments', shipmentId]);
      
    } catch (e: any) {
      this.error = e?.message ?? 'Failed to create shipment';
    } finally {
      this.loading = false;
    }
  }
}
