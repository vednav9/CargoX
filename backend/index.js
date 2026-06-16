const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID
});

const db = admin.firestore();

// Test route
app.get("/", (req, res) => {
    res.json({ message: "CargoX Backend is running!", timestamp: new Date() });
});

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "healthy", firebase: "connected" });
});

// User routes
app.get("/api/users/:uid", async (req, res) => {
    try {
        const { uid } = req.params;
        const userDoc = await db.collection('users').doc(uid).get();
        
        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }
        
        res.json({ id: uid, ...userDoc.data() });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Shipments routes
app.get("/api/shipments", async (req, res) => {
    try {
        const { userId, role } = req.query;
        let query = db.collection('shipments');
        
        if (role === 'driver') {
            query = query.where('driverId', '==', userId);
        } else if (role === 'user' || role === 'enterprise') {
            query = query.where('customerId', '==', userId);
        }
        
        const snapshot = await query.get();
        const shipments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        res.json(shipments);
    } catch (error) {
        console.error("Error fetching shipments:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`CargoX Backend running on port ${PORT}`);
});
