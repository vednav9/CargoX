import { Timestamp } from '@angular/fire/firestore';

export interface TrackingUpdate {
  status: string;
  location: {
    lat: number;
    lng: number;
  };
  timestamp: Timestamp;
  note: string;
}

export interface TrackingData {
  shipmentId: string;
  driverId: string;
  currentLocation: {
    lat: number;
    lng: number;
  };
  status: string;
  timestamp: Timestamp;
  updates: TrackingUpdate[];
}
