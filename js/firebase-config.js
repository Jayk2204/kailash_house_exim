// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAE6wJbsekWN46wC5HgyMyRQ5D9I9SHZM",
  authDomain: "kailash-house-exim-cfcb1.firebaseapp.com",
  projectId: "kailash-house-exim-cfcb1",
  storageBucket: "kailash-house-exim-cfcb1.firebasestorage.app",
  messagingSenderId: "912462708660",
  appId: "1:912462708660:web:e1cefecdc94ce6d88dbce1",
  measurementId: "G-XQN54W4R8E"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Firestore collections
const productsRef = db.collection('products');
const inquiriesRef = db.collection('inquiries');
const usersRef = db.collection('users');