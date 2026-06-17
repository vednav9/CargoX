import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ShipmentService } from '../../services/shipment.service';
import { Shipment } from '../../models/shipment.model';
import { UserData } from '../../models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-driver',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './driver.html'
})
export class Driver implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private shipmentService = inject(ShipmentService);
  private router = inject(Router);

  currentUser: UserData | null = null;
  availableJobs: Shipment[] = [];
  myJobs: Shipment[] = [];
  loading = true;
  error: string | null = null;
  
  private subscription = new Subscription();

  ngOnInit() {
    console.log('Driver component initialized');
    
    // Wait a bit for auth service to initialize
    setTimeout(() => {
      this.initializeComponent();
    }, 500);
  }

  private initializeComponent() {
    this.currentUser = this.auth.getCurrentUserData();
    console.log('Current user:', this.currentUser);
    
    if (!this.currentUser) {
      console.log('No user found, checking auth state...');
      // Subscribe to auth state changes
      this.subscription.add(
        this.auth.currentUserData$.subscribe(userData => {
          console.log('Auth state changed:', userData);
          if (userData) {
            this.currentUser = userData;
            this.loadData();
          } else {
            this.router.navigate(['/login']);
          }
        })
      );
    } else {
      this.loadData();
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async loadData() {
    console.log('Loading driver data...');
    
    if (!this.currentUser) {
      this.loading = false;
      this.error = 'User not found';
      return;
    }
    
    this.loading = true;
    this.error = null;

    try {
      // Start listening to real-time updates
      this.shipmentService.listenToAvailableShipments();
      
      // Subscribe to available shipments
      this.subscription.add(
        this.shipmentService.availableShipments$.subscribe(
          shipments => {
            console.log('Available shipments updated:', shipments);
            this.availableJobs = shipments;
          }
        )
      );

      // Load available jobs and my current jobs
      await Promise.all([
        this.shipmentService.getAvailableShipments(),
        this.loadMyJobs()
      ]);
      
      console.log('Driver data loaded successfully');
    } catch (e: any) {
      console.error('Error loading driver data:', e);
      this.error = e.message;
    } finally {
      this.loading = false;
    }
  }

  async loadMyJobs() {
    if (!this.currentUser) return;
    try {
      this.myJobs = await this.shipmentService.getShipments(this.currentUser.uid, 'driver');
      console.log('My jobs loaded:', this.myJobs);
    } catch (e: any) {
      console.error('Error loading my jobs:', e);
    }
  }

  async acceptJob(shipmentId: string) {
    if (!this.currentUser) return;

    try {
      console.log('Accepting job:', shipmentId);
      await this.shipmentService.assignDriver(shipmentId, this.currentUser.uid);
      // Refresh data
      await this.loadData();
    } catch (e: any) {
      console.error('Error accepting job:', e);
      this.error = e.message;
    }
  }

  getJobsByStatus(status: string): Shipment[] {
    return this.myJobs.filter(job => job.status === status);
  }

  get totalEarned(): number {
    return this.myJobs
      .filter(job => job.status === 'delivered')
      .reduce((sum, job) => sum + job.payment.amount, 0);
  }

  get activeJobsCount(): number {
    return this.getJobsByStatus('assigned').length + 
           this.getJobsByStatus('picked').length + 
           this.getJobsByStatus('in-transit').length;
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  calculateDistance(pickup: any, dropoff: any): string {
    return `${Math.floor(Math.random() * 50 + 5)} km`;
  }
}
