import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../../firebase/firebaseConfig'; // adjust path as needed
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import axios from 'axios';
import baseURL from '../../../../assets/common/baseURL';
import { FontAwesome } from '@expo/vector-icons';

const Chats = () => {
  const { user } = useSelector((state) => state.auth);
  const vendorId = user?.user?._id
  const [rooms, setRooms] = useState([]);
  const router = useRouter();
  const [participantsInfo, setParticipantsInfo] = useState({});

  useEffect(() => {
    if (!vendorId) return;

    const roomsRef = collection(db, 'rooms');
    const q = query(roomsRef, where('participants', 'array-contains', vendorId));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const roomsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setRooms(roomsData);

      const info = {};
      await Promise.all(roomsData.map(async (room) => {
        const otherUserId = room.participants.find(id => id !== vendorId);
        if (!participantsInfo[otherUserId]) {
          try {
            const { data } = await axios.get(`${baseURL}/get-user/${otherUserId}`);
            info[otherUserId] = data.user;
          } catch (err) {
            // console.error(`Failed to fetch user ${otherUserId}`, err);
          }
        }
      }));

      setParticipantsInfo(prev => ({ ...prev, ...info }));
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

  const renderItem = ({ item }) => {
    const receiverId = item.participants.find(id => id !== vendorId);
    const receiver = participantsInfo[receiverId];
    // console.log(item)
    return (
      <TouchableOpacity
        style={styles.roomItem}
        onPress={() => handleOpenChat(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: receiver?.avatar?.url || 'https://via.placeholder.com/56' }}
          style={styles.avatar}
        />
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.name}>{receiver ? receiver.name : 'Unknown User'}</Text>
          </View>
          <Text style={{ color: '#4CAF50' }}>Role: {receiver ? receiver.role : 'Unknown User'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ backgroundColor: '#2A4535', borderBottomRightRadius: 20, borderBottomLeftRadius: 20 }}>
        <View style={{ padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <FontAwesome name="comments" size={24} color="#fff" />
          <Text style={{ color: 'white', fontSize: 20, marginLeft: 10 }}>Chat Heads</Text>
        </View>
      </View>
      <View style={{ padding: 10, backgroundColor: '#E9FFF3', flex: 1 }}>
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
    </View>
  );
};

export default Chats;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#333',
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    backgroundColor: '#2A4535',
    padding: 10,
    borderRadius: 20,
    marginBottom: 7
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    backgroundColor: '#ccc',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
  },
});