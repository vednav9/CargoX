import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { VehicleDetails } from '../../../models/user.model';

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './complete-profile.html'
})
export class CompleteProfile {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = false;
  error: string | null = null;
  userRole: 'user' | 'driver' | 'admin' | 'enterprise' = 'user';

  form = this.fb.group({
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    address: ['', [Validators.required]],
    company: [''],
    vehicleDetails: this.fb.group({
      type: [''],
      license: [''],
      registration: [''],
      capacity: [0]
    })
  });

  constructor() {
    this.route.queryParams.subscribe(params => {
      this.userRole = params['role'] || 'user';
      this.updateValidators();
    });

    // Pre-fill form with any existing user data
    this.auth.currentUserData$.subscribe(userData => {
      if (userData) {
        this.form.patchValue({
          phone: userData.phone.toString(),
          address: userData.profile?.address || '',
          company: userData.profile?.company || '',
          vehicleDetails: {
            type: userData.profile?.vehicleDetails?.type || '',
            license: userData.profile?.vehicleDetails?.license || '',
            registration: userData.profile?.vehicleDetails?.registration || '',
            capacity: userData.profile?.vehicleDetails?.capacity || 0
          }
        });
      }
    });
  }

  private updateValidators() {
    const vehicleDetailsGroup = this.form.get('vehicleDetails');
    if (this.userRole === 'driver') {
      vehicleDetailsGroup?.get('type')?.setValidators([Validators.required]);
      vehicleDetailsGroup?.get('license')?.setValidators([Validators.required]);
      vehicleDetailsGroup?.get('registration')?.setValidators([Validators.required]);
      vehicleDetailsGroup?.get('capacity')?.setValidators([Validators.required, Validators.min(1)]);
    } else {
      vehicleDetailsGroup?.get('type')?.clearValidators();
      vehicleDetailsGroup?.get('license')?.clearValidators();
      vehicleDetailsGroup?.get('registration')?.clearValidators();
      vehicleDetailsGroup?.get('capacity')?.clearValidators();
    }
    
    if (this.userRole === 'enterprise') {
      this.form.get('company')?.setValidators([Validators.required]);
    } else {
      this.form.get('company')?.clearValidators();
    }

    this.form.updateValueAndValidity();
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.error = 'Please fill all required fields correctly.';
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const formValues = this.form.value;
      
      // Type-safe vehicle details creation
      let vehicleDetails: VehicleDetails | undefined = undefined;
      if (this.userRole === 'driver' && formValues.vehicleDetails) {
        const vType = formValues.vehicleDetails.type as VehicleDetails['type'];
        vehicleDetails = {
          type: vType,
          license: formValues.vehicleDetails.license || '',
          registration: formValues.vehicleDetails.registration || '',
          capacity: Number(formValues.vehicleDetails.capacity) || 0
        };
      }

      const profileData = {
        phone: formValues.phone || '',
        address: formValues.address || '',
        company: formValues.company || undefined,
        vehicleDetails,
        role: this.userRole
      };

      await this.auth.updateProfile(profileData);
      
      // Redirect to appropriate dashboard
      switch (this.userRole) {
        case 'driver':
          this.router.navigate(['/driver']);
          break;
        case 'enterprise':
          this.router.navigate(['/enterprise']);
          break;
        case 'admin':
          this.router.navigate(['/admin']);
          break;
        default:
          this.router.navigate(['/']);
      }
    } catch (e: any) {
      this.error = e?.message ?? 'Failed to update profile';
    } finally {
      this.loading = false;
    }
  }
}
