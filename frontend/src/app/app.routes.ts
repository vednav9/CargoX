import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { Home } from './pages/home/home';
import { Enterprise } from './pages/enterprise/enterprise';
import { Driver } from './pages/driver/driver';
import { Support } from './pages/support/support';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'enterprise', component: Enterprise },
  { path: 'driver', component: Driver },
  { path: 'support', component: Support },

  // Auth routes
  { path: 'login', loadComponent: () => import('./pages/auth/login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./pages/auth/register/register').then(m => m.Register) },
  { path: 'complete-profile', loadComponent: () => import('./pages/auth/complete-profile/complete-profile').then(m => m.CompleteProfile) },

  // Shipment routes
  { path: 'create-shipment', loadComponent: () => import('./pages/create-shipment/create-shipment').then(m => m.CreateShipment) },
  { path: 'shipments', loadComponent: () => import('./pages/shipments/shipments').then(m => m.Shipments) },
  { path: 'shipments/:id', loadComponent: () => import('./pages/shipment-details/shipment-details').then(m => m.ShipmentDetails) },

  // Add this line to your routes array
  { path: 'debug', loadComponent: () => import('./pages/debug/debug').then(m => m.Debug) },


  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
