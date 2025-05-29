import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../../../firebase/firebaseConfig';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import axios from 'axios';
import baseURL from '../../../../../assets/common/baseURL';
import { FontAwesome } from '@expo/vector-icons';
import Footer from '../../../Footer';
import Constants from 'expo-constants';

const Chats = () => {
  const { user } = useSelector((state) => state.auth);
  const userId = user?.user?._id;
  const [rooms, setRooms] = useState([]);
  const [participantsInfo, setParticipantsInfo] = useState({});
  const [lastMessages, setLastMessages] = useState({}); // store last message per room
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    const roomsRef = collection(db, 'rooms');
    const q = query(roomsRef, where('participants', 'array-contains', userId));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const roomsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setRooms(roomsData);

      const info = {};
      await Promise.all(roomsData.map(async (room) => {
        const otherUserId = room.participants.find(id => id !== userId);
        if (!participantsInfo[otherUserId]) {
          try {
            const { data } = await axios.get(`${baseURL}/get-user/${otherUserId}`);
            info[otherUserId] = data.user;
          } catch (err) {
            console.error(`Failed to fetch user ${otherUserId}`, err);
          }
        }
      }));

      setParticipantsInfo(prev => ({ ...prev, ...info }));
      const lastMsg = {};
      roomsData.forEach(room => {
        if (room.lastMessage) {
          lastMsg[room.id] = room.lastMessage;
        }
      });
      setLastMessages(lastMsg);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleOpenChat = (room) => {
    const receiverId = room.participants.find(id => id !== userId);
    router.push({
      pathname: '/components/User/components/Chat/ChatRoom',
      params: { userId, receiverId },
    });
  };

  const renderItem = ({ item }) => {
    const receiverId = item.participants.find(id => id !== userId);
    const receiver = participantsInfo[receiverId];

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
          <Text>Stall #: {receiver ? receiver.stall.stallNumber : 'Unknown User'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <View style={{ backgroundColor: 'green', borderBottomRightRadius: 20, borderBottomLeftRadius: 20 }}>
          <View style={{ padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesome name="comments" size={24} color="#fff" />
            <Text style={{ color: 'white', fontSize: 20, marginLeft: 10 }}>Chat Heads</Text>
          </View>
        </View>
        {rooms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No chat rooms found.</Text>
          </View>
        ) : (
          <FlatList
            data={rooms}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <View>
        <Footer />
      </View>
    </>
  );
};

export default Chats;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 35,
    paddingTop: Constants.statusBarHeight,
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
    color: '#222',
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