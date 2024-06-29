import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {getStorage} from 'firebase/storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

const firebaseConfig = {
  apiKey: "AIzaSyDSVgKuiXpK3geC8OLXYKIY2cfa1Yj1EGY",
  authDomain: "seeds-4a6cb.firebaseapp.com",
  projectId: "seeds-4a6cb",
  storageBucket: "seeds-4a6cb.appspot.com",
  messagingSenderId: "306560363733",
  appId: "1:306560363733:web:1ef29644e054667710465c",
  measurementId: "G-M7NTRT3QTY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export default app;
