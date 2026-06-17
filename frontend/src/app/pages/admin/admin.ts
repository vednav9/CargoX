import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ShipmentService } from '../../services/shipment.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      <div class="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 shadow-xl">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 class="text-3xl font-bold text-white">👑 Admin Dashboard</h1>
          <p class="text-purple-100">System overview and management</p>
        </div>
      </div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- System Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div class="flex items-center">
              <div class="text-3xl mr-4">👥</div>
              <div>
                <div class="text-2xl font-bold text-gray-900">1,234</div>
                <div class="text-sm text-gray-600">Total Users</div>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div class="flex items-center">
              <div class="text-3xl mr-4">🚚</div>
              <div>
                <div class="text-2xl font-bold text-gray-900">456</div>
                <div class="text-sm text-gray-600">Active Drivers</div>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div class="flex items-center">
              <div class="text-3xl mr-4">📦</div>
              <div>
                <div class="text-2xl font-bold text-gray-900">789</div>
                <div class="text-sm text-gray-600">Total Shipments</div>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div class="flex items-center">
              <div class="text-3xl mr-4">💰</div>
              <div>
                <div class="text-2xl font-bold text-gray-900">₹2.3L</div>
                <div class="text-sm text-gray-600">Revenue</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h3 class="text-lg font-semibold mb-4">📊 Recent Activity</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>New driver registration: John Doe</span>
              </div>
              <span class="text-sm text-gray-500">2 min ago</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <div class="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span>Shipment delivered: #SHP123</span>
              </div>
              <span class="text-sm text-gray-500">5 min ago</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <div class="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <span>Payment processed: ₹1,250</span>
              </div>
              <span class="text-sm text-gray-500">8 min ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class Admin implements OnInit {
  private auth = inject(AuthService);
  private shipmentService = inject(ShipmentService);

  ngOnInit() {
    // Check if user is admin
    const user = this.auth.getCurrentUserData();
    if (user?.role !== 'admin') {
      // Redirect or show error
    }
  }
}
