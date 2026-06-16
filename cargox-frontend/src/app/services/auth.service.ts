import { Injectable } from '@angular/core';
import { 
  Auth, 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup 
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UserData, VehicleDetails } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private currentUserDataSubject = new BehaviorSubject<UserData | null>(null);
  
  currentUser$ = this.currentUserSubject.asObservable();
  currentUserData$ = this.currentUserDataSubject.asObservable();

  constructor(
    private auth: Auth,
    private router: Router,
    private firestore: Firestore
  ) {
    this.auth.onAuthStateChanged(async (user) => {
      this.currentUserSubject.next(user);
      if (user) {
        const userData = await this.getUserData(user.uid);
        this.currentUserDataSubject.next(userData);
      } else {
        this.currentUserDataSubject.next(null);
      }
    });
  }

  private async getUserData(uid: string): Promise<UserData | null> {
    try {
      const docRef = doc(this.firestore, 'users', uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { uid, ...docSnap.data() } as UserData : null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  async register(email: string, password: string, name: string, phone: number, role: 'user' | 'driver' | 'admin' | 'enterprise' = 'user'): Promise<boolean> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      const userData: Omit<UserData, 'uid'> = {
        email,
        name,
        phone,
        role,
        createdAt: new Date(),
        status: 'pending',
        isVerified: false
      };
      
      await setDoc(doc(this.firestore, 'users', user.uid), userData);
      return true;
    } catch (error: any) {
      console.error('Register error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please try logging in.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      }
      
      throw new Error(errorMessage);
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      // Router navigation will be handled by the component
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error('Invalid email or password');
    }
  }

  async loginWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;
      
      // Check if user exists in our database
      const userDoc = await this.getUserData(user.uid);
      
      if (!userDoc) {
        // Create new user document if first time login
        const userData: Omit<UserData, 'uid'> = {
          email: user.email || '',
          name: user.displayName || '',
          phone: 0, // Will be updated in profile completion
          role: 'user', // Default role
          createdAt: new Date(),
          status: 'pending',
          isVerified: false,
          profile: {
            address: '',
            dp: user.photoURL || '',
          }
        };
        await setDoc(doc(this.firestore, 'users', user.uid), userData);
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw new Error('Google sign in failed');
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  async updateProfile(profileData: {
    phone: string;
    address: string;
    company?: string;
    vehicleDetails?: VehicleDetails;
    role: 'user' | 'driver' | 'admin' | 'enterprise';
  }): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No user logged in');

    try {
      const userData: Partial<UserData> = {
        phone: Number(profileData.phone),
        role: profileData.role,
        status: 'active',
        profile: {
          address: profileData.address,
          dp: user.photoURL || '',
          company: profileData.company,
          vehicleDetails: profileData.vehicleDetails
        }
      };

      await setDoc(doc(this.firestore, 'users', user.uid), userData, { merge: true });
      
      // Refresh user data
      const updatedUserData = await this.getUserData(user.uid);
      this.currentUserDataSubject.next(updatedUserData);
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error('Failed to update profile');
    }
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserData(): UserData | null {
    return this.currentUserDataSubject.value;
  }
}
