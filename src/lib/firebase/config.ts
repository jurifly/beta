
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCLjqD3sPPQ40gI9blVWptATS7A3I-QxIM",
  authDomain: "lexiqaibeta.firebaseapp.com",
  projectId: "lexiqaibeta",
  storageBucket: "lexiqaibeta.appspot.com",
  messagingSenderId: "761844314992",
  appId: "1:761844314992:web:3463f225d8f763905b55b5",
  measurementId: "G-0RC823RTMB"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
