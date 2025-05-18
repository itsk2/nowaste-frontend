import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../../firebase/firebaseConfig'; // adjust path as needed
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';

const Chats = () => {
  const { user } = useSelector((state) => state.auth);
  const vendorId = user?.user?._id
  const [rooms, setRooms] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!vendorId) return;

    const roomsRef = collection(db, 'rooms');
    const q = query(roomsRef, where('participants', 'array-contains', vendorId));

    const unsubscribe = onSnapshot(q, snapshot => {
      const roomsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRooms(roomsData);
    });

    return () => unsubscribe();
  }, [vendorId]);

  const handleOpenChat = (room) => {
    // get other participant ID (not vendorId)
    const customerId = room.participants.find(id => id !== vendorId);

    router.push({
      pathname: '/components/Vendor/components/Chat/ChatRoom',
      params: {
        vendorId,
        customerId,
      },
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.roomItem} onPress={() => handleOpenChat(item)}>
      <Text style={styles.roomText}>Chat with {item.participants.filter(id => id !== vendorId)[0]}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Chat Rooms</Text>
      {rooms.length === 0 ? (
        <Text>No chat rooms found.</Text>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={item => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

export default Chats;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  roomItem: {
    padding: 12,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  roomText: { fontSize: 16 },
});