import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getPerformance } from "firebase/performance";


const firebaseConfig = {
    apiKey: "AIzaSyBkanSk8LBCzziAax2eZ66ZAN4HFukdkiM",
    authDomain: "family-finance-app-61a64.firebaseapp.com",
    projectId: "family-finance-app-61a64",
    storageBucket: "family-finance-app-61a64.firebasestorage.app",
    messagingSenderId: "705065179989",
    appId: "1:705065179989:web:2f9d9edfc805caa392eddc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
const perf = getPerformance(app);