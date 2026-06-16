import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  error: string | null = null;
  successMessage: string | null = null;
  loading = false;
  googleLoading = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    role: ['user', [Validators.required]]
  });

  async onRegister() {
    this.error = null;
    this.successMessage = null;

    if (this.form.invalid) {
      this.error = 'Please fill all required fields correctly.';
      return;
    }

    const { email, password, name, phone, role } = this.form.value;
    this.loading = true;

    try {
      const success = await this.auth.register(
        email!,
        password!,
        name!,
        Number(phone),
        role as 'user' | 'driver' | 'admin'
      );
      
      if (success) {
        // Clear the form first
        const currentRole = this.form.get('role')?.value;
        this.form.reset();
        this.form.patchValue({
          role: currentRole
        });
        
        // Then show success message
        this.successMessage = 'Account created successfully!';
      }
    } catch (e: any) {
      this.error = e.message;
      this.successMessage = null;
    } finally {
      this.loading = false;
    }
  }

  async registerWithGoogle() {
    this.error = null;
    this.successMessage = null;
    this.googleLoading = true;

    const role = this.form.get('role')?.value as 'user' | 'driver' | 'admin';
    
    try {
      await this.auth.loginWithGoogle();
      // After Google login, redirect to profile completion if needed
      this.router.navigate(['/complete-profile'], { 
        queryParams: { role: role || 'user' }
      });
    } catch (e: any) {
      this.error = e?.message ?? 'Google registration failed';
    } finally {
      this.googleLoading = false;
    }
  }
}
