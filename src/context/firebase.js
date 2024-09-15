// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyC6-MgewzZHUGEDqqZSQP2qZakU3gq8-z4",
    authDomain: "chat-app-fb511.firebaseapp.com",
    projectId: "chat-app-fb511",
    storageBucket: "chat-app-fb511.appspot.com",
    messagingSenderId: "515552768870",
    appId: "1:515552768870:web:a0bc59a82862ec2a3e8ea7",
    measurementId: "G-C2QGW19RYN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
