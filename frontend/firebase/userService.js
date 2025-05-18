import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig"; // update with your path

export const getUserById = async (userId) => {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};