export interface VehicleDetails {
  type: 'bike' | 'tempo' | 'truck-small' | 'truck-large' | 'container' | 'refrigerated';
  license: string;
  registration: string;
  capacity: number;
}

export interface UserProfile {
  address: string;
  dp: string;
  company?: string;
  vehicleDetails?: VehicleDetails;
}

export interface UserData {
  uid: string;
  email: string;
  name: string;
  phone: number;
  role: 'user' | 'driver' | 'admin' | 'enterprise';
  createdAt: Date;
  profile?: UserProfile;
  isVerified?: boolean;
  status?: 'active' | 'pending' | 'suspended';
}
