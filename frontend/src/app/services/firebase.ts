// import { Injectable } from '@angular/core';
// import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
// import { Firestore, collection, addDoc, getDocs } from '@angular/fire/firestore';

// @Injectable({
//   providedIn: 'root'
// })
// export class FirebaseService {
//   constructor(private auth: Auth, private firestore: Firestore) {}

//   register(email: string, password: string) {
//     return createUserWithEmailAndPassword(this.auth, email, password);
//   }

//   login(email: string, password: string) {
//     return signInWithEmailAndPassword(this.auth, email, password);
//   }

//   logout() {
//     return signOut(this.auth);
//   }

//   addData(collectionName: string, data: any) {
//     return addDoc(collection(this.firestore, collectionName), data);
//   }

//   async getData(collectionName: string) {
//     const querySnapshot = await getDocs(collection(this.firestore, collectionName));
//     return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//   }
// }
