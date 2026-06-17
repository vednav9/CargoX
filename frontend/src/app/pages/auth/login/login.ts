import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service'; // Fixed path

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  googleLoading = false;
  error: string | null = null;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async onLogin() {
    this.error = null;
    if (this.form.invalid) return;
    
    this.loading = true;
    const { email, password } = this.form.value;
    
    try {
      await this.auth.login(email!, password!);
      
      // Check if user needs to complete profile
      const userData = this.auth.getCurrentUserData();
      if (userData && !userData.profile?.address) {
        this.router.navigate(['/complete-profile']);
      } else {
        this.router.navigate(['/']);
      }
    } catch (e: any) {
      this.error = e?.message ?? 'Login failed';
    } finally {
      this.loading = false;
    }
  }

  async loginWithGoogle() {
    this.error = null;
    this.googleLoading = true;
    
    try {
      await this.auth.loginWithGoogle();
      
      // Check if user needs to complete profile
      setTimeout(() => {
        const userData = this.auth.getCurrentUserData();
        if (userData && !userData.profile?.address) {
          this.router.navigate(['/complete-profile']);
        } else {
          this.router.navigate(['/']);
        }
      }, 1000);
    } catch (e: any) {
      this.error = e?.message ?? 'Google login failed';
    } finally {
      this.googleLoading = false;
    }
  }
}
