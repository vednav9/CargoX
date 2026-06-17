import { Injectable } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';

export interface RouteInfo {
  distance: string;
  duration: string;
  distanceInKm: number;
  durationInMinutes: number;
  polyline?: any[];
  bounds?: any;
}

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

declare global {
  interface Window {
    google: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class MapsService {
  private geocoder: any = null;
  private directionsService: any = null;

  constructor() {
    // Initialize Google Maps services when available
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      this.initializeServices();
    }
  }

  private initializeServices() {
    this.geocoder = new window.google.maps.Geocoder();
    this.directionsService = new window.google.maps.DirectionsService();
  }

  // Convert address to coordinates
  async geocodeAddress(address: string): Promise<LocationCoordinates> {
    return new Promise((resolve) => {
      if (!this.geocoder) {
        // Fallback to mock coordinates for Mumbai area
        resolve({
          lat: 19.0760 + (Math.random() - 0.5) * 0.1,
          lng: 72.8777 + (Math.random() - 0.5) * 0.1
        });
        return;
      }

      this.geocoder.geocode({ address }, (results: any, status: any) => {
        if (status === 'OK' && results && results[0]) {
          const location = results.geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          // Fallback to mock coordinates
          resolve({
            lat: 19.0760 + (Math.random() - 0.5) * 0.1,
            lng: 72.8777 + (Math.random() - 0.5) * 0.1
          });
        }
      });
    });
  }

  // Get route information between two points
  async getRouteInfo(pickupAddress: string, dropoffAddress: string): Promise<RouteInfo> {
    return new Promise(async (resolve) => {
      try {
        if (!this.directionsService) {
          // Mock data for demonstration
          resolve({
            distance: '25.3 km',
            duration: '42 mins',
            distanceInKm: 25.3,
            durationInMinutes: 42,
            polyline: [],
            bounds: null
          });
          return;
        }

        const request = {
          origin: pickupAddress,
          destination: dropoffAddress,
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false
        };

        this.directionsService.route(request, (result: any, status: any) => {
          if (status === 'OK' && result) {
            const route = result.routes[0];
            const leg = route.legs;
            
            resolve({
              distance: leg.distance?.text || 'Unknown',
              duration: leg.duration?.text || 'Unknown',
              distanceInKm: (leg.distance?.value || 0) / 1000,
              durationInMinutes: Math.round((leg.duration?.value || 0) / 60),
              polyline: route.overview_path,
              bounds: route.bounds
            });
          } else {
            // Fallback to mock data
            resolve({
              distance: '25.3 km',
              duration: '42 mins',
              distanceInKm: 25.3,
              durationInMinutes: 42,
              polyline: [],
              bounds: null
            });
          }
        });
      } catch (error) {
        // Fallback to mock data
        resolve({
          distance: '25.3 km',
          duration: '42 mins',
          distanceInKm: 25.3,
          durationInMinutes: 42,
          polyline: [],
          bounds: null
        });
      }
    });
  }

  // Calculate dynamic fare based on distance
  calculateDynamicFare(distanceInKm: number, vehicleType: string, timeOfDay: 'peak' | 'normal' = 'normal'): number {
    const baseRates = {
      'bike': 8,
      'tempo': 18,
      'truck-small': 28,
      'truck-large': 45,
      'container': 65,
      'refrigerated': 55
    };

    const baseRate = baseRates[vehicleType as keyof typeof baseRates] || 25;
    let fare = distanceInKm * baseRate;

    // Peak hour multiplier
    if (timeOfDay === 'peak') {
      fare *= 1.3;
    }

    // Minimum fare
    const minimumFare = 150;
    return Math.max(Math.round(fare), minimumFare);
  }
}
