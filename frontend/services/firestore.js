// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
const db = getDatabase(app);