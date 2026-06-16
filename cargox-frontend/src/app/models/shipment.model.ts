import { Timestamp } from '@angular/fire/firestore';

export interface Location {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  time?: Timestamp;
}

export interface PackageDetails {
  type: string;
  weight: number;
  dimensions: string;
  description?: string;
  fragile?: boolean;
}

export interface PaymentInfo {
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripePaymentId?: string;
  transactionId?: string;
}

export interface Shipment {
  id: string;
  customerId: string;
  driverId?: string;
  status: 'pending' | 'assigned' | 'picked' | 'in-transit' | 'delivered' | 'cancelled';
  pickup: {
    address: string;
    coordinates: { lat: number; lng: number };
    time?: Timestamp | Date | string; // Make this optional
  };
  dropoff: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  package: {
    type: string;
    weight: number;
    dimensions: string;
    description?: string;
    fragile: boolean;
  };
  payment: {
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed';
  };
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
