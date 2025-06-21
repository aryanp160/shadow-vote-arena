
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA51Mwr2LbQeYK7rqRxUQ6VW09iad5K9Mw",
  authDomain: "dramafy-54d74.firebaseapp.com",
  projectId: "dramafy-54d74",
  storageBucket: "dramafy-54d74.firebasestorage.app",
  messagingSenderId: "713630661821",
  appId: "1:713630661821:web:efafa21d2a2a5d4f238bd4",
  measurementId: "G-V0E041W77R"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
