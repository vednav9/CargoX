import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  Timestamp,
  getDoc,
  onSnapshot,
  collectionData
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { Shipment } from '../models/shipment.model';

@Injectable({
  providedIn: 'root'
})
export class ShipmentService {
  private firestore = inject(Firestore);

  private shipmentsSubject = new BehaviorSubject<Shipment[]>([]);
  private availableShipmentsSubject = new BehaviorSubject<Shipment[]>([]);

  shipments$ = this.shipmentsSubject.asObservable();
  availableShipments$ = this.availableShipmentsSubject.asObservable();

  async createShipment(shipmentData: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(this.firestore, 'shipments'), {
        ...shipmentData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating shipment:', error);
      throw new Error('Failed to create shipment');
    }
  }

  async getShipments(userId: string, userRole: string): Promise<Shipment[]> {
    console.log('Getting shipments for user:', userId, 'role:', userRole);

    try {
      // For now, get all shipments and filter in memory to avoid index issues
      const querySnapshot = await getDocs(collection(this.firestore, 'shipments'));
      let shipments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Shipment[];

      // Filter based on user role
      if (userRole === 'driver') {
        shipments = shipments.filter(s => s.driverId === userId);
      } else {
        shipments = shipments.filter(s => s.customerId === userId);
      }

      // Sort by creation date (newest first)
      shipments.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : (a.createdAt ? new Date(a.createdAt as any) : new Date(0));
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : (b.createdAt ? new Date(b.createdAt as any) : new Date(0));
        return dateB.getTime() - dateA.getTime();
      });

      this.shipmentsSubject.next(shipments);
      console.log('Loaded shipments:', shipments);
      return shipments;
    } catch (error) {
      console.error('Error fetching shipments:', error);
      throw new Error('Failed to fetch shipments');
    }
  }

  async getAvailableShipments(): Promise<Shipment[]> {
    console.log('Getting available shipments...');

    try {
      // Get all shipments and filter for pending ones
      const querySnapshot = await getDocs(collection(this.firestore, 'shipments'));
      let shipments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Shipment[];

      // Filter for available (pending) shipments
      shipments = shipments.filter(s => s.status === 'pending');

      // Sort by creation date (newest first)
      shipments.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : (a.createdAt ? new Date(a.createdAt as any) : new Date(0));
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : (b.createdAt ? new Date(b.createdAt as any) : new Date(0));
        return dateB.getTime() - dateA.getTime();
      });

      this.availableShipmentsSubject.next(shipments);
      console.log('Available shipments:', shipments);
      return shipments;
    } catch (error) {
      console.error('Error fetching available shipments:', error);
      throw new Error('Failed to fetch available shipments');
    }
  }

  // Simplified real-time listener
  listenToAvailableShipments(): void {
    try {
      const shipmentsRef = collection(this.firestore, 'shipments');

      onSnapshot(shipmentsRef, (querySnapshot) => {
        let shipments = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Shipment[];

        // Filter for pending shipments
        shipments = shipments.filter(s => s.status === 'pending');

        console.log('Real-time available shipments update:', shipments);
        this.availableShipmentsSubject.next(shipments);
      });
    } catch (error) {
      console.error('Error setting up real-time listener:', error);
      // Fallback to regular polling
      setInterval(() => {
        this.getAvailableShipments();
      }, 30000); // Refresh every 30 seconds
    }
  }

  async updateShipmentStatus(shipmentId: string, status: Shipment['status'], notes?: string): Promise<void> {
    try {
      const updateData: any = {
        status,
        updatedAt: Timestamp.now()
      };

      if (notes) {
        updateData.notes = notes;
      }

      await updateDoc(doc(this.firestore, 'shipments', shipmentId), updateData);
      console.log('Updated shipment status:', shipmentId, status);
    } catch (error) {
      console.error('Error updating shipment status:', error);
      throw new Error('Failed to update shipment status');
    }
  }

  async assignDriver(shipmentId: string, driverId: string): Promise<void> {
    try {
      await updateDoc(doc(this.firestore, 'shipments', shipmentId), {
        driverId,
        status: 'assigned',
        updatedAt: Timestamp.now()
      });
      console.log('Assigned driver to shipment:', shipmentId, driverId);
    } catch (error) {
      console.error('Error assigning driver:', error);
      throw new Error('Failed to assign driver');
    }
  }

  async getShipmentById(shipmentId: string): Promise<Shipment | null> {
    try {
      const docSnap = await getDoc(doc(this.firestore, 'shipments', shipmentId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Shipment;
      }
      return null;
    } catch (error) {
      console.error('Error fetching shipment:', error);
      throw new Error('Failed to fetch shipment');
    }
  }

  // Calculate fare estimation
  calculateFare(distance: number, vehicleType: string): number {
    const baseRates = {
      'bike': 5,
      'tempo': 15,
      'truck-small': 25,
      'truck-large': 40,
      'container': 60,
      'refrigerated': 50
    };

    const rate = baseRates[vehicleType as keyof typeof baseRates] || 20;
    return Math.round(distance * rate);
  }
}
