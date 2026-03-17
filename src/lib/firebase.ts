import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBGyCqXTa50qprtr7bXntORwxNZypgj3FE",
  authDomain: "civicvoive.firebaseapp.com",
  projectId: "civicvoive",
  storageBucket: "civicvoive.firebasestorage.app",
  messagingSenderId: "149376391900",
  appId: "1:149376391900:web:ef09abeac29f05d931f219",
  measurementId: "G-L4N8YYME02",
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);

export { RecaptchaVerifier, signInWithPhoneNumber };
export type { ConfirmationResult };
