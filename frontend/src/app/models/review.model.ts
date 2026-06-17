import { Timestamp } from '@angular/fire/firestore';

export interface Review {
  id: string;
  shipmentId: string;
  fromId: string;
  toId: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
}
