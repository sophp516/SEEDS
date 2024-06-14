import firebase from 'firebase/app';
import 'firebase/auth';

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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // if already initialized, use that one
}

const analytics = getAnalytics(app);
const db = getDatabase(app);