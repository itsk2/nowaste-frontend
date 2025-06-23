import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, collection } from "firebase/firestore";

// Your config
const firebaseConfig = {
  apiKey: "AIzaSyDUF2tancMPywZQEdG2XPQj-cUBDDz4iow",
  authDomain: "nowaste-9fdc9.firebaseapp.com",
  projectId: "nowaste-9fdc9",
  storageBucket: "nowaste-9fdc9.appspot.com",
  messagingSenderId: "851126160543",
  appId: "1:851126160543:web:b82b63c7ef585d8877e6aa",
  measurementId: "G-ZDQWPFD6YN",
};


// Initialize Firebase App once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// ✅ Safely initialize Auth with AsyncStorage
let auth;
try {
  auth = getAuth(app); // if already initialized
} catch (e) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };

export const db = getFirestore(app);
export const usersRef = collection(db, "users");
export const roomRef = collection(db, "rooms");