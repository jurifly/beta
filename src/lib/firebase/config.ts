import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// In a real app, you would want to use environment variables for these
const firebaseConfig = {
  apiKey: "AIzaSy_..._your_fake_api_key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:123456abcdef"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
