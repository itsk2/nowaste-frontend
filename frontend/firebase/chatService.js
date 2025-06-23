import baseURL from '../assets/common/baseURL';
import { generateRoomId } from '../utils/generateRoom';
import { db } from './firebaseConfig';
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
import axios from 'axios';

const sendPushNotification = async (expoPushToken, message, roomId, receiverName, targetRole) => {

  // console.log('Receiver:', receiverName);
  // console.log('targetRole:', targetRole);
  await fetch(`${baseURL}/push/send`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: expoPushToken,
      title: `New message from ${receiverName}`,
      body: message,
      data: {
        screen: 'Chat',
        roomId,
        targetRole,
      },
    }),
  });
};


// Create or update room
export const createOrUpdateRoom = async (userId1, userId2) => {
  const roomId = generateRoomId(userId1, userId2);
  const roomDocRef = doc(db, 'rooms', roomId);

  const roomSnapshot = await getDoc(roomDocRef);
  if (!roomSnapshot.exists()) {
    await setDoc(roomDocRef, {
      participants: [userId1, userId2],
      createdAt: new Date(),
    });
  } else {
    await setDoc(
      roomDocRef,
      {
        participants: [userId1, userId2],
      },
      { merge: true }
    );
  }

  return roomId;
};

// Listen to messages
export const subscribeToMessages = (roomId, callback) => {
  const messagesRef = collection(db, 'rooms', roomId, 'messages');
  const q = query(messagesRef, orderBy('timestamp'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
};

// Send a message and trigger notification
export const sendMessage = async (roomId, senderId, receiverId, text, receiverName, targetRole) => {
  if (!senderId || !receiverId || !text) {
    throw new Error("Missing senderId, receiverId, or text");
  }

  // Create or update room
  await createOrUpdateRoom(senderId, receiverId);

  // Add the message to Firestore
  const messagesRef = collection(db, 'rooms', roomId, 'messages');
  await addDoc(messagesRef, {
    senderId,
    text,
    timestamp: serverTimestamp(),
  });

  // Fetch receiver data
  const receiverRef = doc(db, 'users', receiverId);
  const receiverSnap = await getDoc(receiverRef);
  const receiverData = receiverSnap.data();

  // Fetch sender data
  const senderRef = doc(db, 'users', senderId);
  const senderSnap = await getDoc(senderRef);
  const senderData = senderSnap.data();
  if (
    receiverId !== senderId &&
    receiverData?.expoPushToken &&
    receiverData.expoPushToken !== senderData?.expoPushToken
  ) {
    await sendPushNotification(receiverData.expoPushToken, text, roomId, receiverName, targetRole);
  }
};