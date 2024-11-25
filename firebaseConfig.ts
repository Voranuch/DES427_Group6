// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";  // Import Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBbMBtYSdYwK6yc2EWLH_YQSG6yS5aFO4Y",
  authDomain: "mobile-app-g6.firebaseapp.com",
  projectId: "mobile-app-g6",
  storageBucket: "mobile-app-g6.firebasestorage.app",
  messagingSenderId: "854614131859",
  appId: "1:854614131859:web:00a3819b90c265fb6ff966",
  measurementId: "G-PQ37Q5E6YK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
const db = getFirestore(app);

// Export the Firestore instance
export { db };