import { Component, HostListener, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
})
export class Navbar {
  private router = inject(Router);
  auth = inject(AuthService);

  user$ = this.auth.currentUser$;
  userData$ = this.auth.currentUserData$;

  isDropdownOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  async doLogout() {
    await this.auth.logout();
    this.isDropdownOpen = false;
    this.router.navigateByUrl('/');
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.profile-menu')) {
      this.isDropdownOpen = false;
    }
  }
}
