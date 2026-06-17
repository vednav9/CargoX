import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">Debug Authentication</h1>
      
      <div class="bg-gray-100 p-4 rounded mb-4">
        <h2 class="font-bold mb-2">Current User Data:</h2>
        <pre>{{ currentUserData | json }}</pre>
      </div>
      
      <div class="bg-gray-100 p-4 rounded mb-4">
        <h2 class="font-bold mb-2">Is Logged In:</h2>
        <p>{{ isLoggedIn }}</p>
      </div>
      
      <div class="bg-gray-100 p-4 rounded mb-4">
        <h2 class="font-bold mb-2">Firebase User:</h2>
        <pre>{{ firebaseUser | json }}</pre>
      </div>
    </div>
  `
})
export class Debug implements OnInit {
  private auth = inject(AuthService);
  
  currentUserData: any = null;
  isLoggedIn = false;
  firebaseUser: any = null;

  ngOnInit() {
    this.auth.currentUserData$.subscribe(userData => {
      this.currentUserData = userData;
    });
    
    this.auth.currentUser$.subscribe(user => {
      this.firebaseUser = user;
      this.isLoggedIn = !!user;
    });
  }
}
