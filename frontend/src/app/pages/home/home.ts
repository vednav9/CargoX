import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <!-- Hero Section -->
      <div class="relative overflow-hidden bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div class="text-center">
            <h1 class="text-5xl font-bold text-gray-900 mb-6">
              Welcome to <span class="text-blue-600">CargoX</span>
            </h1>
            <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Your trusted logistics partner. Connect shippers with reliable drivers for seamless cargo transport across the country.
            </p>
            
            @if (authService.isLoggedIn()) {
              <div class="space-y-4">
                <p class="text-lg text-green-600">Welcome back, {{ (authService.currentUserData$ | async)?.name }}!</p>
                <div class="flex justify-center space-x-4 flex-wrap">
                  @if ((authService.currentUserData$ | async)?.role === 'driver') {
                    <a routerLink="/driver" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                      Driver Dashboard
                    </a>
                  } @else if ((authService.currentUserData$ | async)?.role === 'enterprise') {
                    <a routerLink="/enterprise" class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                      Enterprise Dashboard
                    </a>
                  } @else {
                    <a routerLink="/create-shipment" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                      Book Shipment
                    </a>
                  }
                  <a routerLink="/shipments" class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                    My Shipments
                  </a>
                </div>
              </div>
            } @else {
              <div class="flex justify-center space-x-4">
                <a routerLink="/register" class="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 transition-colors">
                  Get Started
                </a>
                <a routerLink="/login" class="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg text-lg hover:bg-gray-300 transition-colors">
                  Sign In
                </a>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Quick Actions (for logged in users) -->
      @if (authService.isLoggedIn()) {
        <div class="py-12 bg-white">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-center text-gray-900 mb-8">Quick Actions</h2>
            <div class="grid md:grid-cols-3 gap-6">
              <a routerLink="/create-shipment" class="block p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                <div class="text-3xl mb-3">📦</div>
                <h3 class="text-xl font-semibold text-blue-900">Create Shipment</h3>
                <p class="text-blue-700">Book a new delivery quickly and easily</p>
              </a>
              <a routerLink="/shipments" class="block p-6 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                <div class="text-3xl mb-3">📋</div>
                <h3 class="text-xl font-semibold text-green-900">Track Shipments</h3>
                <p class="text-green-700">Monitor your ongoing deliveries</p>
              </a>
              <a routerLink="/support" class="block p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                <div class="text-3xl mb-3">💬</div>
                <h3 class="text-xl font-semibold text-purple-900">Get Support</h3>
                <p class="text-purple-700">Need help? Contact our support team</p>
              </a>
            </div>
          </div>
        </div>
      }

      <!-- Features Section -->
      <div class="py-16 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900">Why Choose CargoX?</h2>
          </div>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="text-center p-6 bg-white rounded-lg shadow-sm">
              <div class="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                🚚
              </div>
              <h3 class="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p class="text-gray-600">Quick and reliable shipping solutions for all your logistics needs.</p>
            </div>
            <div class="text-center p-6 bg-white rounded-lg shadow-sm">
              <div class="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                📍
              </div>
              <h3 class="text-xl font-semibold mb-2">Real-time Tracking</h3>
              <p class="text-gray-600">Track your shipments in real-time with our advanced GPS technology.</p>
            </div>
            <div class="text-center p-6 bg-white rounded-lg shadow-sm">
              <div class="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                🛡️
              </div>
              <h3 class="text-xl font-semibold mb-2">Secure & Safe</h3>
              <p class="text-gray-600">Your cargo is protected with our comprehensive insurance coverage.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class Home {
  authService = inject(AuthService);
}
