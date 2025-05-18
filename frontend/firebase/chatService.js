// chatService.js

import { generateRoomId } from '../utils/generateRoom';
import { db } from './firebaseConfig'; // adjust path as needed
import {
  collection,
  doc,
  addDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  getDoc,
} from 'firebase/firestore';

// create or update room with participants, only set createdAt if new
export const createOrUpdateRoom = async (userId1, userId2) => {
  const roomId = generateRoomId(userId1, userId2);
  const roomDocRef = doc(db, 'rooms', roomId);

  // Check if room already exists to avoid overwriting createdAt
  const roomSnapshot = await getDoc(roomDocRef);
  if (!roomSnapshot.exists()) {
    await setDoc(roomDocRef, {
      participants: [userId1, userId2],
      createdAt: new Date(),
    });
  } else {
    // Optionally update participants in case of any changes (merge)
    await setDoc(roomDocRef, {
      participants: [userId1, userId2],
    }, { merge: true });
  }
};

// subscribe to messages in a room, ordered by timestamp ascending
export const subscribeToMessages = (roomId, callback) => {
  const messagesRef = collection(db, 'rooms', roomId, 'messages');
  const q = query(messagesRef, orderBy('timestamp'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
};

// send a message and ensure room is created/updated
export const sendMessage = async (roomId, senderId, receiverId, text) => {
  if (!senderId) {
    throw new Error("senderId is undefined or null");
  }
  if (!receiverId) {
    throw new Error("receiverId is undefined or null");
  }
  if (!text) {
    throw new Error("text is undefined or empty");
  }

  // Make sure room exists before sending message
  await createOrUpdateRoom(senderId, receiverId);

  const messagesRef = collection(db, 'rooms', roomId, 'messages');
  await addDoc(messagesRef, {
    senderId,
    text,
    timestamp: serverTimestamp(),
  });
};