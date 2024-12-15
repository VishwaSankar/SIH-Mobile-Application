// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore'




// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCsk6Hzo-Xqre6sxgaeQt8HgumZkyl97tM",
  authDomain: "sih24-8fe3b.firebaseapp.com",
  projectId: "sih24-8fe3b",
  storageBucket: "sih24-8fe3b.firebasestorage.app",
  messagingSenderId: "360627432855",
  appId: "1:360627432855:web:d53d95239c35eccec8e8d2",
  measurementId: "G-FCM760BV2K"
};

// Initialize Firebase
export const FireBaseApp = initializeApp(firebaseConfig);
export const FireBaseAuth= getAuth(FireBaseApp);
export const FireStoreDB = getFirestore(FireBaseApp)

export default FireBaseApp; // Default export of the Firebase app (if needed elsewhere)

