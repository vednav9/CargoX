# The Full Project Plan for CargoX

1. Project Goal

- Build a logistics & transport management platform where:
- Enterprises (companies) can post their shipping needs.
- Drivers / Transport providers can accept jobs (for trucks, tempos).
- Customers (individual users) can also book one-time or recurring shipments.
- System manages listings, bookings, payments, tracking, and communication.

Current Progress:
Done - Basic project setup
Done - Firebase integration
Done - Authentication system
Done - User role management
Not Done - Profile management
Not Done - Shipment system
Not Done - Payment integration
Not Done - Real-time tracking

2. Tech Stack

Frontend
- Angular 17 (main framework)
- Tailwind CSS (UI styling)
- Angular Material (components like dialogs, tables, forms, buttons)

Backend & Database
- Firebase (serverless backend)
- Firebase Authentication → Signup/Login
- Firestore → Database (users, bookings, routes, shipments, reviews)
- Firebase Storage → For uploading docs (like license, ID, invoices)
- Firebase Cloud Functions → Business logic (payments, notifications)
- NodeJs, ExpressJs

Other Services
- Google Maps API → For location, route tracking, live tracking
- Stripe → For secure payments
- Push Notifications → Firebase Cloud Messaging

3. User Roles

Admin
- Manage users (enterprises, drivers, customers).
- Approve/reject transport provider registrations.
- View all bookings and payments.
- Enterprise (Company)
- Post shipment requests (truck/tempo requirement).
- Manage recurring shipments.
- Track deliveries in real-time.
- Driver/Transport Provider
- Register with documents (license, vehicle RC).
- Accept/reject delivery requests.
- Update status (Picked up, In Transit, Delivered).

Customer (Individual)
- Book one-time parcel delivery.
- Select vehicle type & preferred driver.
- Track parcel live.

4. Core Features

Authentication & Profiles
- Signup/Login with email, phone, or Google.
- Role selection (Enterprise, Driver, Customer).

Profile setup:
- Enterprise → Company details.
- Driver → License, vehicle details, verification docs.
- Customer → Basic info.

Shipment Management

Enterprises/Customers can:
- Create new shipment request (pickup, drop location, package details, date).
- Choose transport type (small parcel, tempo, truck, etc.).

Drivers can:
- View available requests.
- Accept shipment jobs.

Booking System
- Automatic matching (based on location/availability).
- Manual assignment (enterprise selects driver).
- Booking confirmation with fare details.

- Real-Time Tracking
- Google Maps integration for:
- Live driver location.
- Shipment status (Pending → Picked → In Transit → Delivered).

Payment System
- Stripe integration.
- Fare estimation before booking.
- Secure online payment + receipt generation.

Notifications
- Firebase Cloud Messaging for updates:
- “Driver accepted your shipment”
- “Shipment delivered successfully”

Reviews & Ratings
- Customers/Enterprises can rate drivers.
- Drivers can rate customers/enterprises.
  
Admin Panel
- Manage all users (approve/reject drivers).
- View all bookings & revenue analytics.
- Handle complaints & disputes.

5. Firebase Database Structure (Firestore)

Collections:
1. users
   - uid (document id)
   - email: string
   - name: string
   - phone: number
   - role: 'user' | 'driver' | 'admin'
   - createdAt: timestamp
   - profile: {
     - address: string
     - dp: string
     - company?: string (for enterprise)
     - vehicleDetails?: { (for drivers)
       - type: string
       - license: string
       - registration: string
       - capacity: number
     }
   }

2. shipments
   - id (document id)
   - customerId: string (ref: users)
   - driverId?: string (ref: users)
   - status: 'pending' | 'assigned' | 'picked' | 'in-transit' | 'delivered'
   - pickup: {
     - address: string
     - location: GeoPoint
     - time: timestamp
   }
   - dropoff: {
     - address: string
     - location: GeoPoint
     - time: timestamp
   }
   - package: {
     - type: string
     - weight: number
     - dimensions: string
   }
   - payment: {
     - amount: number
     - status: string
     - stripeId: string
   }
   - createdAt: timestamp
   - updatedAt: timestamp

3. reviews
   - id (document id)
   - shipmentId: string (ref: shipments)
   - fromId: string (ref: users)
   - toId: string (ref: users)
   - rating: number
   - comment: string
   - createdAt: timestamp

4. tracking
   - shipmentId (document id)
   - driverId: string (ref: users)
   - location: GeoPoint
   - status: string
   - timestamp: timestamp
   - updates: array of {
     - status: string
     - location: GeoPoint
     - timestamp: timestamp
     - note: string
   }

6. Development Phases
Phase 1: Setup & Authentication
- Angular + Firebase integration
- Signup/Login (email + role selection)
- Store users in Firestore

Phase 2: Shipment Posting
- Form to create shipment request
- Firestore integration
- Drivers view shipment requests

Phase 3: Booking & Matching
- Driver accepts/rejects
- Assign driver → update shipment status

Phase 4: Tracking & Notifications
- Google Maps live tracking
- Push notifications

Phase 5: Payments
- Stripe integration
- Store payment records in Firestore

Phase 6: Reviews & Admin Panel
- Review system
- Admin dashboard

7. Future Enhancements
- AI-powered fare prediction.
- Smart route optimization.
- Multi-language support.
- Analytics dashboard for enterprises.