import { initializeApp } from 'firebase/app';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFirestore, Firestore } from 'firebase/firestore';

// Define the configuration object with specific types
const firebaseConfig = {
  apiKey: "AIzaSyCawaQeg5F08XAdewCmJLdYonTWY8oEmEU",
  authDomain: "react-login-project-422602.firebaseapp.com",
  projectId: "react-login-project-422602",
  storageBucket: "react-login-project-422602.appspot.com",
  messagingSenderId: "225470423561",
  appId: "1:225470423561:web:16e0f53730ad5585db4ed8",
  measurementId: "G-H4Z98LC06Q",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services with types
const storage: FirebaseStorage = getStorage(app);
const firestore: Firestore = getFirestore(app);

export { storage, firestore };