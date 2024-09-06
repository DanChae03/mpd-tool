import { initializeApp } from "firebase/app";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Partner } from "./types";
import dayjs from "dayjs";

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

export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const database = getFirestore(app);

export const signInWithGoogle = () => signInWithPopup(auth, provider);

export default app;

export const fetchDocument = async (UUI: string) => {
  const docRef = doc(database, "users", UUI);

  try {
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.error("Error getting document:", error);
  }
};

export const fetchPartners = async (UUI: string) => {
  try {
    const querySnapshot = await getDocs(
      collection(database, "users", UUI, "partners")
    );
    const partners: Partner[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(data);
      partners.push({
        ...data,
        id: doc.id,
      } as Partner);
    });
    return partners;
  } catch (error) {
    console.error("Error getting document:", error);
    return [];
  }
};

export const setPartner = async (UID: string, partner: Partner) => {
  try {
    await setDoc(doc(database, "users", UID, "partners", partner.id), {
      name: partner.name,
      email: partner.email,
      number: partner.number,
      nextStepDate: partner.nextStepDate,
      pledgedAmount: partner.pledgedAmount,
      confirmedDate: partner.confirmedDate,
      confirmedAmount: partner.confirmedAmount,
      notes: partner.notes,
      status: partner.status,
      saved: partner.saved,
    });
  } catch (error) {
    console.error("Error updating document:", error);
  }
};

export const deletePartner = async (UID: string, id: string) => {
  try {
    await deleteDoc(doc(database, "users", UID, "partners", id));
  } catch (error) {
    console.error("Error deleting document:", error);
  }
};

export const createUser = async (UID: string) => {
  try {
    await setDoc(doc(database, "users", UID), {
      message: "",
      webpage: "",
    });
  } catch (error) {
    console.error("Error creating document:", error);
  }
};
