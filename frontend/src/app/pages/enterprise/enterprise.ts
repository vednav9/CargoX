import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ShipmentService } from '../../services/shipment.service';
import { Shipment } from '../../models/shipment.model';
import { UserData } from '../../models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-enterprise',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './enterprise.html'
})
export class Enterprise implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private shipmentService = inject(ShipmentService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  currentUser: UserData | null = null;
  shipments: Shipment[] = [];
  loading = true;
  error: string | null = null;
  activeTab: 'overview' | 'shipments' | 'analytics' | 'bulk' = 'overview';
  
  private subscription = new Subscription();

  // Analytics data with default values
  analytics = {
    totalShipments: 0,
    pendingShipments: 0,
    inTransitShipments: 0,
    deliveredShipments: 0,
    totalSpent: 0,
    avgDeliveryTime: 2.5,
    monthlyTrend: [
      { month: 'Jan', shipments: 45, revenue: 125000 },
      { month: 'Feb', shipments: 62, revenue: 178000 },
      { month: 'Mar', shipments: 38, revenue: 95000 },
      { month: 'Apr', shipments: 71, revenue: 203000 },
      { month: 'May', shipments: 55, revenue: 156000 },
      { month: 'Jun', shipments: 89, revenue: 245000 }
    ]
  };

  bulkForm = this.fb.group({
    count: [1, [Validators.required, Validators.min(1), Validators.max(50)]],
    vehicleType: ['', Validators.required],
    packageType: ['', Validators.required],
    weight: [0, [Validators.required, Validators.min(0.1)]],
    notes: ['']
  });

  ngOnInit() {
    console.log('Enterprise component initialized');
    
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
            this.checkUserRoleAndLoad();
          } else {
            // Redirect to login if no user
            this.router.navigate(['/login']);
          }
        })
      );
    } else {
      this.checkUserRoleAndLoad();
    }
  }

  private checkUserRoleAndLoad() {
    console.log('Checking user role:', this.currentUser?.role);
    
    // Allow any logged-in user for now (remove role restriction temporarily)
    if (this.currentUser) {
      this.loadDashboardData();
    } else {
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async loadDashboardData() {
    console.log('Loading dashboard data...');
    
    if (!this.currentUser) {
      this.loading = false;
      this.error = 'User not found';
      return;
    }
    
    this.loading = true;
    this.error = null;

    try {
      console.log('Fetching shipments for user:', this.currentUser.uid);
      this.shipments = await this.shipmentService.getShipments(
        this.currentUser.uid,
        this.currentUser.role
      );
      console.log('Shipments loaded:', this.shipments);
      this.calculateAnalytics();
    } catch (e: any) {
      console.error('Error loading dashboard:', e);
      this.error = e.message;
    } finally {
      this.loading = false;
      console.log('Dashboard loading complete');
    }
  }

  private calculateAnalytics() {
    this.analytics.totalShipments = this.shipments.length;
    this.analytics.pendingShipments = this.shipments.filter(s => s.status === 'pending').length;
    this.analytics.inTransitShipments = this.shipments.filter(s => ['assigned', 'picked', 'in-transit'].includes(s.status)).length;
    this.analytics.deliveredShipments = this.shipments.filter(s => s.status === 'delivered').length;
    this.analytics.totalSpent = this.shipments.reduce((sum, s) => sum + s.payment.amount, 0);
  }

  setActiveTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
  }

  getShipmentsByStatus(status: string): Shipment[] {
    return this.shipments.filter(shipment => shipment.status === status);
  }

  getStatusColor(status: string): string {
    const colors = {
      'pending': 'bg-amber-100 text-amber-800 border-amber-200',
      'assigned': 'bg-blue-100 text-blue-800 border-blue-200',
      'picked': 'bg-purple-100 text-purple-800 border-purple-200',
      'in-transit': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'delivered': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  async onBulkSubmit() {
    if (this.bulkForm.invalid || !this.currentUser) return;

    console.log('Creating bulk shipments:', this.bulkForm.value);
    // This would create multiple shipments - simplified for demo
    this.bulkForm.reset({ count: 1 });
  }
}
