import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAQn0Vyn36cZ9PAhb-sUE6NoPqhEgN_fxg",
  authDomain: "mpd-tool.firebaseapp.com",
  projectId: "mpd-tool",
  storageBucket: "mpd-tool.appspot.com",
  messagingSenderId: "51846876699",
  appId: "1:51846876699:web:6954e22354b1c27a89f2be",
  measurementId: "G-DW78EFL3FZ",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const database = getFirestore(app);

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export default app;
