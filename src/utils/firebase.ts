import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Partner, Settings, UserStatistics } from "./types";
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
provider.setCustomParameters({
  prompt: "select_account",
});

export const database = getFirestore(app);

export const signInWithGoogle = () => signInWithPopup(auth, provider);

export default app;

export const fetchDocument = async (email: string) => {
  const docRef = doc(database, "users", email);

  try {
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.error("Error getting document:", error);
  }
};

export const fetchProjects = async () => {
  const docRef = doc(database, "projects", "projects");
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.error("Error getting document:", error);
  }
};

export const updateNewPartners = async (email: string, partners: Partner[]) => {
  try {
    await updateDoc(doc(database, "users", email), {
      partners: partners,
    });
  } catch (error) {
    console.error("Error deleting document:", error);
  }
};

export const createUser = async (name: string, email: string) => {
  try {
    await setDoc(doc(database, "users", email), {
      deadline: dayjs().add(1, "month").toString(),
      target: 850,
      message: "Add your Support Raising message here.",
      newUser: true,
      admin: false,
      project: "No Project",
      stats: {
        letters: 0,
        outstandingLetters: 0,
        pledged: 0,
        confirmed: 0,
      },
      partners: [],
      name: name,
    });
  } catch (error) {
    console.error("Error creating document:", error);
  }
};

export const setNewUser = async (email: string) => {
  await updateDoc(doc(database, "users", email), {
    newUser: false,
  });
};

export const updateSettings = async (email: string, settings: Settings) => {
  await updateDoc(doc(database, "users", email), settings);
};

export const fetchUsers = async () => {
  const usersRef = collection(database, "users");
  const queryRef = query(usersRef, where("admin", "==", false));

  try {
    const querySnapshot = await getDocs(queryRef);
    const users: UserStatistics[] = [];
    querySnapshot.docs.forEach((doc) => {
      const docData = doc.data();
      users.push({
        ...docData.stats,
        id: doc.id,
        project: docData.project,
        name: docData.name,
        target: docData.target,
      });
    });

    console.log(users);

    return users;
  } catch (error) {
    console.error("Error fetching users: ", error);
  }
  return undefined;
};
