import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapsService, LocationCoordinates } from '../../services/maps.service';
import { Shipment } from '../../models/shipment.model';

declare global {
  interface Window {
    google: any;
  }
}

@Component({
  selector: 'app-live-tracking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-tracking.html'
})
export class LiveTracking implements OnInit, OnDestroy {
  @Input() shipment: Shipment | null = null;
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  private mapsService = inject(MapsService);
  private map: any = null;
  private directionsRenderer: any = null;
  private pickupMarker: any = null;
  private dropoffMarker: any = null;
  private driverMarker: any = null;
  private trackingInterval: any;

  // Component state
  loading = true;
  error: string | null = null;
  routeInfo: any = null;
  driverLocation: LocationCoordinates = { lat: 19.0760, lng: 72.8777 };

  // Mock driver movement
  private routeProgress = 0;

  ngOnInit() {
    this.initializeMap();
  }

  ngOnDestroy() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
    }
  }

  async initializeMap() {
    if (!this.shipment) {
      this.error = 'No shipment data provided';
      this.loading = false;
      return;
    }

    try {
      // Wait a bit for the view to render
      setTimeout(async () => {
        await this.loadMapAndRoute();
      }, 100);
    } catch (error) {
      console.error('Error initializing map:', error);
      this.error = 'Failed to load map';
      this.loading = false;
    }
  }

  private async loadMapAndRoute() {
    try {
      // Get route information
      this.routeInfo = await this.mapsService.getRouteInfo(
        this.shipment!.pickup.address,
        this.shipment!.dropoff.address
      );

      // Initialize map if Google Maps is available
      if (this.isGoogleMapsAvailable() && this.mapContainer) {
        this.initializeGoogleMap();
      } else {
        // Show mock map
        this.showMockMap();
      }

      // Start tracking simulation
      this.startDriverTracking();

      this.loading = false;
    } catch (error) {
      console.error('Error loading route:', error);
      this.showMockMap();
      this.loading = false;
    }
  }

  isGoogleMapsAvailable(): boolean {
    return typeof window !== 'undefined' && window.google && window.google.maps;
  }

  private initializeGoogleMap() {
    const mapOptions = {
      zoom: 13,
      center: { lat: 19.0760, lng: 72.8777 },
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    };

    this.map = new window.google.maps.Map(this.mapContainer.nativeElement, mapOptions);
    this.directionsRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#4F46E5',
        strokeWeight: 6,
        strokeOpacity: 0.8
      }
    });
    this.directionsRenderer.setMap(this.map);

    this.addCustomMarkers();
    this.displayRoute();
  }

  private async addCustomMarkers() {
    if (!this.map || !this.shipment) return;

    try {
      // Pickup marker
      const pickupCoords = await this.mapsService.geocodeAddress(this.shipment.pickup.address);
      this.pickupMarker = new window.google.maps.Marker({
        position: pickupCoords,
        map: this.map,
        title: 'Pickup Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#FFFFFF'
        }
      });

      // Dropoff marker
      const dropoffCoords = await this.mapsService.geocodeAddress(this.shipment.dropoff.address);
      this.dropoffMarker = new window.google.maps.Marker({
        position: dropoffCoords,
        map: this.map,
        title: 'Delivery Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#10B981',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#FFFFFF'
        }
      });

      // Driver marker (moving)
      this.driverMarker = new window.google.maps.Marker({
        position: pickupCoords,
        map: this.map,
        title: 'Driver Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#F59E0B',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#FFFFFF'
        }
      });

      // Fit map to show all markers
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(pickupCoords);
      bounds.extend(dropoffCoords);
      this.map.fitBounds(bounds);

    } catch (error) {
      console.error('Error adding markers:', error);
    }
  }

  private displayRoute() {
    if (!this.directionsRenderer || !this.shipment) return;

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route({
      origin: this.shipment.pickup.address,
      destination: this.shipment.dropoff.address,
      travelMode: window.google.maps.TravelMode.DRIVING
    }, (result: any, status: any) => {
      if (status === 'OK' && result) {
        this.directionsRenderer.setDirections(result);
      }
    });
  }

  private showMockMap() {
    // If Google Maps isn't available, we show a mock representation
    this.routeInfo = {
      distance: '25.3 km',
      duration: '42 mins',
      distanceInKm: 25.3,
      durationInMinutes: 42
    };
  }

  private startDriverTracking() {
    if (this.shipment?.status !== 'in-transit') return;

    // Simulate driver movement every 10 seconds
    this.trackingInterval = setInterval(() => {
      this.updateDriverPosition();
    }, 10000);
  }

  private updateDriverPosition() {
    this.routeProgress += 0.1; // 10% progress each update

    if (this.routeProgress >= 1) {
      this.routeProgress = 1;
      clearInterval(this.trackingInterval);
    }

    // Update driver marker position if available
    if (this.driverMarker && this.routeInfo?.polyline && this.routeInfo.polyline.length > 0) {
      const pointIndex = Math.floor(this.routeProgress * (this.routeInfo.polyline.length - 1));
      const newPosition = this.routeInfo.polyline[pointIndex];
      this.driverMarker.setPosition(newPosition);
    }

    // Update ETA
    if (this.routeInfo) {
      const remainingTime = Math.round(this.routeInfo.durationInMinutes * (1 - this.routeProgress));
      this.routeInfo.currentETA = remainingTime;
    }
  }

  getProgressPercentage(): number {
    return Math.round(this.routeProgress * 100);
  }

  getEstimatedTimeRemaining(): string {
    if (!this.routeInfo?.currentETA) {
      return this.routeInfo?.duration || 'Calculating...';
    }

    if (this.routeInfo.currentETA <= 0) {
      return 'Arriving now';
    }

    return `${this.routeInfo.currentETA} mins remaining`;
  }

  formatPickupTime(time: any): string {
    if (!time) return '';

    try {
      // Handle Firebase Timestamp
      if (time.toDate && typeof time.toDate === 'function') {
        return time.toDate().toLocaleString();
      }

      // Handle regular Date objects or timestamps
      if (time instanceof Date) {
        return time.toLocaleString();
      }

      // Handle string or number timestamps
      if (typeof time === 'string' || typeof time === 'number') {
        return new Date(time).toLocaleString();
      }

      return '';
    } catch (error) {
      console.error('Error formatting pickup time:', error);
      return '';
    }
  }

}
